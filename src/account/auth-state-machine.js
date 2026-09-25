import {PASSWORD_POLICY_COPY} from './password-policy.js';

export const AUTH_STAGES=Object.freeze({
  LOGIN:'LOGIN',
  NEW_SIGNUP:'NEW_SIGNUP',
  VERIFICATION_PENDING:'VERIFICATION_PENDING',
  INCOMPLETE_HISTORICAL_ACCOUNT:'INCOMPLETE_HISTORICAL_ACCOUNT',
  HISTORICAL_VERIFICATION_PENDING:'HISTORICAL_VERIFICATION_PENDING',
  SET_PASSWORD:'SET_PASSWORD',
  ACCOUNT_COMPLETE:'ACCOUNT_COMPLETE',
  AUTHENTICATED_COMPLETE:'ACCOUNT_COMPLETE',
  FORGOT_PASSWORD:'FORGOT_PASSWORD',
  PASSWORD_RECOVERY_SESSION:'PASSWORD_RECOVERY_SESSION',
  RESET_PASSWORD:'RESET_PASSWORD',
  RECOVERY_LINK_FAILURE:'RECOVERY_LINK_FAILURE',
  PASSWORD_RESET_COMPLETE:'PASSWORD_RESET_COMPLETE'
});

const recoveryPriority=new Set([
  AUTH_STAGES.PASSWORD_RECOVERY_SESSION,
  AUTH_STAGES.RESET_PASSWORD,
  AUTH_STAGES.PASSWORD_RESET_COMPLETE
]);

export function hasRecoveryIntent({hash='',search='',href=''}={}){
  const params=new URLSearchParams(String(search).replace(/^\?/,''));
  return String(hash).replace(/^#/,'')==='reset-password'||
    params.get('auth_action')==='recovery'||
    params.get('type')==='recovery'||
    /(?:[?#&])type=recovery(?:&|$)/.test(String(href));
}

export function isRecoveryPriorityStage(stage){return recoveryPriority.has(stage);}

export function stageFromLocation({hash='',search='',href=''}={}){
  if(hasRecoveryIntent({hash,search,href}))return AUTH_STAGES.RESET_PASSWORD;
  const route=String(hash).replace(/^#/,'');
  if(route==='signup')return AUTH_STAGES.NEW_SIGNUP;
  if(route==='verify')return AUTH_STAGES.VERIFICATION_PENDING;
  if(route==='verify-incomplete')return AUTH_STAGES.HISTORICAL_VERIFICATION_PENDING;
  if(route==='forgot')return AUTH_STAGES.FORGOT_PASSWORD;
  if(route==='password-reset-complete')return AUTH_STAGES.PASSWORD_RESET_COMPLETE;
  return AUTH_STAGES.LOGIN;
}

export function stageFromHash(hash=''){return stageFromLocation({hash});}

export function resolveAuthenticatedStage({stage,hasSession,credentialState=''}={}){
  if(isRecoveryPriorityStage(stage))return stage;
  if(!hasSession)return [AUTH_STAGES.NEW_SIGNUP,AUTH_STAGES.VERIFICATION_PENDING,AUTH_STAGES.HISTORICAL_VERIFICATION_PENDING,AUTH_STAGES.FORGOT_PASSWORD].includes(stage)?stage:AUTH_STAGES.LOGIN;
  if(credentialState==='PASSWORD_REQUIRED')return AUTH_STAGES.SET_PASSWORD;
  return AUTH_STAGES.ACCOUNT_COMPLETE;
}

export function accountKindFromMetadata(metadata={}){
  const state=metadata?.skrek_account_state??'';
  if(state==='PASSWORD_REQUIRED')return 'INCOMPLETE_HISTORICAL_ACCOUNT';
  if(state==='ACCOUNT_COMPLETE_PENDING_VERIFICATION')return 'NEW_VERIFICATION_PENDING';
  return 'ACCOUNT_COMPLETE';
}

export function authErrorMessage(error,{context='general'}={}){
  const text=String(error?.message??error??'');
  if(/invalid.*email|email.*invalid/i.test(text))return '请输入有效的邮箱地址。';
  if(/invalid login|invalid credentials/i.test(text))return '邮箱或密码不正确。';
  if(/username_taken|duplicate key.*username/i.test(text))return '该显示名称已被使用，请重新选择。';
  if(/password/i.test(text)&&/(characters|weak|least|short)/i.test(text))return PASSWORD_POLICY_COPY;
  if(context==='otp'&&/(incorrect|wrong)/i.test(text))return '验证码不正确，请检查后重试。';
  if(context==='otp'&&/expired/i.test(text)&&!/invalid/i.test(text))return '验证码已失效，请重新获取。';
  if(context==='otp'&&/invalid.*expired|expired.*invalid/i.test(text))return '验证码无效或已失效，请重新获取并使用最新验证码。';
  if(context==='otp'&&/(token|otp|code).*(invalid)|invalid.*(token|otp|code)/i.test(text))return '验证码无效或已被新的验证码替代，请使用最新收到的验证码。';
  if(context==='recovery-session'&&/(expired|invalid|session|pkce|code)/i.test(text))return '密码恢复链接无效或已失效，请重新申请。';
  if(/fetch|network|timeout|temporar|service unavailable/i.test(text))return '网络暂时不可用，请稍后再试。';
  return '操作未完成，请稍后重试。';
}
