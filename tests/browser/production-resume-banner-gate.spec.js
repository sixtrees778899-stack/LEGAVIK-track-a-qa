import {test,expect} from '@playwright/test';

const productionUrl='/web/v2/index.html?test_recovery_map=1&release=production-resume-banner-gate';
const activeKey='skrek.mainnet.active-operation.v1';
const descriptorKey='skrek.mainnet.active-operation-descriptor.v1';
const dismissalsKey='skrek.ui.dismissed-mainnet-operations.v1';

async function clearOperationState(page){
  await page.goto(productionUrl);
  await page.evaluate(async({activeKey,descriptorKey,dismissalsKey})=>{
    localStorage.removeItem(activeKey);
    localStorage.removeItem(descriptorKey);
    localStorage.removeItem(dismissalsKey);
    await new Promise(resolve=>{const request=indexedDB.deleteDatabase('skrek-mainnet-operations-v1');request.onsuccess=request.onerror=request.onblocked=()=>resolve();});
  },{activeKey,descriptorKey,dismissalsKey});
}

async function saveOperation(page,{id,state='LOCAL_ARTIFACTS_READY',complete=false}={}){
  await page.evaluate(async({id,state,complete})=>{
    const [{createRecoveryMapDraft},{createBrowserOperationStore,createOperation,transitionOperation,MAINNET_STAGES}]=await Promise.all([import('/src/product-v2/model.js'),import('/src/ui/mainnet-stability.js')]);
    const draft=createRecoveryMapDraft({draftId:`draft-${id}`}),operation=createOperation({draftId:draft.draft_id,versionId:draft.version.version_id,snapshotId:`snapshot-${id}`,archiveSha256:'a'.repeat(64),operationId:id});
    if(state!==MAINNET_STAGES.LOCAL_ARTIFACTS_READY)for(const next of ['CHECKPOINT_DURABLE','WALLET_DETECTED','WALLET_CONNECTED','QUOTE_READY','FEE_CONFIRMED','SIGNING','SIGNED_CHECKPOINTED','UPLOADING','TX_ACCEPTED','EVIDENCE_READY','VERIFYING','COMPLETE']){transitionOperation(operation,MAINNET_STAGES[next]);if(MAINNET_STAGES[next]===state)break;}
    if(complete&&operation.state!==MAINNET_STAGES.COMPLETE)transitionOperation(operation,MAINNET_STAGES.COMPLETE);
    await createBrowserOperationStore().save({operation,store:draft,receipt:{generation_allowed:true},artifacts:{snapshot:{snapshot_id:`snapshot-${id}`},archiveBytes:new Uint8Array([1]),kitBytes:new Uint8Array([2])},evidence:{},signedTransaction:null},{password:'ProductionBanner9!'});
  },{id,state,complete});
}

async function expectProductionBannerZero(page){
  await page.goto(productionUrl);
  await expect(page.getByText('资产与账户',{exact:true}).first()).toBeVisible();
  await expect(page.locator('[data-resume-choice]')).toHaveCount(0);
  await expect(page.getByText('发现一项未完成的安全创建操作')).toHaveCount(0);
}

test.beforeEach(async({page})=>clearOperationState(page));

test('production banner count is zero with no operation',async({page})=>expectProductionBannerZero(page));

test('production banner count is zero with one valid unfinished operation',async({page})=>{
  await saveOperation(page,{id:'unfinished-production',state:'UPLOADING'});
  await expectProductionBannerZero(page);
});

test('production banner count is zero with multiple unfinished operations',async({page})=>{
  await saveOperation(page,{id:'unfinished-one',state:'UPLOADING'});
  await saveOperation(page,{id:'unfinished-two',state:'VERIFYING'});
  await expectProductionBannerZero(page);
});

test('production banner count is zero with a COMPLETE operation',async({page})=>{
  await saveOperation(page,{id:'complete-production',state:'COMPLETE',complete:true});
  await expectProductionBannerZero(page);
});

test('production banner count is zero with malformed or stale operation state',async({page})=>{
  for(const descriptor of [
    {schema_version:1,operation_id:'malformed-production',state:'UPLOADING',status:'UPLOADING'},
    {schema_version:0,operation_id:'stale-production',state:'UNKNOWN',status:'UNKNOWN'}
  ]){
    await page.evaluate(({activeKey,descriptorKey,descriptor})=>{localStorage.setItem(activeKey,descriptor.operation_id);localStorage.setItem(descriptorKey,JSON.stringify(descriptor));},{activeKey,descriptorKey,descriptor});
    await expectProductionBannerZero(page);
  }
});

test('production banner remains zero after refresh, new tab and reopened page',async({page,context})=>{
  await saveOperation(page,{id:'persistent-production',state:'UPLOADING'});
  await expectProductionBannerZero(page);
  await page.reload();
  await expect(page.locator('[data-resume-choice]')).toHaveCount(0);
  const next=await context.newPage();
  await expectProductionBannerZero(next);
  await page.close();
  await next.close();
  const reopened=await context.newPage();
  await expectProductionBannerZero(reopened);
});
