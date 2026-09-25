import { CONFIDENCE_STATUS } from '../domain/constants.js';
import { validateKnowledgeMap } from '../knowledge/validator.js';
import { validatorIssue } from '../review/readiness-rules.js';

const TARGETS={ASSET_WITHOUT_EXISTENCE:'wallet-exists',ASSET_WITHOUT_LOCATION:'device-location',ASSET_WITHOUT_ORDER:'first-action',CRITICAL_CONTACT_MISSING:'has-assistant',LOCATION_WITHOUT_INSTRUCTIONS:'device-location',ORDER_WITHOUT_PREREQUISITES:'first-action',ORDER_WITHOUT_EXPECTED_RESULT:'expected-result',ORDER_WITHOUT_FAILURE_ACTION:'failure-action',HIGH_RISK_WITHOUT_WARNING:'risk-warning',ATTACHMENT_MISSING:'device-attachment',ATTACHMENT_HASH_MISMATCH:'device-attachment',ATTACHMENT_WITHOUT_PURPOSE:'device-attachment',VERSION_STALE:'wallet-exists',REHEARSAL_NOT_COMPLETED:'rehearsal'};
const issue=(severity,dimension,code,message,entity_id)=>({severity,dimension,code,message,step_id:TARGETS[code]??null,...(entity_id?{entity_id}:{})});
const list=value=>Array.isArray(value)?value:[];
const hasText=value=>typeof value==='string'&&value.trim().length>0;
export function checkRecoveryConfidence(map,{rehearsalCompleted=false,observedAttachmentHashes={},now=new Date(),freshnessDays=365}={}){
  const issues=[];const validation=validateKnowledgeMap(map);
  for(const error of validation.errors)issues.push(validatorIssue(error));
  for(const asset of list(map?.assets)){
    if(!hasText(asset?.existence_note))issues.push(issue('attention','Coverage','ASSET_WITHOUT_EXISTENCE','Asset existence is not explained',asset?.id));
    if(!list(asset?.location_refs).length)issues.push(issue('attention','Findability','ASSET_WITHOUT_LOCATION','Asset has no Location',asset?.id));
    if(!list(asset?.order_refs).length)issues.push(issue('attention','Sequencing','ASSET_WITHOUT_ORDER','Asset has no recovery Order',asset?.id));
    if(!list(asset?.contact_refs).length)issues.push(issue('attention','Findability','CRITICAL_CONTACT_MISSING','Asset has no recovery Contact',asset?.id));
  }
  for(const location of list(map?.locations))if(!hasText(location?.description))issues.push(issue('attention','Findability','LOCATION_WITHOUT_INSTRUCTIONS','Location has no finding instructions',location?.id));
  for(const order of list(map?.orders)){
    if(!list(order?.prerequisites).some(hasText))issues.push(issue('attention','Sequencing','ORDER_WITHOUT_PREREQUISITES','Order has no prerequisites',order?.id));
    if(!hasText(order?.expected_result))issues.push(issue('attention','Sequencing','ORDER_WITHOUT_EXPECTED_RESULT','Order has no expected result',order?.id));
    if(!hasText(order?.failure_action))issues.push(issue('attention','Safety','ORDER_WITHOUT_FAILURE_ACTION','Order has no failure action',order?.id));
    if(['high','critical'].includes(order?.risk_level)&&!list(order?.warning_refs).length)issues.push(issue('critical','Safety','HIGH_RISK_WITHOUT_WARNING','High-risk Order has no Warning',order?.id));
  }
  for(const attachment of list(map?.attachments)){
    if(!(attachment.id in observedAttachmentHashes))issues.push(issue('critical','Evidence','ATTACHMENT_MISSING','Attachment payload is missing',attachment.id));
    else if(observedAttachmentHashes[attachment.id]!==attachment.sha256)issues.push(issue('critical','Evidence','ATTACHMENT_HASH_MISMATCH','Attachment hash does not match',attachment.id));
    if(!hasText(attachment?.purpose))issues.push(issue('attention','Evidence','ATTACHMENT_WITHOUT_PURPOSE','Attachment purpose is missing',attachment?.id));
  }
  const reviewed=Date.parse(map?.reviewed_at);if(!Number.isFinite(reviewed)||now.getTime()-reviewed>freshnessDays*86400000)issues.push(issue('attention','Freshness','VERSION_STALE','Version should be reviewed for freshness'));
  if(!rehearsalCompleted)issues.push(issue('rehearsal','Recoverability','REHEARSAL_NOT_COMPLETED','Independent recovery rehearsal is not complete'));
  const hasCritical=issues.some((item)=>item.severity==='critical'),hasAttention=issues.some((item)=>item.severity==='attention');
  const status=hasCritical?CONFIDENCE_STATUS.CRITICAL:hasAttention?CONFIDENCE_STATUS.ATTENTION:rehearsalCompleted?CONFIDENCE_STATUS.VERIFIED:CONFIDENCE_STATUS.READY;
  return {status,issues:issues.map(item=>({...item,blocking:item.blocking??item.severity==='critical'})),dimensions:['Coverage','Findability','Sequencing','Safety','Evidence','Freshness','Recoverability']};
}
