import { ValidationError } from '../shared/errors.js';
import { validateKnowledgeMap as validateV1 } from './validator.js';
import { evaluateKnowledgeRulesV2 } from '../review/rules-v2.js';

export function validateKnowledgeMapByVersion(input,options={}){
  if(input?.schema_version===1)return{...validateV1(input),schema_version:1};
  if(input?.schema_version===2){const result=evaluateKnowledgeRulesV2(input,options);return{valid:result.valid,errors:result.blocking,issues:result.issues,schema_version:2};}
  return{valid:false,errors:[{path:'$.schema_version',code:'UNSUPPORTED_VERSION',message:'Unsupported Knowledge Schema version',blocking:true}],schema_version:input?.schema_version??null};
}
export function assertValidKnowledgeMapByVersion(input,options={}){const result=validateKnowledgeMapByVersion(input,options);if(!result.valid)throw new ValidationError('INVALID_KNOWLEDGE_MAP','Recovery Knowledge Map validation failed',result.errors);return input;}
