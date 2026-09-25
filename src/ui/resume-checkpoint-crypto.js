const DOMAIN='SKREK-LOCAL-RESUME-CHECKPOINT-V1';
const PARAMETERS=Object.freeze({name:'PBKDF2',hash:'SHA-256',iterations:300000});
const CIPHER=Object.freeze({name:'AES-GCM',tagLength:128});
const encoder=new TextEncoder(),decoder=new TextDecoder();

function requireCrypto(cryptoImpl){if(!cryptoImpl?.subtle||typeof cryptoImpl.getRandomValues!=='function')throw new Error('Web Crypto API is required');return cryptoImpl;}
function concat(parts){const size=parts.reduce((sum,item)=>sum+item.byteLength,0),out=new Uint8Array(size);let offset=0;for(const item of parts){out.set(item,offset);offset+=item.byteLength;}return out;}
function encodeBinary(value,buffers=[]){
  if(value instanceof Uint8Array){const index=buffers.length;buffers.push(value);return{$bytes:index,length:value.byteLength};}
  if(Array.isArray(value))return value.map(item=>encodeBinary(item,buffers));
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,encodeBinary(item,buffers)]));
  return value;
}
function decodeBinary(value,buffers){
  if(value&&typeof value==='object'&&!Array.isArray(value)&&Number.isInteger(value.$bytes)&&Object.keys(value).every(key=>['$bytes','length'].includes(key))){const bytes=buffers[value.$bytes];if(!bytes||bytes.byteLength!==value.length)throw new Error('Invalid encrypted checkpoint binary reference');return bytes;}
  if(Array.isArray(value))return value.map(item=>decodeBinary(item,buffers));
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,decodeBinary(item,buffers)]));
  return value;
}
export function encodeCheckpointPayload(payload){
  const buffers=[],json=encoder.encode(JSON.stringify(encodeBinary(payload,buffers))),header=new Uint8Array(4+4*buffers.length),view=new DataView(header.buffer);view.setUint32(0,json.byteLength);buffers.forEach((item,index)=>view.setUint32(4+index*4,item.byteLength));return concat([new Uint8Array([buffers.length>>>24,buffers.length>>>16,buffers.length>>>8,buffers.length]),header,json,...buffers]);
}
export function decodeCheckpointPayload(bytes){
  if(!(bytes instanceof Uint8Array)||bytes.byteLength<8)throw new Error('Invalid encrypted checkpoint payload');const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),count=view.getUint32(0),headerSize=4+4+count*4;if(headerSize>bytes.byteLength)throw new Error('Invalid encrypted checkpoint header');const jsonLength=view.getUint32(4);let offset=headerSize;if(offset+jsonLength>bytes.byteLength)throw new Error('Invalid encrypted checkpoint JSON');const json=JSON.parse(decoder.decode(bytes.subarray(offset,offset+jsonLength)));offset+=jsonLength;const buffers=[];for(let index=0;index<count;index++){const length=view.getUint32(8+index*4);if(offset+length>bytes.byteLength)throw new Error('Invalid encrypted checkpoint buffer');buffers.push(bytes.slice(offset,offset+length));offset+=length;}if(offset!==bytes.byteLength)throw new Error('Invalid encrypted checkpoint trailing bytes');return decodeBinary(json,buffers);
}
function aadFor(envelope){return encoder.encode(JSON.stringify({checkpoint_schema:envelope.checkpoint_schema,operation_id:envelope.operation_id,draft_id:envelope.operation.draft_id,version_id:envelope.operation.version_id,snapshot_id:envelope.operation.snapshot_id,archive_sha256:envelope.operation.archive_sha256,kdf_domain:DOMAIN}));}
async function deriveKey(password,salt,cryptoImpl){if(typeof password!=='string'||!password.length)throw new Error('Recovery Password is required');const subtle=cryptoImpl.subtle,material=await subtle.importKey('raw',encoder.encode(password.normalize('NFC')),'PBKDF2',false,['deriveKey']),domainSalt=concat([encoder.encode(DOMAIN),new Uint8Array([0]),salt]);return subtle.deriveKey({...PARAMETERS,salt:domainSalt},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
export async function encryptResumeCheckpoint({password,envelope,payload,cryptoImpl=globalThis.crypto}){const cryptoApi=requireCrypto(cryptoImpl),salt=cryptoApi.getRandomValues(new Uint8Array(16)),nonce=cryptoApi.getRandomValues(new Uint8Array(12)),key=await deriveKey(password,salt,cryptoApi),plaintext=encodeCheckpointPayload(payload),ciphertext=new Uint8Array(await cryptoApi.subtle.encrypt({...CIPHER,iv:nonce,additionalData:aadFor(envelope)},key,plaintext));plaintext.fill(0);return{checkpoint_crypto:{format:'SKREK_ENCRYPTED_RESUME_V1',kdf:{name:PARAMETERS.name,hash:PARAMETERS.hash,iterations:PARAMETERS.iterations,domain:DOMAIN,salt},cipher:{name:CIPHER.name,tag_length:CIPHER.tagLength,nonce}},encrypted_payload:ciphertext};}
export async function decryptResumeCheckpoint({password,record,cryptoImpl=globalThis.crypto}){try{const cryptoApi=requireCrypto(cryptoImpl),metadata=record?.checkpoint_crypto;if(metadata?.format!=='SKREK_ENCRYPTED_RESUME_V1'||metadata.kdf?.domain!==DOMAIN||metadata.kdf?.iterations!==PARAMETERS.iterations||metadata.kdf?.hash!==PARAMETERS.hash)throw new Error('Unsupported encrypted checkpoint');const key=await deriveKey(password,metadata.kdf.salt,cryptoApi),plaintext=new Uint8Array(await cryptoApi.subtle.decrypt({...CIPHER,iv:metadata.cipher.nonce,additionalData:aadFor(record)},key,record.encrypted_payload));try{return decodeCheckpointPayload(plaintext);}finally{plaintext.fill(0);}}catch{const error=new Error('无法解锁未完成的创建。请确认输入的是这份 Recovery Map 的 Recovery Password。');error.code='RESUME_CHECKPOINT_UNLOCK_FAILED';throw error;}}
export const RESUME_CHECKPOINT_CRYPTO=Object.freeze({format:'SKREK_ENCRYPTED_RESUME_V1',domain:DOMAIN,parameters:PARAMETERS});
