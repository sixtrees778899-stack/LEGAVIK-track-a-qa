import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../../web/v3-crypto/product-v1.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../../web/v3-crypto/product-v1.css',import.meta.url),'utf8');
const pricing=app.slice(app.indexOf('const pricingPlans='),app.indexOf('const knowledgeTopics='));
const pricingPage=app.slice(app.indexOf('function pricingPage()'),app.indexOf('const knowledgeTopics='));

test('first-year products remain complete twelve-month services at approved prices',()=>{
  for(const value of ["price:{USD:599,AUD:840}","price:{USD:1199,AUD:1680}","price:{USD:5000,AUD:7000}",'首个12个月服务周期','建立完整恢复地图及'])assert.ok(pricing.includes(value),value);
});

test('second-year pricing is transparent and fixed to twelve installments',()=>{
  for(const value of ["annual:{USD:240,AUD:336},monthly:{USD:20,AUD:28}","annual:{USD:480,AUD:672},monthly:{USD:40,AUD:56}","annual:{USD:1200,AUD:1680},monthly:{USD:100,AUD:140}",'按月支付','× 12期'])assert.ok(pricing.includes(value),value);
  assert.doesNotMatch(pricing,/您可以一次支付全年费用，也可以分12个月支付/);
});

test('renewal lifecycle is opt-in, annual, reminded and manageable before next year',()=>{
  for(const value of ['renewalChoice:null','到期前再决定','续订前至少30天','下一服务年度开始前管理或关闭','今天不会收取第二年的费用'])assert.ok(pricing.includes(value),value);
});

test('purchase confirmation precedes the unchanged account purchase boundary',()=>{
  for(const value of ['purchase-confirm-backdrop','购买确认','首年服务','第二年年度维护服务','第二年继续包含','data-renewal-contract','data-auto-renew-status','data-confirm-purchase','renewalChoice:null'])assert.ok(pricing.includes(value),value);
  assert.ok(pricing.indexOf('pricingState.confirmation=event.currentTarget.dataset.buyPlan')<pricing.indexOf("location.href=canonicalAccountUrl('signup'"));
  assert.doesNotMatch(pricing,/createOrder|stripe|chargeCustomer/i);
});

test('confirmation uses service-cycle terms and never simulates calendar dates',()=>{
  for(const value of ['首个12个月服务周期','下一个12个月服务周期','data-current-service-cycle="first-12-months"','data-next-service-cycle="next-12-months"'])assert.ok(pricing.includes(value),value);
  assert.doesNotMatch(pricingPage,/serviceYearDates|toLocaleDateString|data-service-year-start|data-next-renewal-date|\d{4}年\d{1,2}月\d{1,2}日/);
});

test('main cards show only first-year price and use selection CTA',()=>{
  const mainCard=pricing.slice(pricing.indexOf('<section class="pricing-products"'),pricing.indexOf('<section class="pricing-comparison"'));
  assert.match(mainCard,/首年服务价格/);
  assert.match(mainCard,/选择此方案/);
  assert.doesNotMatch(mainCard,/第二年|pricing-renewal-summary|购买此方案/);
});

test('Standard renewal includes the complete approved service list',()=>{
  for(const value of ['每个服务年度包含2次免费恢复地图更新','每年1次专属恢复演练','恢复演练记录','每年1次专属顾问指导','优先客户支持','赠送数字身份与关键账户扩展存储服务','持续获得最新版恢复手册和填写模板'])assert.ok(pricing.includes(value),value);
});

test('annual value section stays compact and preserves independent recovery explanation',()=>{
  for(const value of ['annual-value-list','独立恢复应急包','恢复密钥文件（Recovery Kit）','链上恢复凭证（Mainnet Recovery Evidence）','恢复密码（Recovery Password）'])assert.ok(pricing.includes(value),value);
  for(const value of ['.pricing-renewal-summary','.annual-value-list','.purchase-confirm-backdrop','@media(max-width:640px)'])assert.ok(css.includes(value),value);
});
