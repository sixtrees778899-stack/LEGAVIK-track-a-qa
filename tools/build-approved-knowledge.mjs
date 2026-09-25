import {readdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd();
const approvedRoot=path.join(root,'knowledge','approved');
const output=path.join(root,'web','v3-crypto','approved-knowledge.generated.js');
const migrateCustomerBrand=value=>String(value??'')
  .replace(/Digital Asset Recovery & Continuity/g,'Digital Asset Recovery & Legacy')
  .replace(/\b(?:SKREK|Skrek|CJAS)\b/g,'LEGAVIK')
  .replace(/\b(?:Legvik|Legvic|Lagvik)\b/gi,'LEGAVIK');
const internalHeadings=new Set([
  '相关 Recovery Map 模块',
  'Related Recovery Map Module',
  'Internal Knowledge / AI Retrieval Metadata',
  'Needs Review',
  '内部审批信息',
  '内部风险元数据'
]);

function section(markdown,heading){
  const match=markdown.match(new RegExp(`^## ${heading}\\s*\\n([\\s\\S]*?)(?=^## |\\Z)`,'m'));
  return match?.[1]?.trim()||'';
}

function publicMarkdown(source){
  const lines=source.split('\n');
  const kept=[];
  let hidden=false;
  for(const raw of lines){
    const line=raw.trim();
    if(/^# /.test(line))continue;
    if(/^\*\*Status[：:].*\*\*$/.test(line))continue;
    if(/^\*\*Needs Review\*\*$/i.test(line)){hidden=true;continue;}
    if(/^## /.test(line))hidden=internalHeadings.has(line.slice(3).trim());
    if(hidden)continue;
    if(/^\*\*与现有 APPROVED Knowledge 冲突/.test(line))continue;
    kept.push(raw.replace(/`?(?:NEEDS REVIEW\s*\/\s*)?HUMAN ESCALATION`?/gi,'人工支持'));
  }
  const cleaned=kept.join('\n')
    .replace(/本 Draft/g,'本文')
    .replace(/\bDraft\b/g,'本文')
    .replace(/\n{3,}/g,'\n\n')
    .trim();
  const tableLines=cleaned.split('\n');
  const result=[];
  for(let index=0;index<tableLines.length;index++){
    if(!/^\|.*\|$/.test(tableLines[index].trim())||!/^\|(?:\s*:?-+:?\s*\|)+$/.test((tableLines[index+1]||'').trim())){
      result.push(tableLines[index]);
      continue;
    }
    const cells=line=>line.trim().slice(1,-1).split('|').map(cell=>cell.trim());
    const headers=cells(tableLines[index]);
    const visible=headers.map((header,column)=>({header,column})).filter(({header})=>!/(Applicable Region|Risk Notes|Internal|Approval|内部|风险元数据)/i.test(header));
    while(index<tableLines.length&&/^\|.*\|$/.test(tableLines[index].trim())){
      const row=cells(tableLines[index]);
      result.push(`| ${visible.map(({column})=>row[column]||'').join(' | ')} |`);
      index++;
    }
    index--;
  }
  return migrateCustomerBrand(result.join('\n'));
}

function searchText(source,entry){
  const published=publicMarkdown(source);
  return [entry.title,entry.category,entry.platform,entry.keywords,entry.tags,section(published,'快速了解'),section(published,'相关知识'),published]
    .flat().filter(Boolean).join(' ');
}

const domains=(await readdir(approvedRoot,{withFileTypes:true})).filter(item=>item.isDirectory());
const articles=[];
for(const domain of domains){
  const manifestPath=path.join(approvedRoot,domain.name,'manifest.json');
  let manifest;
  try{manifest=JSON.parse(await readFile(manifestPath,'utf8'));}catch{continue;}
  for(const entry of manifest.articles||[]){
    if(entry.status!=='PUBLISHED'||entry.published!==true)continue;
    const source=await readFile(path.join(approvedRoot,domain.name,entry.source_file),'utf8');
    articles.push({
      id:entry.article_id,
      domain:manifest.domain||domain.name,
      title:migrateCustomerBrand(entry.title),
      category:migrateCustomerBrand(entry.category),
      platform:migrateCustomerBrand(entry.platform||''),
      keywords:migrateCustomerBrand(entry.keywords||''),
      tags:(entry.tags||[]).map(migrateCustomerBrand),
      lastVerified:entry.last_verified||'',
      summary:migrateCustomerBrand(section(source,'快速了解').split('\n\n')[0]||''),
      relatedKnowledge:migrateCustomerBrand(section(source,'相关知识')),
      markdown:publicMarkdown(source),
      searchText:searchText(source,entry)
    });
  }
}

await writeFile(output,`globalThis.SKREK_APPROVED_KNOWLEDGE=${JSON.stringify(articles,null,2)};\n`);
process.stdout.write(`Published knowledge bundle: ${articles.length} articles\n`);
