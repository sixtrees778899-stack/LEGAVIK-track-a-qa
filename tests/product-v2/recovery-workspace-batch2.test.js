import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {buildRecoveryWorkspaceHtml} from '../../web/map-view.js';
import {recoveryWorkspacePreviewFixtures} from '../../web/recovery-workspace-preview-fixtures.js';

const complete=recoveryWorkspacePreviewFixtures.complete;
const boundary=recoveryWorkspacePreviewFixtures.boundary;

test('01–07 are sequential closed accordions with explicit expand and collapse affordances',()=>{
  const html=buildRecoveryWorkspaceHtml(complete);
  assert.equal((html.match(/data-workspace-section="0[1-7]"/g)||[]).length,7);
  assert.equal((html.match(/class="recovery-guide-item"/g)||[]).length,4);
  assert.doesNotMatch(html,/<details[^>]+open/);
  assert.equal((html.match(/▶ 展开/g)||[]).length>=6,true);
  assert.equal((html.match(/▼ 收起/g)||[]).length>=6,true);
});

test('account overview links target the matching account card',()=>{
  const html=buildRecoveryWorkspaceHtml(complete);
  for(const id of ['binance','uniswap','metamask','ledger']){
    assert.match(html,new RegExp(`data-account-target="${id}"`));
    assert.match(html,new RegExp(`id="recovery-account-${id}"`));
  }
});

test('account cards preserve the approved numbered recovery path',()=>{
  const html=buildRecoveryWorkspaceHtml(complete);
  for(const [number,title] of [['1.','账户信息'],['2.','恢复需要什么'],['3.','这些材料在哪里'],['4.','怎么恢复'],['5.','其他相关附件']])assert.match(html,new RegExp(`<span class="content-step">${number.replace('.','\\.')}</span>${title}`));
  for(const oldTitle of ['01｜账户信息','02｜恢复需要什么','03｜这些材料在哪里','04｜怎么恢复','05｜其他相关附件'])assert.doesNotMatch(html,new RegExp(oldTitle));
  assert.doesNotMatch(html,/06｜如需帮助/);
});

test('Module 3 and 4 single and shared files are placed without duplication in account view',()=>{
  const html=buildRecoveryWorkspaceHtml(complete);
  for(const file of ['Ledger_位置与查找.docx','Ledger_恢复步骤.docx'])assert.equal((html.match(new RegExp(file,'g'))||[]).length,2,'account view plus original archive only');
  for(const file of ['位置与查找_汇总.docx','恢复与转移步骤_汇总.docx']){
    assert.match(html,new RegExp(file));
    assert.match(html,/模块汇总附件/);
    assert.match(html,/请打开后查找“Ledger”对应部分/);
  }
});

test('boundary fixture exposes missing location and steps and hides helper section',()=>{
  const html=buildRecoveryWorkspaceHtml(boundary),ledger=html.slice(html.indexOf('id="recovery-account-ledger"'));
  assert.match(ledger,/未记录相关位置资料/);
  assert.match(ledger,/未记录相关恢复步骤/);
  assert.doesNotMatch(ledger,/06｜如需帮助/);
});

test('Module 6 online message and attachment-only modes are both explicit',()=>{
  const completeHtml=buildRecoveryWorkspaceHtml(complete),boundaryHtml=buildRecoveryWorkspaceHtml(boundary);
  assert.match(completeHtml,/请先阅读所有说明和附件/);
  assert.match(boundaryHtml,/没有留下在线文字说明，但留下了 2 个相关附件，请优先查看/);
});

test('original archive keeps all six modules and attachments',()=>{
  const html=buildRecoveryWorkspaceHtml(complete);
  for(const title of ['资产与账户','恢复所需条件与资料','位置与查找','恢复与转移步骤','协助人','给未来恢复人的嘱托'])assert.match(html,new RegExp(title));
  for(const file of complete.knowledge_graph.attachments.map(item=>item.display_name))assert.match(html,new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
});

test('CEO-approved LEGAVIK Recovery Guide V1 is integrated byte-for-byte as a system help asset',async()=>{
  const bytes=await readFile(new URL('../../web/assets/LEGAVIK-Recovery-Guide-V1.pdf',import.meta.url));
  const server=await readFile(new URL('../../tools/static-server.mjs',import.meta.url),'utf8');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),'fe19ece2ef96da4093f7aa2c88bb54221b5ed459f31c8a78de8d734ff9b02722');
  assert.match(buildRecoveryWorkspaceHtml(complete),/href="\.\/assets\/LEGAVIK-Recovery-Guide-V1\.pdf"/);
  assert.match(server,/'\.pdf':'application\/pdf'/);
});

test('freeze candidate keeps top attachment stats on one visual line and Guide actions share one PDF',()=>{
  const html=buildRecoveryWorkspaceHtml(complete);
  assert.match(html,/class="attachment-stat"[\s\S]*?<dd>13<small>｜ 文档 7 · 图片 2 · 语音 2 · 视频 2<\/small><\/dd>/);
  assert.equal((html.match(/href="\.\/assets\/LEGAVIK-Recovery-Guide-V1\.pdf"/g)||[]).length,2);
  assert.match(html,/target="_blank"[^>]*>在线查看使用手册<\/a>/);
  assert.match(html,/download="LEGAVIK-Recovery-Guide-V1\.pdf"[^>]*>下载使用手册<\/a>/);
});

test('account execution view removes generated advice and risk copy while preserving original archive',()=>{
  const html=buildRecoveryWorkspaceHtml(complete),accountView=html.slice(html.indexOf('data-workspace-section="05"'),html.indexOf('data-workspace-section="06"'));
  assert.doesNotMatch(accountView,/官方恢复路径|停止条件 \/ 风险提醒/);
  assert.match(html,/按 binance 官方恢复路径逐项核对并操作/);
});

test('customer attachments are download-only while the official Guide retains online viewing',()=>{
  const html=buildRecoveryWorkspaceHtml(complete);
  assert.match(html,/class="map-attachment-actions"/);
  assert.doesNotMatch(html,/data-attachment-action="view"/);
  assert.match(html,/data-attachment-id="ledger-video" data-attachment-action="download">下载/);
  assert.match(html,/data-attachment-id="ledger-location" data-attachment-action="download">下载/);
  assert.match(html,/target="_blank"[^>]*>在线查看使用手册<\/a>/);
});

test('guidance uses the approved four-part nested structure and privacy boundary',()=>{
  const html=buildRecoveryWorkspaceHtml(complete);
  for(const phrase of ['第一次使用，请按这个顺序','Recovery Map 的六个部分','如何理解不同资料和附件','什么时候应该停止并寻求帮助','LEGAVIK依据填写时已有的模块和账户关联帮助你查找资料'])assert.match(html,new RegExp(phrase));
  assert.doesNotMatch(html,/LEGAVIK识别到|系统分析发现|已阅读附件/);
});

test('assistant is a standalone Section 05 and Help does not duplicate its card',()=>{
  const completeHtml=buildRecoveryWorkspaceHtml(complete),boundaryHtml=buildRecoveryWorkspaceHtml(boundary);
  const assistant=completeHtml.slice(completeHtml.indexOf('data-workspace-section="05"'),completeHtml.indexOf('data-workspace-section="06"')),help=completeHtml.slice(completeHtml.indexOf('data-workspace-section="07"'));
  assert.doesNotMatch(assistant.slice(0,assistant.indexOf('<div class="workspace-section-body">')),/已留下协助人信息|未留下协助人信息|section-summary-note/);
  assert.match(assistant,/Alex Chen/);
  assert.match(assistant,/协助人联系说明\.docx/);
  assert.doesNotMatch(help,/Alex Chen|协助人联系说明\.docx/);
  assert.match(boundaryHtml,/未留下协助人信息/);
  assert.match(boundaryHtml,/填写人未留下协助人信息。/);
  assert.match(boundaryHtml,/如需进一步帮助，请继续查阅填写人留下的特别说明、相关附件或其他恢复资料。/);
  assert.doesNotMatch(boundaryHtml,/请进一步确认/);
});

test('banner is unnumbered and final top-level section order is 01 through 07',()=>{
  const html=buildRecoveryWorkspaceHtml(complete),expected=[['01','如何理解和使用这份 Recovery Map'],['02','账户与钱包总览'],['03','填写人给你的特别说明与嘱托'],['04','按账户逐一恢复'],['05','协助人'],['06','填写人原始档案'],['07','需要帮助？']];
  assert.doesNotMatch(html,/01 · RECOVERY WORKSPACE/);
  let cursor=html.indexOf('你的 Recovery Map 已成功恢复');
  for(const [number,title] of expected){const marker=`data-workspace-section="${number}"`,next=html.indexOf(marker);assert.ok(next>cursor,`${number} ${title} should be sequential`);assert.match(html.slice(next,next+300),new RegExp(`<strong>${title.replace(/[?]/g,'\\?')}</strong>`));cursor=next;}
});

test('account view uses only a lightweight global assistant reference',()=>{
  const html=buildRecoveryWorkspaceHtml(complete),accounts=html.slice(html.indexOf('data-workspace-section="04"'),html.indexOf('data-workspace-section="05"'));
  assert.equal((accounts.match(/需要协助？查看填写人留下的协助人信息 →/g)||[]).length,1);
  assert.doesNotMatch(accounts,/Alex Chen|技术协助人|协助人联系说明\.docx/);
  const boundaryHtml=buildRecoveryWorkspaceHtml(boundary),boundaryAccounts=boundaryHtml.slice(boundaryHtml.indexOf('data-workspace-section="04"'),boundaryHtml.indexOf('data-workspace-section="05"'));
  assert.doesNotMatch(boundaryAccounts,/data-assistant-target/);
});

test('Spark help is explicitly presentation-only',()=>{
  const html=buildRecoveryWorkspaceHtml(complete);
  assert.match(html,/仍有疑问？可以咨询 Spark/);
  assert.match(html,/咨询 Spark · Coming soon/);
  assert.match(html,/button[^>]+disabled/);
});
