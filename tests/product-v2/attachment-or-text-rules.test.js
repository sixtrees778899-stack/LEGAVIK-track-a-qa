import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRecoveryMapDraft } from '../../src/product-v2/model.js';
import { ProductActions } from '../../src/product-v2/actions.js';
import { addAttachment } from '../../src/product-v2/attachment-manager.js';
import { validateProductStore } from '../../src/product-v2/validator.js';

const templates=JSON.parse(await readFile(new URL('../../config/recovery-map/v2/platform-templates-v2.json',import.meta.url)));
const rules=JSON.parse(await readFile(new URL('../../config/recovery-map/v2/living-rules-v2.json',import.meta.url)));
const hash=async()=> 'a'.repeat(64);
const addAccount=store=>ProductActions.addAccount(store,{account_id:'ledger-a',platform_id:'ledger',region:'',account_type:'',display_label:''},{expected_revision:store.draft_revision});
const select=(store,ids)=>ProductActions.setConditionSelection(store,'ledger-a',{selected_condition_ids:ids},{expected_revision:store.draft_revision});
const attach=async(store,id,covers,moduleId='locations')=>addAttachment(store,{attachment_id:id,bytes:new Uint8Array([1,2,3]),byte_length:3,file_name:`${id}.txt`,mime_type:'text/plain',module_id:moduleId,platform_id:'ledger',account_id:'ledger-a',field_or_condition_id:covers[0]??moduleId,purpose:'测试说明',covered_condition_ids:covers},{rules,hash});

test('Module 3 accepts one text coverage plus two attachment-only coverages',async()=>{
  let store=select(addAccount(createRecoveryMapDraft()),['recovery_phrase','hardware_device','device_pin']);
  store=ProductActions.upsertCoverage(store,{coverage_id:'text-phrase',account_id:'ledger-a',mode:'ITEMIZED',covered_condition_ids:['recovery_phrase'],description:'保险柜第二层',attachment_ids:[]},{expected_revision:store.draft_revision});
  store=await attach(store,'hardware-file',['hardware_device']);
  store=ProductActions.upsertCoverage(store,{coverage_id:'hardware-attachment',account_id:'ledger-a',mode:'ITEMIZED',covered_condition_ids:['hardware_device'],attachment_ids:['hardware-file']},{expected_revision:store.draft_revision});
  store=await attach(store,'pin-file',['device_pin']);
  store=ProductActions.upsertCoverage(store,{coverage_id:'pin-attachment',account_id:'ledger-a',mode:'ITEMIZED',covered_condition_ids:['device_pin'],attachment_ids:['pin-file']},{expected_revision:store.draft_revision});
  const issues=validateProductStore(store,{platformTemplates:templates,rules}).validation_issues;
  assert.equal(issues.some(item=>item.issue_code==='LOCATION_COVERAGE_REQUIRED'),false);
});

test('Module 3 still reports a selected condition with neither text nor attachment',()=>{
  let store=select(addAccount(createRecoveryMapDraft()),['recovery_phrase','device_pin']);
  store=ProductActions.upsertCoverage(store,{coverage_id:'text-phrase',account_id:'ledger-a',mode:'ITEMIZED',covered_condition_ids:['recovery_phrase'],description:'保险柜第二层',attachment_ids:[]},{expected_revision:store.draft_revision});
  const issue=validateProductStore(store,{platformTemplates:templates,rules}).validation_issues.find(item=>item.issue_code==='LOCATION_COVERAGE_REQUIRED');
  assert.deepEqual(issue.missing_condition_ids,['device_pin']);
});

test('cancelling a Module 2 condition removes the Module 3 requirement',()=>{
  let store=select(addAccount(createRecoveryMapDraft()),['recovery_phrase','device_pin']);
  store=ProductActions.upsertCoverage(store,{coverage_id:'text-phrase',account_id:'ledger-a',mode:'ITEMIZED',covered_condition_ids:['recovery_phrase'],description:'保险柜第二层',attachment_ids:[]},{expected_revision:store.draft_revision});
  store=select(store,['recovery_phrase']);
  const issues=validateProductStore(store,{platformTemplates:templates,rules}).validation_issues;
  assert.equal(issues.some(item=>item.issue_code==='LOCATION_COVERAGE_REQUIRED'),false);
});

test('Module 4 and Module 5 accept a valid attachment instead of text details',async()=>{
  let store=select(addAccount(createRecoveryMapDraft()),['recovery_phrase']);
  store=ProductActions.upsertCoverage(store,{coverage_id:'text-phrase',account_id:'ledger-a',mode:'ITEMIZED',covered_condition_ids:['recovery_phrase'],description:'保险柜第二层',attachment_ids:[]},{expected_revision:store.draft_revision});
  store=await attach(store,'steps-file',[],'instructions');
  store=ProductActions.updateInstruction(store,'ledger-a',{instruction_attachment_ids:['steps-file']},{expected_revision:store.draft_revision});
  store=ProductActions.confirmInstructionSaved(store,'ledger-a',{expected_revision:store.draft_revision});
  store=ProductActions.setAssistantDecision(store,'NEED',{expected_revision:store.draft_revision});
  store=await attach(store,'assistant-file',[],'assistants');
  const issues=validateProductStore(store,{platformTemplates:templates,rules}).validation_issues;
  assert.equal(issues.some(item=>['INSTRUCTION_REQUIRED','ASSISTANT_REQUIRED','ASSISTANT_DETAILS_REQUIRED'].includes(item.issue_code)),false);
});
