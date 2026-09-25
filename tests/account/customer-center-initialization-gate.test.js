import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../../src/account/supabase-account-app.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../../web/account/index.html',import.meta.url),'utf8');
const entry=readFileSync(new URL('../../web/account/canonical-entry.js',import.meta.url),'utf8');

test('Customer Center shell has an account-owned terminal failure state',()=>{
  assert.match(index,/data-account-initializing/);
  assert.match(entry,/setTimeout\(fail,30000\)/);
  assert.match(entry,/客户中心未能正常打开/);
  assert.match(entry,/重新打开当前页面/);
  assert.match(entry,/返回 LEGAVIK 首页/);
});

test('authenticated initialization cannot be held forever by pending metadata sync',()=>{
  assert.match(source,/PENDING_SYNC_BUDGET_MS=3500/);
  assert.match(source,/Promise\.allSettled\(\[retryPendingPublishedLifecycleSync\(\),retryPendingPublishedVersionSync\(\)\]\)/);
  assert.match(source,/withTimeout\(loadSession\(\),ACCOUNT_INIT_TIMEOUT_MS,'ACCOUNT_SESSION_INIT'\)/);
  assert.match(source,/withTimeout\(fetchCenter\(\),ACCOUNT_INIT_TIMEOUT_MS,'CENTER_DATA_LOAD'\)/);
});
