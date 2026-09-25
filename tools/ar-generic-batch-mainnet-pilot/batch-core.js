import {recoveryKitBuilder} from '../../src/recovery-kit/recovery-kit-builder.js';

export const BATCH_LIMITS=Object.freeze({max_total_bytes:50*1024*1024,local_concurrency:2,network_concurrency:3,max_fee_ar_per_file:0.12});

export async function mapConcurrent(items,limit,worker){
  if(!Number.isInteger(limit)||limit<1)throw new Error('并发设置无效。');
  const results=new Array(items.length);let cursor=0;
  async function run(){while(cursor<items.length){const index=cursor++;try{results[index]={status:'PASS',value:await worker(items[index],index)};}catch(error){results[index]={status:'FAIL',error};}}}
  await Promise.all(Array.from({length:Math.min(limit,items.length)},run));return results;
}

export function assertBatchSelection(files){
  if(!files.length)throw new Error('请选择本批次文件。');
  const names=new Set(files.map(file=>file.name.toLowerCase()));if(names.size!==files.length)throw new Error('Batch中不得包含同名文件，以免恢复交付时相互覆盖。');
  const total=files.reduce((sum,file)=>sum+file.size,0);if(total>BATCH_LIMITS.max_total_bytes)throw new Error('本批次文件总大小超过50MB，请减少文件后重试。');
  return{file_count:files.length,total_original_bytes:total};
}

export function validateEvidence(value){
  if(!value||value.network!=='Arweave Mainnet'||typeof value.txid!=='string'||!/^[-_A-Za-z0-9]{43}$/.test(value.txid)||!Number.isSafeInteger(value.archive_size)||!/^[a-f0-9]{64}$/.test(value.archive_sha256)||typeof value.recovery_kit_identifier!=='string')throw new Error('Mainnet Recovery Evidence 文件不完整或无法识别。');
  return value;
}

export function pairRecoveryMaterials(evidenceEntries,kitEntries){
  const kits=new Map();for(const entry of kitEntries){const parsed=recoveryKitBuilder.parseKit(entry.bytes);if(kits.has(parsed.snapshot_id))throw new Error('发现重复的 Recovery Kit。');kits.set(parsed.snapshot_id,{...entry,parsed});}
  const evidenceIds=new Set(),pairs=[];for(const entry of evidenceEntries){const evidence=validateEvidence(entry.evidence);if(evidenceIds.has(evidence.recovery_kit_identifier))throw new Error('发现重复的 Mainnet Recovery Evidence。');evidenceIds.add(evidence.recovery_kit_identifier);const kit=kits.get(evidence.recovery_kit_identifier);if(!kit)throw new Error(`找不到与 ${entry.name} 同一次创建的 Recovery Kit。`);pairs.push({evidenceEntry:entry,evidence,kitEntry:kit});kits.delete(evidence.recovery_kit_identifier);}
  if(kits.size)throw new Error('存在无法与 Mainnet Recovery Evidence 配对的 Recovery Kit。');return pairs;
}
