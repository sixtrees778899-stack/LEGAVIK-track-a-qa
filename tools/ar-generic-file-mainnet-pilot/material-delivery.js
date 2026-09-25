export async function saveMaterial(bytes,filename,mimeType='application/octet-stream',{preferPicker=true,windowRef=globalThis.window,documentRef=globalThis.document,urlApi=globalThis.URL}={}){
  const blob=new Blob([bytes],{type:mimeType});
  if(preferPicker&&typeof windowRef.showSaveFilePicker==='function'){
    try{const handle=await windowRef.showSaveFilePicker({suggestedName:filename}),writable=await handle.createWritable();await writable.write(blob);await writable.close();return{saved:true,method:'save-picker',filename};}
    catch(error){if(error?.name==='AbortError')return{saved:false,cancelled:true,method:'save-picker',filename};throw new Error('保存未完成，请重新选择保存位置后重试。');}
  }
  let url;try{url=urlApi.createObjectURL(blob);const link=documentRef.createElement('a');link.href=url;link.download=filename;link.rel='noopener';documentRef.body.appendChild(link);link.click();link.remove();setTimeout(()=>urlApi.revokeObjectURL(url),1000);return{saved:true,method:'browser-download',filename};}
  catch{if(url)urlApi.revokeObjectURL(url);throw new Error('下载未能启动，请允许浏览器下载后重试。');}
}
export function materialStem(artifacts){const id=String(artifacts?.pilotId??'').replace(/[^A-Za-z0-9_-]/g,'-');if(!id)throw new Error('恢复材料共同标识缺失。');return `CJAS-${id}`;}
export function materialFilename(role,artifacts,extension){
  const allowed=new Set(['Recovery-Kit','Mainnet-Recovery-Evidence','Local-Encrypted-Backup']);
  if(!allowed.has(role)||!/^\.[A-Za-z0-9]+$/.test(extension))throw new Error('恢复材料文件名参数无效。');
  return `${role}-${materialStem(artifacts)}${extension}`;
}
