import test from 'node:test';
import assert from 'node:assert/strict';
import {createVersionUpdateDraft,removeVersionUpdateAccount} from '../../src/product-v2/version-update-import.js';
import {ProductActions} from '../../src/product-v2/actions.js';
import {validateProductStore} from '../../src/product-v2/validator.js';
import {runGenerationPreflight,bindGenerationPreflight} from '../../src/product-v2/generation-preflight.js';
import {projectReport,generationGate} from '../../src/product-v2/projections.js';
import templates from '../../config/recovery-map/v2/platform-templates-v2.json' with {type:'json'};
import rules from '../../config/recovery-map/v2/living-rules-v2.json' with {type:'json'};

const bytes=new TextEncoder().encode('old attachment');
const encoded=Buffer.from(bytes).toString('base64url');
const snapshot={knowledge_graph:{schema_version:2,vault_title:'现有地图',assistance:{needed:false},contacts:[],personal_message:{text:'保留说明',attachment_refs:[],disclaimer_acknowledged:true},custom_fields:[{id:'metadata-asset-a-region',value:'Australia'},{id:'metadata-asset-a-account-type',value:'Personal'}],assets:[{id:'asset-a',label:'Binance',platform_hint:'binance',condition_refs:['condition-asset-a-email'],location_refs:['location-a'],attachment_refs:['file-a']}],recovery_conditions:[{id:'condition-asset-a-email',type:'email',asset_refs:['asset-a'],location_refs:['location-a'],notes:''}],locations:[{id:'location-a',label:'邮箱位置',type:'设备',finding_instructions:'安全位置',attachment_refs:['file-a']}],recovery_steps:[{id:'step-a',asset_refs:['asset-a'],action:'按官方流程恢复',stop_condition:'核对域名',attachment_refs:[]}],attachments:[{id:'file-a',display_name:'guide.txt',media_type:'text/plain',byte_length:bytes.length,sha256:'0'.repeat(64),module_refs:['locations-finding'],owner_entity_refs:['asset-a'],purpose:'说明'}]},attachment_payloads:{'file-a':encoded}};

test('recovered V1 becomes a complete editable next-version draft without mutating source',()=>{const source=structuredClone(snapshot),draft=createVersionUpdateDraft(snapshot,{draftId:'draft-next',sourceVersionId:'version-v1',sourceVersionNumber:1,clock:()=> '2026-09-04T00:00:00.000Z'});assert.equal(draft.version.version_number,2);assert.equal(draft.version.source_version_id,'version-v1');assert.equal(draft.version.status,'DRAFT');assert.equal(draft.accounts['asset-a'].platform_id,'binance');assert.deepEqual(draft.attachments['file-a'].bytes,bytes);assert.deepEqual(snapshot,source);});

test('recovered system summaries are regenerated for V2 instead of imported as customer attachments',()=>{const source=structuredClone(snapshot),graph=source.knowledge_graph;for(const number of[1,2]){const id=`system-generated-module-${number}`,scope=`attachment-scope-system-module-${number}`,payload=new TextEncoder().encode(`old system summary ${number}`);graph.custom_fields.push({id:scope,module_ref:number===1?'assets-accounts':'recovery-conditions',label:'附件适用范围',field_type:'text',value:'SYSTEM_GENERATED'});graph.attachments.push({id,display_name:`old-${number}.docx`,media_type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',byte_length:payload.byteLength,sha256:'1'.repeat(64),module_refs:[number===1?'assets-accounts':'recovery-conditions'],owner_entity_refs:[scope],purpose:'系统汇总',sensitive_acknowledged:true});source.attachment_payloads[id]=Buffer.from(payload).toString('base64url');}const draft=createVersionUpdateDraft(source,{draftId:'draft-next',sourceVersionId:'version-v1',sourceVersionNumber:1});assert.deepEqual(Object.keys(draft.attachments),['file-a']);assert.ok(draft.attachments['file-a']);});

test('a valid recovered Update draft and a valid content edit pass the unchanged Generation Gate',()=>{
  const draft=createVersionUpdateDraft(snapshot,{draftId:'draft-gate',sourceVersionId:'version-v1',sourceVersionNumber:1});
  draft.personal_message.text='更新后的说明';draft.draft_revision=1;draft.version.draft_revision=1;
  const receipt=validateProductStore(draft,{platformTemplates:templates,rules});
  const preflight=runGenerationPreflight(draft,receipt,{platformTemplates:templates});
  bindGenerationPreflight(receipt,preflight);
  const gate=generationGate(draft,receipt,projectReport(draft,receipt,{platformTemplates:templates}));
  assert.deepEqual(gate,{allowed:true,draft_revision:1,issue_ids:[],report_matches:true,preflight_publishable:true});
});

test('an Update edit that removes a required condition is rejected by the unchanged gate with an exact issue',()=>{
  const draft=createVersionUpdateDraft(snapshot,{draftId:'draft-blocked',sourceVersionId:'version-v1',sourceVersionNumber:1});
  draft.condition_selections['asset-a'].selected_condition_ids=[];draft.draft_revision=1;draft.version.draft_revision=1;
  const receipt=validateProductStore(draft,{platformTemplates:templates,rules});
  const preflight=runGenerationPreflight(draft,receipt,{platformTemplates:templates});bindGenerationPreflight(receipt,preflight);
  const gate=generationGate(draft,receipt,projectReport(draft,receipt,{platformTemplates:templates}));
  assert.equal(gate.allowed,false);
  assert.deepEqual(gate.issue_ids,['CONDITION_SELECTION_REQUIRED:asset-a:selected_condition_ids','ATTACHMENT_INVALID:asset-a:attachment']);
});

const scopedAttachment=(id,moduleRef,scopeId)=>({id,display_name:`${id}.txt`,media_type:'text/plain',byte_length:bytes.length,sha256:'2'.repeat(64),module_refs:[moduleRef],owner_entity_refs:[scopeId],purpose:'支持资料'});
function multiAccountSummarySnapshot(){
  const source=structuredClone(snapshot),graph=source.knowledge_graph;
  graph.assets.push({id:'asset-b',label:'Coinbase',platform_hint:'coinbase',condition_refs:['condition-asset-b-email'],location_refs:[],attachment_refs:[]});
  graph.recovery_conditions.push({id:'condition-asset-b-email',type:'email',asset_refs:['asset-b'],location_refs:[],notes:''});
  graph.recovery_steps.push({id:'step-b',asset_refs:['asset-b'],action:'按官方流程恢复',stop_condition:'',attachment_refs:[]});
  graph.custom_fields.push({id:'metadata-asset-b-region',value:'Australia'},{id:'metadata-asset-b-account-type',value:'Personal'});
  for(const [id,moduleRef] of [['module-3-summary','locations-finding'],['module-5-summary','contacts-assistance'],['module-6-summary','evidence-messages']]){
    const scopeId=`scope-${id}`;graph.custom_fields.push({id:scopeId,module_ref:moduleRef,label:'附件适用范围',field_type:'text',value:'MODULE_SUMMARY'});graph.attachments.push(scopedAttachment(id,moduleRef,scopeId));source.attachment_payloads[id]=encoded;
  }
  const scopedId='asset-b-assistant',scopeId=`scope-${scopedId}`;graph.custom_fields.push({id:scopeId,module_ref:'contacts-assistance',label:'附件适用范围',field_type:'text',value:'ACCOUNT:asset-b'});graph.attachments.push(scopedAttachment(scopedId,'contacts-assistance',scopeId));source.attachment_payloads[scopedId]=encoded;
  return source;
}

test('Update import preserves explicit module-summary and account attachment scopes',()=>{
  const draft=createVersionUpdateDraft(multiAccountSummarySnapshot(),{draftId:'scope-import',sourceVersionId:'version-v4',sourceVersionNumber:4});
  for(const id of ['module-3-summary','module-5-summary','module-6-summary'])assert.equal(draft.attachments[id].field_or_condition_id,'module-summary');
  assert.equal(draft.attachments['asset-b-assistant'].account_id,'asset-b');
  assert.equal(draft.attachments['asset-b-assistant'].field_or_condition_id,'account-support');
});

test('deleting the module-summary carrier account rehomes global attachments without touching other modules',()=>{
  const imported=createVersionUpdateDraft(multiAccountSummarySnapshot(),{draftId:'scope-delete',sourceVersionId:'version-v4',sourceVersionNumber:4}),before=Object.fromEntries(['module-3-summary','module-5-summary','module-6-summary'].map(id=>[id,{module_id:imported.attachments[id].module_id,sha256:imported.attachments[id].sha256,byte_length:imported.attachments[id].byte_length}]));
  const next=removeVersionUpdateAccount(imported,'asset-a',{confirmCascade:true,expected_revision:imported.draft_revision});
  assert.deepEqual(Object.keys(next.accounts),['asset-b']);
  assert.ok(next.attachments['asset-b-assistant']);
  for(const [id,identity] of Object.entries(before)){assert.deepEqual({module_id:next.attachments[id].module_id,sha256:next.attachments[id].sha256,byte_length:next.attachments[id].byte_length},identity);assert.equal(next.attachments[id].account_id,'asset-b');assert.equal(next.attachments[id].platform_id,'coinbase');}
});

test('editing carrier-account conditions does not mutate module-summary coverage metadata',()=>{
  const imported=createVersionUpdateDraft(multiAccountSummarySnapshot(),{draftId:'scope-condition',sourceVersionId:'version-v4',sourceVersionNumber:4}),before=structuredClone(imported.attachments['module-3-summary'].covered_condition_ids);
  const next=ProductActions.setConditionSelection(imported,'asset-a',{selected_condition_ids:[]},{expected_revision:imported.draft_revision});
  assert.deepEqual(next.attachments['module-3-summary'].covered_condition_ids,before);
});

test('re-importing the same source is structurally stable and does not mix old and new drafts',()=>{
  const source=multiAccountSummarySnapshot(),first=createVersionUpdateDraft(source,{draftId:'first',sourceVersionId:'version-v4',sourceVersionNumber:4,clock:()=> '2026-09-04T00:00:00.000Z'}),second=createVersionUpdateDraft(source,{draftId:'second',sourceVersionId:'version-v4',sourceVersionNumber:4,clock:()=> '2026-09-04T00:00:00.000Z'}),shape=value=>Object.fromEntries(Object.values(value.attachments).map(file=>[file.attachment_id,{account_id:file.account_id,module_id:file.module_id,field_or_condition_id:file.field_or_condition_id,covered_condition_ids:file.covered_condition_ids}]));
  assert.deepEqual(shape(second),shape(first));
});
