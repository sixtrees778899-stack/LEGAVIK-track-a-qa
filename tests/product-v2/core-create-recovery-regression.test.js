import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRecoveryMapDraft} from '../../src/product-v2/model.js';
import {ProductActions} from '../../src/product-v2/actions.js';
import {addAttachment,removeAttachment} from '../../src/product-v2/attachment-manager.js';
import {validateProductStore} from '../../src/product-v2/validator.js';
import {mapProductToKnowledgeV2,attachmentPayloads,embedSystemSummaryDocuments,ATTACHMENT_MODULE_REFS} from '../../src/product-v2/snapshot-mapper.js';
import {runGenerationPreflight} from '../../src/product-v2/generation-preflight.js';
import {projectReview,projectReport,generationGate} from '../../src/product-v2/projections.js';
import {prepareSystemSummaryDocuments} from '../../src/product-v2/module-summary-exports.js';
import {createVaultArtifacts,recoverVaultArtifacts} from '../../src/ui/vault-pipeline.js';
import {recoverAttachmentForDownload} from '../../src/recovery/attachment-recovery.js';
import {createVersionUpdateDraft} from '../../src/product-v2/version-update-import.js';

const root=new URL('../../',import.meta.url);
const templates=JSON.parse(await readFile(new URL('config/recovery-map/v2/platform-templates-v2.json',root)));
const rules=JSON.parse(await readFile(new URL('config/recovery-map/v2/living-rules-v2.json',root)));
const module1CanonicalBytes=new Uint8Array(await readFile(new URL('web/v2/assets/templates/LEGAVIK_Module1_资产与账户_Canonical_V2.docx',root)));
const module2CanonicalBytes=new Uint8Array(await readFile(new URL('web/v2/assets/templates/LEGAVIK_Module2_恢复所需条件与资料_Canonical_V2.docx',root)));
const clock=()=> '2026-08-28T12:00:00.000Z';
const label=(_account,id)=>({email:'注册邮箱',authenticator:'2FA / Authenticator',recovery_phrase:'Seed Phrase / 助记词',hardware_device:'Hardware Wallet / 硬件钱包 / 恢复设备',device_pin:'设备密码 / PIN'})[id]??id;
const options={platformTemplates:templates,conditionLabels:templates.condition_labels,conditionLabelForAccount:label};
const bytesFor=name=>new TextEncoder().encode(`CJAS Core Fixture:${name}`);

const addAccount=(store,id,platform,region='',accountType='')=>ProductActions.addAccount(store,{account_id:id,platform_id:platform,platform_name:templates.platforms.find(item=>item.id===platform)?.name??platform,region,account_type:accountType,display_label:id},{expected_revision:store.draft_revision,clock});
const select=(store,id,ids)=>ProductActions.setConditionSelection(store,id,{selected_condition_ids:ids},{expected_revision:store.draft_revision,clock});
const addFile=async(store,{id,moduleId,accountId,field='detail',covers=[],mime='application/pdf'})=>{const bytes=bytesFor(id);return addAttachment(store,{attachment_id:id,bytes,byte_length:bytes.byteLength,file_name:`${id}.${mime==='image/png'?'png':mime.startsWith('audio/')?'mp3':mime==='video/mp4'?'mp4':mime.includes('wordprocessingml')?'docx':'pdf'}`,mime_type:mime,module_id:moduleId,platform_id:store.accounts[accountId].platform_id,account_id:accountId,field_or_condition_id:field,purpose:`${moduleId} fixture`,covered_condition_ids:covers},{rules,clock});};

async function fixture(){
  let store=createRecoveryMapDraft({draftId:'core-create-recovery',title:'Core Create-Recovery Regression',clock});
  store=addAccount(store,'binance-main','binance','Australia','Personal');
  store=addAccount(store,'ledger-main','ledger');
  store=select(store,'binance-main',['email','authenticator']);
  store=select(store,'ledger-main',['recovery_phrase','hardware_device','device_pin']);
  store=await addFile(store,{id:'m3-summary',moduleId:'locations',accountId:'binance-main',field:'module-summary'});
  store=await addFile(store,{id:'m3-ledger',moduleId:'locations',accountId:'ledger-main',field:'device_pin',covers:['device_pin']});
  store=await addFile(store,{id:'m4-summary',moduleId:'instructions',accountId:'binance-main',field:'module-summary'});
  store=await addFile(store,{id:'m4-binance',moduleId:'instructions',accountId:'binance-main'});
  store=ProductActions.updateInstruction(store,'binance-main',{instruction_attachment_ids:['m4-binance']},{expected_revision:store.draft_revision,clock});
  store=ProductActions.confirmInstructionSaved(store,'binance-main',{expected_revision:store.draft_revision,clock});
  store=ProductActions.updateInstruction(store,'ledger-main',{instruction_text:'使用官方渠道完成恢复并核对结果。'},{expected_revision:store.draft_revision,clock});
  store=ProductActions.confirmInstructionSaved(store,'ledger-main',{expected_revision:store.draft_revision,clock});
  store=ProductActions.setAssistantDecision(store,'NEED',{expected_revision:store.draft_revision,clock});
  store=ProductActions.upsertAssistant(store,{assistant_id:'trusted-adviser',role:'律师',contact_timing:'需要启动恢复时',allowed_help:'协助确认正式文件和联系路径',permission_boundary:'不接触完整控制材料'},{expected_revision:store.draft_revision,clock});
  store=await addFile(store,{id:'m5-assistant',moduleId:'assistants',accountId:'binance-main'});
  store=await addFile(store,{id:'m6-document',moduleId:'message',accountId:'binance-main',mime:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
  store=await addFile(store,{id:'m6-image',moduleId:'message',accountId:'binance-main',mime:'image/png'});
  store=await addFile(store,{id:'m6-audio',moduleId:'message',accountId:'binance-main',mime:'audio/mpeg'});
  store=await addFile(store,{id:'m6-video',moduleId:'message',accountId:'binance-main',mime:'video/mp4'});
  store=ProductActions.setPersonalMessage(store,{text:'请先核对所有恢复材料。',attachment_ids:['m6-document','m6-image','m6-audio','m6-video']},{expected_revision:store.draft_revision,clock});
  return store;
}

test('CJAS V3 Core Create-Recovery Regression preserves the complete current product fixture',async()=>{
  const store=await fixture(),receipt=validateProductStore(store,{platformTemplates:templates,rules});
  assert.equal(receipt.generation_allowed,true,JSON.stringify(receipt.validation_issues));
  const knowledge=mapProductToKnowledgeV2(store,receipt,{platformTemplates:templates,reviewedAt:clock(),conditionLabelForAccount:label});
  const documents=await prepareSystemSummaryDocuments(store,options,{module1CanonicalBytes,module2CanonicalBytes});
  const embedded=await embedSystemSummaryDocuments(knowledge,documents);
  const payloads={...attachmentPayloads(store),...embedded.payloads};
  const password='River-Lantern-27-Mango';
  const artifacts=await createVaultArtifacts({knowledgeGraph:embedded.knowledge,attachmentPayloads:payloads,password,wizardConfigVersion:2,vaultId:'core-regression-vault',snapshotId:'core-regression-snapshot',createdAt:clock()});
  assert.ok(artifacts.snapshot);
  assert.ok(artifacts.archiveBytes.byteLength>0);
  assert.ok(artifacts.kitBytes.byteLength>0);
  const recovered=await recoverVaultArtifacts({kitBytes:artifacts.kitBytes,archiveBytes:artifacts.archiveBytes,password});
  assert.deepEqual(recovered.snapshot.knowledge_graph,embedded.knowledge);
  assert.equal(recovered.snapshot.knowledge_graph.assets.length,2);
  assert.equal(recovered.snapshot.knowledge_graph.attachments.length,Object.keys(payloads).length);
  for(const [id,original] of Object.entries(payloads)){
    const file=await recoverAttachmentForDownload(recovered.snapshot,id);
    assert.deepEqual(file.bytes,new Uint8Array(original),id);
  }
  assert.deepEqual(new Set(recovered.snapshot.knowledge_graph.attachments.map(item=>item.module_refs[0])),new Set(Object.values(ATTACHMENT_MODULE_REFS)));
});

test('V2 Update strips regenerated system summaries and reuses the unchanged publish pipeline',async()=>{
  const v1=await fixture(),v1Receipt=validateProductStore(v1,{platformTemplates:templates,rules}),v1Knowledge=mapProductToKnowledgeV2(v1,v1Receipt,{platformTemplates:templates,reviewedAt:clock(),conditionLabelForAccount:label}),v1Documents=await prepareSystemSummaryDocuments(v1,options,{module1CanonicalBytes,module2CanonicalBytes}),v1Embedded=await embedSystemSummaryDocuments(v1Knowledge,v1Documents),password='River-Lantern-27-Mango',v1Artifacts=await createVaultArtifacts({knowledgeGraph:v1Embedded.knowledge,attachmentPayloads:{...attachmentPayloads(v1),...v1Embedded.payloads},password,wizardConfigVersion:2,vaultId:'update-source-vault',snapshotId:'update-source-snapshot',createdAt:clock()}),recovered=await recoverVaultArtifacts({kitBytes:v1Artifacts.kitBytes,archiveBytes:v1Artifacts.archiveBytes,password});
  await assert.rejects(()=>embedSystemSummaryDocuments(v1Embedded.knowledge,v1Documents),error=>{assert.equal(error.message,'SYSTEM_SUMMARY_SCHEMA_REJECTED');assert.ok(error.issues.some(issue=>issue.code==='DUPLICATE_ID'&&/^\$\.(attachments|custom_fields)\[\d+\]\.id$/.test(issue.path)));return true;});
  const v2=createVersionUpdateDraft(recovered.snapshot,{draftId:'update-v2',sourceVersionId:v1.version.version_id,sourceVersionNumber:1,clock}),v2Receipt=validateProductStore(v2,{platformTemplates:templates,rules});
  assert.equal(v2Receipt.generation_allowed,true,JSON.stringify(v2Receipt.validation_issues));
  assert.equal(runGenerationPreflight(v2,v2Receipt,{platformTemplates:templates,reviewedAt:clock(),conditionLabelForAccount:label}).publishable,true);
  assert.equal(Object.keys(v2.attachments).some(id=>id.startsWith('system-generated-module-')),false);
  const v2Knowledge=mapProductToKnowledgeV2(v2,v2Receipt,{platformTemplates:templates,reviewedAt:clock(),conditionLabelForAccount:label}),v2Documents=await prepareSystemSummaryDocuments(v2,options,{module1CanonicalBytes,module2CanonicalBytes}),v2Embedded=await embedSystemSummaryDocuments(v2Knowledge,v2Documents),ids=v2Embedded.knowledge.attachments.map(item=>item.id);
  assert.equal(ids.filter(id=>id==='system-generated-module-1').length,1);
  assert.equal(ids.filter(id=>id==='system-generated-module-2').length,1);
  const v2Artifacts=await createVaultArtifacts({knowledgeGraph:v2Embedded.knowledge,attachmentPayloads:{...attachmentPayloads(v2),...v2Embedded.payloads},password,wizardConfigVersion:2,vaultId:'update-target-vault',snapshotId:'update-target-snapshot',createdAt:clock()});
  assert.ok(v2Artifacts.snapshot);assert.ok(v2Artifacts.archiveBytes.byteLength>0);assert.ok(v2Artifacts.kitBytes.byteLength>0);
});

test('unknown attachment module fails before Frozen Snapshot validation with exact evidence',async()=>{
  const store=await fixture(),receipt=validateProductStore(store,{platformTemplates:templates,rules});
  store.attachments['m3-ledger'].module_id='module_3';
  assert.throws(()=>mapProductToKnowledgeV2(store,receipt,{platformTemplates:templates,reviewedAt:clock()}),error=>{
    assert.equal(error.code,'SNAPSHOT_ATTACHMENT_MODULE_REJECTED');
    assert.deepEqual(error.issues,[{path:'$.attachments[1].module_refs[0]',code:'ATTACHMENT_MODULE_REF_INVALID',rejected_value:'module_3',attachment_id:'m3-ledger',expected_allowed_values:['accounts','conditions','locations','instructions','assistants','message'],blocking:true}]);
    return true;
  });
});

test('Module 5 state stability covers NOT_NEEDED, empty, complete with attachment, and complete without attachment',async()=>{
  const base=await fixture();

  const notNeeded=ProductActions.setAssistantDecision(base,'NOT_NEEDED',{expected_revision:base.draft_revision,clock});
  const receiptA=validateProductStore(notNeeded,{platformTemplates:templates,rules});
  assert.deepEqual(notNeeded.assistants,{});
  assert.equal(receiptA.generation_allowed,true,JSON.stringify(receiptA.validation_issues));
  assert.deepEqual(mapProductToKnowledgeV2(notNeeded,receiptA,{platformTemplates:templates,reviewedAt:clock(),conditionLabelForAccount:label}).contacts,[]);

  const empty=ProductActions.upsertAssistant(base,{assistant_id:'trusted-adviser',role:'',contact_timing:'',allowed_help:'',permission_boundary:''},{expected_revision:base.draft_revision,clock});
  const receiptB=validateProductStore(empty,{platformTemplates:templates,rules});
  assert.equal(receiptB.generation_allowed,true);
  assert.deepEqual(mapProductToKnowledgeV2(empty,receiptB,{platformTemplates:templates,reviewedAt:clock(),conditionLabelForAccount:label}).contacts,[]);
  const emptyNoAttachment=removeAttachment(empty,'m5-assistant',{clock}),blockedReceipt=validateProductStore(emptyNoAttachment,{platformTemplates:templates,rules});
  assert.equal(blockedReceipt.generation_allowed,false);
  assert.deepEqual(blockedReceipt.validation_issues.find(item=>item.issue_code==='ASSISTANT_DETAILS_REQUIRED')?.missing_parts,['role','contact_timing','allowed_help','permission_boundary']);
  const unsafeReceipt={...blockedReceipt,generation_allowed:true,report_ready:true};
  assert.throws(()=>mapProductToKnowledgeV2(emptyNoAttachment,unsafeReceipt,{platformTemplates:templates,reviewedAt:clock(),conditionLabelForAccount:label}),error=>{
    assert.equal(error.code,'SNAPSHOT_CONTACT_PROJECTION_REJECTED');
    assert.deepEqual(error.issues.map(item=>item.path),['$.contacts[0].label','$.contacts[0].role','$.contacts[0].when_to_contact','$.contacts[0].assistance_boundary','$.contacts[0].assistance_boundary']);
    return true;
  });

  const receiptC=validateProductStore(base,{platformTemplates:templates,rules});
  assert.equal(receiptC.generation_allowed,true,JSON.stringify(receiptC.validation_issues));
  const contactC=mapProductToKnowledgeV2(base,receiptC,{platformTemplates:templates,reviewedAt:clock(),conditionLabelForAccount:label}).contacts[0];
  assert.equal(contactC.label,'律师');
  assert.equal(contactC.role,'律师');
  assert.equal(contactC.when_to_contact,'需要启动恢复时');

  const withoutAttachment=removeAttachment(base,'m5-assistant',{clock});
  const receiptD=validateProductStore(withoutAttachment,{platformTemplates:templates,rules});
  assert.equal(receiptD.generation_allowed,true,JSON.stringify(receiptD.validation_issues));
  assert.equal(mapProductToKnowledgeV2(withoutAttachment,receiptD,{platformTemplates:templates,reviewedAt:clock(),conditionLabelForAccount:label}).contacts.length,1);
});

test('Module 5 UI save layer does not create an empty placeholder assistant',async()=>{
  const source=await readFile(new URL('web/v2/v2-app.js',root),'utf8');
  assert.match(source,/hasValue=Object\.values\(values\)\.some\(value=>String\(value\)\.trim\(\)\);if\(hasValue\)next=ProductActions\.upsertAssistant/);
  assert.match(source,/else if\(next\.assistants\[assistantId\]\)next=ProductActions\.removeAssistant/);
});

test('Module 5 Completion Contract Regression covers all seven approved states',async()=>{
  const completeWithAttachment=await fixture();
  const completeWithoutAttachment=removeAttachment(completeWithAttachment,'m5-assistant',{clock});
  const attachmentOnly=ProductActions.removeAssistant(completeWithAttachment,'trusted-adviser',{expected_revision:completeWithAttachment.draft_revision,clock});
  const neither=removeAttachment(attachmentOnly,'m5-assistant',{clock});
  const notNeededWithAttachment=ProductActions.setAssistantDecision(completeWithAttachment,'NOT_NEEDED',{expected_revision:completeWithAttachment.draft_revision,clock});
  const notNeededWithoutAttachment=removeAttachment(notNeededWithAttachment,'m5-assistant',{clock});
  const partial=ProductActions.upsertAssistant(neither,{assistant_id:'partial-helper',role:'律师',contact_timing:'',allowed_help:'',permission_boundary:''},{expected_revision:neither.draft_revision,clock});
  const validate=value=>validateProductStore(value,{platformTemplates:templates,rules});
  const map=(value,receipt)=>mapProductToKnowledgeV2(value,receipt,{platformTemplates:templates,reviewedAt:clock(),conditionLabelForAccount:label});

  for(const value of [notNeededWithoutAttachment,notNeededWithAttachment]){const receipt=validate(value);assert.equal(receipt.generation_allowed,true);assert.deepEqual(map(value,receipt).contacts,[]);}
  for(const value of [completeWithoutAttachment,completeWithAttachment]){const receipt=validate(value);assert.equal(receipt.generation_allowed,true);assert.equal(map(value,receipt).contacts.length,1);}
  const attachmentReceipt=validate(attachmentOnly);assert.equal(attachmentReceipt.generation_allowed,true,JSON.stringify(attachmentReceipt.validation_issues));assert.deepEqual(map(attachmentOnly,attachmentReceipt).contacts,[]);
  const neitherReceipt=validate(neither);assert.equal(neitherReceipt.generation_allowed,false);assert.equal(neitherReceipt.validation_issues.some(item=>item.issue_code==='ASSISTANT_REQUIRED'),true);
  const partialReceipt=validate(partial);assert.equal(partialReceipt.generation_allowed,false);assert.equal(partialReceipt.validation_issues.some(item=>item.issue_code==='ASSISTANT_DETAILS_REQUIRED'),true);
});

test('every approved Module 5 state crosses Generation Preflight, Snapshot, Archive and Recovery Kit',async()=>{
  const completeWithAttachment=await fixture();
  const completeWithoutAttachment=removeAttachment(completeWithAttachment,'m5-assistant',{clock});
  const attachmentOnly=ProductActions.removeAssistant(completeWithAttachment,'trusted-adviser',{expected_revision:completeWithAttachment.draft_revision,clock});
  const incompleteWithAttachment=ProductActions.upsertAssistant(attachmentOnly,{assistant_id:'partial-helper',role:'律师',contact_timing:'',allowed_help:'',permission_boundary:''},{expected_revision:attachmentOnly.draft_revision,clock});
  const neither=removeAttachment(attachmentOnly,'m5-assistant',{clock});
  const incompleteWithoutAttachment=removeAttachment(incompleteWithAttachment,'m5-assistant',{clock});
  const notNeeded=ProductActions.setAssistantDecision(completeWithAttachment,'NOT_NEEDED',{expected_revision:completeWithAttachment.draft_revision,clock});
  const legal=[notNeeded,completeWithoutAttachment,attachmentOnly,completeWithAttachment,incompleteWithAttachment];
  for(const [index,value] of legal.entries()){
    const receipt=validateProductStore(value,{platformTemplates:templates,rules}),preflight=runGenerationPreflight(value,receipt,{platformTemplates:templates,reviewedAt:clock(),conditionLabelForAccount:label});
    assert.equal(preflight.publishable,true,JSON.stringify(preflight.issues));
    assert.equal(preflight.knowledge.contacts.some(contact=>!contact.label||!contact.role||!contact.when_to_contact),false);
    const artifacts=await createVaultArtifacts({knowledgeGraph:preflight.knowledge,attachmentPayloads:attachmentPayloads(value),password:'River-Lantern-27-Mango',wizardConfigVersion:2,vaultId:`m5-contract-${index}`,snapshotId:`m5-contract-${index}`,createdAt:clock()});
    assert.ok(artifacts.snapshot);
    assert.ok(artifacts.archiveBytes.byteLength);
    assert.ok(artifacts.kitBytes.byteLength);
  }
  for(const value of [neither,incompleteWithoutAttachment]){
    const receipt=validateProductStore(value,{platformTemplates:templates,rules}),preflight=runGenerationPreflight(value,receipt,{platformTemplates:templates,reviewedAt:clock(),conditionLabelForAccount:label});
    assert.equal(receipt.generation_allowed,false);
    assert.equal(preflight.publishable,false);
  }
});

test('Review and Create Gate consume the same revision-bound Generation Preflight',async()=>{
  const complete=await fixture(),attachmentOnly=ProductActions.removeAssistant(complete,'trusted-adviser',{expected_revision:complete.draft_revision,clock}),receipt=validateProductStore(attachmentOnly,{platformTemplates:templates,rules}),preflight=runGenerationPreflight(attachmentOnly,receipt,{platformTemplates:templates,reviewedAt:clock(),conditionLabelForAccount:label}),report=projectReport(attachmentOnly,receipt,{platformTemplates:templates,conditionLabelForAccount:label});
  assert.equal(projectReview(attachmentOnly,receipt,preflight).generation_allowed,true);
  assert.equal(generationGate(attachmentOnly,receipt,report,preflight).allowed,true);
  const invalid=removeAttachment(attachmentOnly,'m5-assistant',{clock}),invalidReceipt=validateProductStore(invalid,{platformTemplates:templates,rules}),invalidPreflight=runGenerationPreflight(invalid,invalidReceipt,{platformTemplates:templates,reviewedAt:clock(),conditionLabelForAccount:label}),invalidReport=projectReport(invalid,invalidReceipt,{platformTemplates:templates,conditionLabelForAccount:label});
  assert.equal(projectReview(invalid,invalidReceipt,invalidPreflight).generation_allowed,false);
  assert.equal(generationGate(invalid,invalidReceipt,invalidReport,invalidPreflight).allowed,false);
  assert.throws(()=>generationGate(attachmentOnly,receipt,report,invalidPreflight),/STALE_GENERATION_PREFLIGHT/);
});
