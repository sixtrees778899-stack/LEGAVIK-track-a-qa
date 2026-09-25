import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const root=new URL('../../',import.meta.url);

test('customer runtime surfaces do not render diagnostic or release labels',async()=>{
  const [entry,gate,recover,app]=await Promise.all(['web/canonical-entry-recovery.js','web/canonical-runtime-gate.js','web/recover.js','web/v2/v2-app.js'].map(path=>readFile(new URL(path,root),'utf8')));
  assert.doesNotMatch(entry,/DIAGNOSTIC V4|diagnostic-v4-identity/);
  assert.doesNotMatch(gate,/Release:\s*\$\{release\}|SKREK RUNTIME/);
  assert.doesNotMatch(recover,/DIAGNOSTIC V4/);
  assert.doesNotMatch(app,/DIAGNOSTIC V4/);
});

test('Update module choices have independent desktop and mobile button spacing',async()=>{
  const css=await readFile(new URL('web/v2/product-integration.css',root),'utf8');
  assert.match(css,/\.version-update-module-grid\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\);gap:18px\}/);
  assert.match(css,/\.version-update-module-button\{min-height:52px;border:1px solid #123f32;border-radius:12px/);
  assert.match(css,/@media\(max-width:700px\)\{\.version-update-module-grid\{grid-template-columns:1fr;gap:12px\}/);
});

test('Recovery workspace uses the shared three-column accordion alignment for assistance',async()=>{
  const css=await readFile(new URL('web/recovery-workspace.css',root),'utf8');
  assert.match(css,/\.workspace-section>summary\{display:grid;grid-template-columns:52px minmax\(0,1fr\) auto;/);
  assert.doesNotMatch(css,/\.recovery-assistance-section>summary\{grid-template-columns:52px minmax\(0,1fr\) auto auto\}/);
});

test('final Update and Recovery customer copy matches the two-stage action contract',async()=>{
  const [app,recover]=await Promise.all(['web/v2/v2-app.js','web/recover.js'].map(path=>readFile(new URL(path,root),'utf8')));
  assert.match(app,/id="create-updated-map"[^>]*>更新 Recovery Map<\/button>/);
  assert.match(app,/button\.textContent='创建更新后的 Recovery Map'/);
  assert.doesNotMatch(recover,/Mainnet 独立恢复|请使用与该 Recovery Map 版本对应的 Recovery Materials 完成恢复。/);
  assert.match(recover,/你的 Recovery Map 已成功恢复/);
});

test('shared Update render boundary cannot emit the version system banner on any subpage',async()=>{
  const app=await readFile(new URL('web/v2/v2-app.js',root),'utf8');
  for(const route of ['dashboard','accounts','conditions','locations','instructions','assistants','message','attachments','password','downloads'])assert.match(app,new RegExp(`${route.replace('-','\\-')}:|['"]${route}['"]`));
  assert.doesNotMatch(app,/version-update-banner|正在更新 Recovery Map|当前版本：V\$\{versionUpdateContext\.sourceVersionNumber\} · 更新后：|原版本保持不变；更新完成后，新版本将成为 Current Version/);
  assert.match(app,/decorateCustomerUI\(\);decorateVersionUpdateUX\(\)/);
  assert.match(app,/continueButton\.onclick=\(\)=>\{try\{/);
  assert.match(app,/saveVisibleModule\(\)/);
});

test('Customer Center navigation displays only the email local part',async()=>{
  const bridge=await readFile(new URL('src/account/account-nav-bridge.js',root),'utf8');
  assert.match(bridge,/function displayName\(session\)\{return \(session\?\.user\?\.email\?\?''\)\.split\('@'\)\[0\];\}/);
  assert.match(bridge,/client\.auth\.getSession\(\)/);
  assert.doesNotMatch(bridge,/session\?\.user\?\.email\?\?'';\}/);
});
