import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../../web/v2/v2-app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../../web/v2/product-integration.css', import.meta.url), 'utf8');

test('guide and module detail CTAs use authoritative entitlement before Recovery Map', () => {
  assert.match(app, /#guide-start'\)\.onclick=\(\)=>enterAuthoritativeRecoveryMapCreation\(\)/);
  assert.match(app, /#detail-start'\)\.onclick=\(\)=>enterAuthoritativeRecoveryMapCreation\(\)/);
});

test('purchase flow exposes the five approved customer stages', () => {
  for (const route of ['purchase-plans', 'purchase-register', 'purchase-otp', 'purchase-checkout', 'purchase-success']) {
    assert.match(app, new RegExp(`'${route}'`));
  }
});

test('基础版 and 标准版 preserve approved prices and capabilities', () => {
  assert.match(app, /Essential:\{displayName:'基础版',price:99/);
  assert.match(app, /Complete:\{displayName:'标准版',price:199/);
  for (const capability of ['完整 Recovery Map', 'LEGAVIK 文件上传前加密保护', '一次付费，长期存储', '专属恢复包']) {
    assert.match(app, new RegExp(capability));
  }
  assert.match(app, /最多 20MB 附件空间/);
  assert.match(app, /最多 50MB 附件空间/);
  for (const standardOnly of ['完整附件填写模板', '年度 Recovery Map 检查提醒', '3年内完整 Recovery Map 更新 1 次', 'Digital Identity 数字身份资料存储服务 1 次']) {
    assert.match(app, new RegExp(standardOnly));
  }
});

test('pricing comparison is collapsed by default and exactly mirrors the approved plans', () => {
  const pricing = app.slice(app.indexOf('const planCatalog='), app.indexOf('function renderPurchaseRegister'));
  assert.match(app, /<details id="feature-comparison" class="feature-comparison">/);
  assert.doesNotMatch(app, /<details id="feature-comparison" class="feature-comparison" open/);
  assert.match(app, /const planComparison=\[/);
  assert.match(app, /服务内容/);
  assert.match(app, /基础版 <small>USD 99<\/small>/);
  assert.match(app, /标准版 <small>USD 199<\/small>/);
  assert.doesNotMatch(pricing, /赠送|二选一|7天加密草稿|专业填写示例|Recovery Readiness 完整性检查|自助恢复演练与验证/);
});

test('pricing cards separate USD from the modern numeric price and omit a fee caption', () => {
  assert.match(app, /class="plan-price"><span>USD<\/span><strong>\$\{plan\.price\}<\/strong>/);
  assert.doesNotMatch(app, /plan\.tag|一次性付费/);
  assert.match(css, /\.plan-price\{display:flex;align-items:baseline;gap:12px/);
  assert.match(css, /font-variant-numeric:tabular-nums/);
});

test('registration enters the real Supabase account flow without a fixed OTP', () => {
  assert.match(app, /web\/account\/index\.html#signup/);
  assert.doesNotMatch(app, /MOCK OTP|code==='123456'|不会发送真实邮件/);
});

test('payment stays unavailable and legacy checkout cannot be reached through routing', () => {
  assert.match(app, /payment:\{mode:'UNAVAILABLE'/);
  assert.match(app, /'purchase-checkout':renderPurchasePlaceholder/);
  assert.match(app, /'purchase-success':renderPurchasePlaceholder/);
  assert.doesNotMatch(app, /stripe\.confirm|paypal\.Buttons|ApplePaySession/);
});

test('authentication is externalized and unavailable payment routes stay isolated', () => {
  assert.doesNotMatch(app, /auth:\{mode:'MOCK'/);
  assert.match(app, /payment:\{mode:'UNAVAILABLE'/);
  assert.match(app, /'purchase-checkout':renderPurchasePlaceholder/);
  assert.match(app, /'purchase-success':renderPurchasePlaceholder/);
  assert.match(app, /'purchase-placeholder':renderPurchasePlaceholder/);
  assert.match(app, /不会生成虚假政策或法律文本/);
});

test('successful purchase enters the existing Recovery Map rather than a parallel flow', () => {
  assert.match(app, /#start-purchased-map'\)\.onclick=.*navTo\('accounts'\)/);
});

test('purchase pages hide Recovery Map context and provide responsive interaction styles', () => {
  assert.match(css, /body\.purchase-view \.map-context,body\.purchase-view #flow-nav\{display:none\}/);
  assert.match(css, /\.plan-card\.recommended/);
  assert.match(css, /\.payment-methods button\.active/);
  assert.match(css, /@media\(max-width:800px\)/);
});
