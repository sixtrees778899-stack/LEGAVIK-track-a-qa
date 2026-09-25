import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../../src/account/supabase-account-app.js',import.meta.url),'utf8');
const status=readFileSync(new URL('../../src/account/customer-recovery-status.js',import.meta.url),'utf8');

test('public authenticated entry strips customer-state override parameters and has no preview state model',()=>{
  for(const name of ['lifecycle_preview','service_plan','free_updates'])assert.match(app,new RegExp(`customerStateOverrideParameters=.*${name}`,'s'));
  assert.match(app,/removeCustomerStateOverrideParameters\(\)/);
  for(const forbidden of ['PREVIEW-001','version-preview-v1','preview-customer','map-preview-v1','previewServicePlan','lifecyclePreview'])assert.doesNotMatch(app,new RegExp(forbidden));
});

test('all customer center sections consume the same authenticated aggregate and current pointer',()=>{
  assert.match(app,/Object\.freeze\(\{maps:formalMaps,materials:customerVisibleMaterials\(materials\.data\),orders:orders\.data,reviews:reviews\.data,evidence:evidence\.data/);
  assert.match(app,/authoritativeCurrentVersion\(candidate\)/);
  assert.match(app,/function centerContent\(data\)/);
  assert.doesNotMatch(app,/version_number:1|current_version.*V1/);
});

test('overview is status-only and sales-heavy service cards are absent',()=>{
  const overview=app.slice(app.indexOf("if(state.section==='overview')"),app.indexOf("if(state.section==='maps')"));
  for(const value of ['CURRENT RECOVERY MAP','RECOVERY REVIEW','CURRENT PLAN','RECENT ACTIVITY'])assert.match(overview,new RegExp(value));
  assert.doesNotMatch(overview,/USD|AUD|免费更新|传承定制|购买/);
});

test('materials makes independent recovery optional and exposes no secret or technical identifiers',()=>{
  const materials=app.slice(app.indexOf("if(state.section==='materials')"),app.indexOf("if(state.section==='orders')"));
  for(const value of ['Recovery Kit','Mainnet Recovery Evidence','Recovery Password','下载独立恢复工具','查看独立恢复说明'])assert.match(materials,new RegExp(value));
  assert.match(materials,/href="\.\/LEGAVIK-Independent-Recovery-Tool-V1\.html"/);
  assert.doesNotMatch(materials,/尚未提供|缺失|逾期|必须下载|archive_sha256|snapshot_id|object.?key|RPC/i);
  assert.match(status,/LOCAL_ENCRYPTED_BACKUP/);
});

test('orders and annual check use real aggregate records and explicit empty states',()=>{
  assert.match(app,/data\.orders\.length/);
  assert.match(app,/暂无付款订单记录/);
  assert.match(app,/今年尚无恢复维护检查记录/);
  assert.doesNotMatch(app,/service_plan query|mocked order/i);
});

test('account security distinguishes login password from Recovery Password',()=>{
  assert.match(app,/登录密码用于登录 LEGAVIK。Recovery Password 用于恢复 Recovery Map/);
  assert.match(app,/修改登录密码不会修改 Recovery Password/);
});

test('page load cannot initialize or reset a customer map to V1',()=>{
  const load=app.slice(app.indexOf('async function loadAuthenticatedAccount'),app.indexOf('async function initializeRecoveryCallback'));
  assert.doesNotMatch(load,/insert|upsert|version_number|V1|record_published_recovery_map_v1/);
});
