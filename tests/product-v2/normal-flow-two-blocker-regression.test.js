import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const appSource=readFileSync(new URL('../../web/v2/v2-app.js',import.meta.url),'utf8');

test('Module 3 汇总位置说明 is classified as module-summary even when Ledger is selected',()=>{
  assert.match(appSource,/purpose==='汇总位置说明'/);
  assert.match(appSource,/moduleSummary=isLocationModuleSummary\(scope,context\?\.module_id,purpose\?\.value\)/);
  assert.match(appSource,/moduleSummary=isLocationModuleSummary\(selectedScope,moduleId,purpose\)/);
});

test('Module 3 account attachment missing coverage is rejected with an actionable message',()=>{
  assert.match(appSource,/context\?\.module_id==='locations'&&!moduleSummary&&!document\.querySelector\('#new-file-conditions input:checked'\)/);
  assert.match(appSource,/请选择该附件需要覆盖的恢复条件。/);
});

test('normal Mainnet completion verifies before rendering Delivery',()=>{
  assert.match(appSource,/pendingMainnetTransaction=null;await saveOperationCheckpoint\(\);\s*await completeVerifiedMainnet\(customerWaitStarted\);/);
  assert.doesNotMatch(appSource,/pendingMainnetTransaction=null;await saveOperationCheckpoint\(\);current='downloads';render\(\);transitionOperation\(currentOperation,MAINNET_STAGES\.VERIFYING\)/);
  assert.doesNotMatch(appSource,/mainnetEvidence\?\.txid\)\{mainnetEvidence\.background_verification='PENDING';current='downloads'/);
  assert.equal((appSource.match(/for\(let round=0;round<24&&!verified\?\.verified;round\+\+\)/g)??[]).length,1);
});
