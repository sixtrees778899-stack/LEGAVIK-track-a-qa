import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const root=new URL('../../',import.meta.url);
const index=await readFile(new URL('web/v2/index.html',root),'utf8');
const entry=await readFile(new URL('web/v2/canonical-entry.js',root),'utf8');
const app=await readFile(new URL('web/v2/v2-app.js',root),'utf8');
const recovery=await readFile(new URL('web/recover.js',root),'utf8');

test('document bootstrap cannot remain on the static loading shell forever',()=>{
  assert.match(index,/canonical-entry\.[a-z0-9-]+\.js/);
  assert.match(entry,/id:'recovery-map-app'/);
  assert.match(index,/canonical-runtime-gate\.[a-z0-9-]+\.js/);
  assert.match(entry,/setTimeout\(renderFailure,30000\)/);
  assert.match(entry,/Recovery Map 未能正常打开/);
  assert.match(entry,/重新打开当前页面/);
  assert.match(entry,/返回客户中心/);
});

test('version-update handoff retries until acknowledged and fails closed on timeout',()=>{
  assert.match(app,/readyTimer=setInterval\(announceReady,400\)/);
  assert.match(app,/timeoutTimer=setTimeout\(\(\)=>\{stopHandshake\(\);renderVersionUpdateFailure/);
  assert.match(app,/stopHandshake\(\);render\(null,\{resetScroll:true\}\)/);
  assert.match(app,/版本更新入口信息不完整/);
  assert.match(app,/当前版本数据未能完成安全载入/);
  assert.match(recovery,/addEventListener\('message',handler\);child=open\(target,'_blank'\)/);
});
