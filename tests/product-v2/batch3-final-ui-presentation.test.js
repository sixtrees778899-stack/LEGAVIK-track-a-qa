import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL(`../../${path}`,import.meta.url),'utf8');
const account=read('src/account/supabase-account-app.js');
const accountCss=read('web/account/account.css');
const update=read('web/v2/v2-app.js');
const updateCss=read('web/v2/product-integration.css');

test('A2 approved Customer Center baseline opens the authoritative current map and preserves version history',()=>{
  assert.match(account,/data-map-card="\$\{esc\(item\.id\)\}"/);
  assert.match(account,/href="\$\{esc\(recoveryCenterUrl\(item\)\)\}">进入我的恢复中心/);
  assert.match(account,/\$\{versionHistory\(item\)\}/);
  assert.match(account,/历史版本不可更新/);
});

test('A3 approved current-version actions share one aligned action group and exact copy',()=>{
  assert.match(account,/class="map-card-actions"/);
  assert.match(account,/class="primary-link"[^>]+>进入我的恢复中心<\/a><a class="secondary-link"[^>]+>更新 Recovery Map<\/a>/);
  assert.match(accountCss,/\.map-card-actions\{display:flex;align-items:stretch/);
  assert.match(accountCss,/min-height:44px;min-width:164px/);
});

test('A5 desktop heading avoids single-character breaks while mobile remains responsive',()=>{
  assert.match(update,/dashboard-hero version-update-loaded/);
  assert.match(updateCss,/\.version-update-loaded h1\{[^}]*word-break:keep-all;overflow-wrap:normal/);
  assert.match(updateCss,/@media\(max-width:700px\)\{\.version-update-loaded h1\{[^}]*word-break:normal;overflow-wrap:break-word/);
});

test('A9 existing Update help disclosure includes the publication safety reminder',()=>{
  assert.match(update,/<summary>如何更新 Recovery Map？<\/summary>/);
  assert.match(update,/安全存储开始后，请不要关闭、刷新或返回当前页面，直到系统提示创建完成。/);
});
