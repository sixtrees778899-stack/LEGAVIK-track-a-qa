import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const base=new URL('../../web/v3-crypto/',import.meta.url);
const [app,css,packScript,master,indexHtml,entry]=await Promise.all([
  readFile(new URL('product-v1.js',base),'utf8'),
  readFile(new URL('product-v1.css',base),'utf8'),
  readFile(new URL('product-knowledge-pack-v1.js',base),'utf8'),
  readFile(new URL('../../knowledge/internal/product-knowledge-pack-v1.md',import.meta.url),'utf8'),
  readFile(new URL('index.html',base),'utf8'),
  readFile(new URL('canonical-entry.js',base),'utf8')
]);
const source=app.slice(app.indexOf('const knowledgeTopics='),app.indexOf('function simplePage('));
const published=JSON.parse(packScript.slice(packScript.indexOf('=')+1,packScript.lastIndexOf(';')));
const topicSlice=(id,next)=>{
  const start=source.indexOf(`id:'${id}'`);
  const end=next?source.indexOf(`id:'${next}'`,start):source.indexOf('const knowledgeState=',start);
  return source.slice(start,end);
};

test('knowledge route keeps search first and renders compact horizontal results',()=>{
  assert.match(app,/state\.route==='knowledge'\)knowledgeBasePage\(\)/);
  assert.match(source,/找到清晰、可信的数字资产恢复答案。/);
  assert.match(source,/搜索您关心的问题，例如：MetaMask 手机丢失后如何恢复？/);
  assert.match(source,/visible=results\.slice\(0,5\)/);
  assert.match(source,/knowledge-result-list/);
  assert.match(source,/查看答案 →/);
  assert.match(source,/查看全部搜索结果 →/);
  assert.match(source,/没有找到完全匹配的答案。/);
  assert.match(source,/event\.key==='Enter'/);
  assert.doesNotMatch(source,/fetch\(|OpenAI|chatbot|database/i);
});

test('five ordered topics expose the exact V2 directory counts',()=>{
  const expected=[
    ['recovery-map','crypto-recovery',10],
    ['crypto-recovery','security-readiness',8],
    ['security-readiness','digital-assets',9],
    ['digital-assets','questions',10],
    ['questions',null,9]
  ];
  assert.equal((source.match(/id:'(?:recovery-map|crypto-recovery|security-readiness|digital-assets|questions)'/g)??[]).length,5);
  for(const [id,next,count] of expected){
    assert.equal((topicSlice(id,next).match(/\['/g)??[]).length,count,id);
  }
  for(const label of ['付费账户与订阅','Crypto 恢复安全与诈骗','恢复过程安全','Account & Billing'])assert.match(source,new RegExp(label));
});

test('topic navigation is a single-open accordion with both help exits',()=>{
  for(const label of ['LEGAVIK 与 Recovery Map','Crypto 与平台恢复','安全与 Recovery Readiness','数字资产与账户','问答中心'])assert.match(source,new RegExp(label));
  assert.match(source,/class="knowledge-hero-help"[^>]*>没有找到答案\？获取帮助 →/);
  assert.match(source,/id="help"/);
  assert.match(source,/knowledgeState\.openTopic/);
  assert.match(source,/knowledge-topic-panel'\)\.hidden=!open/);
  assert.match(source,/const opening=knowledgeState\.openTopic!==id/);
  assert.match(source,/if\(opening&&align\)requestAnimationFrame/);
  assert.match(source,/navBottom-28/);
  assert.match(source,/window\.scrollTo\(\{top:Math\.max\(0,top\),behavior:'smooth'\}\)/);
  assert.match(source,/data-open-questions/);
  assert.match(source,/查看全部问答 →/);
  assert.doesNotMatch(source,/knowledge-topic-placeholder|已纳入 V2 导航骨架|审核后逐步上线/);
});

test('subtopic lists paginate at ten items without moving the parent topic',()=>{
  assert.match(source,/const KNOWLEDGE_TOPIC_PAGE_SIZE=10/);
  assert.match(source,/item\.children\.slice\(start,start\+KNOWLEDGE_TOPIC_PAGE_SIZE\)/);
  assert.match(source,/totalPages>1\?/);
  assert.match(source,/共 \$\{item\.children\.length\} 条/);
  for(const label of ['上一页','下一页','aria-current="page"'])assert.match(source,new RegExp(label));
  assert.match(source,/knowledgeState\.topicPages\[item\.id\]=page;panel\.innerHTML=knowledgeSubtopicMarkup\(item,page\)/);
});

test('legacy generated articles remain build-compatible but are not loaded by production',()=>{
  const matches=[...master.matchAll(/^# (\d+)\. (.+)$/gm)];
  const approved=matches.map((match,index)=>{
    const block=master.slice(match.index,matches[index+1]?.index??master.length).trim();
    let markdown=block.slice(block.indexOf('## 快速了解'));
    markdown=markdown.replace(/\n\*\*NEEDS PRODUCT DECISION\*\*\n(?:\n- .+)+(?=\n\n## )/g,'').replace(/\n\n---\s*$/,'').trim();
    return{title:match[2].trim(),markdown};
  });
  assert.equal(published.length,10);
  const migrateBrand=value=>value.replaceAll('Digital Asset Recovery & Continuity','Digital Asset Recovery & Legacy').replaceAll('SKREK','LEGAVIK');
  assert.deepEqual(published.map(({title,markdown})=>({title,markdown})),approved.map(({title,markdown})=>({title:migrateBrand(title),markdown:migrateBrand(markdown)})));
  assert.doesNotMatch(packScript,/NEEDS PRODUCT DECISION|Product Decision Pending|AI 检索元数据/);
  assert.doesNotMatch(entry,/product-knowledge-pack-v1\.[a-z0-9-]+\.js|approved-knowledge\.[a-z0-9-]+\.js/);
  assert.match(app,/readLiveKnowledgeArticles/);
  assert.match(app,/knowledgeState\.phase==='error'/);
});

test('published articles open from directories, related links and search',()=>{
  assert.match(source,/function knowledgeArticlePage\(title,rememberPosition=true\)/);
  assert.match(source,/<header><h1>\$\{safe\(article\.title\)\}<\/h1><button class="knowledge-article-back">/);
  assert.doesNotMatch(source,/<p class="kicker">\$\{safe\(article\.category\)\}<\/p>/);
  assert.match(source,/data-knowledge-article/);
  assert.match(source,/publishedKnowledge\.some\(item=>item\.title===button\.dataset\.knowledgeSubtopic\)/);
  assert.match(source,/\[item\.keywords,5\].*\[item\.searchText\|\|item\.markdown,1\]/);
  for(const heading of ['快速了解','详细说明','客户应该怎么做','注意事项','相关知识','相关 Recovery Map 模块'])assert.ok(published.every(article=>article.markdown.includes(`## ${heading}`)),heading);
  assert.match(source,/internalSection=\['相关 Recovery Map 模块','Related Recovery Map Module','Internal Knowledge \/ AI Retrieval Metadata','Needs Review'\]\.includes\(section\)/);
  assert.match(source,/if\(internalSection\)\{index\+\+;continue;\}/);
  assert.match(source,/returnTopic:null,returnScrollY:0/);
  assert.match(source,/function knowledgeScrollTo\(top\)\{window\.scrollTo\(0,top\);\}/);
  assert.doesNotMatch(app,/scrollBehavior\s*=\s*['"]smooth['"]/);
  assert.match(source,/knowledgeState\.returnScrollY=window\.scrollY/);
  assert.match(source,/knowledgeArticlePage\(button\.dataset\.knowledgeArticle,false\)/);
  assert.doesNotMatch(source,/knowledgeArticlePage\([^}]*window\.scrollTo\(\{top:0,behavior:'smooth'\}\)/);
});

test('popular questions and recent updates remain while featured guides leave the homepage',()=>{
  for(const token of ['POPULAR QUESTIONS · Q&amp;A','RECENTLY UPDATED','LEGAVIK SUPPORT','没有找到您需要的答案'])assert.match(source,new RegExp(token));
  assert.match(source,/popularKnowledge=publishedKnowledge\.slice\(0,6\)/);
  assert.match(source,/popularKnowledge\.map/);
  const page=source.slice(source.indexOf('function knowledgeBasePage()'));
  assert.doesNotMatch(page,/FEATURED GUIDES|knowledge-guide-grid/);
  assert.doesNotMatch(source,/const knowledgeGuides=/);
});

test('live search remains customer-only and fails closed',()=>{
  for(const field of ['query','timestamp','language','resultCount','clickedResult','noResult'])assert.match(source,new RegExp(field));
  assert.match(source,/knowledgeState\.phase!=='ready'/);
  assert.match(source,/publishedKnowledge\.map/);
  assert.doesNotMatch(source,/SKREK_PRODUCT_KNOWLEDGE|SKREK_APPROVED_KNOWLEDGE|knowledgeQuestions|knowledgeGuides/);
  assert.match(source,/不会用旧版静态答案替代当前正式知识库/);
  assert.doesNotMatch(source,/Recovery Password|private key.*record/i);
});

test('V2 styling uses uniform rows and mobile-safe list layouts',()=>{
  assert.match(css,/\.knowledge-hero\{[^}]*linear-gradient\(112deg,#10362d 0%,#0d2f28 58%,#123d32 100%\)/);
  assert.match(css,/\.knowledge-result-list\{[^}]*overflow:hidden/);
  assert.match(css,/\.knowledge-result-list article\{[^}]*grid-template-columns:minmax\(0,1fr\) auto/);
  assert.match(css,/\.knowledge-topic-list\{display:grid;gap:12px/);
  assert.match(css,/\.knowledge-topic-toggle\{[^}]*width:100%/);
  assert.match(css,/\.knowledge-subtopic-list button\{[^}]*width:100%/);
  assert.match(css,/\.knowledge-topic-row\{background:transparent\}/);
  assert.doesNotMatch(css,/\.knowledge-topic-row:has/);
  assert.match(css,/\.knowledge-topic-toggle\{[^}]*border:1px solid #d3dcd4;[^}]*border-radius:12px;[^}]*background:#fffefa/);
  assert.match(css,/\.knowledge-topic-panel\{width:auto;margin:10px 76px 0 0/);
  assert.match(css,/\.knowledge-subtopic-list\{[^}]*background:#f2f5ef/);
  assert.doesNotMatch(css,/\.knowledge-subtopic-list\{[^}]*(?:overflow-y|overflow-x):(?:auto|scroll)|\.knowledge-topic-panel\{[^}]*(?:overflow-y|overflow-x):(?:auto|scroll)/);
  assert.match(css,/\.knowledge-topic-pagination\{[^}]*display:flex/);
  assert.match(css,/\.knowledge-article-page>header\{min-height:210px;[^}]*grid-template-columns:minmax\(0,1fr\) auto/);
  assert.match(css,/\.knowledge-article-back\{[^}]*justify-self:end/);
  assert.match(css,/\.knowledge-article-page h1\{[^}]*font:500 clamp\(48px,4vw,54px\)\/1\.1 Georgia/);
  assert.doesNotMatch(css,/\.knowledge-topic-placeholder/);
  assert.match(css,/@media\(max-width:900px\)/);
  assert.match(css,/\.knowledge-topic-panel\{width:auto;margin-left:0;margin-right:56px/);
  assert.match(css,/@media\(max-width:640px\)/);
  assert.match(css,/\.knowledge-topic-panel\{width:auto;margin-left:0;margin-right:24px/);
  assert.doesNotMatch(css,/\.knowledge-topic-grid|\.knowledge-topic\.featured|\.knowledge-guide-grid/);
  assert.match(css,/@media\(max-width:640px\)\{[^}]*\.knowledge-hero/);
});
