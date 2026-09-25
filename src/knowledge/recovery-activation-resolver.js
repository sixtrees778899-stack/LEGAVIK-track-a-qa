import { ValidationError } from '../shared/errors.js';

const SUPPORTED=new Set(['binance','okx','coinbase','custom']);
const ELIGIBILITY={question:'TEMPLATE_ELIGIBLE',guidance:'GUIDANCE_ELIGIBLE',rule:'RULE_ENGINE_ELIGIBLE',drill:'DRILL_ELIGIBLE'};
const list=value=>Array.isArray(value)?value:[];
const fresh=(claim,now)=>Number.isFinite(Date.parse(claim.review_due_at))&&Date.parse(claim.review_due_at)>=Date.parse(now);
const scopeOf=claim=>claim.governance_tags?.scope??{};

export function parseClaimJsonl(text){
  return String(text).split(/\r?\n/).filter(Boolean).map((line,index)=>{try{return JSON.parse(line);}catch{throw new ValidationError('INVALID_CLAIM_CATALOG',`Claim catalog line ${index+1} is invalid`);}});
}

export function resolvePlatformKnowledge(context,claims,{now=new Date().toISOString(),use='question'}={}){
  if(!context||!SUPPORTED.has(context.platform))throw new ValidationError('UNSUPPORTED_PLATFORM','当前阶段仅支持 Binance、OKX 和 Coinbase');
  if(context.platform==='custom')return{quality:'UNRESOLVED',claims:[],manual_escalation:true,reason:'自定义平台仅提供中性记录模板',conservative:true,unresolved_dimensions:['platform','geography','legal_entity']};
  if(context.account_class!=='Personal')return{quality:'UNRESOLVED',claims:[],manual_escalation:true,reason:'当前阶段仅支持普通个人账户',conservative:true};
  const requiredUse=ELIGIBILITY[use];
  const approved=list(claims).filter(claim=>claim.platform_id===context.platform&&claim.lifecycle_status==='APPROVED'&&fresh(claim,now)&&list(claim.product_uses).includes(requiredUse)&&!list(claim.product_uses).includes('INTERNAL_ONLY'));
  const exact=approved.filter(claim=>{const scope=scopeOf(claim);return scope.geography===context.registration_geography&&['Personal / Custodial','Personal'].includes(scope.account_type)&&!/(Prime|Institutional|Vault)/i.test(scope.product_scope??'');});
  const global=approved.filter(claim=>scopeOf(claim).geography==='Global');
  const selected=exact.length?exact:global;
  return{quality:exact.length?'EXACT':global.length?'GENERAL':'UNRESOLVED',claims:selected,manual_escalation:selected.length===0,reason:selected.length?'':'该地区没有可安全复用的Approved知识',conservative:selected.length===0,unresolved_dimensions:selected.length?[]:['geography','legal_entity']};
}

export function selectFactorQuestions(context,activationConfig,claims,{now=new Date().toISOString()}={}){
  const resolution=resolvePlatformKnowledge(context,claims,{now,use:'question'}),selectedIds=new Set(resolution.claims.map(item=>item.knowledge_id));
  const factors=list(context.enabled_factors).map(id=>activationConfig.factors.find(item=>item.id===id)).filter(Boolean).map(factor=>{
    const refs=list(factor.claim_refs?.[context.platform]);
    const usable=refs.filter(ref=>selectedIds.has(ref));
    return{...factor,claim_refs:usable,deterministic:usable.length>0,conservative:usable.length===0,asset_ref:context.asset_id};
  });
  return{resolution,questions:factors};
}

export function permittedRecoveryPaths(context){
  const ordinary=context.account_class==='Personal';
  return ordinary?['A_HOLDER_RECOVERY','B_OWNER_DIRECTED_EXIT','C_OFFICIAL_LEGAL_ESCALATION']:['C_OFFICIAL_LEGAL_ESCALATION'];
}

export function requiresOfficialEscalation(context){
  return context.selected_path==='C_OFFICIAL_LEGAL_ESCALATION'||context.third_party_involved===true||context.identity_conflict===true||context.death_or_incapacity===true||context.account_class!=='Personal';
}
