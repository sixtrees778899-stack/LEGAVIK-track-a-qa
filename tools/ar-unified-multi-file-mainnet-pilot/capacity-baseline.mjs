import {snapshotBytes} from '../../src/snapshot/snapshot-builder.js';
import {createUnifiedVaultArtifacts} from './pilot-core.js';

const MiB=1024*1024,points=[1,10,20,30,49],maxFile=8*MiB,password='CJAS local capacity baseline only 2026!';
const encodedLength=length=>Math.ceil(length*4/3);
const memory=()=>process.memoryUsage().rss;

function makeItems(totalMiB){
  let remaining=totalMiB*MiB,index=0;const items=[];
  while(remaining){const length=Math.min(remaining,maxFile),bytes=new Uint8Array(length);bytes.fill(65+(index%26));const filename=`capacity-${totalMiB}mib-${String(++index).padStart(2,'0')}.txt`;items.push({file:{name:filename,type:'text/plain',size:length},bytes,identity:{fileType:'txt',filename,mimeType:'text/plain',size:length}});remaining-=length;}
  return items;
}

async function measure(totalMiB){
  const items=makeItems(totalMiB),before=memory();let peak=before;const sampler=setInterval(()=>{peak=Math.max(peak,memory());},5),started=performance.now();
  const artifacts=await createUnifiedVaultArtifacts({items,password,createdAt:'2026-08-09T00:00:00.000Z',idFactory:(()=>{let value=0;return()=>`capacity-${totalMiB}-${++value}`;})()});clearInterval(sampler);peak=Math.max(peak,memory());
  const original=artifacts.totalOriginalBytes,snapshot=snapshotBytes(artifacts.snapshot).length,archive=artifacts.archiveBytes.length,outer=JSON.parse(new TextDecoder().decode(artifacts.archiveBytes)),payloadCharacters=items.reduce((sum,item)=>sum+encodedLength(item.bytes.length),0),ciphertextDecoded=snapshot+16;
  return{file_count:items.length,original_bytes:original,snapshot_bytes:snapshot,archive_bytes:archive,archive_original_ratio:Number((archive/original).toFixed(6)),local_create_ms:Number((performance.now()-started).toFixed(1)),observed_rss_delta_bytes:Math.max(0,peak-before),composition:{original_attachment_bytes:original,attachment_base64_overhead_bytes:payloadCharacters-original,snapshot_metadata_and_json_bytes:snapshot-payloadCharacters,aes_gcm_tag_bytes:16,archive_ciphertext_base64_overhead_bytes:outer.ciphertext.length-ciphertextDecoded,archive_wrapper_bytes:archive-outer.ciphertext.length}};
}

const results=[];for(const point of points){results.push(await measure(point));if(globalThis.gc)globalThis.gc();}
console.log(JSON.stringify({generated_at:new Date().toISOString(),method:'deterministic in-memory TXT attachments; frozen Unified Snapshot/Archive/Kit pipeline; no wallet and no broadcast',results},null,2));
