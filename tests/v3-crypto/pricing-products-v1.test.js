import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../../web/v3-crypto/product-v1.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../../web/v3-crypto/product-v1.css',import.meta.url),'utf8');
const pricingSource=app.slice(app.indexOf('const pricingPlans='),app.indexOf('function nav()'))+app.slice(app.indexOf('function pricingPage()'),app.indexOf('const knowledgeTopics='));

test('three complete first-year products use the approved Chinese customer copy',()=>{
  for(const token of ["name:'基础版'","name:'标准版'","name:'传承定制版'",'把完整的数字资产恢复体系建立起来，并由您自己掌握','完整的数字资产恢复体系建立，增加恢复演练、更多内容更新和专属人工服务','在完整恢复体系基础上，由 LEGAVIK 协助安排未来的传承交接','把重要的数字资产恢复信息系统整理清楚','<br><strong>选择适合您的服务方案。</strong>'])assert.ok(pricingSource.includes(token),token);
});

test('fixed USD and AUD commercial prices cover first year, annual, update and upgrade',()=>{
  for(const token of ["price:{USD:599,AUD:840}","price:{USD:1199,AUD:1680}","price:{USD:5000,AUD:7000}","annual:{USD:240,AUD:336}","annual:{USD:480,AUD:672}","annual:{USD:1200,AUD:1680}","currency==='USD'?'199':'280'","currency==='USD'?'599':'840'"])assert.ok(pricingSource.includes(token),token);
  assert.doesNotMatch(pricingSource,/exchangeRate|fetch\([^)]*(?:currency|rate)/i);
});

test('currency selection supports AU and NZ defaults with USD fallback and persistence',()=>{
  for(const token of ["forced==='AU'||forced==='NZ'","region==='AU'||region==='NZ'","zone.startsWith('Australia/')","zone==='Pacific/Auckland'","?'AUD':'USD'","pricingCurrencyCookie='legavik_pricing_currency'",'Max-Age=31536000','data-pricing-currency="USD"','data-pricing-currency="AUD"'])assert.ok(pricingSource.includes(token),token);
});

test('pricing terminology consistently defines recovery credentials and password',()=>{
  for(const token of ['恢复凭证套件和恢复密码','恢复凭证套件由恢复密钥文件（Recovery Kit）和链上恢复凭证（Mainnet Recovery Evidence）两个重要文件组成。','实际恢复时，还需要客户自己设置并保存的恢复密码（Recovery Password）。','恢复密钥文件、链上恢复凭证和恢复密码三者缺一不可'])assert.ok(pricingSource.includes(token),token);
  assert.doesNotMatch(pricingSource,/核心恢复材料|恢复材料密钥|恢复凭据|三件套/);
});

test('comparison covers shared foundations and real service differences',()=>{
  for(const token of ['完整恢复地图','独立恢复完整恢复地图','客户端加密与长期存储','恢复凭证套件和恢复密码由客户掌握','免费1次','免费2次','至少免费2次 / 按方案','客户自主安排','LEGAVIK 协助安排','定制设计','pricingCommonComparison','查看三档完整比较'])assert.ok(pricingSource.includes(token),token);
  assert.match(pricingSource,/<th>基础版<\/th><th class="recommended-column">标准版<small>推荐<\/small><\/th><th>传承定制版<\/th>/);
});

test('annual services and three collapsed follow-up accordions match the approved contract',()=>{
  for(const token of ['第二年年度维护服务','为什么需要年度维护？','已经完成的恢复地图本身会继续长期存储','基础版第二年年度维护服务','标准版第二年年度维护服务','传承定制版第二年年度维护服务','查看服务详情 ↓','自动续订与提醒','如果第二年不续费，会发生什么？','如果只需要临时更新一次，怎么办？','以后可以升级到更高一级服务吗？'])assert.ok(pricingSource.includes(token),token);
  assert.match(pricingSource,/\}\]\.map\(item=>`<details><summary>/);
});

test('drawers preserve the approved sales hierarchy without technical or disclaimer overload',()=>{
  for(const token of ['这个方案帮您解决什么问题','适合哪些客户','首年具体包含','未来传承','典型场景','第二年年度维护服务','role="dialog"'])assert.ok(pricingSource.includes(token),token);
  assert.doesNotMatch(pricingSource,/隐私与服务边界 \/ 不包含什么|法律意见|税务意见|100% 资产恢复|非破坏性/);
});

test('purchase handoff keeps existing payment boundary and selected fixed currency price',()=>{
  assert.match(pricingSource,/data-confirm-purchase/);
  assert.match(pricingSource,/canonicalAccountUrl\('signup',\{purchase:'1',plan:selected,currency,price:String\(price\),renewal:pricingState\.renewalChoice\}\)/);
  assert.doesNotMatch(pricingSource,/createOrder|payment_success|stripe/i);
});

test('responsive sales cards use one visual system and bright green CTAs',()=>{
  for(const token of ['.pricing-service-list','.pricing-best-for','.annual-billing','.pricing-faq','@media(max-width:900px)','@media(max-width:640px)','background:#20c77a'])assert.ok(css.includes(token),token);
  assert.doesNotMatch(pricingSource,/MOST POPULAR/i);
});

test('Pricing V2 customer surface contains no prohibited legacy copy',()=>{
  for(const pattern of [/Initial Recovery Readiness Review/i,/Continuity/i,/SKREK|CJAS/,/设计跨越个人的恢复架构/,/不只是建立，而是验证真正可用/,/这不是更高级的套餐/])assert.doesNotMatch(pricingSource,pattern);
});
