import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildWizardConfiguration } from '../../src/wizard/config-loader.js';
import { validateWizardDraft, safeCustomFields } from '../../src/wizard/draft-validator.js';
import { ReviewRevisionTracker } from '../../src/review/review-revision.js';
import { assertReadyForGeneration, hasBlockingIssues } from '../../src/review/readiness-rules.js';
import { checkRecoveryConfidence } from '../../src/confidence/confidence-checker.js';
import { mapWizardDraftToKnowledge } from '../../src/ui/knowledge-mapper.js';
import { createVaultArtifacts } from '../../src/ui/vault-pipeline.js';

const load=async path=>JSON.parse(await readFile(new URL(`../../${path}`,import.meta.url),'utf8'));
const flow=await load('config/wizard/v1.json'),content=await load('config/content/zh-CN.json');
const templates=await Promise.all(flow.modules.map(item=>load(`config/templates/${item.template}.json`)));
const configuration=buildWizardConfiguration(flow,templates,content);
const completeDraft=label=>({modules:{
  'wallet-assets':[{'wallet-exists':'yes','wallet-label':label,'wallet-custom':[]}],
  'exchange-custody':[{'exchange-used':'no'}],
  'devices-locations':[{'primary-device':'备用设备','device-location':'书房上锁抽屉'}],
  'contacts-assistance':[{'has-assistant':'yes','assistant-role':'可信技术协助人'}],
  'recovery-orders-warnings':[{'first-action':'核对设备标签','expected-result':'标签一致','failure-action':'停止并联系协助人','risk-warning':'发现异常立即停止'}]
},customCategories:[]});

for(const label of ['长期 资产 账户','恢复地图 中文名称','Cold Wallet 🔐 — A/B']){
  test(`names with spaces, Chinese, emoji and punctuation remain scalar text: ${label}`,()=>{
    const draft=completeDraft(label),result=validateWizardDraft(configuration,draft);
    assert.equal(result.valid,true);assert.equal(draft.modules['wallet-assets'][0]['wallet-label'],label);
  });
}

test('custom field renderer input never calls map on a scalar',()=>{
  assert.deepEqual(safeCustomFields('name with spaces'),[]);
  assert.deepEqual(safeCustomFields({label:'x'}),[]);
});

test('text field rejects array and object values with an exact target',()=>{
  for(const value of [[],{}]){const draft=completeDraft('资产');draft.modules['wallet-assets'][0]['wallet-label']=value;const result=validateWizardDraft(configuration,draft),issue=result.issues[0];assert.equal(issue.code,'TYPE');assert.equal(issue.module_id,'wallet-assets');assert.equal(issue.entry_index,0);assert.equal(issue.field_id,'wallet-label');}
});

test('custom-fields rejects scalar and object values',()=>{
  for(const value of ['wrong',{}]){const draft=completeDraft('资产');draft.modules['wallet-assets'][0]['wallet-custom']=value;assert.ok(validateWizardDraft(configuration,draft).issues.some(item=>item.code==='TYPE'&&item.field_id==='wallet-custom'));}
});

test('required draft issue blocks review and identifies module, entry and field',()=>{
  const draft=completeDraft('');const issue=validateWizardDraft(configuration,draft).issues.find(item=>item.code==='REQUIRED');
  assert.equal(issue.blocking,true);assert.equal(issue.module_id,'wallet-assets');assert.equal(issue.entry_index,0);assert.equal(issue.field_id,'wallet-label');
});

test('validator required, type and reference errors are never downgraded',async()=>{
  const valid=await load('tests/fixtures/knowledge-valid.json');
  const cases=[map=>{map.assets[0].label='';},map=>{map.assets[0].location_refs='wrong';},map=>{map.assets[0].location_refs=['missing'];}];
  for(const mutate of cases){const map=structuredClone(valid);mutate(map);const result=checkRecoveryConfidence(map,{observedAttachmentHashes:{'attachment-guide-1':map.attachments[0].sha256},now:new Date('2026-08-01T00:00:00Z')});assert.equal(hasBlockingIssues(result),true);assert.ok(result.issues.some(item=>item.blocking===true&&item.module_id&&item.field_id));}
});

test('reference errors target the field that owns the broken relation',async()=>{
  const map=await load('tests/fixtures/knowledge-valid.json');map.assets[0].location_refs=['missing'];
  const issue=checkRecoveryConfidence(map,{observedAttachmentHashes:{'attachment-guide-1':map.attachments[0].sha256},now:new Date('2026-08-01T00:00:00Z')}).issues.find(item=>item.code==='MISSING_REFERENCE');
  assert.equal(issue.module_id,'devices-locations');assert.equal(issue.entry_index,0);assert.equal(issue.schema_field,'location_refs');assert.equal(issue.field_id,'device-location');
});

test('malformed arrays become blocking issues instead of secondary map errors',async()=>{
  const map=await load('tests/fixtures/knowledge-valid.json');map.orders[0].prerequisites={unexpected:true};
  const result=checkRecoveryConfidence(map,{observedAttachmentHashes:{'attachment-guide-1':map.attachments[0].sha256},now:new Date('2026-08-01T00:00:00Z')});
  assert.equal(hasBlockingIssues(result),true);assert.ok(result.issues.some(item=>item.code==='TYPE'&&item.blocking));
});

test('any draft change invalidates the prior review until recalculated',()=>{
  const tracker=new ReviewRevisionTracker();assert.equal(tracker.isCurrent(),false);tracker.reviewed();assert.equal(tracker.isCurrent(),true);tracker.changed();assert.equal(tracker.isCurrent(),false);tracker.reviewed();assert.equal(tracker.isCurrent(),true);
});

test('review gate and Snapshot generation accept the same valid map',async()=>{
  const map=mapWizardDraftToKnowledge(completeDraft('家庭资产 🔐'),{now:'2026-08-01T00:00:00.000Z'}),review=checkRecoveryConfidence(map,{now:new Date('2026-08-01T00:00:00Z')});
  assert.doesNotThrow(()=>assertReadyForGeneration(review));
  const result=await createVaultArtifacts({knowledgeGraph:map,attachmentPayloads:{},password:'Correct Horse Battery Staple 2026!',wizardConfigVersion:2,vaultId:'phase-a-vault',snapshotId:'phase-a-snapshot',createdAt:'2026-08-01T00:00:00.000Z'});
  assert.equal(result.snapshot.knowledge_graph.assets[0].label,'家庭资产 🔐');
});

test('review gate rejects the same invalid map that Snapshot would reject',async()=>{
  const map=mapWizardDraftToKnowledge(completeDraft('资产'),{now:'2026-08-01T00:00:00.000Z'});map.assets[0].label='';
  const review=checkRecoveryConfidence(map,{now:new Date('2026-08-01T00:00:00Z')});
  assert.throws(()=>assertReadyForGeneration(review),error=>error.code==='REVIEW_BLOCKED');
  await assert.rejects(()=>createVaultArtifacts({knowledgeGraph:map,attachmentPayloads:{},password:'Correct Horse Battery Staple 2026!',wizardConfigVersion:2,vaultId:'phase-a-vault',snapshotId:'phase-a-invalid',createdAt:'2026-08-01T00:00:00.000Z'}),error=>error.code==='INVALID_KNOWLEDGE_MAP');
});

test('review messages cover structural errors without exposing internal English',async()=>{
  const messages=await load('config/content/review-zh-CN.json');
  for(const code of ['REQUIRED','TYPE','MISSING_REFERENCE','WRONG_REFERENCE_TYPE','FORMAT'])assert.match(messages[code],/[\u3400-\u9fff]/);
});
