export function formatFileSize(bytes){if(bytes<1024)return`${bytes} B`;if(bytes<1024*1024)return`${(bytes/1024).toFixed(2)} KB`;return`${(bytes/(1024*1024)).toFixed(2)} MB`;}

export function createRecoveryDelivery({bytes,filename,mimeType,sha256}){
  if(!(bytes instanceof Uint8Array)||!bytes.length)throw new Error('RECOVERED_BYTES_INVALID');
  if(typeof filename!=='string'||!filename.toLowerCase().endsWith('.pdf'))throw new Error('RECOVERED_FILENAME_INVALID');
  if(mimeType!=='application/pdf')throw new Error('RECOVERED_MIME_INVALID');
  const immutableBytes=bytes.slice();
  return Object.freeze({filename,mimeType,sha256,size:immutableBytes.length,bytes:immutableBytes,download({documentRef=document,urlApi=URL,schedule=setTimeout}={}){let url;try{const blob=new Blob([immutableBytes],{type:mimeType});url=urlApi.createObjectURL(blob);const link=documentRef.createElement('a');link.href=url;link.download=filename;link.rel='noopener';documentRef.body.appendChild(link);link.click();link.remove();schedule(()=>urlApi.revokeObjectURL(url),1000);return{filename,mimeType,size:immutableBytes.length,sha256};}catch{if(url)urlApi.revokeObjectURL(url);throw new Error('RECOVERY_DOWNLOAD_FAILED');}}});
}

export const FILE_ROLE_MATRIX=Object.freeze([
  Object.freeze({filename:'CJAS-PDF-Pilot.cjas',extension:'.cjas',role:'Recovery Kit',internal_type:'CJASKIT + kit_version',wrapped_data_key:true,encrypted_archive:false,used_for_recovery:true,uploaded_mainnet:false}),
  Object.freeze({filename:'CJAS-PDF-Pilot.cjasvault',extension:'.cjasvault',role:'Encrypted Archive',internal_type:'archive_format_version 1 + AES-256-GCM',wrapped_data_key:false,encrypted_archive:true,used_for_recovery:true,uploaded_mainnet:true})
]);
