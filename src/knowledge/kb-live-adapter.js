const LIVE_KB_VIEW='kb_live_articles';
const LIVE_KB_FIELDS=['id','canonical_question','primary_answer','expanded_answer','important_note','customer_next_step','published_at','updated_at','current_version'];

const text=value=>typeof value==='string'?value.trim():'';
const section=(heading,value)=>text(value)?`## ${heading}\n\n${text(value)}`:'';

export function mapLiveKnowledgeArticle(row){
  if(!row||row.id==null||!text(row.canonical_question)||!text(row.primary_answer))throw new Error('知识库返回了无法使用的公开内容。');
  const parts=[
    section('快速了解',row.primary_answer),
    section('详细说明',row.expanded_answer),
    section('注意事项',row.important_note),
    section('客户应该怎么做',row.customer_next_step)
  ].filter(Boolean);
  return Object.freeze({
    id:String(row.id),
    title:text(row.canonical_question),
    summary:text(row.primary_answer),
    markdown:parts.join('\n\n'),
    updated:text(row.updated_at||row.published_at).slice(0,10),
    version:row.current_version==null?'':String(row.current_version),
    type:'知识文章',
    source:LIVE_KB_VIEW,
    searchText:[row.canonical_question,row.primary_answer,row.expanded_answer,row.important_note,row.customer_next_step].map(text).join(' ')
  });
}

export async function readLiveKnowledgeArticles({config=globalThis.SKREK_PUBLIC_CONFIG,fetchImpl=globalThis.fetch}={}){
  if(!config?.supabaseUrl||!config?.supabaseAnonKey||typeof fetchImpl!=='function')throw new Error('知识库连接暂时不可用。');
  const base=String(config.supabaseUrl).replace(/\/$/,'');
  const query=new URLSearchParams({select:LIVE_KB_FIELDS.join(','),order:'id.asc'});
  const response=await fetchImpl(`${base}/rest/v1/${LIVE_KB_VIEW}?${query}`,{
    method:'GET',
    headers:{apikey:config.supabaseAnonKey,Authorization:`Bearer ${config.supabaseAnonKey}`,Accept:'application/json'},
    cache:'no-store'
  });
  if(!response.ok)throw new Error('知识库暂时无法载入，请稍后重试。');
  const rows=await response.json();
  if(!Array.isArray(rows))throw new Error('知识库返回格式无效。');
  return Object.freeze(rows.map(mapLiveKnowledgeArticle));
}

export const LIVE_KB_CONTRACT=Object.freeze({view:LIVE_KB_VIEW,fields:Object.freeze([...LIVE_KB_FIELDS]),readOnly:true});
