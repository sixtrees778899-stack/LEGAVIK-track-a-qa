import {utf8} from '../../src/shared/encoding.js';
import {ValidationError} from '../../src/shared/errors.js';

const MAGIC=utf8.encode('CJASMP4A'),VERSION=1,HEADER_BYTES=56,MAX_FILE_BYTES=10*1024*1024;
const AAD=utf8.encode('CJAS-MP4-MAINNET-PILOT-V1');

function requireBytes(value,name){if(!(value instanceof Uint8Array))throw new ValidationError('INVALID_MP4_ARCHIVE',`${name} must be bytes`);}
function readText(bytes,start,length){return utf8.decode(bytes.slice(start,start+length));}

export function mp4ArchiveAad(){return AAD.slice();}

export function encodeMp4Archive({nonce,ciphertext,filename,mimeType='video/mp4',originalSize,originalSha256Bytes}){
  requireBytes(nonce,'nonce');requireBytes(ciphertext,'ciphertext');requireBytes(originalSha256Bytes,'original hash');
  if(nonce.length!==12||originalSha256Bytes.length!==32)throw new ValidationError('INVALID_MP4_ARCHIVE','Invalid nonce or hash length');
  if(!Number.isSafeInteger(originalSize)||originalSize<=0||originalSize>MAX_FILE_BYTES||ciphertext.length!==originalSize+16)throw new ValidationError('INVALID_MP4_ARCHIVE','Invalid MP4 or ciphertext length');
  if(mimeType!=='video/mp4'||typeof filename!=='string'||!filename.toLowerCase().endsWith('.mp4'))throw new ValidationError('INVALID_MP4_ARCHIVE','Invalid MP4 identity');
  const filenameBytes=utf8.encode(filename),mimeBytes=utf8.encode(mimeType),aad=mp4ArchiveAad();
  if(filenameBytes.length>1024||mimeBytes.length>64)throw new ValidationError('INVALID_MP4_ARCHIVE','Metadata is too large');
  const total=HEADER_BYTES+nonce.length+aad.length+mimeBytes.length+filenameBytes.length+ciphertext.length,result=new Uint8Array(total),view=new DataView(result.buffer);
  result.set(MAGIC,0);result[8]=VERSION;result[9]=nonce.length;view.setUint16(10,aad.length,false);view.setUint16(12,mimeBytes.length,false);view.setUint16(14,filenameBytes.length,false);view.setUint32(16,originalSize,false);view.setUint32(20,ciphertext.length,false);result.set(originalSha256Bytes,24);
  let offset=HEADER_BYTES;result.set(nonce,offset);offset+=nonce.length;result.set(aad,offset);offset+=aad.length;result.set(mimeBytes,offset);offset+=mimeBytes.length;result.set(filenameBytes,offset);offset+=filenameBytes.length;result.set(ciphertext,offset);return result;
}

export function decodeMp4Archive(bytes){
  requireBytes(bytes,'archive');if(bytes.length<HEADER_BYTES)throw new ValidationError('INVALID_MP4_ARCHIVE','Archive is truncated');
  for(let i=0;i<MAGIC.length;i++)if(bytes[i]!==MAGIC[i])throw new ValidationError('INVALID_MP4_ARCHIVE','Archive magic is invalid');
  if(bytes[8]!==VERSION)throw new ValidationError('INVALID_MP4_ARCHIVE','Archive version is unsupported');
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),nonceLength=bytes[9],aadLength=view.getUint16(10,false),mimeLength=view.getUint16(12,false),filenameLength=view.getUint16(14,false),originalSize=view.getUint32(16,false),ciphertextLength=view.getUint32(20,false);
  const expected=HEADER_BYTES+nonceLength+aadLength+mimeLength+filenameLength+ciphertextLength;if(nonceLength!==12||expected!==bytes.length||ciphertextLength!==originalSize+16||originalSize>MAX_FILE_BYTES)throw new ValidationError('INVALID_MP4_ARCHIVE','Archive length is invalid');
  const originalSha256Bytes=bytes.slice(24,56);let offset=HEADER_BYTES,nonce=bytes.slice(offset,offset+nonceLength);offset+=nonceLength;const aad=bytes.slice(offset,offset+aadLength);offset+=aadLength;const mimeType=readText(bytes,offset,mimeLength);offset+=mimeLength;const filename=readText(bytes,offset,filenameLength);offset+=filenameLength;const ciphertext=bytes.slice(offset);
  if(mimeType!=='video/mp4'||!filename.toLowerCase().endsWith('.mp4'))throw new ValidationError('INVALID_MP4_ARCHIVE','Archive MP4 identity is invalid');
  return{version:VERSION,nonce,aad,mimeType,filename,originalSize,originalSha256Bytes,ciphertext};
}

export const MP4_ARCHIVE_LIMITS=Object.freeze({max_file_bytes:MAX_FILE_BYTES,header_bytes:HEADER_BYTES,version:VERSION});
