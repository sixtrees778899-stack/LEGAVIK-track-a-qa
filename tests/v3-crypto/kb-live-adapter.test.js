import test from 'node:test';
import assert from 'node:assert/strict';
import {LIVE_KB_CONTRACT,mapLiveKnowledgeArticle,readLiveKnowledgeArticles} from '../../src/knowledge/kb-live-adapter.js';

const config={supabaseUrl:'https://project.example',supabaseAnonKey:'public-anon-key'};
const row={id:1,canonical_question:'如何开始？',primary_answer:'从这里开始。',expanded_answer:'详细步骤。',important_note:'不要分享秘密。',customer_next_step:'打开正式入口。',published_at:'2026-09-12T00:00:00Z',updated_at:'2026-09-12T01:00:00Z',current_version:2};

test('adapter is fixed to the published read view and minimum customer fields',()=>{
  assert.equal(LIVE_KB_CONTRACT.view,'kb_live_articles');
  assert.equal(LIVE_KB_CONTRACT.readOnly,true);
  assert.deepEqual(LIVE_KB_CONTRACT.fields,['id','canonical_question','primary_answer','expanded_answer','important_note','customer_next_step','published_at','updated_at','current_version']);
  assert.ok(!LIVE_KB_CONTRACT.fields.some(field=>['sales_guidance','risk_note','escalation_rule','source_of_truth','source_decision_summary','approved_at','status','availability','deprecated'].includes(field)));
});

test('adapter performs one GET against only kb_live_articles and maps customer content',async()=>{
  let request;
  const articles=await readLiveKnowledgeArticles({config,fetchImpl:async(url,options)=>{request={url,options};return{ok:true,json:async()=>[row]};}});
  assert.equal(request.options.method,'GET');
  assert.match(request.url,/\/rest\/v1\/kb_live_articles\?/);
  assert.doesNotMatch(request.url,/kb_articles(?:\?|$)/);
  assert.equal(articles[0].title,'如何开始？');
  assert.match(articles[0].markdown,/快速了解[\s\S]*详细步骤。[\s\S]*不要分享秘密。[\s\S]*打开正式入口。/);
});

test('adapter fails closed and never supplies a static fallback',async()=>{
  await assert.rejects(()=>readLiveKnowledgeArticles({config,fetchImpl:async()=>({ok:false,status:503})}),/知识库暂时无法载入/);
  await assert.rejects(()=>readLiveKnowledgeArticles({config,fetchImpl:async()=>({ok:true,json:async()=>({})})}),/返回格式无效/);
});

test('row mapping rejects incomplete content',()=>{
  assert.throws(()=>mapLiveKnowledgeArticle({...row,primary_answer:''}),/无法使用/);
});
