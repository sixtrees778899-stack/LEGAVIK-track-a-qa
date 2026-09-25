import fs from 'node:fs';
import path from 'node:path';
const root=path.dirname(new URL(import.meta.url).pathname);
const dirs=['01-account-access','02-security-factors','03-recovery','04-operational-control','05-withdrawal-control','06-owner-transfer','07-emergency','08-legal','09-risk','10-drill','11-guidance','12-ai','13-template','14-claims','15-open-questions','16-version-history'];
const errors=[]; const summary={};
const sourceTypes=new Set(['OFFICIAL','CJAS_LAB','VERIFIED_TESTER','OFFICIAL_SUPPORT_CASE','REGULATORY_SOURCE','CJAS_GUIDANCE','USER_REPORTED_UNVERIFIED']);
const inheritedEqual=(child,parent)=>JSON.stringify(child?.scope)===JSON.stringify(parent?.scope)&&child?.confidence===parent?.confidence&&child?.last_verified?.last_verified_at===parent?.last_verified?.last_verified_at;
for(const name of ['Binance','OKX','Coinbase']){
  const base=path.join(root,'platforms',name);
  for(const d of dirs) if(!fs.existsSync(path.join(base,d))) errors.push(`${name}: missing ${d}`);
  const claims=fs.readFileSync(path.join(base,'14-claims','claims.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
  const byId=new Map(claims.map(c=>[c.knowledge_id,c]));
  const sources=JSON.parse(fs.readFileSync(path.join(base,'14-claims','sources.json'),'utf8'));
  const sourceIds=new Set(sources.map(s=>s.source_id));
  for(const s of sources) {
    for(const k of ['scope','source','confidence','last_verified']) if(!s.governance_tags?.[k]) errors.push(`${s.source_id}: missing governance ${k}`);
    if(s.governance_tags?.source?.primary?.source_type!=='OFFICIAL') errors.push(`${s.source_id}: source record must be OFFICIAL`);
  }
  if(byId.size!==claims.length) errors.push(`${name}: duplicate claim ID`);
  for(const c of claims){
    for(const k of ['official_source_id','source_section','checked_at','review_due_at','lifecycle_status','product_uses']) if(!c[k]) errors.push(`${c.knowledge_id}: missing ${k}`);
    if(!sourceIds.has(c.official_source_id)) errors.push(`${c.knowledge_id}: unresolved source ${c.official_source_id}`);
    if(!c.claim || c.claim.length<20) errors.push(`${c.knowledge_id}: non-atomic/empty claim`);
    for(const k of ['scope','source','confidence','last_verified']) if(!c.governance_tags?.[k]) errors.push(`${c.knowledge_id}: missing governance ${k}`);
    if(!sourceTypes.has(c.governance_tags?.source?.primary?.source_type)) errors.push(`${c.knowledge_id}: invalid source type`);
    if(c.lifecycle_status!=='APPROVED'&&c.product_uses.length) errors.push(`${c.knowledge_id}: ineligible status has product uses`);
  }
  const faq=JSON.parse(fs.readFileSync(path.join(base,'12-ai','ai-faq.json'),'utf8'));
  if(faq.length<100) errors.push(`${name}: FAQ below 100`);
  for(const q of faq) for(const ref of q.claim_refs||[]) {
    if(!byId.has(ref)||byId.get(ref).lifecycle_status!=='APPROVED') errors.push(`${q.faq_id}: invalid claim ref ${ref}`);
    else if(!inheritedEqual(q.governance_tags,byId.get(ref).governance_tags)) errors.push(`${q.faq_id}: governance exceeds or differs from ${ref}`);
  }
  for(const q of faq) for(const sid of q.source_ids||[]) if(!sourceIds.has(sid)) errors.push(`${q.faq_id}: invalid source ${sid}`);
  for(const file of [['09-risk','rules.json'],['11-guidance','guidance.json']]){
    const rows=JSON.parse(fs.readFileSync(path.join(base,...file),'utf8'));
    for(const row of rows) for(const ref of row.claim_refs||[]) {
      if(!byId.has(ref)) errors.push(`${name}/${file[1]}: invalid ${ref}`);
      else if(!inheritedEqual(row.governance_tags,byId.get(ref).governance_tags)) errors.push(`${name}/${file[1]}: governance differs from ${ref}`);
    }
  }
  const template=JSON.parse(fs.readFileSync(path.join(base,'13-template','template.json'),'utf8'));
  for(const field of template.fields) for(const ref of field.claim_refs||[]) {
    if(!byId.has(ref)) errors.push(`${name}/template: invalid ${ref}`);
    else if(!inheritedEqual(field.governance_tags,byId.get(ref).governance_tags)) errors.push(`${name}/template: governance differs from ${ref}`);
  }
  const drill=JSON.parse(fs.readFileSync(path.join(base,'10-drill','recovery-drill.json'),'utf8'));
  for(const item of drill.checklist) for(const ref of item.claim_refs||[]) {
    if(!byId.has(ref)) errors.push(`${name}/drill: invalid ${ref}`);
    else if(!inheritedEqual(item.governance_tags,byId.get(ref).governance_tags)) errors.push(`${name}/drill: governance differs from ${ref}`);
  }
  for(const q of faq) for(const k of ['scope','source','confidence','last_verified']) if(!q.governance_tags?.[k]) errors.push(`${q.faq_id}: missing governance ${k}`);
  for(const file of [['09-risk','rules.json'],['11-guidance','guidance.json']]) for(const row of JSON.parse(fs.readFileSync(path.join(base,...file),'utf8'))) for(const k of ['scope','source','confidence','last_verified']) if(!row.governance_tags?.[k]) errors.push(`${name}/${file[1]}: missing governance ${k}`);
  for(const target of [template,drill,JSON.parse(fs.readFileSync(path.join(base,'13-template','succession-passport.json'),'utf8'))]) for(const k of ['scope','source','confidence','last_verified']) if(!target.governance_tags?.[k]) errors.push(`${name}: top-level artifact missing governance ${k}`);
  const statusCounts=claims.reduce((m,c)=>(m[c.lifecycle_status]=(m[c.lifecycle_status]||0)+1,m),{});
  summary[name]={claims:claims.length,status_counts:statusCounts,faq_cases:faq.length};
}
console.log(JSON.stringify({status:errors.length?'FAIL':'PASS',summary,errors},null,2));
if(errors.length) process.exit(1);
