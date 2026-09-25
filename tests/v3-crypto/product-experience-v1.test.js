import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const base=new URL('../../web/v3-crypto/',import.meta.url);
const read=name=>readFile(new URL(name,base),'utf8');
const [html,app,css,brand,content,entry]=await Promise.all(['index.html','product-v1.js','product-v1.css','brand-config.js','product-content.js','canonical-entry.js'].map(read));
const [recoveryHtml,recovery]=await Promise.all(['../../web/recover.html','../../web/recover.js'].map(name=>readFile(new URL(name,import.meta.url),'utf8')));

test('working brand is centralized and product entry consumes it',()=>{
  for(const key of ['brand_name','wordmark','tagline','short_description','legal_name','support_email'])assert.match(brand,new RegExp(key));
  assert.match(app,/import \{brand\} from '.\/brand-config\.js'/);
  assert.doesNotMatch(html,/>CJAS</);
  assert.match(entry,/src:'\.\/product-v1\.[a-z0-9-]+\.bundle\.js'/);
});

test('home uses progressive disclosure with one hero pain how explore trust FAQ and CTA',()=>{
  for(const token of ['hero dark','section pain','HOW','explore-grid','trust dark','faq-preview','final-cta'])assert.match(app,new RegExp(token));
  assert.match(app,/为你的数字资产/);
  assert.match(app,/一次创建/);
});

test('product shell keeps information architecture separate from the Frozen V2 Recovery Map',()=>{
  assert.match(app,/data-recovery-map/);
  assert.match(app,/data-independent-recovery/);
  assert.match(app,/canonicalCreateUrl/);
  assert.match(app,/canonicalRecoveryUrl/);
  assert.match(app,/知识库/);
  assert.match(app,/function bindProductIntegration/);
  assert.match(app,/state\.route==='digital-assets'\)digitalAssetsGuide\(\)/);
  assert.match(app,/state\.route==='security'\)securityPrivacyGuide\(\)/);
  assert.match(app,/state\.route==='pricing'\)pricingPage\(\)/);
  assert.match(app,/state\.route==='knowledge'\)knowledgeBasePage\(\)/);
  assert.match(app,/\['recovery','how-it-works','help'\]/);
});

test('legacy prototype Save and Continue remains isolated and is not a product-shell route',()=>{
  assert.match(app,/function bindSaveFeedback/);
  assert.match(app,/正在保存…/);
  assert.match(app,/已保存，正在进入下一步/);
  assert.match(app,/setTimeout\(\(\)=>navigate\(destination\),180\)/);
});

test('all primary routes render real content without pretending planned capabilities are available',()=>{
  for(const route of ['home','digital-assets','security','recovery','how-it-works','pricing','knowledge','help','register','control'])assert.match(app,new RegExp(`'${route}'|"${route}"`));
  for(const phrase of ['REAL PAYMENT · NOT STARTED','规划中','尚未上线','未来能力'])assert.match(app,new RegExp(phrase));
});

test('account and control center separate management from encrypted recovery material',()=>{
  assert.match(app,/账号管理不等于平台可以读取你的恢复材料/);
  assert.match(app,/Customer Control Center|CUSTOMER CONTROL CENTER/);
  assert.match(app,/Recommended Next Action|RECOMMENDED NEXT ACTION/);
  assert.match(app,/Current Recovery Version/);
});

test('help drawer video placeholder modal and structured FAQ are reusable interactions',()=>{
  assert.match(app,/function helpDrawer/);
  assert.match(app,/function videoModal/);
  assert.match(app,/function bindOverlay/);
  assert.equal((app.match(/bindOverlay\(\)/g)??[]).length>=3,true);
  assert.match(app,/正式介绍视频正在制作/);
  assert.match(content,/faq:/);
  assert.match(app,/data-help/);
});

test('create experience uses real local encryption but cannot broadcast or charge',()=>{
  assert.match(app,/createCryptoProductArtifacts/);
  assert.match(app,/validateRecoveryPassword/);
  assert.match(app,/本地体验版本已创建/);
  assert.doesNotMatch(app,/transactions\.sign|uploadSignedTransaction|arweaveWallet/);
  assert.match(app,/不会执行付款或Mainnet广播/);
});

test('sensitive draft bytes are memory-only while non-sensitive navigation survives refresh',()=>{
  assert.match(app,/history\.replaceState/);
  assert.match(app,/attachments:\[\],artifacts:null/);
  assert.match(app,/note:''/);
  assert.doesNotMatch(app,/localStorage|sessionStorage|indexedDB/);
});

test('accessibility and responsive baselines are explicit',()=>{
  assert.match(html,/class="skip"/);
  assert.match(html,/role="status" aria-live="polite"/);
  assert.match(app,/aria-modal="true"/);
  assert.match(app,/aria-pressed/);
  assert.match(css,/:focus-visible/);
  assert.match(css,/@media\(max-width:980px\)/);
  assert.match(css,/@media\(max-width:640px\)/);
  assert.match(css,/prefers-reduced-motion/);
});

test('customer-facing creation and recovery stages are bounded and explicit',()=>{
  for(const phrase of ['准备恢复版本','本地加密资料','安全上传','创建长期恢复记录','验证完整性','完成'])assert.match(app,new RegExp(phrase));
  for(const phrase of ['正在读取恢复材料','正在获取加密资料','正在验证资料完整性','正在解密 Recovery Map','正在恢复附件','恢复完成'])assert.match(recovery,new RegExp(phrase));
  assert.match(recoveryHtml,/id="app"/);
  assert.match(recovery,/Mainnet Recovery Evidence/);
});

test('design system covers core interaction state primitives',()=>{
  for(const token of ['.button:hover','.button:active','.button:disabled','.selector.selected','#toast.show','.modal-backdrop','.help-drawer','.progress','.compass'])assert.match(css,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
});
