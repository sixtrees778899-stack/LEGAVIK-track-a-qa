import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const root=new URL('../../',import.meta.url);
const app=await readFile(new URL('web/v2/v2-app.js',root),'utf8');
const recovery=await readFile(new URL('web/recover.js',root),'utf8');

test('Update recovery context owns its copy, handoff, and memory-only password reuse',()=>{
  assert.match(recovery,/继续更新 Recovery Map/);
  assert.match(recovery,/更新前，需要先恢复当前版本。恢复完成后，您可以只修改发生变化的内容，没有变化的信息无需调整。更新完成后，系统会生成新的 Recovery Map。/);
  assert.match(recovery,/当前版本：V\$\{query\.get\('version_number'\)/);
  assert.doesNotMatch(recovery,/目标版本/);
  assert.doesNotMatch(recovery,/version-update-changes/);
  assert.match(recovery,/recoveryPassword:recoveredPasswordForUpdate/);
  assert.match(recovery,/recoveredPasswordForUpdate=''/);
  assert.match(app,/versionUpdatePassword=typeof event\.data\.recoveryPassword/);
  assert.doesNotMatch(app,/localStorage\.(setItem|getItem)\([^)]*versionUpdatePassword/);
});

test('Update dashboard is a guarded operation center with direct module and attachment routes',()=>{
  assert.match(app,/dashboard:versionUpdateContext\?renderVersionUpdateDashboard:renderDashboardV5/);
  for(const copy of ['当前版本 V','已完整载入','修改模块内容','管理附件','如何更新 Recovery Map？','更新 Recovery Map','创建更新后的 Recovery Map'])assert.match(app,new RegExp(copy));
  assert.match(app,/data-update-module/);
  assert.match(app,/保存并返回更新预览/);
  assert.doesNotMatch(app,/更新重点：/);
  assert.doesNotMatch(app,/更新后<\/dt>/);
  assert.match(app,/version-update-module-button/);
  assert.match(app,/完成修改后，点击“更新 Recovery Map”进入下一步。设置或确认 Recovery Password 后，点击“创建更新后的 Recovery Map”即开始安全存储。/);
  assert.doesNotMatch(app,/version-update-banner|原版本保持不变；更新完成后，新版本将成为 Current Version/);
});

test('Update creation unlocks only after canonical content differs from the recovered baseline',()=>{
  assert.match(app,/versionUpdateBaselineFingerprint=currentUpdateFingerprint\(\)/);
  assert.match(app,/function versionUpdateHasChanges\(\)/);
  assert.match(app,/versionUpdateHasContentChanges\(store,versionUpdateBaselineFingerprint\)/);
  assert.match(app,/id="create-updated-map" \$\{ready\?'':'disabled'\}/);
  assert.doesNotMatch(app,/id="create-updated-map" \$\{gate\.allowed\?'':'disabled'\}/);
  assert.match(app,/changed\?versionUpdateGateState\(\):null,ready=Boolean\(changed&&check\?\.gate\.allowed\)/);
  assert.match(app,/if\(!latest\.gate\.allowed\)return renderVersionUpdateDashboard\(\);navTo\('password'\)/);
  assert.doesNotMatch(app,/if\(!check\.gate\.allowed\).*navTo\('review'\)/);
  assert.doesNotMatch(app,/if\(canReuse\)document\.querySelector\('#generate'\)\.disabled=false/);
});

test('Update gate failures stay on the Update dashboard and expose exact blocking messages',()=>{
  assert.match(app,/function versionUpdateGateMessages\(check\)/);
  assert.match(app,/message\.textContent=versionUpdateGateMessages\(check\)\.join/);
  assert.match(app,/backButton\.textContent='返回更新预览'/);
  assert.match(app,/backButton\.onclick=\(\)=>navTo\('dashboard'\)/);
});

test('Update completion replaces the Create recovery action with one Customer Center action',()=>{
  const decorator=app.slice(app.indexOf('function decorateVersionDownloads'),app.indexOf('function nav('));
  assert.match(decorator,/actions\.innerHTML=`<a class="button"[^`]+返回客户中心查看版本<\/a>`/);
  assert.doesNotMatch(decorator,/insertAdjacentHTML\('beforeend'/);
  assert.doesNotMatch(decorator,/打开独立恢复/);
});

test('Update attachment drawer returns through full backdrop and body-lock cleanup',()=>{
  assert.match(app,/versionUpdateContext&&current==='dashboard'\?'dashboard':null/);
  assert.match(app,/document\.body\.classList\.remove\('attachment-drawer-open'\)/);
  assert.match(app,/document\.querySelector\('#overlay-root'\)\.replaceChildren\(\)/);
  assert.match(app,/document\.body\.style\.minHeight=''/);
});

test('Create renderer and its accepted customer copy remain intact behind the default branch',()=>{
  for(const copy of ['一步一步整理未来恢复需要的账户、条件和说明','开始建立恢复地图','检查并完善','预览恢复说明','准备创建恢复版本','继续设置恢复密码','创建安全恢复版本'])assert.match(app,new RegExp(copy));
  assert.match(app,/if\(!versionUpdateContext\)return/);
});

test('module summary attachment scope remains coverage-free',()=>{
  assert.match(app,/moduleSummary\?\[\]:covers/);
  assert.match(app,/moduleId==='locations'&&!moduleSummary&&!covers\.length/);
  assert.match(app,/covered_condition_ids:moduleSummary\?\[\]:covers/);
});
