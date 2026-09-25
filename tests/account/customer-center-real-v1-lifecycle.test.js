import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createPublishedLifecyclePayload,queuePublishedLifecycleSync,pendingPublishedLifecycleSync} from '../../src/account/recovery-metadata-client.js';

const migration=readFileSync(new URL('../../supabase/migrations/20260901120000_recovery_map_v1_lifecycle.sql',import.meta.url),'utf8');
const app=readFileSync(new URL('../../src/account/supabase-account-app.js',import.meta.url),'utf8');
const createFlow=readFileSync(new URL('../../web/v2/v2-app.js',import.meta.url),'utf8');
const txid='T'.repeat(43),hash='a'.repeat(64);
const complete=()=>({operation:{operation_id:'operation-1',draft_id:'map-1',version_id:'version-1',snapshot_id:'snapshot-1',state:'COMPLETE',status:'COMPLETE',transaction_id:txid,archive_sha256:hash},evidence:{status:'READY_FOR_INDEPENDENT_RECOVERY',background_verification:'PASS',txid,archive_sha256:hash,archive_size:1024,network:'arweave-mainnet',first_downloadable_at:'2026-09-01T10:18:00.000Z'},displayName:'My Recovery Map',plan:'Essential'});

test('only stable verified publication can form a V1 lifecycle payload',()=>{
  const payload=createPublishedLifecyclePayload(complete());
  assert.equal(payload.p_recovery_map_id,'map-1');
  assert.equal(payload.p_version_id,'version-1');
  assert.equal(payload.p_operation_id,'operation-1');
  assert.equal(payload.p_operation_state,'COMPLETE');
  assert.equal(payload.p_evidence_status,'READY_FOR_INDEPENDENT_RECOVERY');
  assert.equal(payload.p_verification_status,'PASS');
  assert.throws(()=>createPublishedLifecyclePayload({...complete(),operation:{...complete().operation,state:'UPLOADING',status:'UPLOADING'}}),error=>error.code==='LIFECYCLE_NOT_COMPLETE');
  assert.throws(()=>createPublishedLifecyclePayload({...complete(),evidence:{...complete().evidence,background_verification:'PENDING'}}),error=>error.code==='LIFECYCLE_NOT_VERIFIED');
});

test('pending retry record contains non-secret lifecycle metadata only',()=>{
  const values=new Map(),storage={setItem:(key,value)=>values.set(key,value),getItem:key=>values.get(key)??null},payload=createPublishedLifecyclePayload(complete());
  queuePublishedLifecycleSync(payload,{storage});
  assert.deepEqual(pendingPublishedLifecycleSync({storage}),payload);
  const serialized=JSON.stringify(payload);
  assert.doesNotMatch(serialized,/password|resume.?key|dek|kek|wrapped|kitBytes|snapshot_payload|attachment_bytes/i);
});

test('database separates Map, Version and Operation identities with explicit V1 Current state',()=>{
  assert.match(migration,/create table if not exists public\.recovery_map_versions/);
  assert.match(migration,/version_number integer not null/);
  assert.match(migration,/operation_id text not null/);
  assert.match(migration,/current_version_id uuid references public\.recovery_map_versions/);
  assert.match(migration,/p_version_id,1,p_operation_id/);
  assert.match(migration,/'CURRENT'/);
  assert.match(migration,/unique \(user_id, operation_id\)/);
  assert.match(migration,/LIFECYCLE_IDEMPOTENCY_CONFLICT/);
});

test('authenticated RPC and RLS enforce ownership without trusting a client owner id',()=>{
  assert.match(migration,/owner_id uuid := auth\.uid\(\)/);
  assert.match(migration,/if owner_id is null then raise exception 'AUTHENTICATION_REQUIRED'/);
  assert.match(migration,/enable row level security/);
  assert.match(migration,/using \(\(select auth\.uid\(\)\) = user_id\)/);
  assert.doesNotMatch(migration,/p_user_id|p_owner_id/);
});

test('Customer Center dashboard, map list and V1 history use one formal lifecycle source',()=>{
  assert.match(app,/formalMaps/);
  assert.match(app,/current_version/);
  assert.match(app,/versionHistory\(item\)/);
  assert.match(app,/CURRENT RECOVERY MAP/);
  assert.match(app,/RECENT ACTIVITY/);
  assert.match(app,/recoveryMapPurchaseUrl=canonicalPricingUrl\(\)/);
  assert.doesNotMatch(app,/entry=guide#guide/);
  assert.match(app,/我的 Recovery Map/);
  assert.doesNotMatch(app,/is_latest\?'最新版本'/);
  assert.match(app,/最近更新时间/);
  assert.match(app,/Current/);
  assert.match(app,/Historical/);
  assert.match(app,/创建\/发布时间/);
  assert.match(app,/mayUpdateRecoveryVersion/);
  assert.match(app,/data-map-card/);
  assert.match(app,/VERSION HISTORY/);
  assert.match(app,/进入我的恢复中心/);
  assert.match(app,/历史版本不可更新/);
});

test('create flow no longer syncs LOCAL_ENCRYPTED or TxID-only state',()=>{
  assert.doesNotMatch(createFlow,/bindRecoveryMetadata|status:'LOCAL_ENCRYPTED'/);
  assert.match(createFlow,/sanitizeStableCompletedCheckpoint\(\).*syncStablePublishedLifecycle/s);
  assert.match(createFlow,/retryPendingPublishedLifecycleSync/);
});

test('Customer Center lifecycle never adds secret custody or recovery material re-download',()=>{
  const combined=`${migration}\n${app}`;
  assert.doesNotMatch(migration,/recovery_password|resume_key|wrapped_dek|kit_bytes|snapshot_payload|attachment_bytes/);
  assert.doesNotMatch(app,/regenerateEvidence|重新获取 Evidence|Recovery Kit re-download/i);
  assert.doesNotMatch(combined,/forgot Recovery Password|reset Recovery Password/i);
});
