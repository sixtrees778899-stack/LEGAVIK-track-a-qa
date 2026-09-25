import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../../web/v3-crypto/product-v1.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../../web/v3-crypto/product-v1.css',import.meta.url),'utf8');
const pricing=app.slice(app.indexOf('const pricingPlans='),app.indexOf('const knowledgeTopics='));

test('Product & Service V1 copy and comparison follow the approved contract',()=>{
  for(const value of ['把重要的数字资产恢复信息系统整理清楚','恢复凭证套件和恢复密码始终由您掌握','帮助您建立完整的数字资产恢复体系','在完整恢复体系基础上，增加更多恢复地图更新','为有明确传承需求的客户定制恢复与交接方案','客户端加密与长期存储','恢复凭证套件和恢复密码由客户掌握','查看三档完整比较','多次 / 按方案'])assert.ok(pricing.includes(value),value);
  assert.doesNotMatch(pricing,/适合您，如果：|您希望把恢复体系完整建立起来/);
  assert.doesNotMatch(pricing,/更适合这样的需求|先比较恢复演练|客户端加密与长期保存/);
});

test('all annual maintenance tiers and drawer summaries are complete',()=>{
  for(const value of ['基础版第二年年度维护服务','标准版第二年年度维护服务','传承定制版第二年年度维护服务','为什么需要年度维护？','每半年一次恢复信息检查提醒','每年1次专属恢复演练','不提供法律、税务或投资建议','第三方专业人士原则上由您自行选择和指定','plan-renewal-fixed',' / 年','默认按月分期支付：','参考按月支付：'])assert.ok(pricing.includes(value),value);
  assert.doesNotMatch(pricing,/重要变化提醒|第二年为什么值得继续|为什么值得继续？/);
  assert.doesNotMatch(pricing,/钱包、账户、设备、双重验证、恢复条件和家庭安排|购买第二年年度维护服务的客户，将持续获得|\/ 12个月/);
});

test('expanded annual details use a warm-white information layer',()=>{
  for(const value of ['.annual-value-item[open]{background:#fffdf8}', '.annual-value-detail{margin:0 0 10px', 'background:#fffdf8', '.annual-service-note'])assert.ok(css.includes(value),value);
});
