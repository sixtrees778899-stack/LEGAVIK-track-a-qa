import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {SKREK_GLOBAL_NAV,skrekGlobalHeader} from '../../src/ui/skrek-global-header.js';
import {CURRENT_TEST_RELEASE} from '../../src/ui/canonical-customer-links.js';

const product=await readFile(new URL('../../web/v3-crypto/product-v1.js',import.meta.url),'utf8');
const account=await readFile(new URL('../../src/account/supabase-account-app.js',import.meta.url),'utf8');
const accountBridge=await readFile(new URL('../../src/account/account-nav-bridge.js',import.meta.url),'utf8');
const map=await readFile(new URL('../../web/v2/v2-app.js',import.meta.url),'utf8');

test('global navigation exposes the approved six destinations in exact order',()=>{
  assert.deepEqual(SKREK_GLOBAL_NAV,[
    ['digital-assets','数字资产'],['security','安全与隐私'],['pricing','产品与服务'],
    ['knowledge','知识库'],['professionals','专业合作'],['about','联系我们']
  ]);
  const html=skrekGlobalHeader({mode:'product'});
  assert.match(html,/id="product-home-logo"[^>]+data-route="home"/);
  assert.doesNotMatch(html,/>首页<|>如何运作<|>帮助</);
  assert.match(html,/>登录 \/ 注册</);
  assert.match(html,/>我的恢复中心</);
});

test('professional and contact routes are real product views without public commission language',()=>{
  assert.match(product,/state\.route==='professionals'\)professionalsPage\(\)/);
  assert.match(product,/state\.route==='about'\)aboutPage\(\)/);
  assert.match(product,/FOR PROFESSIONALS/);
  assert.match(product,/为您的客户，补齐数字资产恢复这一环/);
  for(const section of ['CLIENT NEED','WHO WE WORK WITH','HOW WE WORK TOGETHER','WHAT PARTNERS GET','WHEN TO INTRODUCE LEGAVIK','PROFESSIONAL BOUNDARIES','PARTNERSHIP MODELS'])assert.match(product,new RegExp(section));
  for(const partner of ['Lawyers & Estate Planning','Trust & Fiduciary Services','Wealth Advisers & Financial Planners','Family Offices','Accountants & Professional Advisers'])assert.match(product,new RegExp(partner.replace(/[&/]/g,'\\$&')));
  assert.match(product,/预约合作沟通/);
  for(const text of ['CONTACT LEGAVIK','联系我们','客户咨询 / Customer Enquiries','专业机构合作 / Professional Partnerships','hello@skrek.com','partners@skrek.com','Sydney, Australia'])assert.match(product,new RegExp(text.replace(/[/.]/g,'\\$&')));
  for(const removed of ['Why LEGAVIK','Our Principles','Company'])assert.doesNotMatch(product,new RegExp(removed));
  assert.doesNotMatch(product,/25% commission|referral fee|revenue share|partner rebate|commission calculator|affiliate earnings/i);
});

test('account and Recovery Map shells retain account state and independent Recovery Center links',()=>{
  assert.match(account,/skrekGlobalHeader/);
  assert.match(accountBridge,/data-account-state/);
  assert.match(accountBridge,/session\?\.user\?\.email/);
  assert.doesNotMatch(accountBridge,/username/);
  assert.match(accountBridge,/split\('@'\)\[0\]/);
  assert.match(map,/skrekGlobalHeader\(\{mode:'map'/);
  const html=skrekGlobalHeader({mode:'map'});
  assert.match(html,new RegExp(`href="https://sixtrees778899-stack\\.github\\.io/SKREK-auth-test/web/account/index\\.html\\?release=${CURRENT_TEST_RELEASE}#login"`));
  assert.match(html,new RegExp(`href="https://sixtrees778899-stack\\.github\\.io/SKREK-auth-test/web/recover\\.html\\?source=recovery-center&release=${CURRENT_TEST_RELEASE}"`));
  assert.doesNotMatch(html,/v3-crypto\/recover\.html/);
});
