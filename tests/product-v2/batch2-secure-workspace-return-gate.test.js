import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CURRENT_TEST_RELEASE} from '../../src/ui/canonical-customer-links.js';

const read=path=>readFileSync(new URL(`../../${path}`,import.meta.url),'utf8');
const v2=read('web/v2/v2-app.js');
const recover=read('web/recover.html');
const accountEntry=read('web/account/canonical-entry.js');
const v2Entry=read('web/v2/canonical-entry.js');
const recoveryEntry=read('web/canonical-entry-recovery.js');
const gate=read('web/canonical-runtime-gate.js');

test('A1 uses one minimal secure shell for Recovery and Update while Create keeps the product shell',()=>{
  assert.match(recover,/body class="secure-workspace"/);
  assert.match(recover,/secure-workspace-header/);
  assert.match(recover,/返回客户中心/);
  assert.doesNotMatch(recover,/<footer>/);
  assert.match(v2,/if\(versionUpdateMode\)\{/);
  assert.match(v2,/document\.body\.classList\.add\('secure-workspace'\)/);
  assert.match(v2,/\}else document\.querySelector\('#site-header'\)\.innerHTML=skrekGlobalHeader/);
});

test('B4 every asynchronous entry has an explicit LOADING to READY or FAILED lifecycle',()=>{
  assert.match(gate,/runtimeState='LOADING'/);
  assert.match(gate,/runtimeState='FAILED'/);
  assert.match(gate,/runtimeState='READY'/);
  assert.match(accountEntry,/runtimeState!=='LOADING'/);
  assert.match(v2Entry,/runtimeState!=='LOADING'/);
  assert.match(recoveryEntry,/runtimeState!=='LOADING'/);
  for(const entry of [accountEntry,v2Entry])assert.match(entry,/30000/);
  assert.match(recoveryEntry,/12000/);
});

test('B7 all six Customer Center paths converge on the canonical current-release route',()=>{
  const canonical=`account/index.html?section=maps&release=${CURRENT_TEST_RELEASE}#center`;
  assert.match(recover,new RegExp(canonical.replace('&','&amp;').replace(/[.?]/g,'\\$&')));
  assert.ok((v2.match(/canonicalAccountUrl\('center',\{section:'maps'\}\)/g)??[]).length>=2);
  assert.match(recoveryEntry,new RegExp(`section=maps&release=${CURRENT_TEST_RELEASE}#center`));
  assert.match(gate,/readManifest/);
  assert.match(gate,/runtime_upgrade/);
});
