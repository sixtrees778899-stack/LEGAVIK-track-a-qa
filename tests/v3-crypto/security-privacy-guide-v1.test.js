import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const base=new URL('../../web/v3-crypto/',import.meta.url);
const [app,css]=await Promise.all([
  readFile(new URL('product-v1.js',base),'utf8'),
  readFile(new URL('product-v1.css',base),'utf8')
]);
const securitySource=app.slice(app.indexOf('function securityPrivacyGuide()'),app.indexOf('function digitalAssets()',app.indexOf('function securityPrivacyGuide()')));
const securityText=securitySource.replace(/<[^>]+>/g,'');

test('security navigation renders a dedicated guide instead of the generic information page',()=>{
  assert.match(app,/state\.route==='security'\)securityPrivacyGuide\(\)/);
  assert.match(app,/function securityPrivacyGuide\(\)/);
  assert.doesNotMatch(app,/\['security','recovery','how-it-works','pricing','knowledge','help'\]/);
});

test('approved security and privacy copy is present without prohibited claims',()=>{
  for(const phrase of [
    '所有资料先加密，再上传','恢复凭证套件和恢复密码由您掌握','长期、可验证的加密存储',
    '需要时，您可以随时通过恢复中心启动恢复','当您需要帮助时，我们将随时提供相应的支持',
    '平台无法看到任何原始明文信息','平台不保留任何用于解密您资料的恢复密钥',
    '去中心化永久存储网络','您的安全与隐私，是 LEGAVIK 产品设计的一部分。',
    '您的安全与隐私，我们始终十分重视。','资料上传、存储和恢复的每一个环节'
  ])assert.match(securityText,new RegExp(phrase));
  for(const phrase of ['您不需要相信 LEGAVIK','即使 LEGAVIK 不存在','平台倒闭也可以恢复','平台不会作恶','永远不会被黑'])assert.doesNotMatch(securitySource,new RegExp(phrase));
});

test('guide includes five numbered capabilities, a simple path placeholder and responsive styling',()=>{
  assert.equal((securitySource.match(/class="security-capability"/g)??[]).length,5);
  assert.match(securitySource,/aria-label="五项核心安全能力"/);
  assert.match(securitySource,/LEGAVIK 通过产品与技术设计，将安全与隐私保护落实到资料上传、存储和恢复的每一个环节。/);
  for(const token of ['security-guide','security-intro','security-capabilities','security-path','security-commitment'])assert.match(css,new RegExp(`\\.${token}`));
  assert.match(securitySource,/安全机制示意图将在后续完善/);
  assert.match(css,/@media\(max-width:980px\)/);
  assert.match(css,/@media\(max-width:640px\)/);
});

test('security visual is a single in-flow centered asset before the principles heading',()=>{
  const visual='class="security-capabilities-visual"';
  const heading='<header><p class="kicker">FIVE PRINCIPLES</p>';
  assert.match(securitySource,/security-privacy-visual\.png/);
  assert.equal((securitySource.match(/security-privacy-visual\.png/g)??[]).length,1);
  assert.ok(securitySource.indexOf(visual)<securitySource.indexOf(heading));
  assert.match(css,/\.security-capabilities\{[^}]*padding:44px/);
  assert.match(css,/\.security-capabilities-visual\{display:block;width:596px;max-width:596px;margin:0 auto 40px/);
  assert.match(css,/\.security-capabilities-visual img\{display:block;width:100%;height:auto;[^}]*border-radius:6px/);
  assert.doesNotMatch(css,/\.security-capabilities-visual\{[^}]*position:absolute|left:413px|top:394px|top:300px|\.security-capabilities\{padding-top:467px/);
  assert.match(css,/@media\(max-width:980px\)/);
  assert.match(css,/\.security-capabilities-visual\{width:100%;max-width:596px\}/);
});
