import { STANDARD_MODULE_IDS } from '../knowledge/schema-v2.js';
import { evaluateKnowledgeRulesV2 } from '../review/rules-v2.js';

const COLLECTIONS={'assets-accounts':'assets','recovery-conditions':'recovery_conditions','locations-finding':'locations','contacts-assistance':'contacts','recovery-order-exceptions':'recovery_steps','evidence-messages':'attachments'};
export const MODULE_STATES=Object.freeze({NOT_STARTED:'未开始',IN_PROGRESS:'进行中',SUGGESTED:'建议补充',COMPLETED:'已完成',VERIFIED:'已验证'});

export function calculateModuleStatesV2(map,{rehearsalCompleted=false,reviewOverride=null}={}){
  const review=reviewOverride??evaluateKnowledgeRulesV2(map,{rehearsalCompleted}),result={};
  for(const moduleId of STANDARD_MODULE_IDS){const hasContent=moduleId==='contacts-assistance'?map.assistance?.needed===false||(map.contacts?.length??0)>0:moduleId==='evidence-messages'?(map.attachments?.length??0)>0||Boolean(map.personal_message):(map[COLLECTIONS[moduleId]]?.length??0)>0,blocking=review.blocking.filter(item=>item.module_id===moduleId),attention=review.attention.filter(item=>item.module_id===moduleId);result[moduleId]={state:!hasContent?MODULE_STATES.NOT_STARTED:blocking.length?MODULE_STATES.IN_PROGRESS:attention.length?MODULE_STATES.SUGGESTED:rehearsalCompleted?MODULE_STATES.VERIFIED:MODULE_STATES.COMPLETED,blocking_count:blocking.length,suggestion_count:attention.length};}
  for(const module of map.custom_modules??[]){if(!module.enabled)continue;const hasContent=(module.custom_field_refs?.length??0)>0||(module.attachment_refs?.length??0)>0;result[module.id]={state:!hasContent?MODULE_STATES.NOT_STARTED:rehearsalCompleted?MODULE_STATES.VERIFIED:MODULE_STATES.COMPLETED,blocking_count:0,suggestion_count:0};}
  return{modules:result,blocking_count:review.blocking.length,suggestion_count:review.attention.length,rehearsal_completed:rehearsalCompleted};
}
