import {validatePasswordPair} from './password-policy.js';

export const PASSWORD_UPDATE_CATEGORIES=Object.freeze({
  SAME_PASSWORD:'SAME_PASSWORD',
  PASSWORD_POLICY:'PASSWORD_POLICY',
  RECOVERY_SESSION_INVALID:'RECOVERY_SESSION_INVALID',
  RATE_LIMIT:'RATE_LIMIT',
  NETWORK:'NETWORK',
  REAUTHENTICATION:'REAUTHENTICATION',
  UNKNOWN:'UNKNOWN'
});

export function validateNewPassword(password,confirmation){
  return validatePasswordPair(password,confirmation);
}

export function classifyPasswordUpdateError(error){
  const code=String(error?.code??'').toLowerCase();
  const name=String(error?.name??'');
  const status=Number(error?.status??0)||null;
  const text=String(error?.message??error??'');
  let category=PASSWORD_UPDATE_CATEGORIES.UNKNOWN;
  if(code==='same_password'||/same password|different from the old password/i.test(text))category=PASSWORD_UPDATE_CATEGORIES.SAME_PASSWORD;
  else if(code==='weak_password'||/password.*(?:weak|strength|characters|least|short|pwned|compromised)/i.test(text))category=PASSWORD_UPDATE_CATEGORIES.PASSWORD_POLICY;
  else if(['session_not_found','refresh_token_not_found','bad_jwt'].includes(code)||/session.*(?:missing|invalid|expired)|jwt.*(?:invalid|expired)/i.test(text)||name==='AuthSessionMissingError')category=PASSWORD_UPDATE_CATEGORIES.RECOVERY_SESSION_INVALID;
  else if(status===429||/rate.?limit|too many requests|over_request_rate_limit/i.test(`${code} ${text}`))category=PASSWORD_UPDATE_CATEGORIES.RATE_LIMIT;
  else if(/fetch|network|timeout|temporar|service unavailable/i.test(text))category=PASSWORD_UPDATE_CATEGORIES.NETWORK;
  else if(['reauthentication_needed','reauth_nonce_missing','reauthentication_not_valid','current_password_required','current_password_mismatch'].includes(code))category=PASSWORD_UPDATE_CATEGORIES.REAUTHENTICATION;
  const reasons=Array.isArray(error?.reasons)?error.reasons.filter(reason=>['length','characters','pwned'].includes(reason)):[];
  return {category,name:name||'AuthError',code:code||null,status,...(reasons.length?{reasons}: {})};
}

export function passwordUpdateCustomerMessage(errorEvidence){
  const category=typeof errorEvidence==='string'?errorEvidence:errorEvidence?.category;
  if(category===PASSWORD_UPDATE_CATEGORIES.SAME_PASSWORD)return '新密码不能与当前密码相同，请设置不同的密码。';
  if(category===PASSWORD_UPDATE_CATEGORIES.PASSWORD_POLICY&&errorEvidence?.reasons?.includes('pwned'))return '此密码可能已出现在已知泄露数据中，请使用不同的密码。';
  if(category===PASSWORD_UPDATE_CATEGORIES.PASSWORD_POLICY)return '密码未通过安全检查，请确认至少10位，并同时包含大写字母、小写字母、数字和特殊字符。';
  if(category===PASSWORD_UPDATE_CATEGORIES.RECOVERY_SESSION_INVALID)return '此密码重置链接已失效，请重新申请密码重置邮件。';
  if(category===PASSWORD_UPDATE_CATEGORIES.RATE_LIMIT)return '操作过于频繁，请稍后再试。';
  if(category===PASSWORD_UPDATE_CATEGORIES.NETWORK)return '网络或服务暂时不可用，请稍后重试。';
  if(category===PASSWORD_UPDATE_CATEGORIES.REAUTHENTICATION)return '当前密码恢复会话无法完成更新，请重新申请密码重置邮件。';
  return '操作未完成，请稍后重试。';
}
