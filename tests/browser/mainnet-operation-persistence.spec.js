import {test,expect} from '@playwright/test';

const url='/web/v2/index.html?test_recovery_map=1&mainnet_experience_test=1&release=mainnet-state-machine-v2';

test('real browser IndexedDB checkpoint is durable across reload',async({page})=>{
  await page.goto(url);
  const saved=await page.evaluate(async()=>{
    const module=await import('/src/ui/mainnet-stability.js');
    const store=module.createBrowserOperationStore();
    const operation=module.createOperation({draftId:'browser-gate',versionId:'version-1',snapshotId:'snapshot-1',archiveSha256:'a'.repeat(64),operationId:'browser-operation-1'});
    const record=await store.save({operation,store:{draft_id:'browser-gate',version:{version_id:'version-1',version_number:1,status:'REVIEW_READY'},attachments:{}},receipt:{draft_id:'browser-gate',draft_revision:0,generation_allowed:true,report_ready:true},artifacts:{snapshot:{snapshot_id:'snapshot-1',attachments:[]},archiveBytes:new Uint8Array([1,2,3]),kitBytes:new Uint8Array([4])},evidence:{status:'LOCAL'},signedTransaction:null},{password:'BrowserCheckpoint9!'});
    return{top:record.operation_id,nested:record.operation.operation_id,state:record.operation.state};
  });
  expect(saved).toEqual({top:'browser-operation-1',nested:'browser-operation-1',state:'LOCAL_ARTIFACTS_READY'});
  const duplicate=await page.evaluate(async()=>{
    const module=await import('/src/ui/mainnet-stability.js');
    const store=module.createBrowserOperationStore();
    const operation=module.createOperation({draftId:'browser-gate',versionId:'version-1',snapshotId:'snapshot-2',archiveSha256:'b'.repeat(64),operationId:'browser-operation-2'});
    const record=await store.save({operation,store:{draft_id:'browser-gate',version:{version_id:'version-1',version_number:1,status:'REVIEW_READY'},attachments:{}},receipt:{draft_id:'browser-gate',draft_revision:0,generation_allowed:true,report_ready:true},artifacts:{snapshot:{snapshot_id:'snapshot-2',attachments:[]},archiveBytes:new Uint8Array([9]),kitBytes:new Uint8Array([8])},evidence:{},signedTransaction:null},{password:'BrowserCheckpoint9!'});
    return{id:record.operation_id,resumed:record.resumed_existing};
  });
  expect(duplicate).toEqual({id:'browser-operation-1',resumed:true});
  await page.reload();
  const restored=await page.evaluate(async()=>{
    const module=await import('/src/ui/mainnet-stability.js');
    const store=module.createBrowserOperationStore(),envelope=await store.loadActive(),record=await store.unlock(envelope.operation_id,'BrowserCheckpoint9!');
    return{top:record.operation_id,nested:record.operation.operation_id,bytes:[...record.artifacts.archiveBytes],plaintext:'store' in envelope||'artifacts' in envelope};
  });
  expect(restored).toEqual({top:'browser-operation-1',nested:'browser-operation-1',bytes:[1,2,3],plaintext:false});
});

test('provider capability failure is explicit and does not invoke wallet',async({page})=>{
  await page.goto(url);
  const result=await page.evaluate(async()=>{
    const module=await import('/src/ui/mainnet-stability.js');
    try{module.assertWalletCapabilities({});return null;}catch(error){return{stage:error.stage,code:error.code};}
  });
  expect(result).toEqual({stage:'WALLET_DETECTED',code:'WALLET_CAPABILITY_UNSUPPORTED'});
});

test('failed replacement leaves the previous encrypted checkpoint resumable',async({page})=>{
  await page.goto(url);
  const result=await page.evaluate(async()=>{const module=await import('/src/ui/mainnet-stability.js'),store=module.createBrowserOperationStore(),operation=module.createOperation({draftId:'atomic-draft',versionId:'atomic-v1',snapshotId:'atomic-s1',archiveSha256:'c'.repeat(64),operationId:'atomic-op'}),input={operation,store:{draft_id:'atomic-draft',version:{version_id:'atomic-v1',version_number:1,status:'REVIEW_READY'},attachments:{}},receipt:{draft_id:'atomic-draft',draft_revision:0,generation_allowed:true,report_ready:true},artifacts:{snapshot:{snapshot_id:'atomic-s1',attachments:[]},archiveBytes:new Uint8Array([7,8]),kitBytes:new Uint8Array([9])},evidence:{status:'LOCAL'},signedTransaction:null};await store.save(input,{password:'AtomicCheckpoint9!'});const circular={};circular.self=circular;let failed=false;try{await store.save({...input,signedTransaction:circular},{password:'AtomicCheckpoint9!'});}catch{failed=true;}const restored=await store.unlock('atomic-op','AtomicCheckpoint9!');return{failed,archive:[...restored.artifacts.archiveBytes]};});
  expect(result).toEqual({failed:true,archive:[7,8]});
});

test('stable COMPLETE checkpoint is durably sanitized without losing lifecycle metadata',async({page})=>{
  await page.goto(url);
  const before=await page.evaluate(async()=>{
    const module=await import('/src/ui/mainnet-stability.js'),store=module.createBrowserOperationStore(),operation=module.createOperation({draftId:'sanitize-draft',versionId:'version-1',snapshotId:'snapshot-1',archiveSha256:'a'.repeat(64),operationId:'sanitize-operation'});
    for(const state of ['CHECKPOINT_DURABLE','WALLET_DETECTED','WALLET_CONNECTED','QUOTE_READY','FEE_CONFIRMED','SIGNING','SIGNED_CHECKPOINTED','UPLOADING','TX_ACCEPTED','EVIDENCE_READY','VERIFYING','COMPLETE'])module.transitionOperation(operation,module.MAINNET_STAGES[state],state==='TX_ACCEPTED'?{transaction_id:'T'.repeat(43)}:{});
    await store.save({operation,store:{draft_id:'sanitize-draft',version:{version_id:'version-1',version_number:1,status:'REVIEW_READY'},attachments:{}},receipt:{draft_id:'sanitize-draft',draft_revision:0,generation_allowed:true,report_ready:true},artifacts:{snapshot:{snapshot_id:'snapshot-1',attachments:[]},archiveBytes:new Uint8Array([1,2,3]),kitBytes:new Uint8Array([4,5])},evidence:{status:'READY_FOR_INDEPENDENT_RECOVERY',network:'Arweave Mainnet',txid:'T'.repeat(43),archive_size:3,archive_sha256:'a'.repeat(64),recovery_kit_identifier:'snapshot-1',background_verification:'PASS'},signedTransaction:{id:'T'.repeat(43)}},{password:'BrowserCheckpoint9!'});
    const sanitized=await store.sanitizeCompleted(operation.operation_id);
    return{retention:sanitized.retention.state,store:sanitized.store,artifacts:sanitized.artifacts,signed:sanitized.signed_transaction,txid:sanitized.evidence.txid,pending:store.pendingSanitization()};
  });
  expect(before).toEqual({retention:'COMPLETED_SANITIZED',store:null,artifacts:null,signed:null,txid:'T'.repeat(43),pending:null});
  await page.reload();
  const after=await page.evaluate(async()=>{const record=await (await import('/src/ui/mainnet-stability.js')).createBrowserOperationStore().load('sanitize-operation');return{state:record.operation.state,retention:record.retention.state,store:record.store,artifacts:record.artifacts,txid:record.evidence.txid};});
  expect(after).toEqual({state:'COMPLETE',retention:'COMPLETED_SANITIZED',store:null,artifacts:null,txid:'T'.repeat(43)});
});
