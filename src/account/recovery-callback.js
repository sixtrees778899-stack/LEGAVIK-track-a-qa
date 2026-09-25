const RECOVERY_TYPE='recovery';

export function readRecoveryCallback(search=''){
  const params=new URLSearchParams(String(search).replace(/^\?/,''));
  const tokenHash=params.get('token_hash')??'';
  const type=params.get('type')??'';
  return {
    // auth_action=recovery is routing intent, not a server-issued credential.
    // ConfirmationURL/PKCE callbacks are completed by supabase-js before
    // getSession resolves; only direct token-hash callbacks belong here.
    present:Boolean(tokenHash||type),
    validShape:Boolean(tokenHash&&type===RECOVERY_TYPE),
    tokenHash,
    type
  };
}

export function cleanSuccessfulRecoveryUrl({href,history}){
  const url=new URL(href);
  url.searchParams.delete('token_hash');
  url.searchParams.delete('type');
  url.searchParams.delete('code');
  url.searchParams.set('auth_action','recovery');
  url.hash='reset-password';
  history.replaceState(null,'',`${url.pathname}${url.search}${url.hash}`);
}

export async function verifyRecoveryCallback({auth,search,href,history}){
  const callback=readRecoveryCallback(search);
  if(!callback.present)return {handled:false,session:null,error:null};
  if(!callback.validShape)return {handled:true,session:null,error:new Error('MALFORMED_RECOVERY_CALLBACK')};
  const {data,error}=await auth.verifyOtp({token_hash:callback.tokenHash,type:RECOVERY_TYPE});
  if(error||!data?.session){
    return {handled:true,session:null,error:error??new Error('RECOVERY_SESSION_MISSING')};
  }
  cleanSuccessfulRecoveryUrl({href,history});
  return {handled:true,session:data.session,error:null};
}

export function isTemporaryRecoveryFailure(error){
  return /fetch|network|timeout|temporar|service unavailable/i.test(String(error?.message??error??''));
}
