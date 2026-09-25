import { RECOVERY_KIT_VERSION } from '../domain/constants.js';
import { cryptoEngine } from '../crypto/crypto-engine.js';
import { canonicalBytes, canonicalize } from '../shared/canonical-json.js';
import { base64UrlToBytes, bytesToBase64Url, concatBytes, utf8 } from '../shared/encoding.js';
import { CryptoError, ValidationError } from '../shared/errors.js';

const MAGIC=utf8.encode('CJASKIT'),MAX_KIT_BYTES=1024*1024,SHA256=/^[a-f0-9]{64}$/;
const PAYLOAD_FIELDS=new Set(['kit_version','vault_format','snapshot_id','kdf','wrap_algorithm','wrapped_dek','ciphertext_sha256','storage_locators','created_at','tool_compatibility']);
function randomBytes(length){const bytes=new Uint8Array(length);globalThis.crypto.getRandomValues(bytes);return bytes;}
function aadFields(payload){const {wrapped_dek,...aad}=payload;return aad;}
function assertHex(value){if(!SHA256.test(value??''))throw new ValidationError('INVALID_CIPHERTEXT_HASH','Ciphertext SHA-256 must be lowercase hex');}

export class RecoveryKitBuilder {
  async wrapDataKey(dataKey,kek,{nonce=randomBytes(12),aad}){
    if(!(dataKey instanceof Uint8Array)||dataKey.length!==32||!(kek instanceof Uint8Array)||kek.length!==32)throw new ValidationError('INVALID_KEY','DEK and KEK must be 32 bytes');
    return cryptoEngine.encryptSnapshot(dataKey,{dataKey:kek,nonce,aad});
  }
  async unwrapDataKey(wrapped,kek,{aad}){return cryptoEngine.decryptSnapshot({algorithm:'AES-256-GCM',nonce:wrapped.nonce,aad,ciphertext:wrapped.ciphertext},{dataKey:kek,expectedAad:aad});}

  async createKit({password,dataKey,snapshotId,ciphertextSha256,storageLocators,kdfProvider,kdfParameters,createdAt,toolCompatibility='>=0.1.0'}){
    if(!kdfProvider)throw new ValidationError('KDF_REQUIRED','Explicit KDF provider is required');assertHex(ciphertextSha256);if(!Array.isArray(storageLocators)||storageLocators.length===0)throw new ValidationError('LOCATOR_REQUIRED','At least one storage locator is required');
    const salt=randomBytes(16),nonce=randomBytes(12);kdfProvider.validateParameters(kdfParameters);const kek=await kdfProvider.deriveKey(password,salt,kdfParameters);
    const publicPayload={kit_version:RECOVERY_KIT_VERSION,vault_format:'cjas-vault-snapshot-v1',snapshot_id:snapshotId,kdf:{kdf_id:kdfProvider.algorithm,algorithm:kdfProvider.algorithm,parameters:kdfParameters,salt:bytesToBase64Url(salt)},wrap_algorithm:{algorithm:'AES-256-GCM',nonce:bytesToBase64Url(nonce)},ciphertext_sha256:ciphertextSha256,storage_locators:storageLocators,created_at:createdAt,tool_compatibility:toolCompatibility};
    const aad=canonicalBytes(publicPayload);const wrapped=await this.wrapDataKey(dataKey,kek,{nonce,aad});cryptoEngine.wipeSensitiveReference(kek);
    const payload={...publicPayload,wrapped_dek:bytesToBase64Url(wrapped.ciphertext)};return this.encode(payload);
  }

  encode(payload){const body=utf8.encode(canonicalize(payload));if(body.length>MAX_KIT_BYTES)throw new ValidationError('KIT_TOO_LARGE','Recovery Kit exceeds size limit');const header=new Uint8Array(12);header.set(MAGIC,0);header[7]=RECOVERY_KIT_VERSION;new DataView(header.buffer).setUint32(8,body.length,false);return concatBytes(header,body);}
  parseKit(bytes){
    if(!(bytes instanceof Uint8Array)||bytes.length<12||bytes.length>MAX_KIT_BYTES)throw new ValidationError('INVALID_KIT_LENGTH','Recovery Kit length is invalid');
    for(let i=0;i<MAGIC.length;i++)if(bytes[i]!==MAGIC[i])throw new ValidationError('INVALID_KIT_MAGIC','Not a CJAS Recovery Kit');
    if(bytes[7]!==RECOVERY_KIT_VERSION)throw new ValidationError('UNSUPPORTED_KIT_VERSION','Unsupported Recovery Kit version');const length=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength).getUint32(8,false);if(length!==bytes.length-12)throw new ValidationError('INVALID_KIT_LENGTH','Recovery Kit payload length mismatch');
    let payload;try{payload=JSON.parse(utf8.decode(bytes.slice(12)));}catch{throw new ValidationError('INVALID_KIT_ENCODING','Recovery Kit payload is invalid');}this.validateKit(payload);return payload;
  }
  validateKit(payload){
    if(!payload||typeof payload!=='object'||Array.isArray(payload))throw new ValidationError('INVALID_KIT','Recovery Kit payload must be an object');for(const key of Object.keys(payload))if(!PAYLOAD_FIELDS.has(key))throw new ValidationError('UNKNOWN_KIT_FIELD',`Unknown Kit field: ${key}`);
    for(const field of PAYLOAD_FIELDS)if(!(field in payload))throw new ValidationError('MISSING_KIT_FIELD',`Missing Kit field: ${field}`);if(payload.kit_version!==RECOVERY_KIT_VERSION||payload.vault_format!=='cjas-vault-snapshot-v1')throw new ValidationError('UNSUPPORTED_KIT_VERSION','Unsupported Kit or Vault format');
    if(typeof payload.snapshot_id!=='string'||payload.snapshot_id.length<3)throw new ValidationError('INVALID_SNAPSHOT_ID','Invalid snapshot ID');assertHex(payload.ciphertext_sha256);if(!Array.isArray(payload.storage_locators)||!payload.storage_locators.length||payload.storage_locators.some((x)=>typeof x!=='string'||!x))throw new ValidationError('INVALID_LOCATORS','Invalid storage locators');
    if(typeof payload.kdf?.kdf_id!=='string'||payload.kdf.kdf_id!==payload.kdf.algorithm)throw new ValidationError('INVALID_KDF_ID','Recovery Kit KDF identity is invalid');base64UrlToBytes(payload.kdf?.salt??'',{maxBytes:64});base64UrlToBytes(payload.wrap_algorithm?.nonce??'',{maxBytes:32});base64UrlToBytes(payload.wrapped_dek??'',{maxBytes:128});if(payload.wrap_algorithm?.algorithm!=='AES-256-GCM')throw new ValidationError('UNSUPPORTED_WRAP','Unsupported DEK wrapping algorithm');return true;
  }
  async unwrapKit({kitBytes,password,kdfProvider,expectedSnapshotId,expectedCiphertextSha256}){
    const payload=this.parseKit(kitBytes);if(payload.snapshot_id!==expectedSnapshotId||payload.ciphertext_sha256!==expectedCiphertextSha256)throw new CryptoError('KIT_VERSION_MISMATCH','Recovery Kit does not belong to this Vault Version');if(kdfProvider?.algorithm!==payload.kdf.algorithm)throw new CryptoError('KDF_MISMATCH','Required KDF provider is unavailable; downgrade is forbidden');
    kdfProvider.validateParameters(payload.kdf.parameters);const salt=base64UrlToBytes(payload.kdf.salt,{maxBytes:64}),kek=await kdfProvider.deriveKey(password,salt,payload.kdf.parameters);const aad=canonicalBytes(aadFields(payload));
    try{return await this.unwrapDataKey({nonce:base64UrlToBytes(payload.wrap_algorithm.nonce,{maxBytes:32}),ciphertext:base64UrlToBytes(payload.wrapped_dek,{maxBytes:128})},kek,{aad});}catch{throw new CryptoError('KIT_UNLOCK_FAILED','Recovery Password is incorrect or Kit is damaged');}finally{cryptoEngine.wipeSensitiveReference(kek);}
  }
}

export const recoveryKitBuilder=new RecoveryKitBuilder();
