import {cryptoEngine} from '../../src/crypto/crypto-engine.js';
import {Pbkdf2Provider} from '../../src/crypto/kdf-provider.js';
import {RecoveryKitBuilder} from '../../src/recovery-kit/recovery-kit-builder.js';
import {EXPERIENCE_KDF_PARAMETERS} from '../../src/ui/vault-pipeline.js';
import {decodeMp4Archive,encodeMp4Archive,mp4ArchiveAad,MP4_ARCHIVE_LIMITS} from './mp4-archive.js';

const KIT_BUILDER=new RecoveryKitBuilder(),KDF=new Pbkdf2Provider();
const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
const fromHex=value=>Uint8Array.from(value.match(/.{2}/g)??[],part=>Number.parseInt(part,16));
const elapsed=start=>Number((performance.now()-start).toFixed(1));

export function assertCustomerMp4(file,header){
  if(!file||!Number.isSafeInteger(file.size)||file.size<=0)throw new Error('请选择有效的 MP4 文件。');
  if(file.size>MP4_ARCHIVE_LIMITS.max_file_bytes)throw new Error('MP4 不得超过 10 MB。');
  if(file.type!=='video/mp4'||!file.name.toLowerCase().endsWith('.mp4'))throw new Error('请选择扩展名为 .mp4、类型为 video/mp4 的文件。');
  if(!(header instanceof Uint8Array)||header.length<12||String.fromCharCode(...header.slice(4,8))!=='ftyp')throw new Error('该文件不是可识别的 MP4 容器。');
  return true;
}

export async function createMp4PilotArtifacts({bytes,filename,mimeType,password,createdAt=new Date().toISOString()}){
  if(!(bytes instanceof Uint8Array))throw new Error('MP4 无法读取。');assertCustomerMp4({size:bytes.length,name:filename,type:mimeType},bytes.slice(0,16));
  const originalHashStart=performance.now(),originalSha256=await cryptoEngine.hashHex(bytes),originalHashMs=elapsed(originalHashStart);let dataKey,passwordReference=password;
  try{
    dataKey=cryptoEngine.generateDataKey();const encryptionStart=performance.now(),envelope=await cryptoEngine.encryptSnapshot(bytes,{dataKey,aad:mp4ArchiveAad()}),encryptionMs=elapsed(encryptionStart);
    const archiveStart=performance.now(),archiveBytes=encodeMp4Archive({nonce:envelope.nonce,ciphertext:envelope.ciphertext,filename,mimeType,originalSize:bytes.length,originalSha256Bytes:fromHex(originalSha256)}),archiveGenerationMs=elapsed(archiveStart);
    const archiveHashStart=performance.now(),archiveSha256=await cryptoEngine.hashHex(archiveBytes),archiveHashMs=elapsed(archiveHashStart),pilotId=`mp4-${originalSha256.slice(0,16)}-${Date.now()}`;
    const kitStart=performance.now(),kitBytes=await KIT_BUILDER.createKit({password:passwordReference,dataKey,snapshotId:pilotId,ciphertextSha256:archiveSha256,storageLocators:[`${filename}.cjasmp4archive`],kdfProvider:KDF,kdfParameters:EXPERIENCE_KDF_PARAMETERS,createdAt,toolCompatibility:'CJAS-MP4-Pilot-V1'}),kitGenerationMs=elapsed(kitStart);
    return{pilotId,originalSha256,archiveSha256,archiveBytes,kitBytes,timings:{original_hash_ms:originalHashMs,aes_256_gcm_ms:encryptionMs,archive_generation_ms:archiveGenerationMs,archive_hash_ms:archiveHashMs,recovery_kit_ms:kitGenerationMs},overheadBytes:archiveBytes.length-bytes.length,overheadPercent:(archiveBytes.length-bytes.length)/bytes.length*100};
  }finally{passwordReference='';if(dataKey)cryptoEngine.wipeSensitiveReference(dataKey);}
}

export async function recoverMp4Pilot({archiveBytes,kitBytes,password}){
  const archiveSha256=await cryptoEngine.hashHex(archiveBytes),parsed=decodeMp4Archive(archiveBytes),kit=KIT_BUILDER.parseKit(kitBytes),dataKey=await KIT_BUILDER.unwrapKit({kitBytes,password,kdfProvider:KDF,expectedSnapshotId:kit.snapshot_id,expectedCiphertextSha256:archiveSha256});
  try{const bytes=await cryptoEngine.decryptSnapshot({algorithm:'AES-256-GCM',nonce:parsed.nonce,aad:parsed.aad,ciphertext:parsed.ciphertext},{dataKey,expectedAad:mp4ArchiveAad()}),hash=await cryptoEngine.hashHex(bytes);if(bytes.length!==parsed.originalSize||hash!==hex(parsed.originalSha256Bytes))throw new Error('恢复 MP4 完整性校验失败。');return{bytes,filename:parsed.filename,mimeType:parsed.mimeType,sha256:hash};}finally{cryptoEngine.wipeSensitiveReference(dataKey);}
}

export function quoteProjection({quoteAR,archiveBytes,balanceAR}){const mib=archiveBytes/(1024*1024);return{quote_ar:quoteAR,ar_per_mib:quoteAR/mib,projected_balance_ar:balanceAR-quoteAR,estimated_50_mib_ar:quoteAR/mib*50};}
