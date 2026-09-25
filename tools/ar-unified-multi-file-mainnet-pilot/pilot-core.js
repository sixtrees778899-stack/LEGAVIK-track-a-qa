import {cryptoEngine} from '../../src/crypto/crypto-engine.js';
import {createVaultArtifacts,recoverVaultArtifacts} from '../../src/ui/vault-pipeline.js';
import {base64UrlToBytes} from '../../src/shared/encoding.js';
import {STANDARD_MODULE_IDS} from '../../src/knowledge/schema-v2.js';
import {identifyAndValidateFile} from '../ar-generic-file-mainnet-pilot/pilot-core.js?v=final-whitelist-v2';
import {browserPerformanceContext,observeLongTasks,summarizeUploadPerformance} from '../../src/ui/upload-performance.js';

export const UNIFIED_LIMITS=Object.freeze({max_total_original_bytes:50*1024*1024,gateway_concurrency:2});
const elapsed=start=>Number((performance.now()-start).toFixed(1));

export async function validateIncomingFiles(files,existing=[]){
  const incoming=[...files];if(!incoming.length)throw new Error('请选择需要追加的文件。');
  const names=new Set(existing.map(item=>item.file.name.normalize('NFC').toLowerCase()));for(const file of incoming){const name=file.name.normalize('NFC').toLowerCase();if(names.has(name))throw new Error(`文件 ${file.name} 已存在，未覆盖原文件。`);names.add(name);}
  const total=existing.reduce((sum,item)=>sum+item.file.size,0)+incoming.reduce((sum,file)=>sum+file.size,0);if(total>UNIFIED_LIMITS.max_total_original_bytes)throw new Error('累计文件总大小超过50 MiB，请删除部分文件后重试。');
  const added=[];for(const file of incoming){const bytes=new Uint8Array(await file.arrayBuffer()),identity=identifyAndValidateFile(file,bytes);added.push({file,bytes,identity});}return added;
}

export async function createUnifiedVaultArtifacts({items,password,createdAt=new Date().toISOString(),idFactory=()=>crypto.randomUUID()}){
  if(!items.length)throw new Error('统一文件集合不能为空。');const total=items.reduce((sum,item)=>sum+item.bytes.length,0);if(total>UNIFIED_LIMITS.max_total_original_bytes)throw new Error('累计文件总大小超过50 MiB，请删除部分文件后重试。');
  const prepared=[];for(let index=0;index<items.length;index++){const item=items[index],sha256=await cryptoEngine.hashHex(item.bytes),id=`attachment-${String(index+1).padStart(4,'0')}-${sha256.slice(0,16)}`;prepared.push({...item,id,sha256});}
  const attachmentIds=prepared.map(item=>item.id),knowledgeGraph={schema_version:2,vault_title:'CJAS Unified Multi-File Archive Pilot',plan_type:'unified-multi-file-pilot',reviewed_at:createdAt,standard_modules:STANDARD_MODULE_IDS.map((id,index)=>({id,order:(index+1)*10})),custom_modules:[],assets:[{id:'asset-pilot-collection',type:'document-collection',label:'统一多文件测试集合',exists:true,platform_hint:'本地文件集合',condition_refs:['condition-pilot-access'],location_refs:['location-pilot-materials'],contact_refs:[],step_refs:['step-pilot-recover'],attachment_refs:attachmentIds,custom_field_refs:[]}],recovery_conditions:[{id:'condition-pilot-access',type:'recovery-materials',exists:true,asset_refs:['asset-pilot-collection'],location_refs:['location-pilot-materials'],fallback_path_refs:[],notes:'使用同一次创建的Recovery Kit、Mainnet Recovery Evidence和密码',custom_field_refs:[]}],fallback_paths:[],locations:[{id:'location-pilot-materials',label:'客户选择的恢复材料保存位置',type:'digital',finding_instructions:'找到同一次创建的Recovery Kit和Mainnet Recovery Evidence',access_prerequisites:[],attachment_refs:[],custom_field_refs:[]}],assistance:{needed:false},contacts:[],recovery_steps:[{id:'step-pilot-recover',sequence:1,risk_level:'low',action:'从Mainnet下载统一Archive并在浏览器本地恢复',completion_check:'全部文件SHA-256及字节长度一致',failure_action:'停止并核对恢复材料',stop_condition:'任何大小或SHA-256不一致',asset_refs:['asset-pilot-collection'],condition_refs:['condition-pilot-access'],location_refs:['location-pilot-materials'],contact_refs:[],warning_refs:[],attachment_refs:attachmentIds}],warnings:[],attachments:prepared.map(item=>({id:item.id,display_name:item.identity.filename,media_type:item.identity.mimeType,byte_length:item.bytes.length,sha256:item.sha256,module_refs:['evidence-messages'],owner_entity_refs:['asset-pilot-collection'],purpose:'统一多文件恢复测试',sensitive_acknowledged:true})),personal_message:null,custom_fields:[]};
  const attachmentPayloads=Object.fromEntries(prepared.map(item=>[item.id,item.bytes])),snapshotId=`unified-${idFactory()}`,vaultId=`unified-vault-${idFactory()}`,started=performance.now(),artifacts=await createVaultArtifacts({knowledgeGraph,attachmentPayloads,password,wizardConfigVersion:3,vaultId,snapshotId,createdAt});
  return{...artifacts,snapshotId,vaultId,fileCount:prepared.length,totalOriginalBytes:total,files:prepared.map(({bytes,file,...item})=>({...item,originalBytes:bytes})),createMs:elapsed(started)};
}

export async function recoverUnifiedFiles({archiveBytes,kitBytes,password}){
  const started=performance.now(),recovered=await recoverVaultArtifacts({archiveBytes,kitBytes,password}),results=[];for(const attachment of recovered.snapshot.knowledge_graph.attachments){const bytes=base64UrlToBytes(recovered.snapshot.attachment_payloads[attachment.id]),sha256=await cryptoEngine.hashHex(bytes);if(bytes.length!==attachment.byte_length||sha256!==attachment.sha256)throw new Error(`附件 ${attachment.display_name} 完整性验证失败。`);results.push({id:attachment.id,filename:attachment.display_name,mimeType:attachment.media_type,bytes,size:bytes.length,sha256,sha_match:true,byte_match:true});}return{snapshot:recovered.snapshot,files:results,recoveryMs:elapsed(started)};
}

export async function uploadSignedTransaction({arweave,transaction,onProgress=()=>{},chunkTimeoutMs=30000,maxChunkAttempts=3,clock=()=>performance.now(),sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms))}){
  if(!arweave?.transactions?.getUploader||!transaction?.id)throw new Error('无法启动分块Mainnet上传。');
  const started=clock(),prepareStarted=clock(),uploader=await arweave.transactions.getUploader(transaction),prepareChunksMs=clock()-prepareStarted,chunks=[],longTasks=observeLongTasks(),context=browserPerformanceContext();let currentMetrics=null;
  const originalGetChunk=typeof transaction.getChunk==='function'?transaction.getChunk:null,originalPost=typeof arweave?.api?.post==='function'?arweave.api.post:null;let getChunkWrapped=false,postWrapped=false;
  try{if(originalGetChunk){transaction.getChunk=function(...args){const itemStarted=clock();try{return originalGetChunk.apply(this,args);}finally{if(currentMetrics)currentMetrics.get_chunk_ms+=clock()-itemStarted;}};getChunkWrapped=true;}}catch{}
  try{if(originalPost){arweave.api.post=async function(path,...args){const requestStarted=clock();if(currentMetrics){currentMetrics.request_start_ms=Number((requestStarted-started).toFixed(1));currentMetrics.api_post_started=requestStarted;}try{const response=await originalPost.call(this,path,...args);if(currentMetrics)currentMetrics.http_status=response?.status??null;return response;}finally{if(currentMetrics){const ended=clock();currentMetrics.http_ms+=ended-requestStarted;currentMetrics.response_end_ms=Number((ended-started).toFixed(1));}}};postWrapped=true;}}catch{}
  try{while(!uploader.isComplete){
    const chunkStarted=clock(),uploadedBefore=uploader.uploadedChunks??0;let lastError=null,retryMs=0,attemptUsed=0;
    currentMetrics={get_chunk_ms:0,http_ms:0,api_post_started:null,request_start_ms:null,response_end_ms:null,http_status:null};
    for(let attempt=1;attempt<=maxChunkAttempts;attempt++){
      attemptUsed=attempt;
      try{
        let timer;try{await Promise.race([uploader.uploadChunk(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Object.assign(new Error('Mainnet上传分块超时。'),{code:'UPLOAD_CHUNK_TIMEOUT'})),chunkTimeoutMs);})]);}finally{clearTimeout(timer);}
        lastError=null;break;
      }catch(error){lastError=error;if(attempt<maxChunkAttempts){const delay=Math.min(250*2**(attempt-1),2000);retryMs+=delay;await sleep(delay);}}
    }
    if(lastError)throw Object.assign(new Error('Mainnet上传未完成；可安全重试同一笔已签名交易。'),{code:'UPLOAD_CHUNK_FAILED',stage:'BROADCAST',transaction_id:transaction.id,cause:lastError});
    const uploadedAfter=uploader.uploadedChunks??uploadedBefore,kind=uploadedAfter===uploadedBefore?'transaction_header':'data_chunk',chunkIndex=Math.max(0,uploadedAfter-1),descriptor=transaction?.chunks?.chunks?.[chunkIndex],payloadBytes=kind==='data_chunk'&&descriptor?descriptor.maxByteRange-descriptor.minByteRange:null,localBeforeHttp=Math.max(0,(currentMetrics.api_post_started??clock())-chunkStarted),proofMs=Math.max(0,localBeforeHttp-currentMetrics.get_chunk_ms),entry={kind,chunk_index:kind==='data_chunk'?chunkIndex:null,offset:kind==='data_chunk'?descriptor?.minByteRange??null:null,payload_bytes:payloadBytes,get_chunk_ms:Number(currentMetrics.get_chunk_ms.toFixed(1)),proof_validation_ms:Number(proofMs.toFixed(1)),serialization_ms:null,http_ms:Number(currentMetrics.http_ms.toFixed(1)),ttfb_ms:null,request_start_ms:currentMetrics.request_start_ms,response_end_ms:currentMetrics.response_end_ms,http_status:currentMetrics.http_status??uploader.lastResponseStatus??null,attempt:attemptUsed,retry_count:attemptUsed-1,backoff_ms:retryMs,uploaded_chunks:uploadedAfter,total_chunks:uploader.totalChunks,pct_complete:uploader.pctComplete,roundtrip_ms:Number((clock()-chunkStarted).toFixed(1))};chunks.push(entry);const uploadedPayload=chunks.reduce((sum,item)=>sum+(item.payload_bytes??0),0),runningMs=Math.max(1,clock()-started);entry.rolling_throughput_mbps=Number((uploadedPayload*8/runningMs/1000).toFixed(3));onProgress(entry);currentMetrics=null;
  }}finally{try{if(getChunkWrapped)transaction.getChunk=originalGetChunk;}catch{}try{if(postWrapped)arweave.api.post=originalPost;}catch{}longTasks.stop();}
  const ended=clock();longTasks.stop();const performanceReport=summarizeUploadPerformance({prepareChunksMs,entries:chunks,startedAt:started,endedAt:ended,network:context.network,memory:context.memory,longTasks:longTasks.entries});
  return{txid:transaction.id,upload_strategy:'ARWEAVE_CHUNK_UPLOADER',upload_ms:Number((ended-started).toFixed(1)),chunk_count:chunks.filter(item=>item.kind==='data_chunk').length,chunks,performance:performanceReport};
}

export function validateUnifiedEvidence(value){if(!value||value.network!=='Arweave Mainnet'||typeof value.txid!=='string'||!/^[-_A-Za-z0-9]{43}$/.test(value.txid)||!Number.isSafeInteger(value.archive_size)||!/^[a-f0-9]{64}$/.test(value.archive_sha256)||typeof value.recovery_kit_identifier!=='string')throw new Error('Mainnet Recovery Evidence文件不完整或无法识别。');return value;}
