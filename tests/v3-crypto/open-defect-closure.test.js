import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const app=await readFile(new URL('../../web/v2/v2-app.js',import.meta.url),'utf8');
const product=await readFile(new URL('../../web/v3-crypto/product-v1.js',import.meta.url),'utf8');
const header=await readFile(new URL('../../src/ui/skrek-global-header.js',import.meta.url),'utf8');

test('B01 homepage and Recovery Map consume one global header source',()=>{
  assert.match(product,/skrekGlobalHeader\(\{brand,activeRoute:state\.route,[^}]*productBase:[^}]*accountBase:[^}]*logoBase:/);
  assert.match(app,/skrekGlobalHeader\(\{mode:'map',productBase:canonicalHomeUrl/);
  assert.doesNotMatch(header,/if\(mode==='map'\)return/);
  assert.match(header,/return `<div class="nav-shell"/);
  for(const label of ['数字资产','安全与隐私','产品与服务','知识库','专业合作','联系我们','登录 / 注册','我的恢复中心'])assert.match(header,new RegExp(label));
  assert.doesNotMatch(header,/\['home','首页'\]|\['how-it-works','如何运作'\]|\['help','帮助'\]/);
});

test('B02 Module 1 defaults to category accordion and hides non-CEX account fields',()=>{
  assert.match(app,/catalogCategory=null,catalogExpanded=false/);
  assert.match(app,/catalog-accordion/);
  const current=app.slice(app.indexOf('function renderAccountsAccordion'),app.indexOf('function renderConditionsStructured'));
  assert.match(current,/isAccountScoped\(account\.platform_id\)\?/);
  assert.doesNotMatch(current,/钱包与DeFi项目无需填写地区或个人\/机构账户类型/);
});

test('B03-B04 structured conditions use existing selected_condition_ids without schema changes',()=>{
  assert.match(app,/function conditionOptions\(account\)/);
  assert.match(app,/recovery_phrase/);
  assert.match(app,/function renderConditionsStructured/);
  assert.match(app,/selectedConditions\(store,account\.account_id\)/);
  assert.match(app,/renderLocationsV2/);
});

test('B05 Review recalculates the current canonical revision',()=>{const body=app.slice(app.indexOf('function renderReview(anchor)'),app.indexOf('function renderReport'));assert.match(body,/recalc\(\);/);assert.ok(body.indexOf('recalc();')<body.indexOf('projectReview('));});

test('B06-B07 attachment context clears stale account coverage and keeps shared manager',()=>{
  assert.match(app,/context\.covered_condition_ids=\[\]/);
  assert.match(app,/renderAttachmentsContextualLegacy/);
  assert.match(app,/addAttachment\(store/);
  assert.match(app,/\['assistants','message'\]\.includes/);
});
