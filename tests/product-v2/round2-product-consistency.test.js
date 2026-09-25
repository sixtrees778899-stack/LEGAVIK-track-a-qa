import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRecoveryMapDraft } from '../../src/product-v2/model.js';
import { ProductActions } from '../../src/product-v2/actions.js';
import { addAttachment,attachmentCapacity } from '../../src/product-v2/attachment-manager.js';
import { validateProductStore } from '../../src/product-v2/validator.js';
import { projectReport } from '../../src/product-v2/projections.js';

const json=async path=>JSON.parse(await readFile(new URL(path,import.meta.url)));
const templates=await json('../../config/recovery-map/v2/platform-templates-v2.json');
const rules=await json('../../config/recovery-map/v2/living-rules-v2.json');
const policy=await json('../../config/attachments/v1.json');
const source=await readFile(new URL('../../web/v2/v2-app.js',import.meta.url),'utf8');
const hash=async()=> 'b'.repeat(64);
const file=(name,type,size=8)=>({name,type,size,arrayBuffer:async()=>new Uint8Array(size).buffer});
const addAccount=(store,id,type)=>ProductActions.addAccount(store,{account_id:id,platform_id:id.startsWith('okx')?'okx':'binance',platform_name:id.startsWith('okx')?'OKX':'Binance',region:'Australia',account_type:type,display_label:id},{expected_revision:store.draft_revision});
const completeAccount=(store,id)=>{let next=ProductActions.setConditionSelection(store,id,{selected_condition_ids:['email']},{expected_revision:store.draft_revision});next=ProductActions.upsertCoverage(next,{coverage_id:`summary-${id}`,account_id:id,mode:'SUMMARY',covered_condition_ids:['email'],description:'保险柜'},{expected_revision:next.draft_revision});next=ProductActions.updateInstruction(next,id,{instruction_text:'从官方入口恢复并核对账户'},{expected_revision:next.draft_revision});return ProductActions.confirmInstructionSaved(next,id,{expected_revision:next.draft_revision});};

test('institutional and personal accounts share Validator Report and Generation eligibility',()=>{
  let store=addAccount(addAccount(createRecoveryMapDraft({draftId:'round2-types'}),'okx-personal','Personal'),'binance-institutional','Institutional');
  store=completeAccount(completeAccount(store,'okx-personal'),'binance-institutional');store=ProductActions.setAssistantDecision(store,'NOT_NEEDED',{expected_revision:store.draft_revision});
  const receipt=validateProductStore(store,{platformTemplates:templates,rules}),report=projectReport(store,receipt,{platformTemplates:templates});
  assert.equal(receipt.validation_issues.some(issue=>issue.issue_code==='PERSONAL_ACCOUNT_ONLY'),false);assert.equal(receipt.generation_allowed,true);
  assert.deepEqual(report.accounts.map(account=>account.account_type).sort(),['个人账户','机构账户']);
});

test('Report uses the current account-aware condition labels and fails closed for unresolved IDs',()=>{
  let store=addAccount(createRecoveryMapDraft({draftId:'report-current-labels'}),'ledger-main','Personal');
  store=ProductActions.setConditionSelection(store,'ledger-main',{selected_condition_ids:['device_pin']},{expected_revision:store.draft_revision});
  const receipt=validateProductStore(store,{platformTemplates:templates,rules});
  const report=projectReport(store,receipt,{platformTemplates:templates,conditionLabelForAccount:(_account,id)=>id==='device_pin'?'设备密码 / PIN':undefined});
  assert.deepEqual(report.accounts[0].conditions.map(item=>item.label),['设备密码 / PIN']);
  assert.throws(()=>projectReport(store,receipt,{platformTemplates:templates}),error=>error.code==='UNRESOLVED_CONDITION_ID'&&error.condition_id==='device_pin');
});

test('Review fix uses exact anchor and returns directly to refreshed Review',()=>{
  const review=source.slice(source.indexOf('function renderReview'),source.indexOf('function renderReport'));
  assert.match(review,/review_context=\{navigation_anchor/);assert.match(source,/保存并返回 Review/);assert.match(source,/if\(appState\.review_context\)return navTo\('review'\)/);assert.match(review,/data-review-group/);
});

test('module 5 and 6 rely only on the Application Shell save action',()=>{
  const assistants=source.slice(source.indexOf('function renderAssistants(anchor)'),source.indexOf('function renderMessage'));
  const message=source.slice(source.indexOf('function renderMessage()'),source.indexOf('function renderAttachments'));
  assert.doesNotMatch(assistants,/保存协助人|save-assistant/);assert.doesNotMatch(message,/保存留言|save-message/);
  assert.match(source,/current==='assistants'/);assert.match(source,/current==='message'/);
});

test('PDF PNG MP3 and MP4 share one policy and MIME-based capacity categories',async()=>{
  let store=addAccount(createRecoveryMapDraft({draftId:'round2-media'}),'okx-personal','Personal');
  for(const [index,[name,mime]] of [['guide.pdf','application/pdf'],['photo.png','image/png'],['voice.mp3','audio/mpeg'],['clip.mp4','video/mp4']].entries())store=await addAttachment(store,{attachment_id:`media-${index}`,file:file(name,mime),platform_id:'okx',account_id:'okx-personal',module_id:'accounts',field_or_condition_id:'accounts',purpose:'账户资料',covered_condition_ids:[]},{rules,policy,hash});
  assert.deepEqual(Object.values(store.attachments).map(item=>item.mime_type),['application/pdf','image/png','audio/mpeg','video/mp4']);assert.equal(attachmentCapacity(store,policy).count,4);
  assert.match(source,/classifyAttachment/);assert.match(source,/附件概览/);
});

test('unsupported oversized and zero-byte files fail before Canonical Store mutation',async()=>{
  const store=addAccount(createRecoveryMapDraft({draftId:'round2-invalid'}),'okx-personal','Personal'),base={platform_id:'okx',account_id:'okx-personal',module_id:'accounts',field_or_condition_id:'accounts',purpose:'账户资料',covered_condition_ids:[]};
  await assert.rejects(addAttachment(store,{...base,attachment_id:'bad-type',file:file('run.exe','application/x-msdownload')},{rules,policy,hash}),error=>error.code==='UNSUPPORTED_ATTACHMENT_TYPE');
  await assert.rejects(addAttachment(store,{...base,attachment_id:'too-large',file:file('large.mp4','video/mp4',policy.limits.max_attachment_bytes+1)},{rules,policy,hash}),error=>error.code==='ATTACHMENT_TOO_LARGE');
  await assert.rejects(addAttachment(store,{...base,attachment_id:'empty',file:file('empty.pdf','application/pdf',0)},{rules,policy,hash}),error=>error.code==='EMPTY_ATTACHMENT');
  assert.equal(Object.keys(store.attachments).length,0);assert.match(source,/暂不支持此文件格式/);assert.match(source,/文件没有有效内容/);
});

test('Report manages projected attachments without a duplicated full directory',()=>{
  const report=source.slice(source.indexOf('function renderReportV2'),source.indexOf('function attachmentHint'));
  assert.match(source,/管理此附件/);assert.match(report,/管理全部附件/);assert.match(report,/附件统计/);assert.doesNotMatch(report,/全部附件目录/);
});

test('upload whitelist is rendered from the same versioned policy used by Product attachment validation',()=>{
  for(const extension of ['md','webp','webm'])assert.ok(policy.extension_mime[extension]);
  assert.match(source,/attachmentPolicy\.allowed_media\.map/);assert.match(source,/uploadPolicyNotice/);assert.match(source,/attachmentAccept/);assert.match(source,/accept="\$\{attachmentAccept\}"/);
});
