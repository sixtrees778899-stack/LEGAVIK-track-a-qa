import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../../src/account/supabase-account-app.js',import.meta.url),'utf8');
const metadata=readFileSync(new URL('../../src/account/recovery-metadata-client.js',import.meta.url),'utf8');
const migration=readFileSync(new URL('../../supabase/migrations/20260815152000_account_center_v1.sql',import.meta.url),'utf8');
const hardening=readFileSync(new URL('../../supabase/migrations/20260815164500_profiles_server_managed.sql',import.meta.url),'utf8');
const usernames=readFileSync(new URL('../../supabase/migrations/20260815173000_unique_usernames.sql',import.meta.url),'utf8');
const lifecycle=readFileSync(new URL('../../supabase/migrations/20260901120000_recovery_map_v1_lifecycle.sql',import.meta.url),'utf8');
const config=readFileSync(new URL('../../web/account/public-config.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../../web/account/account.css',import.meta.url),'utf8');
const bundle=readFileSync(new URL('../../web/account/account-app.bundle.js',import.meta.url),'utf8');

test('real email signup, six digit verification, password login, reset and logout use Supabase Auth',()=>{
  for(const token of ['auth.signUp','auth.verifyOtp','auth.resend','auth.signInWithPassword','auth.resetPasswordForEmail','auth.updateUser','auth.signOut','persistSession:true'])assert.match(app,new RegExp(token.replace('.','\\.')));
  assert.match(app,/maxlength="6" pattern="\[0-9\]\{6\}"/);
  assert.doesNotMatch(app,/code\s*===\s*['"]123456['"]|MOCK OTP/);
});

test('customer center exposes the seven approved sections and no mock orders',()=>{
  for(const label of ['总览','我的 Recovery Map','恢复与凭证','恢复维护','我的方案与订单','帮助与客服','账户与安全'])assert.match(app,new RegExp(label));
  assert.match(app,/from\('orders'\)\.select/);
  assert.doesNotMatch(app,/mockOrder|MOCK_ORDER/);
});

test('dashboard stays focused on current map, review, plan and real recent activity',()=>{
  for(const label of ['CURRENT RECOVERY MAP','RECOVERY REVIEW','CURRENT PLAN','最近活动','overview-sections','activity-list'])assert.match(app,new RegExp(label,'i'));
  assert.match(app,/slice\(0,5\)/);
  assert.match(app,/function recentActivities\(data\)/);
  assert.match(app,/data-section-link/);
  assert.doesNotMatch(app.slice(app.indexOf("if(state.section==='overview')"),app.indexOf("if(state.section==='maps')")),/USD|AUD|免费更新|购买单次更新/);
  assert.doesNotMatch(app,/Seed Phrase|Private Key|sensitive attachment/i);
});

test('help and support uses the knowledge source and human support exits',()=>{
  assert.match(app,/知识库是当前正式帮助内容来源/);
  assert.match(app,/智能助手/);
  assert.match(app,/转人工支持/);
  assert.match(app,/浏览帮助内容/);
  assert.match(app,/联系人工支持/);
});

test('dashboard bundle and responsive layout expose the approved desktop and mobile structure',()=>{
  for(const token of ['overview-sections','status-summary','activity-list','support-placeholder'])assert.match(bundle,new RegExp(token));
  assert.match(css,/\.overview-sections\{display:grid/);
  assert.match(css,/@media\(max-width:760px\).*\.status-summary\{[^}]*flex-direction:column/s);
});

test('browser configuration contains only public placeholders and never a privileged key',()=>{
  assert.match(config,/supabaseAnonKey/);
  assert.doesNotMatch(config,/service_role|SUPABASE_SERVICE_ROLE|secret[_-]?key/i);
  assert.doesNotMatch(app+metadata,/service_role|SUPABASE_SERVICE_ROLE/);
});

test('RLS isolates all customer tables and profile identity is server managed',()=>{
  for(const table of ['profiles','recovery_maps','recovery_materials','mainnet_evidence','orders','annual_reviews']){
    assert.match(migration,new RegExp(`alter table public\\.${table} enable row level security`));
    assert.match(migration,new RegExp(`auth\\.uid\\(\\).*user_id`));
  }
  assert.match(hardening,/drop policy if exists profiles_update_own/);
  assert.match(hardening,/revoke insert, update, delete on public\.profiles from authenticated/);
  assert.doesNotMatch(app,/from\('profiles'\)\.upsert/);
  assert.match(lifecycle,/alter table public\.recovery_map_versions enable row level security/);
  assert.match(lifecycle,/auth\.uid\(\).*user_id/);
});

test('Recovery Map binding persists metadata only and never recovery secrets',()=>{
  assert.match(metadata,/record_published_recovery_map_v1/);
  assert.match(metadata,/READY_FOR_INDEPENDENT_RECOVERY/);
  assert.match(metadata,/background_verification.*PASS/);
  assert.doesNotMatch(metadata,/password|data[_-]?key|kitBytes|evidence_payload|recovery_materials/i);
});

test('Customer Center shows only formal published lifecycle records and never productizes Evidence download',()=>{
  assert.match(app,/from\('recovery_maps'\).*eq\('lifecycle_state','PUBLISHED'\).*eq\('status','PUBLISHED'\)/s);
  assert.match(app,/from\('recovery_map_versions'\)/);
  assert.match(app,/当前版本：/);
  assert.match(app,/版本记录/);
  assert.doesNotMatch(app,/regenerateEvidence|重新获取 Evidence|data-evidence/);
});

test('legacy username schema remains intact but no longer gates account completion',()=>{
  assert.match(usernames,/create unique index(?: if not exists)? profiles_username_unique/);
  assert.match(usernames,/where username is not null/);
  assert.match(usernames,/auth\.uid\(\)/);
  assert.match(usernames,/USERNAME_TAKEN/);
  assert.doesNotMatch(app,/supabase\.rpc\('claim_username'|completion-form|renderAccountCompletion/);
  assert.match(app,/customerBrand\.name}[\s\S]*state\.session\.user\.email/);
});

test('purchase identity handoff ends at payment pending and never fabricates an order',()=>{
  assert.match(app,/purchase\.active/);
  assert.match(app,/付款流程待接入/);
  assert.match(app,/不会创建订单/);
  assert.doesNotMatch(app,/insert\(.*orders|PAYMENT_SUCCESS|mock payment/is);
});
