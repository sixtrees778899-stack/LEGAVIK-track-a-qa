import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=path=>readFile(new URL(`../../${path}`,import.meta.url),'utf8');

test('canonical recovery enters the six-module recovered map',async()=>{
  const [recovery,map]=await Promise.all([read('web/recover.js'),read('web/map-view.js')]);
  assert.match(recovery,/Recovery Map 已成功恢复/);
  assert.match(recovery,/进入 Recovery Map/);
  assert.doesNotMatch(recovery,/给恢复人的使用说明|开始查看恢复地图/);
  for(const title of ['资产与账户','恢复所需条件与资料','位置与查找','恢复与转移步骤','协助人','给未来恢复人的嘱托'])assert.match(map,new RegExp(title));
  assert.match(map,/class="map-module card"/);
  assert.match(map,/attachmentScopeLabel=file=>file\.attachment_scope==='MODULE_SUMMARY'\?'汇总资料'/);
});

test('preview mirrors six modules and module-level ownership',async()=>{
  const source=await read('web/v2/v2-app.js');
  for(const number of ['01','02','03','04','05','06'])assert.match(source,new RegExp(`previewModule\\('${number}'`));
  assert.match(source,/previewAttachment\(file,true\)/);
  assert.match(source,/所属模块：\$\{escape\(file\.module_label\)\}/);
});

test('module one toggles selection and exposes explicit duplicate-account action',async()=>{
  const source=await read('web/v2/v2-app.js');
  assert.match(source,/else if\(selected\.length\)\{for\(const account of selected\)removeCatalogAccount/);
  assert.match(source,/data-add-another=/);
  assert.match(source,/添加另一个账户/);
});

test('drawer errors, full-width footer and real upload chunks are visible',async()=>{
  const [source,css]=await Promise.all([read('web/v2/v2-app.js'),read('web/v2/product-integration.css')]);
  assert.match(source,/id="attachment-upload-error"/);
  assert.match(source,/attachmentPolicy\.limits\.max_attachment_bytes/);
  assert.match(source,/当前文件超过 \$\{Math\.round\(attachmentPolicy\.limits\.max_attachment_bytes\/1048576\)\}MB 限制/);
  assert.match(source,/该文件已上传，请勿重复提交/);
  assert.match(css,/\.drawer-return-bar\{right:0;bottom:0;/);
  assert.match(css,/\.drawer-return-bar\{width:min\(46vw,880px\);max-width:50vw\}/);
  assert.match(css,/display:inline-flex;align-items:center;justify-content:center;text-align:center/);
  assert.match(source,/\$\{item\.uploaded_chunks\} \/ \$\{item\.total_chunks\} 个上传分块/);
});
