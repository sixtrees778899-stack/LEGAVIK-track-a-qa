import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root=new URL('../../',import.meta.url);
const app=await readFile(new URL('web/v2/v2-app.js',root),'utf8');
const css=await readFile(new URL('web/v2/product-integration.css',root),'utf8');

test('attachment center uses overview, six collapsed modules, then compact upload',()=>{
  assert.match(app,/attachmentDisplayTypes=ATTACHMENT_FRIENDLY_TYPES/);
  assert.match(app,/uploadCard\.before\(host\)/);
  assert.match(app,/querySelector\('h2'\)\.textContent='补充上传新附件'/);
  assert.doesNotMatch(app,/details\.open=true/);
  assert.match(css,/\.attachment-type-stats\{display:grid/);
});

test('display-only ordering keeps summary first and stable chronological account groups',()=>{
  assert.match(app,/summary=files\.filter\(isModuleSummary\)\.sort\(displayOrder\)/);
  assert.match(app,/owned=files\.filter\(file=>!isModuleSummary\(file\)\)\.sort\(displayOrder\)/);
  assert.match(app,/Date\.parse\(a\.created_at\?\?''\)/);
  assert.match(app,/insertionOrder\.get\(a\.attachment_id\)/);
  assert.doesNotMatch(app,/store\.attachments\s*=/);
});

test('module and review stats share the same read-only display resolver',()=>{
  assert.match(app,/function attachmentDisplayStats\(\)/);
  assert.match(app,/const attachmentStats=attachmentDisplayStats\(\)/);
  assert.match(app,/attachmentTypeSummary\(attachmentStats\.counts\)/);
  assert.match(app,/已使用 \$\{formatBytes\(stats\.usedBytes\)\} \/ 50 MB/);
});

test('customer file cards emphasize category, filename, and size instead of MIME',()=>{
  assert.match(app,/meta\.innerHTML=`<span class="file-kind">\$\{attachmentCategory\(file\)\}<\/span><span class="file-size">\$\{formatBytes\(file\.byte_length\)\}<\/span>`/);
  assert.match(css,/\.file-size\{/);
});

test('mobile attachment center contracts to a non-overflowing layout',()=>{
  assert.match(css,/@media\(max-width:700px\)\{\.attachment-overview-primary/);
  assert.match(css,/\.attachment-type-stats\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)\}/);
  assert.match(css,/\.attachment-file-card\{grid-template-columns:1fr\}/);
});
