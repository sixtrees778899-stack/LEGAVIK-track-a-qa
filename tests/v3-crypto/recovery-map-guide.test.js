import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const app=await readFile(new URL('../../web/v2/v2-app.js',import.meta.url),'utf8');
const css=await readFile(new URL('../../web/v2/product-integration.css',import.meta.url),'utf8');
const product=await readFile(new URL('../../web/v3-crypto/product-v1.js',import.meta.url),'utf8');

test('Homepage enters the Recovery Map guide rather than a form deep link',()=>{
  assert.match(product,/\[data-recovery-map\][\s\S]*canonicalCreateUrl\(\)/);
  assert.match(app,/const entryView=versionUpdateMode\?'version-update-loading':testRecoveryMap\?'accounts':'guide'/);
});
test('guide exposes six accessible accordion modules and pricing CTAs',()=>{
  for(const id of ['accounts','conditions','locations','instructions','assistants','message'])assert.match(app,new RegExp(`${id}:\\{summary:`));
  assert.match(app,/data-guide-accordion/);assert.match(app,/开始建立 Recovery Map/);
  assert.match(app,/aria-expanded="false"/);
  assert.doesNotMatch(app,/index===0\?'is-open'/);
  assert.match(app,/accordionItems\.forEach/);
  assert.doesNotMatch(app,/class="puzzle-grid"/);
  assert.doesNotMatch(app,/class="guide-module-sections"/);
  assert.match(app,/guide-start-top.*guide-start.*canonicalPricingUrl\(\)/s);
  for(const phrase of ['Recovery Map 不是一份资产清单','有什么','需要什么','在哪里','怎么做','谁协助','留下什么说明','六个模块，组成一条完整的恢复路径','Recovery Clues','Recovery Ready','Keep It Current'])assert.match(app,new RegExp(phrase));
});
test('guide uses homepage green, restrained accordion states and responsive layouts',()=>{
  assert.match(css,/linear-gradient\(112deg,#10362d 0%,#0d2f28 58%,#123d32 100%\)/);
  assert.match(css,/\.guide-accordion-item\.is-open/);
  assert.match(css,/\.guide-accordion-panel/);
  assert.match(css,/@media\(max-width:800px\)/);
  assert.match(css,/--guide-cta-bg:linear-gradient\(100deg,#67f2c1,#24db78\)/);
  assert.match(css,/\.guide-definition>p:last-child\{[^}]*white-space:nowrap/);
  assert.match(css,/\.guide-modules-heading h2\{white-space:nowrap\}/);
  assert.match(css,/\.guide-top-cta,\.guide-primary #guide-start\{/);
  assert.match(css,/body\.guide-view main\{width:100%;padding-top:0\}/);
  assert.match(css,/\.guide-intro\{width:100%;max-width:none;justify-self:stretch;border-radius:0/);
  assert.match(css,/\.guide-definition,\.guide-path,\.guide-modules-overview,\.guide-footer\{width:min\(1320px,calc\(100% - 72px\)\);max-width:none;margin-left:auto;margin-right:auto\}/);
  assert.match(css,/\.guide-path\{[^}]*display:flex;[^}]*justify-content:flex-start/);
  assert.match(css,/\.guide-path strong\{margin-top:11px;font-size:18px\}/);
});
