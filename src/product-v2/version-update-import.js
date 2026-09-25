import {createRecoveryMapDraft,field} from './model.js';
import {ProductActions} from './actions.js';
import {base64UrlToBytes} from '../shared/encoding.js';

const MODULE_BY_REF=Object.freeze({'assets-accounts':'accounts','recovery-conditions':'conditions','locations-finding':'locations','recovery-order-exceptions':'instructions','contacts-assistance':'assistants','evidence-messages':'message'});
const clean=value=>String(value??'').normalize('NFC');

export function createVersionUpdateDraft(snapshot,{draftId,sourceVersionId,sourceVersionNumber,clock}={}){
  if(snapshot?.knowledge_graph?.schema_version!==2)throw new Error('VERSION_UPDATE_SOURCE_UNSUPPORTED');
  if(!draftId||!sourceVersionId||!Number.isInteger(sourceVersionNumber)||sourceVersionNumber<1)throw new Error('VERSION_UPDATE_IDENTITY_INVALID');
  const graph=snapshot.knowledge_graph,now=typeof clock==='function'?clock():new Date().toISOString(),custom=new Map((graph.custom_fields??[]).map(item=>[item.id,item.value])),systemGeneratedScopes=new Set((graph.custom_fields??[]).filter(item=>item.value==='SYSTEM_GENERATED').map(item=>item.id));
  const attachmentScope=file=>(file.owner_entity_refs??[]).map(ref=>custom.get(ref)).find(value=>value==='MODULE_SUMMARY'||String(value??'').startsWith('ACCOUNT:'))??null;
  const moduleSummaryLocationFiles=new Set((graph.attachments??[]).filter(file=>file.module_refs?.[0]==='locations-finding'&&attachmentScope(file)==='MODULE_SUMMARY').map(file=>file.id));
  const syntheticModuleSummaryLocation=location=>clean(location.label)==='本模块汇总附件'&&(location.attachment_refs??[]).some(id=>moduleSummaryLocationFiles.has(id));
  const next=createRecoveryMapDraft({draftId,title:graph.vault_title||'我的恢复地图',sourceVersionId,clock:()=>now});
  next.version.version_number=sourceVersionNumber+1;
  const assets=graph.assets??[],assetIds=new Set(assets.map(item=>item.id));
  for(const asset of assets){
    const region=custom.get(`metadata-${asset.id}-region`)??'',accountType=custom.get(`metadata-${asset.id}-account-type`)??'';
    next.accounts[asset.id]={account_id:asset.id,platform_id:clean(asset.platform_hint)||'custom_cex',platform_name:clean(asset.label),region:field(region),account_type:field(accountType),display_label:'',created_at:now,updated_at:now};
    const conditions=(asset.condition_refs??[]).map(ref=>(graph.recovery_conditions??[]).find(item=>item.id===ref)).filter(Boolean);
    next.condition_selections[asset.id]={account_id:asset.id,selected_condition_ids:conditions.map(item=>item.type),custom_conditions:[],optional_notes:conditions.map(item=>item.notes).filter(Boolean).join('\n'),related_attachment_ids:[]};
    const step=(graph.recovery_steps??[]).find(item=>(item.asset_refs??[]).includes(asset.id));
    next.recovery_instructions[asset.id]={account_id:asset.id,instruction_text:clean(step?.action),instruction_attachment_ids:[...(step?.attachment_refs??[])],optional_risk_notes:clean(step?.stop_condition),optional_risk_attachment_ids:[],saved_at:now};
  }
  for(const asset of assets){
    const conditions=(asset.condition_refs??[]).map(ref=>(graph.recovery_conditions??[]).find(item=>item.id===ref)).filter(Boolean);
    for(const locationRef of new Set(conditions.flatMap(item=>item.location_refs??[]))){
      const location=(graph.locations??[]).find(item=>item.id===locationRef);if(!location||syntheticModuleSummaryLocation(location))continue;
      const covered=conditions.filter(item=>(item.location_refs??[]).includes(locationRef)).map(item=>item.type),summary=/SUMMARY|汇总/i.test(location.label??'');
      next.location_coverages[location.id]={coverage_id:location.id,account_id:asset.id,mode:summary?'SUMMARY':'ITEMIZED',covered_condition_ids:covered,location_type:clean(location.type),location_name:clean(location.label),description:clean(location.finding_instructions),attachment_ids:[...(location.attachment_refs??[])],created_at:now,updated_at:now};
    }
  }
  const contacts=graph.assistance?.needed?(graph.contacts??[]):[];
  next.assistant_decision=graph.assistance?.needed?'NEED':'NOT_NEEDED';
  for(const contact of contacts){const [allowed='',boundary='']=clean(contact.assistance_boundary).split(/\n权限边界：/);next.assistants[contact.id]={assistant_id:contact.id,role:clean(contact.role||contact.label),contact_timing:clean(contact.when_to_contact),allowed_help:allowed.replace(/^可协助：/,'').trim(),permission_boundary:boundary.trim()};}
  next.personal_message=graph.personal_message?{text:clean(graph.personal_message.text),attachment_ids:[...(graph.personal_message.attachment_refs??[])],updated_at:now}:null;
  for(const file of graph.attachments??[]){
    const generatedSummary=(file.owner_entity_refs??[]).some(ref=>systemGeneratedScopes.has(ref))||/^system-generated-module-[12]$/.test(file.id??'');
    if(generatedSummary)continue;
    const declaredScope=attachmentScope(file);
    const declaredAccountId=String(declaredScope??'').startsWith('ACCOUNT:')?String(declaredScope).slice(8):null;
    const directAccountId=(file.owner_entity_refs??[]).find(ref=>assetIds.has(ref))??null;
    const moduleSummary=declaredScope==='MODULE_SUMMARY';
    const accountId=declaredAccountId&&assetIds.has(declaredAccountId)?declaredAccountId:directAccountId??(moduleSummary?assets[0]?.id:null),moduleId=MODULE_BY_REF[file.module_refs?.[0]]??'message';
    if(!accountId)throw new Error('VERSION_UPDATE_ATTACHMENT_OWNER_MISSING');
    const relatedLocations=(graph.locations??[]).filter(item=>(item.attachment_refs??[]).includes(file.id));
    const covered=(graph.recovery_conditions??[]).filter(item=>(item.asset_refs??[]).includes(accountId)&&(item.location_refs??[]).some(ref=>relatedLocations.some(location=>location.id===ref))).map(item=>item.type);
    const bytes=base64UrlToBytes(snapshot.attachment_payloads?.[file.id]??'',{maxBytes:1024**3});
    next.attachments[file.id]={attachment_id:file.id,file_name:clean(file.display_name),mime_type:clean(file.media_type),byte_length:file.byte_length,sha256:file.sha256,bytes,module_id:moduleId,platform_id:next.accounts[accountId].platform_id,account_id:accountId,field_or_condition_id:moduleSummary?'module-summary':covered[0]??'account-support',purpose:clean(file.purpose)||'恢复说明',covered_condition_ids:moduleSummary?[]:covered,technical_status:'VALID',created_at:now,updated_at:now};
  }
  next.draft_revision=0;next.version.draft_revision=0;next.version.status='DRAFT';next.source_version_id=sourceVersionId;next.updated_at=now;
  return next;
}

export function removeVersionUpdateAccount(store,accountId,options={}){
  const summaries=Object.values(store.attachments).filter(file=>file.account_id===accountId&&file.field_or_condition_id==='module-summary').map(file=>structuredClone(file));
  const next=ProductActions.removeAccount(store,accountId,options),replacement=Object.values(next.accounts)[0]??null;
  if(!replacement)return next;
  for(const file of summaries)next.attachments[file.attachment_id]={...file,account_id:replacement.account_id,platform_id:replacement.platform_id,covered_condition_ids:[],updated_at:next.updated_at};
  return next;
}
