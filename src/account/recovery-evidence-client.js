import {cryptoEngine} from '../crypto/crypto-engine.js';

export const RECOVERY_EVIDENCE_SCHEMA='LEGAVIK-RECOVERY-EVIDENCE-EVENT-V1';
export const RECOVERY_RECEIPT_SCHEMA='LEGAVIK-INDEPENDENT-RECOVERY-RECEIPT-V1';
export const RECOVERY_ENGINE_IDENTITY='LEGAVIK-RECOVERY-ENGINE:CJAS-VAULT-ARCHIVE-V1';
const EVENTS=new Set(['VERSION_CREATED','MAINNET_PUBLISHED','INITIAL_RECOVERY_VERIFICATION','ONLINE_RECOVERY','GUIDED_RECOVERY_DRILL','INDEPENDENT_RECOVERY_RECEIPT_IMPORTED']);
const SOURCES=new Set(['SYSTEM','ONLINE','SELF_VERIFICATION','GUIDED_DRILL','INDEPENDENT']);
const RESULTS=new Set(['PASS','FAIL']);
const STATES=new Set(['PASS','FAIL','N/A']);
const HASH=/^[0-9a-f]{64}$/;
let client;

async function publicClient(){const config=globalThis.SKREK_PUBLIC_CONFIG??{};if(!config.supabaseUrl||!config.supabaseAnonKey)return null;if(client)return client;const {createClient}=await import('@supabase/supabase-js');client=globalThis.LEGAVIK_SUPABASE_CLIENT??=createClient(config.supabaseUrl,config.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});return client;}
function requireHash(value,name,{nullable=true}={}){if(value==null&&nullable)return null;if(!HASH.test(value??''))throw Object.assign(new Error(`${name} must be a lowercase SHA-256 digest.`),{code:'RECOVERY_EVIDENCE_HASH_INVALID'});return value;}
function state(value='N/A'){if(!STATES.has(value))throw Object.assign(new Error('Evidence validation state is invalid.'),{code:'RECOVERY_EVIDENCE_STATE_INVALID'});return value;}
export async function sha256(bytes){if(!(bytes instanceof Uint8Array))throw new TypeError('Evidence hashing requires Uint8Array.');return cryptoEngine.hashHex(bytes);}
export function attachmentHashSummary(snapshot){return (snapshot?.attachments??[]).map(item=>({sha256:requireHash(item.sha256,'attachment.sha256',{nullable:false}),byte_length:Number(item.byte_length??0)})).sort((a,b)=>a.sha256.localeCompare(b.sha256));}

export function createRecoveryEvidencePayload(input={}){
  if(!input.recoveryMapVersionId)throw Object.assign(new Error('Recovery Map version row identity is required.'),{code:'RECOVERY_EVIDENCE_VERSION_REQUIRED'});
  if(!EVENTS.has(input.eventType)||!SOURCES.has(input.eventSource)||!RESULTS.has(input.result))throw Object.assign(new Error('Recovery evidence event identity is invalid.'),{code:'RECOVERY_EVIDENCE_EVENT_INVALID'});
  const attachments=input.attachmentHashSummary??null;
  return Object.freeze({
    p_recovery_map_version_id:input.recoveryMapVersionId,p_event_type:input.eventType,p_event_source:input.eventSource,p_result:input.result,
    p_occurred_at:input.occurredAt??new Date().toISOString(),p_recovery_kit_sha256:requireHash(input.recoveryKitSha256,'recoveryKitSha256'),
    p_mainnet_evidence_sha256:requireHash(input.mainnetEvidenceSha256,'mainnetEvidenceSha256'),p_archive_sha256:requireHash(input.archiveSha256,'archiveSha256'),
    p_archive_size_bytes:input.archiveSizeBytes??null,p_mainnet_txid:input.mainnetTxid??null,p_pairing_identifier:input.pairingIdentifier??null,
    p_recovery_format_identity:input.recoveryFormatIdentity??null,p_recovery_engine_identity:input.recoveryEngineIdentity??RECOVERY_ENGINE_IDENTITY,
    p_release_identity:input.releaseIdentity??null,p_independent_tool_identity:input.independentToolIdentity??null,
    p_independent_tool_sha256:requireHash(input.independentToolSha256,'independentToolSha256'),p_kit_match:state(input.kitMatch),
    p_evidence_match:state(input.evidenceMatch),p_archive_match:state(input.archiveMatch),p_password_verification:state(input.passwordVerification),
    p_output_exact_match:state(input.outputExactMatch),p_recovered_output_sha256:requireHash(input.recoveredOutputSha256,'recoveredOutputSha256'),
    p_attachment_count:input.attachmentCount??(attachments?.length??null),p_attachment_hash_summary:attachments,
    p_independent_receipt_sha256:requireHash(input.independentReceiptSha256,'independentReceiptSha256')
  });
}

export async function appendRecoveryEvidenceEvent(input,options={}){
  const payload=input?.p_event_type?input:createRecoveryEvidencePayload(input);
  const supabase=options.supabase??await publicClient();
  if(!supabase)return {recorded:false,reason:'NOT_CONFIGURED',payload};
  const {data:{session},error:sessionError}=await supabase.auth.getSession();if(sessionError)throw sessionError;if(!session)return {recorded:false,reason:'NOT_AUTHENTICATED',payload};
  const {data,error}=await supabase.rpc('append_recovery_evidence_event',payload);if(error)throw error;
  return {recorded:true,eventId:data,payload};
}
export async function appendRecoveryEvidenceBestEffort(input,options={}){try{return await appendRecoveryEvidenceEvent(input,options);}catch(error){return{recorded:false,reason:'EVIDENCE_WRITE_FAILED',error,payload:input};}}
export function reportRecoveryEvidenceResult(result,{root=globalThis.document?.documentElement}={}){const status=result?.recorded?'RECORDED':'FAILED';if(root?.dataset)root.dataset.recoveryEvidenceWrite=status;globalThis.dispatchEvent?.(new CustomEvent('legavik:recovery-evidence',{detail:{status,reason:result?.reason??null}}));return status;}

export async function createPublicationEvidence({recoveryMapVersionId,artifacts,evidence,evidenceBytes,releaseIdentity,eventType='MAINNET_PUBLISHED'}){
  return createRecoveryEvidencePayload({recoveryMapVersionId,eventType,eventSource:'SYSTEM',result:'PASS',occurredAt:evidence.first_downloadable_at??evidence.evidence_ready_at,
    recoveryKitSha256:await sha256(artifacts.kitBytes),mainnetEvidenceSha256:await sha256(evidenceBytes),archiveSha256:await sha256(artifacts.archiveBytes),
    archiveSizeBytes:artifacts.archiveBytes.byteLength,mainnetTxid:evidence.txid,pairingIdentifier:evidence.recovery_kit_identifier,
    recoveryFormatIdentity:evidence.format_version,recoveryEngineIdentity:RECOVERY_ENGINE_IDENTITY,releaseIdentity,
    kitMatch:'PASS',evidenceMatch:'PASS',archiveMatch:'PASS'});
}

export async function createRecoveryEvent({recoveryMapVersionId,eventType='ONLINE_RECOVERY',eventSource='ONLINE',result='PASS',kitBytes,evidenceBytes,archiveBytes,evidence,snapshot,releaseIdentity,toolIdentity=null,toolSha256=null,receiptSha256=null}){
  const attachments=attachmentHashSummary(snapshot);
  return createRecoveryEvidencePayload({recoveryMapVersionId,eventType,eventSource,result,recoveryKitSha256:kitBytes?await sha256(kitBytes):null,
    mainnetEvidenceSha256:evidenceBytes?await sha256(evidenceBytes):null,archiveSha256:archiveBytes?await sha256(archiveBytes):evidence?.archive_sha256,
    archiveSizeBytes:archiveBytes?.byteLength??evidence?.archive_size,mainnetTxid:evidence?.txid,pairingIdentifier:evidence?.recovery_kit_identifier,
    recoveryFormatIdentity:evidence?.format_version,recoveryEngineIdentity:RECOVERY_ENGINE_IDENTITY,releaseIdentity,independentToolIdentity:toolIdentity,
    independentToolSha256:toolSha256,kitMatch:'PASS',evidenceMatch:'PASS',archiveMatch:'PASS',passwordVerification:result,
    outputExactMatch:result,recoveredOutputSha256:snapshot?.integrity?.snapshot_payload_sha256,attachmentCount:attachments.length,
    attachmentHashSummary:attachments,independentReceiptSha256:receiptSha256});
}
