import {utf8} from '../../src/shared/encoding.js';
import {ValidationError} from '../../src/shared/errors.js';
import {FILE_FORMAT_POLICY} from './file-format-policy.js?v=final-whitelist-v2';

const MAGIC=utf8.encode('CJASGEN1'),VERSION=1,HEADER_BYTES=57,MAX_FILE_BYTES=10*1024*1024;
const AAD=utf8.encode('CJAS-GENERIC-FILE-MAINNET-PILOT-V1');
const requireBytes=(value,name)=>{if(!(value instanceof Uint8Array))throw new ValidationError('INVALID_GENERIC_ARCHIVE',`${name} must be bytes`);};
const readText=(bytes,start,length)=>utf8.decode(bytes.slice(start,start+length));

export const genericArchiveAad=()=>AAD.slice();
export const GENERIC_ARCHIVE_LIMITS=Object.freeze({max_file_bytes:MAX_FILE_BYTES,header_bytes:HEADER_BYTES,version:VERSION});
export const GENERIC_FILE_TYPES=FILE_FORMAT_POLICY;

export function encodeGenericArchive({nonce,ciphertext,fileType,filename,mimeType,originalSize,originalSha256Bytes}){
  requireBytes(nonce,'nonce');requireBytes(ciphertext,'ciphertext');requireBytes(originalSha256Bytes,'original hash');
  const rule=FILE_FORMAT_POLICY[fileType];if(!rule||!rule.mimes.includes(mimeType))throw new ValidationError('INVALID_GENERIC_ARCHIVE','Invalid file identity');
  if(nonce.length!==12||originalSha256Bytes.length!==32||!Number.isSafeInteger(originalSize)||originalSize<=0||originalSize>MAX_FILE_BYTES||ciphertext.length!==originalSize+16)throw new ValidationError('INVALID_GENERIC_ARCHIVE','Invalid archive lengths');
  const typeBytes=utf8.encode(fileType),nameBytes=utf8.encode(filename),mimeBytes=utf8.encode(mimeType),aad=genericArchiveAad();
  if(typeBytes.length>16||nameBytes.length>1024||mimeBytes.length>128)throw new ValidationError('INVALID_GENERIC_ARCHIVE','Archive metadata is too large');
  const result=new Uint8Array(HEADER_BYTES+nonce.length+aad.length+typeBytes.length+mimeBytes.length+nameBytes.length+ciphertext.length),view=new DataView(result.buffer);
  result.set(MAGIC,0);result[8]=VERSION;result[9]=nonce.length;view.setUint16(10,aad.length,false);result[12]=typeBytes.length;view.setUint16(13,mimeBytes.length,false);view.setUint16(15,nameBytes.length,false);view.setUint32(17,originalSize,false);view.setUint32(21,ciphertext.length,false);result.set(originalSha256Bytes,25);
  let offset=HEADER_BYTES;for(const part of [nonce,aad,typeBytes,mimeBytes,nameBytes,ciphertext]){result.set(part,offset);offset+=part.length;}return result;
}

export function decodeGenericArchive(bytes){
  requireBytes(bytes,'archive');if(bytes.length<HEADER_BYTES)throw new ValidationError('INVALID_GENERIC_ARCHIVE','Archive is truncated');for(let i=0;i<MAGIC.length;i++)if(bytes[i]!==MAGIC[i])throw new ValidationError('INVALID_GENERIC_ARCHIVE','Archive magic is invalid');if(bytes[8]!==VERSION)throw new ValidationError('INVALID_GENERIC_ARCHIVE','Archive version is unsupported');
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),nonceLength=bytes[9],aadLength=view.getUint16(10,false),typeLength=bytes[12],mimeLength=view.getUint16(13,false),nameLength=view.getUint16(15,false),originalSize=view.getUint32(17,false),ciphertextLength=view.getUint32(21,false),expected=HEADER_BYTES+nonceLength+aadLength+typeLength+mimeLength+nameLength+ciphertextLength;
  if(nonceLength!==12||expected!==bytes.length||ciphertextLength!==originalSize+16||originalSize<=0||originalSize>MAX_FILE_BYTES)throw new ValidationError('INVALID_GENERIC_ARCHIVE','Archive length is invalid');
  let offset=HEADER_BYTES;const take=length=>{const value=bytes.slice(offset,offset+length);offset+=length;return value;};const nonce=take(nonceLength),aad=take(aadLength),fileType=readText(bytes,offset,typeLength);offset+=typeLength;const mimeType=readText(bytes,offset,mimeLength);offset+=mimeLength;const filename=readText(bytes,offset,nameLength);offset+=nameLength;const rule=FILE_FORMAT_POLICY[fileType];if(!rule||!rule.mimes.includes(mimeType)||!rule.extensions.some(ext=>filename.toLowerCase().endsWith(ext)))throw new ValidationError('INVALID_GENERIC_ARCHIVE','Archive file identity is invalid');
  return{version:VERSION,nonce,aad,fileType,mimeType,filename,originalSize,originalSha256Bytes:bytes.slice(25,57),ciphertext:bytes.slice(offset)};
}
