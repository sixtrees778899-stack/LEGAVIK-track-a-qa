import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const root=new URL('../../',import.meta.url);
const source=await readFile(new URL('web/v2/v2-app.js',root),'utf8');
const css=await readFile(new URL('web/v2/product-integration.css',root),'utf8');

test('four account families use one ordered recovery-condition template each',()=>{
  for(const family of ['cexConditions','dexConditions','walletConditions','hardwareConditions'])assert.match(source,new RegExp(`const ${family}=\\[[^\\]]+\\]`));
  for(const required of ['email','recovery_phrase','private_key','authenticator','passkey','security_key','multisig_approval','other'])assert.match(source,new RegExp(`['"]${required}['"]`));
  assert.match(source,/function conditionOptions\(account\)\{const category=catalogCategoryFor\(account\.platform_id\)/);
});

test('attachment scope is explicit and module 5/6 remain module-owned',()=>{
  assert.match(source,/>请选择<\/option><option value="\$\{MODULE_SUMMARY_SCOPE\}"/);
  assert.match(source,/本模块汇总信息/);
  assert.doesNotMatch(source,/本模块全部信息/);
  assert.match(source,/\['assistants','message'\]\.includes\(context\?\.module_id\)/);
  assert.match(source,/<strong>所属模块：<\/strong>\$\{escape\(labels\[context\.module_id\]\)\}/);
});

test('drawer keeps a light photographic blur, responsive width, solid picker and custom return',()=>{
  assert.match(css,/background:rgba\(247,246,241,\.1\)/);
  assert.match(css,/attachment-background-snapshot[^}]+filter:blur\(10px\) saturate\(\.8\)/);
  assert.doesNotMatch(css,/attachment-drawer-open #overlay-root[^}]+rgba\(4,20,15/);
  assert.match(css,/width:min\(46vw,880px\);max-width:50vw/);
  assert.match(css,/input\[type="file"\]\{padding:18px;border:1px solid/);
  assert.match(source,/id="return-custom-catalog">返回原页面/);
});

test('preview copy and return actions preserve the current in-memory draft',()=>{
  assert.match(source,/<h1>恢复地图信息预览<\/h1>/);
  assert.match(source,/id="manage-all-files">附件中心/);
  assert.match(source,/querySelector\('#report-back'\)\.onclick=\(\)=>nav\('review'\)/);
  assert.match(source,/previewModule\('01','资产与账户'/);
  assert.match(source,/function navTo\(id,anchor\)\{current=enterApplicationView\(appState,id\)/);
  assert.doesNotMatch(source,/id==='dashboard'\?'guide':id/);
  assert.match(source,/当前创建进度已保存于本次会话/);
});
