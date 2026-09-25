import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {appendRecoveryEvidenceBestEffort,createRecoveryEvent,createRecoveryEvidencePayload,createPublicationEvidence,reportRecoveryEvidenceResult} from '../../src/account/recovery-evidence-client.js';
import {createIndependentRecoveryReceipt,importIndependentRecoveryReceipt,validateIndependentRecoveryReceipt} from '../../src/independent-recovery-tool/recovery-receipt.js';

const migrationPath='supabase/migrations/20260914120000_recovery_evidence_audit_trail_v1.sql';
const digest='a'.repeat(64),txid='T'.repeat(43),versionId='10000000-0000-4000-8000-000000000001';
const evidence={archive_sha256:digest,archive_size:3,txid,recovery_kit_identifier:'snapshot-v3',format_version:'CJAS-VAULT-ARCHIVE-V1'};
const snapshot={integrity:{snapshot_payload_sha256:'b'.repeat(64)},attachments:[{id:'two',sha256:'d'.repeat(64),byte_length:2},{id:'one',sha256:'c'.repeat(64),byte_length:1}]};

test('migration creates a dedicated append-only owner-scoped ledger',async()=>{
  const sql=await readFile(migrationPath,'utf8');
  assert.match(sql,/create table public\.recovery_evidence_events/);
  assert.match(sql,/alter table public\.recovery_evidence_events enable row level security/);
  assert.match(sql,/create policy recovery_evidence_events_select_own[\s\S]*auth\.uid\(\)[\s\S]*user_id/);
  assert.doesNotMatch(sql,/create policy recovery_evidence_events_(insert|update|delete)/i);
  assert.match(sql,/revoke all on table public\.recovery_evidence_events from public, anon, authenticated/);
  assert.match(sql,/grant select on table public\.recovery_evidence_events to authenticated/);
  assert.match(sql,/security definer[\s\S]*set search_path = pg_catalog, public/);
  assert.match(sql,/where id = p_recovery_map_version_id and user_id = owner_id/);
  for(const forbidden of ['recovery_password','dek','kek','wrapped_dek','seed_phrase','private_key','plaintext'])assert.doesNotMatch(sql,new RegExp(`^\\s*${forbidden}\\s+`,'im'));
  for(const column of ['recovery_map_version_id','recovery_map_id','user_id','event_type','occurred_at'])assert.match(sql,new RegExp(`recovery_evidence_events_[a-z_]+[\\s\\S]{0,100}\\b${column}\\b`));
});

test('controlled RPC rejects arbitrary ownership and validates authoritative version identity',async()=>{
  const sql=await readFile(migrationPath,'utf8');
  assert.doesNotMatch(sql,/p_user_id|p_owner_id|p_recovery_map_id\s+uuid/);
  for(const check of ['ARCHIVE_HASH_MISMATCH','ARCHIVE_SIZE_MISMATCH','MAINNET_TXID_MISMATCH','PAIRING_IDENTIFIER_MISMATCH'])assert.match(sql,new RegExp(check));
  assert.match(sql,/version_row\.recovery_map_id,version_row\.id,version_row\.version_number/);
});

test('all required event types and immutable history semantics are represented',async()=>{
  const sql=await readFile(migrationPath,'utf8');
  for(const type of ['VERSION_CREATED','MAINNET_PUBLISHED','INITIAL_RECOVERY_VERIFICATION','ONLINE_RECOVERY','GUIDED_RECOVERY_DRILL','INDEPENDENT_RECOVERY_RECEIPT_IMPORTED'])assert.match(sql,new RegExp(type));
  const history=Array.from({length:5},(_,index)=>createRecoveryEvidencePayload({recoveryMapVersionId:`10000000-0000-4000-8000-00000000000${index+1}`,eventType:'ONLINE_RECOVERY',eventSource:'ONLINE',result:'PASS'}));
  assert.equal(new Set(history.map(item=>item.p_recovery_map_version_id)).size,5);
  assert.ok(Object.isFrozen(history[0]));
});

test('publication evidence hashes exact Kit, Evidence and Archive bytes',async()=>{
  const artifacts={kitBytes:new Uint8Array([1]),archiveBytes:new Uint8Array([1,2,3])};
  const payload=await createPublicationEvidence({recoveryMapVersionId:versionId,artifacts,evidence,evidenceBytes:new Uint8Array([4]),releaseIdentity:'release-1'});
  for(const key of ['p_recovery_kit_sha256','p_mainnet_evidence_sha256','p_archive_sha256'])assert.match(payload[key],/^[0-9a-f]{64}$/);
  assert.equal(payload.p_archive_size_bytes,3);assert.equal(payload.p_kit_match,'PASS');assert.equal(payload.p_archive_match,'PASS');
});

test('online recovery evidence records result state and attachment hashes without secrets',async()=>{
  const payload=await createRecoveryEvent({recoveryMapVersionId:versionId,kitBytes:new Uint8Array([1]),evidenceBytes:new Uint8Array([2]),archiveBytes:new Uint8Array([1,2,3]),evidence:{...evidence,archive_sha256:await crypto.subtle.digest('SHA-256',new Uint8Array([1,2,3])).then(value=>Buffer.from(value).toString('hex'))},snapshot,releaseIdentity:'release-1'});
  assert.equal(payload.p_password_verification,'PASS');assert.equal(payload.p_output_exact_match,'PASS');assert.deepEqual(payload.p_attachment_hash_summary.map(item=>item.sha256),['c'.repeat(64),'d'.repeat(64)]);
  assert.doesNotMatch(JSON.stringify(payload),/Recovery Password|DEK|KEK|private key|seed phrase/i);
});

test('evidence write failure is non-blocking and remains separate from recovery result',async()=>{
  const supabase={auth:{getSession:async()=>({data:{session:{access_token:'not-persisted'}},error:null})},rpc:async()=>({data:null,error:new Error('network unavailable')})};
  const result=await appendRecoveryEvidenceBestEffort(createRecoveryEvidencePayload({recoveryMapVersionId:versionId,eventType:'ONLINE_RECOVERY',eventSource:'ONLINE',result:'PASS'}),{supabase});
  assert.equal(result.recorded,false);assert.equal(result.reason,'EVIDENCE_WRITE_FAILED');
  const root={dataset:{}};assert.equal(reportRecoveryEvidenceResult(result,{root}),'FAILED');assert.equal(root.dataset.recoveryEvidenceWrite,'FAILED');
});

test('independent receipt is local, non-secret, validated and associated before import',async()=>{
  const archiveBytes=new Uint8Array([1,2,3]),archiveHash=Buffer.from(await crypto.subtle.digest('SHA-256',archiveBytes)).toString('hex'),matchingEvidence={...evidence,archive_sha256:archiveHash};
  const receipt=await createIndependentRecoveryReceipt({kitBytes:new Uint8Array([1]),evidenceBytes:new Uint8Array([2]),archiveBytes,evidence:matchingEvidence,snapshot,toolManifest:{build_identity:'tool-v1',executable_sha256:'e'.repeat(64)}});
  assert.equal(receipt.validation.password_verification,'PASS');assert.equal(receipt.independent_tool_sha256,'e'.repeat(64));
  assert.doesNotMatch(JSON.stringify(receipt),/password\s*[:=]|DEK|KEK|private key|seed phrase/i);
  const imported=await validateIndependentRecoveryReceipt(receipt,{evidence:matchingEvidence,recoveryMapVersionId:versionId});
  assert.equal(imported.eventType,'INDEPENDENT_RECOVERY_RECEIPT_IMPORTED');assert.match(imported.independentReceiptSha256,/^[0-9a-f]{64}$/);
  let rpcPayload=null;const supabase={auth:{getSession:async()=>({data:{session:{}},error:null})},rpc:async(name,payload)=>{assert.equal(name,'append_recovery_evidence_event');rpcPayload=payload;return{data:'event-id',error:null};}};
  const recorded=await importIndependentRecoveryReceipt(receipt,{evidence:matchingEvidence,recoveryMapVersionId:versionId,supabase});assert.equal(recorded.recorded,true);assert.equal(rpcPayload.p_event_type,'INDEPENDENT_RECOVERY_RECEIPT_IMPORTED');
  await assert.rejects(()=>validateIndependentRecoveryReceipt(receipt,{evidence:{...matchingEvidence,txid:'X'.repeat(43)},recoveryMapVersionId:versionId}),error=>error.code==='RECOVERY_RECEIPT_ASSOCIATION_MISMATCH');
});

test('online, self verification and guided drill map to distinct append-only events',()=>{
  for(const [eventType,eventSource] of [['ONLINE_RECOVERY','ONLINE'],['INITIAL_RECOVERY_VERIFICATION','SELF_VERIFICATION'],['GUIDED_RECOVERY_DRILL','GUIDED_DRILL']]){
    const payload=createRecoveryEvidencePayload({recoveryMapVersionId:versionId,eventType,eventSource,result:'PASS'});assert.equal(payload.p_event_type,eventType);assert.equal(payload.p_event_source,eventSource);
  }
});
