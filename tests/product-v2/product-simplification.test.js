import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRecoveryMapDraft } from '../../src/product-v2/model.js';
import { ProductActions } from '../../src/product-v2/actions.js';
import { addAttachment } from '../../src/product-v2/attachment-manager.js';
import { commitPendingAccount,hasPendingAccount } from '../../src/product-v2/account-form.js';
import { createApplicationState,beginAttachmentView } from '../../src/product-v2/application-state.js';
import { markGenerated,markReviewReady,createDraftFromVersion } from '../../src/product-v2/version-machine.js';
import { validateProductStore } from '../../src/product-v2/validator.js';

const rules=JSON.parse(await readFile(new URL('../../config/recovery-map/v2/living-rules-v2.json',import.meta.url)));
const templates=JSON.parse(await readFile(new URL('../../config/recovery-map/v2/platform-templates-v2.json',import.meta.url)));
const appSource=await readFile(new URL('../../web/v2/v2-app.js',import.meta.url),'utf8');
const add=(store,id,platform,accountType='Personal')=>ProductActions.addAccount(store,{account_id:id,platform_id:platform,platform_name:platform.toUpperCase(),region:'Australia',account_type:accountType},{expected_revision:store.draft_revision});
const conditions=(store,id,ids=['email','phone','password','authenticator'])=>ProductActions.setConditionSelection(store,id,{selected_condition_ids:ids},{expected_revision:store.draft_revision});
const attachmentOptions={rules,hash:async()=> 'a'.repeat(64)};

test('Story 14: deleting one account cascades only its conditions locations steps and attachments',async()=>{
  let store=add(add(createRecoveryMapDraft({draftId:'story-14'}),'okx-a','okx'),'binance-a','binance');
  store=conditions(conditions(store,'okx-a'),'binance-a');
  store=ProductActions.upsertCoverage(store,{coverage_id:'summary-binance',account_id:'binance-a',mode:'SUMMARY',covered_condition_ids:['email','phone','password','authenticator'],description:'cabinet'},{expected_revision:store.draft_revision});
  store=ProductActions.updateInstruction(store,'binance-a',{instruction_text:'recover and transfer'},{expected_revision:store.draft_revision});
  store=await addAttachment(store,{attachment_id:'file-binance',bytes:new Uint8Array([1]),byte_length:1,mime_type:'text/plain',file_name:'note.txt',platform_id:'binance',account_id:'binance-a',module_id:'locations',field_or_condition_id:'summary',purpose:'位置说明',covered_condition_ids:['email']},attachmentOptions);
  const next=ProductActions.removeAccount(store,'binance-a',{confirmCascade:true,expected_revision:store.draft_revision});
  assert.equal(next.accounts['binance-a'],undefined);assert.equal(next.condition_selections['binance-a'],undefined);assert.equal(next.location_coverages['summary-binance'],undefined);assert.equal(next.recovery_instructions['binance-a'],undefined);assert.equal(next.attachments['file-binance'],undefined);
  assert.ok(next.accounts['okx-a']);assert.deepEqual(next.condition_selections['okx-a'].selected_condition_ids,['email','phone','password','authenticator']);
});

test('Story 14A-C: blank pending cards are UI-only and never change or block the Draft',()=>{
  const store=add(add(createRecoveryMapDraft({draftId:'story-14abc'}),'okx-a','okx'),'binance-a','binance'),before=store.draft_revision;
  assert.equal(hasPendingAccount({}),false);
  const result=commitPendingAccount(store,{},{});
  assert.equal(result.added,false);assert.equal(result.store.draft_revision,before);assert.equal(Object.keys(result.store.accounts).length,2);
  assert.equal(hasPendingAccount({platform_id:'binance',region:'Australia'}),true);
  assert.match(appSource,/取消新增/);assert.match(appSource,/已填写的未保存内容将被清除/);
});

test('Story 15: generated Version stays immutable and derives an editable Draft with Chinese product UX',()=>{
  let store=conditions(add(createRecoveryMapDraft({draftId:'story-15'}),'okx-a','okx'),'okx-a');
  store=ProductActions.upsertCoverage(store,{coverage_id:'summary-okx',account_id:'okx-a',mode:'SUMMARY',covered_condition_ids:['email','phone','password','authenticator'],description:'cabinet'},{expected_revision:store.draft_revision});
  store=ProductActions.updateInstruction(store,'okx-a',{instruction_text:'recover'},{expected_revision:store.draft_revision});
  store=ProductActions.confirmInstructionSaved(store,'okx-a',{expected_revision:store.draft_revision});
  store=ProductActions.setAssistantDecision(store,'NOT_NEEDED',{expected_revision:store.draft_revision});
  const receipt=validateProductStore(store,{platformTemplates:templates,rules}),generated=markGenerated(markReviewReady(store,receipt),receipt);
  assert.throws(()=>ProductActions.updateAccount(generated,'okx-a',{display_label:'changed'}),/GENERATED_VERSION_IMMUTABLE/);
  const next=createDraftFromVersion(generated,{draftId:'story-15-next'});
  assert.equal(next.version.status,'DRAFT');assert.equal(generated.accounts['okx-a'].display_label,'');
  assert.match(appSource,/当前版本已生成。需要修改时，请基于此版本创建新草稿。/);assert.match(appSource,/创建新草稿并修改/);
});

test('Story 16: first and later accounts use the same Personal or Institutional configuration',()=>{
  let store=add(createRecoveryMapDraft({draftId:'story-16'}),'first','okx','Institutional');
  store=add(store,'second','binance','Personal');
  assert.equal(store.accounts.first.account_type.value,'Institutional');assert.equal(store.accounts.second.account_type.value,'Personal');
  assert.match(appSource,/id="new-type"[\s\S]*value="Personal"[\s\S]*value="Institutional"/);
});

test('Story 17: contextual attachment state locks module while current accounts remain selectable',()=>{
  const state=createApplicationState();beginAttachmentView(state,{return_module:'conditions',account_id:'okx-a',module_id:'conditions',purpose:'恢复条件说明'});
  assert.deepEqual(state.attachment_context,{return_module:'conditions',return_view:null,account_id:'okx-a',module_id:'conditions',purpose:'恢复条件说明',covered_condition_ids:[],attachment_id:''});
  assert.match(appSource,/account\.disabled=false/);assert.match(appSource,/module\.closest\('\.field'\)\.hidden=true/);assert.match(appSource,/purpose\.closest\('\.field'\)\.hidden=true/);
});

test('Story 18-19: summary default and opt-in itemized locations share one bottom save path',()=>{
  const presentation=appSource.slice(appSource.indexOf('function renderLocationsV2'),appSource.indexOf('function renderInstructionsV2'));
  assert.match(presentation,/summary\?\.covered_condition_ids\?\?selected/);
  assert.match(presentation,/分别说明不同恢复条件的位置/);
  assert.doesNotMatch(presentation,/data-save-summary=/);
  assert.doesNotMatch(presentation,/data-save-location=/);
  assert.match(presentation,/data-summary-account/);assert.match(presentation,/data-location=/);
  assert.match(appSource,/saveVisibleModule\(\);if\(!validateCurrentModuleBeforeContinue\(\)\)return;v3State\.module_resolutions\[current\]=true;persistDraft\(\);if\(appState\.review_context\)return navTo\('review'\);navTo\(nextProductView\(current\)\)/);
});

test('capacity and condition labels use customer-facing units and wording',()=>{
  assert.equal(templates.condition_labels.password,'登录密码');assert.equal(templates.condition_labels.identity,'身份验证材料');
  const presentation=appSource.slice(appSource.indexOf('function renderAttachmentsV2'),appSource.indexOf('function reportAttachment'));
  assert.match(presentation,/已使用：\$\{formatBytes\(capacity\.used_bytes\)\}/);assert.doesNotMatch(presentation,/capacity\.used_bytes} bytes/);
});
