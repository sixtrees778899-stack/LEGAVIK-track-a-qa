import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const root=new URL('../../',import.meta.url);
const app=await readFile(new URL('web/v2/v2-app.js',root),'utf8');
const css=await readFile(new URL('web/v2/product-integration.css',root),'utf8');

test('contextual attachment display puts module summaries before account groups without rewriting data',()=>{
  const renderer=app.slice(app.indexOf('function renderAttachmentsV3('),app.indexOf('function renderReviewV3('));
  assert.match(renderer,/summaryCards=moduleCards\.filter\(card=>isModuleSummary/);
  assert.match(renderer,/accountCards=moduleCards\.filter\(card=>!isModuleSummary/);
  assert.ok(renderer.indexOf("summaryGroup.className='attachment-summary-group'")<renderer.indexOf("group.className='attachment-account-group'"));
  assert.match(renderer,/for\(const card of summaryCards\)summaryGroup\.append\(card\)/);
  assert.match(renderer,/for\(const item of accounts\)/);
  assert.match(renderer,/const remaining=accountCards\.filter\(card=>!groupedCards\.has\(card\)\)/);
  assert.doesNotMatch(renderer,/store\.attachments\s*=/);
});

test('system summaries still generate and download but do not write a persistent success message',()=>{
  const handler=app.slice(app.indexOf("app.addEventListener('click',async event=>{const trigger=event.target.closest('[data-system-summary]')"),app.indexOf('function show('));
  assert.match(handler,/prepareSystemSummaryDocuments\(store,summaryOptions\(\)\)/);
  assert.match(handler,/await saveBytesLocally/);
  assert.match(handler,/系统生成文件下载失败/);
  assert.doesNotMatch(handler,/Canonical DOCX 已根据当前最新资料生成并开始下载/);
  assert.doesNotMatch(handler,/汇总文件已生成并开始下载/);
});

test('both password fields have independent accessible visibility controls',()=>{
  const renderer=app.slice(app.indexOf('function renderPasswordV3('),app.indexOf('function setGenerationStage('));
  for(const id of ['password-value','password-confirm']){
    assert.match(renderer,new RegExp(`id="${id}" type="password"`));
    assert.match(renderer,new RegExp(`data-password-toggle="${id}"`));
  }
  assert.match(renderer,/document\.querySelectorAll\('\[data-password-toggle\]'\)/);
  assert.match(renderer,/toggle\.dataset\.passwordToggle/);
  assert.match(renderer,/input\.type=visible\?'password':'text'/);
  assert.match(renderer,/aria-pressed/);
  assert.match(renderer,/class="eye-slash"/);
  assert.match(renderer,/const touched=\{password:false,confirmation:false\}/);
  assert.match(renderer,/passwordPolicy\.min_code_points/);
  assert.match(renderer,/passwordPolicy\.max_code_points/);
  assert.match(renderer,/passwordPolicy\.minimum_character_classes/);
  assert.match(renderer,/密码要求：\$\{passwordPolicy\.min_code_points\}–\$\{passwordPolicy\.max_code_points\} 个字符/);
  assert.doesNotMatch(renderer,/满足当前密码安全要求/);
  assert.match(renderer,/touched\.password&&passwordIssue\?passwordIssue\.message:''/);
  assert.match(renderer,/touched\.confirmation&&confirmationEntered&&mismatch\?'两次输入的恢复密码不一致。':''/);
  assert.match(renderer,/inputs\[0\]\.onblur=.*touched\.password=true/);
  assert.match(renderer,/inputs\[1\]\.onblur=.*touched\.confirmation=inputs\[1\]\.value\.length>0/);
  assert.match(css,/\.password-input-wrap\{position:relative;display:block\}/);
  assert.match(css,/\.password-visibility-toggle/);
  assert.match(css,/\.password-visibility-toggle:hover,.password-visibility-toggle:active\{[^}]*transform:translateY\(-50%\)/);
  assert.match(css,/\.password-visibility-toggle\[aria-pressed="true"\] \.eye-slash\{opacity:0\}/);
  assert.match(css,/\.password-guidance\{[^}]*color:var\(--text-secondary\)/);
  assert.match(css,/\.password-field-error\{[^}]*color:var\(--danger\);font-size:14px;font-weight:550;line-height:1.5/);
  assert.match(css,/@media\(max-width:700px\)[\s\S]*\.password-field-error\{font-size:13\.5px\}/);
});

test('historical operation banner is authorized only by explicit local internal Resume mode',()=>{
  assert.match(app,/internalResumeTest=localTestHost&&queryParams\.get\('internal_resume_test'\)==='1'/);
  assert.match(app,/function decorateResumeChoice\(\)\{\s*if\(!internalResumeTest\)return;/);
  assert.match(app,/async function discoverResumableHistory\(\)\{\s*if\(!internalResumeTest\)return;/);
});

test('Review attachment statistic keeps total primary and breakdown subordinate on one row',()=>{
  const report=app.slice(app.indexOf('function renderReportV3('),app.indexOf('function renderPasswordV3('));
  assert.match(report,/class="review-attachment-stat"/);
  assert.match(report,/<dd><strong>\$\{attachmentStats\.total\}<\/strong><small>\$\{attachmentTypeSummary\(attachmentStats\.counts\)\}<\/small><\/dd>/);
  assert.match(css,/\.review-attachment-stat dd\{display:flex;align-items:baseline/);
  assert.match(css,/\.review-attachment-stat dd>small\{padding-left:16px;border-left:1px solid var\(--border-subtle\)\}/);
  assert.match(css,/@media\(max-width:700px\)[\s\S]*\.review-attachment-stat dd\{gap:10px;white-space:normal\}/);
});
