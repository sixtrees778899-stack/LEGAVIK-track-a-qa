import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const pricing=readFileSync(new URL('../../web/v3-crypto/product-v1.js',import.meta.url),'utf8');
const center=readFileSync(new URL('../../src/account/supabase-account-app.js',import.meta.url),'utf8');

test('Pricing FAQ exposes only the two approved low-frequency service entries',()=>{
  for(const token of ['购买单次恢复地图更新','升级当前服务','single-update','service-confirm-backdrop','真实付款和权益发放将在 Payment Integration 阶段接入'])assert.ok(pricing.includes(token),token);
  assert.doesNotMatch(pricing,/Buy Add-on|Upgrade Package|Add-ons Store|其他产品与服务/);
});

test('Customer Center prioritizes included update rights and branches upgrades by current plan',()=>{
  for(const token of ['本年度剩余免费更新：','开始更新','购买单次更新','升级至标准版','咨询 / 升级传承定制版','管理定制服务','联系私人客户支持','free_updates_remaining','included_updates_remaining'])assert.ok(center.includes(token),token);
  assert.match(center,/service\.remaining>0[\s\S]*开始更新[\s\S]*购买单次更新/);
  assert.match(center,/service\.plan==='Essential'[\s\S]*service\.plan==='Standard'[\s\S]*service\.plan==='Legacy \/ Private'/);
});

test('service placeholders preserve payment, lifecycle and Update boundaries',()=>{
  for(const token of ['USD 199 / 次 · AUD 280 / 次','USD 599 · AUD 840','当前不会创建订单、收费或发放权益','updateRecoveryMapUrl(service.latest)'])assert.ok(center.includes(token),token);
  assert.doesNotMatch(center,/insert\([^)]*orders|PAYMENT_SUCCESS|grantEntitlement|stripe/i);
});
