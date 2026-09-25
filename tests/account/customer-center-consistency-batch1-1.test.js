import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {currentRecoveryVerification} from '../../src/account/customer-recovery-status.js';

const app=readFileSync(new URL('../../src/account/supabase-account-app.js',import.meta.url),'utf8');
const center=app.slice(app.indexOf('function displayDate'),app.indexOf('async function renderCenter'));

test('overview and map detail use the same current-version recovery authority',()=>{
  assert.match(center,/const verification=recoveryStatus\(item,data\)/);
  assert.match(center,/function recoveryStatus\(item,data\)\{return currentRecoveryVerification\(item,data\.evidence\)/);
  const map={current_version:{id:'current-row',version_number:1}};
  const events=[
    {recovery_map_version_id:'current-row',event_type:'MAINNET_PUBLISHED',result:'PASS',occurred_at:'2026-09-16T01:00:00Z'},
    {recovery_map_version_id:'old-row',event_type:'ONLINE_RECOVERY',result:'PASS',occurred_at:'2026-09-16T02:00:00Z'},
    {recovery_map_version_id:'current-row',event_type:'ONLINE_RECOVERY',result:'PASS',occurred_at:'2026-09-16T03:04:05Z'}
  ];
  assert.deepEqual(currentRecoveryVerification(map,events),{verified:true,version:1,lastVerifiedAt:'2026-09-16T03:04:05Z'});
});

test('customer time precision is minute-only and current-row actions are the sole primary actions',()=>{
  assert.match(center,/hour:'2-digit',minute:'2-digit',hourCycle:'h23'/);
  const mapSection=center.slice(center.indexOf("if(state.section==='maps')"),center.indexOf("if(state.section==='materials')"));
  assert.doesNotMatch(mapSection,/map-card-actions/);
  assert.match(mapSection,/\$\{versionHistory\(item\)\}/);
  assert.match(center,/current\?`<div class="version-actions"[\s\S]*进入我的恢复中心[\s\S]*更新 Recovery Map/);
  assert.match(center,/historical-version-note/);
  assert.doesNotMatch(center,/恢复此历史版本/);
});

test('publication evidence is the existing authority for both generated credentials',()=>{
  assert.match(app,/\.in\('event_type',\['MAINNET_PUBLISHED','INITIAL_RECOVERY_VERIFICATION','ONLINE_RECOVERY'\]\)/);
  assert.match(center,/event_type==='MAINNET_PUBLISHED'/);
  assert.match(center,/kit=publication\|\|hasMaterial/);
  assert.match(center,/evidence=publication\|\|hasMaterial/);
  assert.doesNotMatch(center,/已保存/);
});

test('credential copy and support hierarchy remain customer-safe',()=>{
  for(const copy of ['共同组成恢复凭证套件','恢复时还需要对应版本的 Recovery Password','与 Recovery Password 分开','LEGAVIK 不保存客户的 Recovery Kit、Mainnet Recovery Evidence 或 Recovery Password'])assert.match(center,new RegExp(copy));
  assert.match(center,/class="primary-link"[^>]*>联系客服支持/);
  assert.doesNotMatch(center,/浏览帮助内容|联系人工支持/);
  assert.doesNotMatch(center,/archive_sha256|engine_identity|event_id|pairing_identifier/i);
});
