import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRecoveryMapDraft } from '../../src/product-v2/model.js';
import { ProductActions } from '../../src/product-v2/actions.js';
import { addAttachment } from '../../src/product-v2/attachment-manager.js';
import { validateProductStore } from '../../src/product-v2/validator.js';
import { mapProductToKnowledgeV2,attachmentPayloads } from '../../src/product-v2/snapshot-mapper.js';
import { createVaultArtifacts,recoverVaultArtifacts } from '../../src/ui/vault-pipeline.js';
import { projectReport } from '../../src/product-v2/projections.js';

const root=new URL('../../',import.meta.url);
const templates=JSON.parse(await readFile(new URL('config/recovery-map/v2/platform-templates-v2.json',root)));
const rules=JSON.parse(await readFile(new URL('config/recovery-map/v2/living-rules-v2.json',root)));
const clock=()=> '2026-08-13T00:00:00.000Z';
const addAccount=(store,id,platform)=>ProductActions.addAccount(store,{account_id:id,platform_id:platform,platform_name:templates.platforms.find(item=>item.id===platform).name,region:platform==='binance'?'Australia':'',account_type:platform==='binance'?'Personal':'',display_label:id},{expected_revision:store.draft_revision,clock});
const select=(store,id,conditions)=>ProductActions.setConditionSelection(store,id,{selected_condition_ids:conditions},{expected_revision:store.draft_revision,clock});

test('one module-wide location attachment covers every selected condition across accounts',async()=>{
  let store=createRecoveryMapDraft({clock});
  store=addAccount(store,'binance-a','binance');
  store=addAccount(store,'ledger-a','ledger');
  store=select(store,'binance-a',['email','authenticator']);
  store=select(store,'ledger-a',['recovery_phrase','device_pin']);
  store=await addAttachment(store,{attachment_id:'module-locations',bytes:new Uint8Array([1,2,3]),byte_length:3,file_name:'locations.pdf',mime_type:'application/pdf',module_id:'locations',platform_id:'binance',account_id:'binance-a',field_or_condition_id:'module-summary',purpose:'位置与查找说明',covered_condition_ids:[]},{rules,clock,hash:async()=> 'a'.repeat(64)});
  const result=validateProductStore(store,{platformTemplates:templates,rules});
  assert.equal(result.validation_issues.some(issue=>issue.module_id==='locations'),false);
  assert.equal(result.module_statuses.locations.state,'COMPLETE');
});

test('summary and account-specific location attachments can coexist',async()=>{
  let store=createRecoveryMapDraft({clock});
  store=addAccount(store,'binance-a','binance');
  store=select(store,'binance-a',['email']);
  for(const [id,field] of [['all','module-summary'],['email','email']])store=await addAttachment(store,{attachment_id:id,bytes:new Uint8Array([1]),byte_length:1,file_name:`${id}.pdf`,mime_type:'application/pdf',module_id:'locations',platform_id:'binance',account_id:'binance-a',field_or_condition_id:field,purpose:'位置说明',covered_condition_ids:field==='module-summary'?[]:['email']},{rules,clock,hash:async()=> id==='all'?'a'.repeat(64):'b'.repeat(64)});
  assert.equal(Object.keys(store.attachments).length,2);
  assert.equal(validateProductStore(store,{platformTemplates:templates,rules}).validation_issues.some(issue=>issue.module_id==='locations'),false);
});

test('report projects module summary before accounts without first-account ownership',async()=>{
  let store=createRecoveryMapDraft({clock});
  store=addAccount(store,'binance-a','binance');
  store=addAccount(store,'ledger-a','ledger');
  store=select(store,'binance-a',['email']);
  store=select(store,'ledger-a',['recovery_phrase']);
  store=await addAttachment(store,{attachment_id:'summary',bytes:new Uint8Array([1]),byte_length:1,file_name:'summary.pdf',mime_type:'application/pdf',module_id:'locations',platform_id:'binance',account_id:'binance-a',field_or_condition_id:'module-summary',purpose:'位置说明',covered_condition_ids:[]},{rules,clock,hash:async()=> 'a'.repeat(64)});
  const receipt=validateProductStore(store,{platformTemplates:templates,rules});
  const report=projectReport(store,receipt,{platformTemplates:templates,conditionLabelForAccount:(_account,id)=>({email:'注册邮箱',recovery_phrase:'Seed Phrase / 助记词'})[id]});
  assert.equal(report.module_attachments.length,1);
  assert.equal(report.module_attachments[0].account_id,null);
  assert.equal(report.module_attachments[0].account_label,'本模块汇总信息');
  assert.equal(report.module_attachments[0].attachment_scope,'MODULE_SUMMARY');
  assert.equal(report.accounts.some(account=>account.attachments.some(file=>file.attachment_id==='summary')),false);
});

test('module-wide location attachment maps every account into a valid frozen Snapshot',async()=>{
  let store=createRecoveryMapDraft({clock});
  store=addAccount(store,'binance-a','binance');
  store=addAccount(store,'ledger-a','ledger');
  for(const [accountId,conditions] of [['binance-a',['email']],['ledger-a',['recovery_phrase','device_pin']]]){
    store=select(store,accountId,conditions);
    store=ProductActions.updateInstruction(store,accountId,{instruction_text:'按官方流程恢复并核对结果。'},{expected_revision:store.draft_revision,clock});
    store=ProductActions.confirmInstructionSaved(store,accountId,{expected_revision:store.draft_revision,clock});
  }
  store=ProductActions.setAssistantDecision(store,'NOT_NEEDED',{expected_revision:store.draft_revision,clock});
  store=await addAttachment(store,{attachment_id:'all-locations',bytes:new Uint8Array([1,2,3]),byte_length:3,file_name:'locations.pdf',mime_type:'application/pdf',module_id:'locations',platform_id:'binance',account_id:'binance-a',field_or_condition_id:'module-summary',purpose:'位置与查找说明',covered_condition_ids:[]},{rules,clock,hash:async()=> '039058c6f2c0cb492c533b0a4d14ef77cc0f78abccced5287d84a1a2011cfb81'});
  const validation=validateProductStore(store,{platformTemplates:templates,rules});
  assert.equal(validation.generation_allowed,true);
  const knowledge=mapProductToKnowledgeV2(store,validation,{platformTemplates:templates,reviewedAt:clock()});
  assert.equal(knowledge.assets.every(asset=>asset.location_refs.length===1),true);
  assert.deepEqual(knowledge.assets.find(asset=>asset.id==='ledger-a').custom_field_refs,[]);
  assert.equal(knowledge.attachments[0].owner_entity_refs.length,3);
  assert.equal(knowledge.custom_fields.find(item=>item.id===knowledge.attachments[0].owner_entity_refs.at(-1)).value,'MODULE_SUMMARY');
  const password='River-Lantern-27-Mango';
  const artifacts=await createVaultArtifacts({knowledgeGraph:knowledge,attachmentPayloads:attachmentPayloads(store),password,wizardConfigVersion:2,vaultId:'summary-vault',snapshotId:'summary-snapshot',createdAt:clock()});
  const recovered=await recoverVaultArtifacts({kitBytes:artifacts.kitBytes,archiveBytes:artifacts.archiveBytes,password});
  assert.deepEqual(recovered.snapshot.knowledge_graph,knowledge);
});

test('customer UI keeps one summary scope, full region order, guide navigation, and fixed drawer return',async()=>{
  const source=await readFile(new URL('web/v2/v2-app.js',root),'utf8');
  assert.match(source,/const entryView=versionUpdateMode\?'version-update-loading':testRecoveryMap\?'accounts':'guide'/);
  assert.match(source,/previous=index>0\?flow\[index-1\]:'guide'/);
  assert.match(source,/<option value="" \$\{accountId===''\?'selected':''\}>请选择<\/option>/);
  assert.match(source,/本模块汇总信息/);
  assert.doesNotMatch(source,/本模块全部信息/);
  assert.match(source,/自定义恢复条件/);
  assert.match(source,/自定义位置 \/ 查找线索/);
  assert.match(source,/Australia','United States','United Kingdom','EEA \/ European Union','Canada','Singapore','Hong Kong','Japan','South Korea','New Zealand','United Arab Emirates','Other/);
  assert.match(source,/drawer-return-bar/);
});
