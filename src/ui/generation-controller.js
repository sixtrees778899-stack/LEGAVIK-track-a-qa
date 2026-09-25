import { ValidationError } from '../shared/errors.js';

export function assertFinalGenerationState({reviewCurrent,knowledge,acknowledged}){
  if(!acknowledged)throw new ValidationError('PASSWORD_ACK_REQUIRED','Password recovery acknowledgement is required');
  if(!reviewCurrent)throw new ValidationError('REVIEW_STALE','Review result is stale');
  if(!knowledge)throw new ValidationError('KNOWLEDGE_MISSING','Reviewed Knowledge Map is missing');
  return true;
}

export function userErrorCode(error){
  if(['PASSWORD_ACK_REQUIRED','REVIEW_STALE','KNOWLEDGE_MISSING','REVIEW_BLOCKED'].includes(error?.code))return error.code;
  if(error?.code?.startsWith('ATTACHMENT_')||error?.code==='VERSION_TOO_LARGE'||error?.code==='TOO_MANY_ATTACHMENTS')return'ATTACHMENT_VALIDATION_FAILED';
  return {snapshot:'SNAPSHOT_BUILD_FAILED','data-key':'DATA_KEY_GENERATION_FAILED',archive:'ARCHIVE_GENERATION_FAILED','recovery-kit':'RECOVERY_KIT_GENERATION_FAILED'}[error?.stage]??'ARCHIVE_GENERATION_FAILED';
}

export async function runWithBusyButton(button,task){
  button.disabled=true;const original=button.textContent;button.textContent='正在生成…';
  try{return await task();}catch(error){button.disabled=false;button.textContent=original;throw error;}
}
