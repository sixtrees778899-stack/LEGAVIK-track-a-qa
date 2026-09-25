import {createClient} from '@supabase/supabase-js';

const PENDING_KEY='skrek.customer-center.lifecycle-sync-pending.v1';
const VERSION_PENDING_KEY='skrek.customer-center.version-sync-pending.v1';
let client;
function getClient(){const config=globalThis.SKREK_PUBLIC_CONFIG??{};if(!config.supabaseUrl||!config.supabaseAnonKey)return null;client??=globalThis.LEGAVIK_SUPABASE_CLIENT??=createClient(config.supabaseUrl,config.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});return client;}
const txidPattern=/^[-_A-Za-z0-9]{43}$/;
const hashPattern=/^[0-9a-f]{64}$/;

export function createPublishedLifecyclePayload({operation,evidence,artifacts,displayName='Recovery Map',plan='未指定',publishedAt}={}){
  const archiveSize=Number(evidence?.archive_size??evidence?.archive_size_bytes??artifacts?.archiveBytes?.byteLength);
  if(operation?.state!=='COMPLETE'||operation?.status!=='COMPLETE')throw Object.assign(new Error('Recovery Map publication is not stably complete.'),{code:'LIFECYCLE_NOT_COMPLETE'});
  if(evidence?.status!=='READY_FOR_INDEPENDENT_RECOVERY'||evidence?.background_verification!=='PASS')throw Object.assign(new Error('Recovery Map publication has not passed gateway verification.'),{code:'LIFECYCLE_NOT_VERIFIED'});
  if(!operation.draft_id||!operation.version_id||!operation.operation_id||!operation.snapshot_id||!txidPattern.test(evidence.txid??operation.transaction_id??'')||!hashPattern.test(evidence.archive_sha256??operation.archive_sha256??'')||!Number.isFinite(archiveSize)||archiveSize<0)throw Object.assign(new Error('Recovery Map lifecycle identity is incomplete.'),{code:'LIFECYCLE_IDENTITY_INVALID'});
  return Object.freeze({
    p_recovery_map_id:operation.draft_id,
    p_version_id:operation.version_id,
    p_operation_id:operation.operation_id,
    p_snapshot_id:operation.snapshot_id,
    p_txid:evidence.txid??operation.transaction_id,
    p_archive_sha256:evidence.archive_sha256??operation.archive_sha256,
    p_archive_size_bytes:archiveSize,
    p_network:evidence.network??'arweave-mainnet',
    p_display_name:String(displayName||'Recovery Map').trim()||'Recovery Map',
    p_plan:String(plan||'未指定'),
    p_published_at:publishedAt??evidence.first_downloadable_at??evidence.evidence_ready_at??new Date().toISOString(),
    p_operation_state:'COMPLETE',
    p_evidence_status:'READY_FOR_INDEPENDENT_RECOVERY',
    p_verification_status:'PASS'
  });
}

export async function syncPublishedRecoveryMapV1(input){
  const payload=input?.p_operation_id?input:createPublishedLifecyclePayload(input);
  const supabase=getClient();if(!supabase)return {synced:false,reason:'NOT_CONFIGURED',payload};
  const {data:{session},error:sessionError}=await supabase.auth.getSession();if(sessionError)throw sessionError;if(!session)return {synced:false,reason:'NOT_AUTHENTICATED',payload};
  const {data,error}=await supabase.rpc('record_published_recovery_map_v1',payload);if(error)throw error;
  return {synced:true,result:Array.isArray(data)?data[0]:data,payload};
}

export async function syncPublishedRecoveryMapVersion(input,{recoveryMapId}={}){
  const payload=input?.p_operation_id?{...input}:createPublishedLifecyclePayload(input);
  if(!recoveryMapId)throw Object.assign(new Error('Recovery Map family identity is required.'),{code:'RECOVERY_MAP_ID_REQUIRED'});
  payload.p_recovery_map_id=recoveryMapId;
  const supabase=getClient();if(!supabase)return {synced:false,reason:'NOT_CONFIGURED',payload};
  const {data:{session},error:sessionError}=await supabase.auth.getSession();if(sessionError)throw sessionError;if(!session)return {synced:false,reason:'NOT_AUTHENTICATED',payload};
  const {data,error}=await supabase.rpc('record_published_recovery_map_version',payload);if(error)throw error;
  return {synced:true,result:Array.isArray(data)?data[0]:data,payload};
}

export function queuePublishedLifecycleSync(payload,{storage=globalThis.localStorage}={}){storage?.setItem(PENDING_KEY,JSON.stringify(payload));return payload;}
export function pendingPublishedLifecycleSync({storage=globalThis.localStorage}={}){try{return JSON.parse(storage?.getItem(PENDING_KEY)??'null');}catch{return null;}}
export async function retryPendingPublishedLifecycleSync({storage=globalThis.localStorage}={}){const payload=pendingPublishedLifecycleSync({storage});if(!payload)return {synced:false,reason:'NOT_PENDING'};const result=await syncPublishedRecoveryMapV1(payload);if(result.synced)storage?.removeItem(PENDING_KEY);return result;}

export function queuePublishedVersionSync(payload,{recoveryMapId,storage=globalThis.localStorage}={}){
  if(!recoveryMapId)throw Object.assign(new Error('Recovery Map family identity is required.'),{code:'RECOVERY_MAP_ID_REQUIRED'});
  const record={payload,recoveryMapId};storage?.setItem(VERSION_PENDING_KEY,JSON.stringify(record));return record;
}
export function pendingPublishedVersionSync({storage=globalThis.localStorage}={}){try{return JSON.parse(storage?.getItem(VERSION_PENDING_KEY)??'null');}catch{return null;}}
export async function retryPendingPublishedVersionSync({storage=globalThis.localStorage}={}){const record=pendingPublishedVersionSync({storage});if(!record?.payload||!record?.recoveryMapId)return {synced:false,reason:'NOT_PENDING'};const result=await syncPublishedRecoveryMapVersion(record.payload,{recoveryMapId:record.recoveryMapId});if(result.synced)storage?.removeItem(VERSION_PENDING_KEY);return result;}

export const CUSTOMER_CENTER_LIFECYCLE=Object.freeze({pendingKey:PENDING_KEY,versionPendingKey:VERSION_PENDING_KEY,formalState:'PUBLISHED',currentVersionStatus:'CURRENT'});
