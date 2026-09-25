import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const home = readFileSync(new URL('../../web/v3-crypto/product-v1.js', import.meta.url), 'utf8');
const map = readFileSync(new URL('../../web/v2/v2-app.js', import.meta.url), 'utf8');

test('homepage uses the approved recovery-map story instead of an unexplained fixed score', () => {
  for (const copy of [
    '数字时代，很多重要资产并没有消失',
    '${brand.brand_name} 帮助你提前梳理数字资产',
    '让未来的自己、家人或指定恢复人',
    "title:'整理'",
    "title:'保护'",
    "title:'恢复'",
    '逐步建立清晰的数字资产恢复地图',
    '浏览器本地加密',
    '独立恢复路径',
    '完整性验证',
  ]) assert.ok(home.includes(copy),copy);
  assert.match(home, /recovery-map-concept/);
  const homepageSource = home.slice(home.indexOf('function home'), home.indexOf('function digitalAssets'));
  assert.doesNotMatch(homepageSource, /\$\{compass\(\)\}/);
});

test('guide contains the approved hero, six accordion modules and pricing CTAs', () => {
  assert.match(map, /重要的资产恢复信息，不应只留在你的记忆里/);
  assert.match(map, /让未来的你，和你指定的恢复人，都能找到/);
  for (const label of ['资产与账户', '恢复条件', '位置与查找', '恢复与转移步骤', '协助人', '给未来恢复人的嘱托']) {
    assert.match(map, new RegExp(label));
  }
  assert.match(map, /guide-accordion/);
  assert.match(map, /必要时谁能提供帮助/);
  assert.equal((map.match(/canonicalPricingUrl\(\)/g) || []).length >= 2, true);
});

test('pricing exposes only current capabilities and approved capacities', () => {
  assert.match(map, /displayName:'基础版',price:99/);
  assert.match(map, /displayName:'标准版',price:199/);
  assert.match(map, /最多 20MB 附件空间/);
  assert.match(map, /最多 50MB 附件空间/);
  assert.match(map, /3年内完整 Recovery Map 更新 1 次/);
  assert.match(map, /Digital Identity 数字身份资料存储服务 1 次/);
});
