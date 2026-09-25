import { ValidationError } from '../shared/errors.js';
const ALLOWED=new Set(['account_id','orders','payments','vault_alias','created_at','updated_at','version_status','rehearsal_status','reminders','support','public_locator_index']);
const FORBIDDEN_PATTERN=/(plaintext|password|data.?key|recovery.?kit|wrapped.?key|dek|kek|knowledge|attachment)/i;
export function validateAccountRecord(record){
  const errors=[];if(!record||typeof record!=='object'||Array.isArray(record))return {valid:false,errors:[{code:'TYPE',message:'Account record must be an object'}]};
  for(const key of Object.keys(record)){if(!ALLOWED.has(key))errors.push({code:'FIELD_NOT_ALLOWED',field:key});if(FORBIDDEN_PATTERN.test(key))errors.push({code:'RECOVERY_MATERIAL_FORBIDDEN',field:key});}
  return {valid:errors.length===0,errors};
}
export function assertAccountBoundary(record){const result=validateAccountRecord(record);if(!result.valid)throw new ValidationError('INVALID_ACCOUNT_RECORD','Account record crosses recovery boundary',result.errors);return record;}
