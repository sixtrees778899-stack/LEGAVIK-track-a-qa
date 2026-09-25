import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {projectRecoveredReport} from '../../src/product-v2/recovered-report.js';
import {buildRecoveryWorkspaceHtml} from '../../web/map-view.js';
import {getRecoveryWorkspacePreviewFixture} from '../../web/recovery-workspace-preview-fixtures.js';

test('Preview A calculates complete coverage from fixture data',()=>{
  const snapshot=getRecoveryWorkspacePreviewFixture('complete'),report=projectRecoveredReport(snapshot),html=buildRecoveryWorkspaceHtml(snapshot);
  assert.equal(report.account_count,4);assert.equal(report.condition_count,14);assert.equal(report.assistant_count,1);
  for(const platform of ['Binance','Uniswap','MetaMask','Ledger'])assert.match(html,new RegExp(platform));
  for(const type of ['文档','图片','语音','视频'])assert.match(html,new RegExp(type));
  assert.match(html,/请先阅读所有说明和附件/);assert.match(html,/Alex Chen/);assert.match(html,/Ledger_位置与查找\.docx/);assert.match(html,/模块汇总附件/);assert.match(html,/填写人原始档案/);
});

test('Preview B preserves boundary semantics without inventing content or empty help blocks',()=>{
  const snapshot=getRecoveryWorkspacePreviewFixture('boundary'),report=projectRecoveredReport(snapshot),html=buildRecoveryWorkspaceHtml(snapshot);
  assert.equal(report.assistant_count,0);assert.equal(snapshot.knowledge_graph.assistance.needed,false);
  assert.match(html,/填写人没有留下在线文字说明，但留下了 2 个相关附件，请优先查看/);
  assert.match(html,/语音 1 · 视频 1/);assert.match(html,/模块汇总附件/);assert.match(html,/未记录/);
  const ledger=html.match(/id="recovery-account-ledger"[\s\S]*?<\/details>/)?.[0]??'';assert.doesNotMatch(ledger,/<h4>如需帮助<\/h4>/);
});

test('preview is local-only, noindex, renderer-shared, and contains no recovery bypass',async()=>{
  const html=await readFile(new URL('../../web/recovery-workspace-preview.html',import.meta.url),'utf8'),loader=await readFile(new URL('../../web/recovery-workspace-preview.js',import.meta.url),'utf8');
  assert.match(html,/noindex,nofollow,noarchive/);assert.match(html,/PREVIEW \/ INTERNAL TEST/);
  assert.match(loader,/import \{renderRecoveryMap\} from '\.\/map-view\.js'/);assert.match(loader,/localhost|127\.0\.0\.1/);assert.match(loader,/internal_preview/);
  assert.doesNotMatch(loader,/Mainnet|Evidence|Recovery Kit|wallet|quote|signature|broadcast|fetch\(/i);
});
