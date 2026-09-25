import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const app=await readFile(new URL('../../web/v2/v2-app.js',import.meta.url),'utf8');
const recovery=await readFile(new URL('../../web/recover.js',import.meta.url),'utf8');

test('R12 Module Instructions Present',()=>{
  for(const id of ['accounts','conditions','locations','instructions','assistants','message'])assert.equal(app.includes(`${id}:[`),true);
  assert.match(app,/填写说明/);
});
test('R13 sensitive draft remains memory-only while approved non-secret operation metadata may persist',()=>{assert.match(app,/当前创建进度已保存于本次会话/);assert.doesNotMatch(app,/localStorage\.setItem\([^,]+,(?:password|store|draft|snapshot|attachment)/i);assert.match(app,/VERSION_OPERATION_CONTEXT_KEY/);assert.match(app,/createBrowserOperationStore/);});
test('R14 Attachment Module Isolation',()=>{assert.match(app,/if\(file\.module_id!==context\.module_id\)card\.remove\(\)/);assert.match(app,/attachment-account-group/);});
test('R15 Attachment Context Return',()=>{assert.match(app,/source_scroll_anchor/);assert.match(app,/return_module/);});
test('R16 Module 5 and 6 module ownership',()=>{assert.match(app,/globalModule=\['assistants','message'\]/);assert.match(app,/所属模块/);});
test('R17 Wallet Module 3 Upload',()=>{assert.match(app,/isAccountScoped/);assert.match(app,/module_id:'locations'|moduleId,'locations'/);});
test('R18 Text Attachment Validation Consistency',()=>{assert.match(app,/TEXT_OR_ATTACHMENT/);assert.match(app,/文字与附件/);});
test('R19 Review Live Sync',()=>{const body=app.slice(app.indexOf('function renderReview(anchor)'),app.indexOf('function renderReport'));assert.match(body,/recalc\(\);/);assert.ok(body.indexOf('recalc();')<body.indexOf('projectReview('));assert.match(app,/CURRENT|当前/);});
test('R20 Module 6 Completion Gate',()=>{assert.doesNotMatch(app,/skip-message/);assert.match(app,/resolvedModules\(\)\.size!==6/);});
test('R21 Duplicate Attachment Detection',()=>{assert.match(app,/这个文件似乎已经添加过/);assert.match(app,/file_name===selected\.name&&item\.byte_length===selected\.size/);});
test('R22 Recovery Workspace entry removes the one-off guide and enters the recovered map directly',()=>{assert.match(recovery,/Recovery Map 已成功恢复/);assert.match(recovery,/进入 Recovery Map/);assert.doesNotMatch(recovery,/给恢复人的使用说明|开始查看恢复地图/);});
