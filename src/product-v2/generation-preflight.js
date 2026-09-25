import { mapProductToKnowledgeV2 } from './snapshot-mapper.js';
import { validateKnowledgeMapByVersion } from '../knowledge/dispatcher.js';

const receiptPreflights=new WeakMap();

const mappingIssue=error=>({
  code:error?.code??error?.message??'GENERATION_PROJECTION_FAILED',
  path:error?.path??null,
  module_id:error?.module_id??null,
  blocking:true,
  details:error?.issues??error?.details??null
});

export function runGenerationPreflight(store,receipt,options={}){
  const base={draft_id:store.draft_id,draft_revision:store.draft_revision,receipt_revision:receipt?.draft_revision??null,knowledge:null,issues:[],publishable:false};
  if(!receipt?.generation_allowed||!receipt?.report_ready){
    return Object.freeze({...base,issues:receipt?.validation_issues?.filter(item=>item.blocking)??[]});
  }
  try{
    const knowledge=mapProductToKnowledgeV2(store,receipt,options),validation=validateKnowledgeMapByVersion(knowledge);
    return Object.freeze({...base,knowledge,issues:validation.issues??validation.errors??[],publishable:validation.valid});
  }catch(error){
    return Object.freeze({...base,issues:error?.issues??error?.details??[mappingIssue(error)]});
  }
}

export function assertGenerationPreflightMatches(store,preflight){
  if(!preflight||preflight.draft_id!==store.draft_id||preflight.draft_revision!==store.draft_revision)throw new Error('STALE_GENERATION_PREFLIGHT');
  return preflight;
}

export function bindGenerationPreflight(receipt,preflight){receiptPreflights.set(receipt,preflight);return receipt;}
export function generationPreflightFor(receipt){return receiptPreflights.get(receipt)??null;}
