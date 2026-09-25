import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const pricing=readFileSync(new URL('../../web/v3-crypto/product-v1.js',import.meta.url),'utf8');
const center=readFileSync(new URL('../../src/account/supabase-account-app.js',import.meta.url),'utf8');

test('Pricing FAQ exposes only the two approved low-frequency service entries',()=>{
  for(const token of ['购买单次恢复地图更新','升级当前服务','single-update','service-confirm-backdrop','真实付款和权益发放将在 Payment Integration 阶段接入'])assert.ok(pricing.includes(token),token);
  assert.doesNotMatch(pricing,/Buy Add-on|Upgrade Package|Add-ons Store|其他产品与服务/);
});

test('approved Customer Center reads formal plan/order state without fabricating service entitlements',()=>{
  for(const token of ['CURRENT PLAN / SERVICE ENTITLEMENT','方案能力来自当前正式服务记录，不由 Recovery Map 版本推断。','ORDER HISTORY','暂无付款订单记录'])assert.ok(center.includes(token),token);
  assert.doesNotMatch(center,/free_updates_remaining|included_updates_remaining|service\.remaining/);
});

test('service placeholders preserve payment, lifecycle and Update boundaries',()=>{
  for(const token of ['当前不会创建订单、不会标记付款成功，也不会进入付费创建流程','recoveryMapPurchaseUrl','updateRecoveryMapUrl(item)'])assert.ok(center.includes(token),token);
  assert.doesNotMatch(center,/insert\([^)]*orders|PAYMENT_SUCCESS|grantEntitlement|stripe/i);
});
