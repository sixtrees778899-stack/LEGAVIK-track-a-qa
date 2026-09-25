import { validateKnowledgeMapV2 } from '../knowledge/validator-v2.js';
import { STANDARD_MODULE_IDS } from '../knowledge/schema-v2.js';

export const RULE_CATALOG_V2=Object.freeze([
  {id:'ASSET_REQUIRED',severity:'critical',blocking:true,module_id:'assets-accounts',predicate:'at_least_one_asset'},
  {id:'ASSET_CONDITION_REQUIRED',severity:'critical',blocking:true,module_id:'recovery-conditions',predicate:'asset_has_condition'},
  {id:'ASSET_LOCATION_REQUIRED',severity:'critical',blocking:true,module_id:'locations-finding',predicate:'asset_has_location'},
  {id:'ASSET_STEP_REQUIRED',severity:'critical',blocking:true,module_id:'recovery-order-exceptions',predicate:'asset_has_step'},
  {id:'FALLBACK_REQUIRED',severity:'critical',blocking:true,module_id:'recovery-conditions',predicate:'missing_condition_has_fallback'},
  {id:'CONTACT_REQUIRED',severity:'critical',blocking:true,module_id:'contacts-assistance',predicate:'contact_when_assistance_needed'},
  {id:'ALTERNATE_CONTACT_SUGGESTED',severity:'attention',blocking:false,module_id:'contacts-assistance',predicate:'alternate_contact_suggested'},
  {id:'HIGH_RISK_FAILURE_ACTION_REQUIRED',severity:'critical',blocking:true,module_id:'recovery-order-exceptions',predicate:'high_risk_failure_action'},
  {id:'HIGH_RISK_STOP_CONDITION_REQUIRED',severity:'critical',blocking:true,module_id:'recovery-order-exceptions',predicate:'high_risk_stop_condition'},
  {id:'ATTACHMENT_MODULE_REQUIRED',severity:'critical',blocking:true,module_id:'evidence-messages',predicate:'attachment_has_module'},
  {id:'ATTACHMENT_PURPOSE_REQUIRED',severity:'critical',blocking:true,module_id:'evidence-messages',predicate:'attachment_has_purpose'}
]);

const text=value=>typeof value==='string'&&value.trim().length>0;
const list=value=>Array.isArray(value)?value:[];
const make=(rule,{entity_id=null,field_id=null,entry_index=null}={})=>({...rule,entity_id,field_id,entry_index,message_key:rule.id});
const PREDICATES={
  at_least_one_asset:(map,rule)=>list(map.assets).length?[]:[make(rule,{field_id:'assets'})],
  asset_has_condition:(map,rule)=>list(map.assets).flatMap((item,index)=>list(item.condition_refs).length?[]:[make(rule,{entity_id:item.id,field_id:'condition_refs',entry_index:index})]),
  asset_has_location:(map,rule)=>list(map.assets).flatMap((item,index)=>list(item.location_refs).length?[]:[make(rule,{entity_id:item.id,field_id:'location_refs',entry_index:index})]),
  asset_has_step:(map,rule)=>list(map.assets).flatMap((item,index)=>list(item.step_refs).length?[]:[make(rule,{entity_id:item.id,field_id:'step_refs',entry_index:index})]),
  missing_condition_has_fallback:(map,rule)=>list(map.recovery_conditions).flatMap((item,index)=>item.exists===false&&!list(item.fallback_path_refs).length?[make(rule,{entity_id:item.id,field_id:'fallback_path_refs',entry_index:index})]:[]),
  contact_when_assistance_needed:(map,rule)=>{
    const hasContact=list(map.contacts).length>0;
    const hasAssistantAttachment=list(map.attachments).some(item=>list(item.module_refs).includes('contacts-assistance'));
    return map.assistance?.needed===true&&!hasContact&&!hasAssistantAttachment?[make(rule,{field_id:'contacts'})]:[];
  },
  alternate_contact_suggested:(map,rule)=>map.assistance?.needed===true&&list(map.contacts).length&&!list(map.contacts).some(item=>text(item.alternate_contact_ref))?[make(rule,{field_id:'alternate_contact_ref'})]:[],
  high_risk_failure_action:(map,rule)=>list(map.recovery_steps).flatMap((item,index)=>['high','critical'].includes(item.risk_level)&&!text(item.failure_action)?[make(rule,{entity_id:item.id,field_id:'failure_action',entry_index:index})]:[]),
  high_risk_stop_condition:(map,rule)=>list(map.recovery_steps).flatMap((item,index)=>['high','critical'].includes(item.risk_level)&&!text(item.stop_condition)?[make(rule,{entity_id:item.id,field_id:'stop_condition',entry_index:index})]:[]),
  attachment_has_module:(map,rule)=>list(map.attachments).flatMap((item,index)=>list(item.module_refs).length?[]:[make(rule,{entity_id:item.id,field_id:'module_refs',entry_index:index})]),
  attachment_has_purpose:(map,rule)=>list(map.attachments).flatMap((item,index)=>text(item.purpose)?[]:[make(rule,{entity_id:item.id,field_id:'purpose',entry_index:index})])
};

export function evaluateKnowledgeRulesV2(map,{rehearsalCompleted=false}={}){
  const structural=validateKnowledgeMapV2(map).issues.map(item=>({...item,severity:'critical',blocking:true,message_key:item.code}));
  const product=structural.length?[]:RULE_CATALOG_V2.flatMap(rule=>PREDICATES[rule.predicate](map,rule));
  const issues=[...structural,...product],blocking=issues.filter(item=>item.blocking),attention=issues.filter(item=>!item.blocking);
  return{schema_version:2,valid:blocking.length===0,blocking,attention,issues,rehearsal_completed:rehearsalCompleted,standard_module_ids:STANDARD_MODULE_IDS};
}
