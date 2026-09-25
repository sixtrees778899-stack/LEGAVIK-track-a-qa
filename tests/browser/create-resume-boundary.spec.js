import {test,expect} from '@playwright/test';

const url='/web/v2/index.html?test_recovery_map=1&internal_resume_test=1&release=create-resume-boundary-v1';
const activeKey='skrek.mainnet.active-operation.v1';
const descriptorKey='skrek.mainnet.active-operation-descriptor.v1';
const dismissalsKey='skrek.ui.dismissed-mainnet-operations.v1';

async function clearOperationState(page){
  await page.goto(url);
  await page.evaluate(async({activeKey,descriptorKey,dismissalsKey})=>{
    localStorage.removeItem(activeKey);
    localStorage.removeItem(descriptorKey);
    localStorage.removeItem(dismissalsKey);
    await new Promise(resolve=>{const request=indexedDB.deleteDatabase('skrek-mainnet-operations-v1');request.onsuccess=request.onerror=request.onblocked=()=>resolve();});
  },{activeKey,descriptorKey,dismissalsKey});
}

test.beforeEach(async({page})=>clearOperationState(page));

test('clean session renders Module 1 before any history work',async({page})=>{
  await page.reload();
  await expect(page.getByText('资产与账户',{exact:true}).first()).toBeVisible();
  await expect(page.locator('[data-resume-choice]')).toHaveCount(0);
});

test('separate new Create sessions receive different draft and version identities',async({page})=>{
  const first=await page.evaluate(()=>window.__CJAS_V2_DIAGNOSTICS__());
  await page.reload();
  const second=await page.evaluate(()=>window.__CJAS_V2_DIAGNOSTICS__());
  expect(second.draft_id).not.toBe(first.draft_id);
  expect(second.version_id).not.toBe(first.version_id);
});

test('a historical unfinished operation cannot collide with a genuinely new draft',async({page})=>{
  const result=await page.evaluate(async()=>{
    const [{createRecoveryMapDraft,createRecoveryMapDraftId},{createBrowserOperationStore,createOperation}]=await Promise.all([import('/src/product-v2/model.js'),import('/src/ui/mainnet-stability.js')]);
    const operationStore=createBrowserOperationStore(),oldDraft=createRecoveryMapDraft({draftId:createRecoveryMapDraftId()}),oldOperation=createOperation({draftId:oldDraft.draft_id,versionId:oldDraft.version.version_id,snapshotId:'old-snapshot',archiveSha256:'a'.repeat(64),operationId:'old-operation'});
    await operationStore.save({operation:oldOperation,store:oldDraft,receipt:{generation_allowed:true},artifacts:{snapshot:{snapshot_id:'old-snapshot'},archiveBytes:new Uint8Array([1]),kitBytes:new Uint8Array([2])},evidence:{},signedTransaction:null},{password:'ResumeBoundary9!'});
    const newDraft=createRecoveryMapDraft({draftId:createRecoveryMapDraftId()}),newOperation=createOperation({draftId:newDraft.draft_id,versionId:newDraft.version.version_id,snapshotId:'new-snapshot',archiveSha256:'b'.repeat(64),operationId:'new-operation'}),saved=await operationStore.save({operation:newOperation,store:newDraft,receipt:{generation_allowed:true},artifacts:{snapshot:{snapshot_id:'new-snapshot'},archiveBytes:new Uint8Array([3]),kitBytes:new Uint8Array([4])},evidence:{},signedTransaction:null},{password:'ResumeBoundary9!'});
    return{operation_id:saved.operation_id,resumed_existing:Boolean(saved.resumed_existing),old_key:oldOperation.idempotency_key,new_key:newOperation.idempotency_key};
  });
  expect(result).toEqual({operation_id:'new-operation',resumed_existing:false,old_key:expect.any(String),new_key:expect.any(String)});
  expect(result.new_key).not.toBe(result.old_key);
});

test('valid unfinished operation is checked after Module 1 renders and shows Resume',async({page})=>{
  await page.evaluate(async()=>{const [{createRecoveryMapDraft},{createBrowserOperationStore,createOperation}]=await Promise.all([import('/src/product-v2/model.js'),import('/src/ui/mainnet-stability.js')]);const draft=createRecoveryMapDraft({draftId:'large-draft'}),operation=createOperation({draftId:draft.draft_id,versionId:draft.version.version_id,snapshotId:'large-snapshot',archiveSha256:'a'.repeat(64),operationId:'large-op'});await createBrowserOperationStore().save({operation,store:draft,receipt:{generation_allowed:true},artifacts:{snapshot:{snapshot_id:'large-snapshot'},archiveBytes:new Uint8Array([1]),kitBytes:new Uint8Array([2])},evidence:{},signedTransaction:null},{password:'ResumeBoundary9!'});});
  await page.reload();
  await expect(page.getByText('资产与账户',{exact:true}).first()).toBeVisible();
  await expect(page.locator('[data-resume-choice]')).toBeVisible();
});

test('IndexedDB delay cannot delay Module 1 first render',async({page})=>{
  await page.evaluate(({activeKey,descriptorKey})=>{localStorage.setItem(activeKey,'delayed-op');localStorage.setItem(descriptorKey,JSON.stringify({schema_version:1,operation_id:'delayed-op',state:'UPLOADING',status:'UPLOADING'}));},{activeKey,descriptorKey});
  await page.addInitScript(()=>{indexedDB.open=()=>{throw new Error('simulated delayed database must not be touched during boot');};});
  await page.reload();
  await expect(page.getByText('资产与账户',{exact:true}).first()).toBeVisible();
  await expect(page.locator('[data-resume-choice]')).toHaveCount(0);
});

test('IndexedDB failure cannot replace Create with a failure page',async({page})=>{
  await page.evaluate(({activeKey,descriptorKey})=>{localStorage.setItem(activeKey,'failed-db-op');localStorage.setItem(descriptorKey,JSON.stringify({schema_version:1,operation_id:'failed-db-op',state:'UPLOADING',status:'UPLOADING'}));},{activeKey,descriptorKey});
  await page.addInitScript(()=>{indexedDB.open=()=>{throw Object.assign(new Error('simulated database failure'),{name:'InvalidStateError'});};});
  await page.reload();
  await expect(page.getByText('资产与账户',{exact:true}).first()).toBeVisible();
  await expect(page.getByText('Recovery Map 暂时无法加载')).toHaveCount(0);
});

test('completed descriptor never hijacks a new Create flow',async({page})=>{
  await page.evaluate(({activeKey,descriptorKey})=>{localStorage.setItem(activeKey,'complete-op');localStorage.setItem(descriptorKey,JSON.stringify({schema_version:1,operation_id:'complete-op',state:'COMPLETE',status:'COMPLETE'}));},{activeKey,descriptorKey});
  await page.reload();
  await expect(page.getByText('资产与账户',{exact:true}).first()).toBeVisible();
  await expect(page.locator('[data-resume-choice]')).toHaveCount(0);
});

test('missing, malformed and old records do not show a Resume banner',async({page})=>{
  for(const id of ['missing-op','malformed-op','old-op']){
    await page.evaluate(({activeKey,descriptorKey,id})=>{localStorage.setItem(activeKey,id);localStorage.setItem(descriptorKey,JSON.stringify({schema_version:1,operation_id:id,state:'UPLOADING',status:'UPLOADING'}));},{activeKey,descriptorKey,id});
    if(id!=='missing-op')await page.evaluate(async id=>{await new Promise((resolve,reject)=>{const open=indexedDB.open('skrek-mainnet-operations-v1',2);open.onupgradeneeded=()=>open.result.createObjectStore('operations',{keyPath:'operation_id'});open.onerror=()=>reject(open.error);open.onsuccess=()=>{const db=open.result,tx=db.transaction('operations','readwrite'),value=id==='old-op'?{schema_version:1,operation_id:id,operation:{schema_version:1,operation_id:id,version_id:'v1',snapshot_id:'s1',archive_sha256:'a'.repeat(64),state:'UPLOADING',status:'UPLOADING'},store:{draft_id:'d',version:{version_id:'v1'},accounts:{},condition_selections:{},location_coverages:{},recovery_instructions:{},assistants:{},attachments:{}},artifacts:{snapshot:{},archiveBytes:new Uint8Array([1]),kitBytes:new Uint8Array([2])}}:{operation_id:id,operation:{operation_id:id}};tx.objectStore('operations').put(value);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};});},id);
    await page.reload();
    await expect(page.getByText('资产与账户',{exact:true}).first()).toBeVisible();
    await expect(page.locator('[data-resume-choice]')).toHaveCount(0);
  }
});

test('starting a new Recovery Map persistently dismisses only that historical operation',async({page,context})=>{
  await page.evaluate(async()=>{const [{createRecoveryMapDraft},{createBrowserOperationStore,createOperation}]=await Promise.all([import('/src/product-v2/model.js'),import('/src/ui/mainnet-stability.js')]);const draft=createRecoveryMapDraft({draftId:'dismiss-draft'}),operation=createOperation({draftId:draft.draft_id,versionId:draft.version.version_id,snapshotId:'dismiss-snapshot',archiveSha256:'d'.repeat(64),operationId:'dismiss-op'});await createBrowserOperationStore().save({operation,store:draft,receipt:{generation_allowed:true},artifacts:{snapshot:{snapshot_id:'dismiss-snapshot'},archiveBytes:new Uint8Array([1]),kitBytes:new Uint8Array([2])},evidence:{},signedTransaction:null},{password:'ResumeBoundary9!'});});
  await page.reload();
  await expect(page.locator('[data-resume-choice]')).toBeVisible();
  await page.locator('#dismiss-history').click();
  await expect(page.locator('[data-resume-choice]')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('[data-resume-choice]')).toHaveCount(0);
  const next=await context.newPage();
  await next.goto(url);
  await expect(next.locator('[data-resume-choice]')).toHaveCount(0);
  expect(await page.evaluate(({dismissalsKey})=>Boolean(JSON.parse(localStorage.getItem(dismissalsKey)??'{}')['dismiss-op']),{dismissalsKey})).toBe(true);
  expect(await page.evaluate(async()=>Boolean(await (await import('/src/ui/mainnet-stability.js')).createBrowserOperationStore().load('dismiss-op')))).toBe(true);
});

test('explicit Resume restores full state and durable signed checkpoint',async({page})=>{
  const saved=await page.evaluate(async()=>{
    const [{createRecoveryMapDraft},{createBrowserOperationStore,createOperation,transitionOperation,MAINNET_STAGES}]=await Promise.all([import('/src/product-v2/model.js'),import('/src/ui/mainnet-stability.js')]);
    const draft=createRecoveryMapDraft({draftId:'resume-draft'}),operation=createOperation({draftId:'resume-draft',versionId:draft.version.version_id,snapshotId:'snapshot-resume',archiveSha256:'a'.repeat(64),operationId:'resume-valid'});
    transitionOperation(operation,MAINNET_STAGES.CHECKPOINT_DURABLE);
    transitionOperation(operation,MAINNET_STAGES.WALLET_DETECTED);
    transitionOperation(operation,MAINNET_STAGES.WALLET_CONNECTED);
    transitionOperation(operation,MAINNET_STAGES.QUOTE_READY,{quote:{quote_ar:1}});
    transitionOperation(operation,MAINNET_STAGES.FEE_CONFIRMED);
    transitionOperation(operation,MAINNET_STAGES.SIGNING);
    transitionOperation(operation,MAINNET_STAGES.SIGNED_CHECKPOINTED,{transaction_id:'T'.repeat(43)});
    await createBrowserOperationStore().save({operation,store:draft,receipt:{generation_allowed:true},artifacts:{snapshot:{snapshot_id:'snapshot-resume'},archiveBytes:new Uint8Array([1,2,3]),kitBytes:new Uint8Array([4,5])},evidence:{txid:'T'.repeat(43)},signedTransaction:{id:'T'.repeat(43),reward:'1'}},{password:'ResumeBoundary9!'});
    return operation.operation_id;
  });
  expect(saved).toBe('resume-valid');
  await page.reload();
  await expect(page.getByText('资产与账户',{exact:true}).first()).toBeVisible();
  await page.locator('#resume-history').click();
  await page.locator('#resume-password').fill('ResumeBoundary9!');
  await page.locator('#unlock-resume').click();
  await expect(page.locator('#app')).toHaveAttribute('data-restored-operation-id','resume-valid');
  await expect(page.locator('#app')).toHaveAttribute('data-restored-operation-state','EVIDENCE_READY');
  await expect(page.locator('#app')).toHaveAttribute('data-restored-draft-id','resume-draft');
  const restored=await page.evaluate(async()=>{const operationStore=(await import('/src/ui/mainnet-stability.js')).createBrowserOperationStore(),envelope=await operationStore.loadActive(),record=await operationStore.unlock(envelope.operation_id,'ResumeBoundary9!');return{state:record.operation.state,txid:record.operation.transaction_id,signed:record.signed_transaction.id,evidence:record.evidence.txid};});
  expect(restored).toEqual({state:'EVIDENCE_READY',txid:'T'.repeat(43),signed:'T'.repeat(43),evidence:'T'.repeat(43)});
});
