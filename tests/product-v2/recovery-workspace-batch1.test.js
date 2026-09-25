import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const root=new URL('../../',import.meta.url);

test('recovery entry exposes a real six-stage progress flow without fake percentages',async()=>{
  const source=await readFile(new URL('web/recover.js',root),'utf8');
  for(const label of ['正在读取恢复材料','正在获取加密资料','正在验证资料完整性','正在解密 Recovery Map','正在恢复附件','恢复完成'])assert.match(source,new RegExp(label));
  assert.match(source,/资料正在恢复中，请保持页面开启/);
  assert.doesNotMatch(source,/\d+%|setInterval\(|fakeProgress/i);
});

test('recovery action is immediately locked and the success state has one clear next action',async()=>{
  const source=await readFile(new URL('web/recover.js',root),'utf8');
  assert.match(source,/setRecovering\(true\)/);
  assert.match(source,/recoverButton\.disabled=value/);
  assert.match(source,/aria-busy/);
  assert.match(source,/正在恢复…/);
  assert.match(source,/Recovery Map 已成功恢复/);
  assert.match(source,/进入 Recovery Map/);
  assert.match(source,/继续更新 Recovery Map/);
  assert.match(source,/result\.innerHTML=versionUpdate\?/);
  assert.match(source,/continue-version-update">继续更新 Recovery Map/);
  assert.match(source,/addEventListener\('message',handler\);child=open\(target,'_blank'\)/);
  assert.doesNotMatch(source,/child=open\(target,'_blank'\).*addEventListener\('message',handler\)/);
  assert.match(source,/recovery-workspace-active/);
  assert.doesNotMatch(source,/给恢复人的使用说明/);
});

test('independent recovery copy is customer-facing and update completion has no competing action',async()=>{
  const source=await readFile(new URL('web/recover.js',root),'utf8');
  assert.doesNotMatch(source,/Mainnet 独立恢复|请使用与该 Recovery Map 版本对应的 Recovery Materials 完成恢复。/);
  assert.match(source,/你的 Recovery Map 已成功恢复/);
  assert.doesNotMatch(source,/只使用同一次创建的 Mainnet Recovery Evidence/);
  assert.doesNotMatch(source,/基于此版本开始更新/);
});

test('Kit unlock failure is mapped to one Chinese customer-safe message',async()=>{
  const source=await readFile(new URL('web/recover.js',root),'utf8');
  assert.match(source,/恢复密码不正确，或所选恢复材料不匹配，请检查后重试。/);
  assert.match(source,/error\?\.code==='KIT_UNLOCK_FAILED'/);
  assert.match(source,/message\.textContent=customerRecoveryError\(error\)/);
  const customerMapping=source.slice(source.indexOf('function customerRecoveryError'),source.indexOf('function renderRecovered'));
  assert.doesNotMatch(customerMapping,/损坏/);
});

test('responsive contract keeps workspace cards single-column on mobile',async()=>{
  const css=await readFile(new URL('web/recovery-workspace.css',root),'utf8');
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/\.recovery-guide-steps,\.recovery-module-explainer,\.recovery-material-explainer\{grid-template-columns:1fr\}/);
  assert.match(css,/#app\.recovery-workspace-active>h1/);
  assert.match(css,/\.workspace-section\[open\]>summary\{background:#123f34;color:#fff;box-shadow:inset 4px 0 #7fb69f\}/);
  assert.match(css,/\.map-account-body>\.account-recovery-part>h4/);
  assert.match(css,/\.content-step\{/);
  assert.match(css,/\.map-attachment\{grid-template-columns:minmax\(0,1fr\) auto/);
});

test('both recovery entrances converge on the single approved recovery implementation',async()=>{
  const sharedHeader=await readFile(new URL('src/ui/skrek-global-header.js',root),'utf8');
  const recoveryRoute=await readFile(new URL('src/ui/recovery-route.js',root),'utf8');
  const completion=await readFile(new URL('web/v2/v2-app.js',root),'utf8');
  const legacyEntry=await readFile(new URL('web/v3-crypto/recover.js',root),'utf8');
  const legacyHtml=await readFile(new URL('web/v3-crypto/recover.html',root),'utf8');
  assert.match(recoveryRoute,/RECOVERY_PATH='\/web\/recover\.html'/);
  assert.match(sharedHeader,/canonicalRecoveryUrl\('recovery-center'\)/);
  assert.match(completion,/canonicalRecoveryUrl\('post-creation'\)/);
  assert.match(legacyEntry,/location\.protocol==='http:'/);
  assert.match(legacyEntry,/location\.replace\('\/web\/recover\.html\?source=legacy-compatibility'\)/);
  assert.match(legacyHtml,/script src="\.\/recover\.js/);
  assert.match(legacyHtml,/当前页面需要通过 LEGAVIK 测试服务打开/);
  assert.doesNotMatch(legacyHtml,/SKREK|Digital Asset Recovery &amp; Continuity/);
  assert.doesNotMatch(legacyHtml,/id="evidence"|id="kit"|id="password"|id="recovery-result"/);
});

test('creation completion keeps recovery materials and one primary recovery action without technical status or draft shortcut',async()=>{
  const completion=await readFile(new URL('web/v2/v2-app.js',root),'utf8');
  const renderDownloads=completion.slice(completion.indexOf('function renderDownloads()'),completion.indexOf('\n\nfunction back()'));
  for(const label of ['Recovery Kit','Mainnet Recovery Evidence','完成前请确认','打开独立恢复'])assert.match(renderDownloads,new RegExp(label));
  assert.doesNotMatch(renderDownloads,/Local Encrypted Backup|本地加密备份|\.cjasvault/);
  assert.doesNotMatch(renderDownloads,/安全存储状态|TXID RETURN|FINAL VERIFY|timings_ms|创建新草稿并修改|id="new-version"/);
  assert.match(renderDownloads,/class="button" href="\$\{canonicalRecoveryUrl\('post-creation'\)\}"/);
});
