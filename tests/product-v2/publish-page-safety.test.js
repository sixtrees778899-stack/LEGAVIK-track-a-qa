import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {MAINNET_STAGES} from '../../src/ui/mainnet-stability.js';
import {PUBLISH_LEAVE_WARNING,publishMaterialsReady,publishCommitmentPending} from '../../src/ui/publish-page-safety.js';

const app=await readFile(new URL('../../web/v2/v2-app.js',import.meta.url),'utf8');
const complete={state:MAINNET_STAGES.COMPLETE,status:MAINNET_STAGES.COMPLETE};
const verified={status:'READY_FOR_INDEPENDENT_RECOVERY',background_verification:'PASS'};

test('final recovery materials require stable COMPLETE plus verified Mainnet evidence',()=>{
  assert.equal(publishMaterialsReady(complete,verified),true);
  for(const [operation,evidence] of [[{state:MAINNET_STAGES.UPLOADING,status:MAINNET_STAGES.UPLOADING},verified],[complete,{...verified,background_verification:'PENDING'}],[complete,{...verified,status:'BROADCAST_ACCEPTED'}]])assert.equal(publishMaterialsReady(operation,evidence),false);
});

test('signed transaction or TxID keeps interrupted publication recoverable and protected',()=>{
  assert.equal(publishCommitmentPending({}),false);
  assert.equal(publishCommitmentPending({locked:true}),true);
  assert.equal(publishCommitmentPending({signedTransaction:{id:'tx'}}),true);
  assert.equal(publishCommitmentPending({transactionId:'tx'}),true);
  assert.equal(publishCommitmentPending({evidence:{txid:'tx'}}),true);
});

test('Create and Update share one page-leave lock and fail-closed material gate',()=>{
  assert.equal(PUBLISH_LEAVE_WARNING,'正在安全存储，请不要关闭、刷新或返回当前页面，直到系统提示创建完成。');
  assert.match(app,/setGenerationStage\(2,PUBLISH_LEAVE_WARNING/);
  assert.match(app,/addEventListener\('beforeunload'/);
  assert.match(app,/back\.disabled=publishSafetyLocked/);
  assert.match(app,/if\(!publishMaterialsReady\(currentOperation,mainnetEvidence\)\)/);
  assert.match(app,/最终恢复材料暂不可下载/);
  assert.match(app,/dashboard:versionUpdateContext\?renderVersionUpdateDashboard:renderDashboardV5/);
});
