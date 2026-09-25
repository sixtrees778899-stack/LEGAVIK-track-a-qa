import {createClient} from '@supabase/supabase-js';
import {skrekGlobalHeader} from '../ui/skrek-global-header.js';
import {canonicalAccountUrl,canonicalCreateUrl,canonicalHomeUrl,canonicalPricingUrl,canonicalRecoveryUrl,CURRENT_TEST_RELEASE} from '../ui/canonical-customer-links.js';
import {retryPendingPublishedLifecycleSync,retryPendingPublishedVersionSync} from './recovery-metadata-client.js';
import {AUTH_STAGES,accountKindFromMetadata,authErrorMessage,hasRecoveryIntent,resolveAuthenticatedStage,stageFromLocation} from './auth-state-machine.js';
import {isTemporaryRecoveryFailure,readRecoveryCallback,verifyRecoveryCallback} from './recovery-callback.js';
import {PASSWORD_UPDATE_CATEGORIES,classifyPasswordUpdateError,passwordUpdateCustomerMessage,validateNewPassword} from './password-reset-submission.js';
import {PASSWORD_POLICY_COPY,validatePasswordPair} from './password-policy.js';
import {customerBrand} from '../ui/brand-contract.js';
import {authoritativeCurrentVersion,currentRecoveryVerification,customerVisibleMaterials,mayUpdateRecoveryVersion} from './customer-recovery-status.js';

const config=globalThis.SKREK_PUBLIC_CONFIG??{};
const configured=Boolean(config.supabaseUrl&&config.supabaseAnonKey);
const supabase=configured?(globalThis.LEGAVIK_SUPABASE_CLIENT??=createClient(config.supabaseUrl,config.supabaseAnonKey,{
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}
})):null;
const app=document.querySelector('#account-app');
document.documentElement.dataset.accountBundleRelease=CURRENT_TEST_RELEASE;
const query=new URLSearchParams(location.search);
const localTestHost=['localhost','127.0.0.1'].includes(location.hostname);
const pagesTestHost=location.hostname==='sixtrees778899-stack.github.io'&&location.pathname.startsWith('/LEGAVIK-track-a-qa/');
const testRecoveryMap=localTestHost||pagesTestHost;
const authCallbackUrl='https://sixtrees778899-stack.github.io/LEGAVIK-track-a-qa/web/account/index.html';
const signupCallbackUrl=`${authCallbackUrl}?auth_action=signup#verify`;
const recoveryCallbackUrl=`${authCallbackUrl}?auth_action=recovery#reset-password`;
const recoveryMapPurchaseUrl=canonicalPricingUrl();
const recoveryCallback=readRecoveryCallback(location.search);
const supportedPurchaseCurrencies=new Set(['USD','AUD']);
const purchase={
  active:query.get('purchase')==='1',
  plan:query.get('plan')??'',
  currency:supportedPurchaseCurrencies.has(query.get('currency'))?query.get('currency'):'',
  price:/^\d+$/.test(query.get('price')??'')?query.get('price'):''
};
const customerStateOverrideParameters=['lifecycle_preview','service_plan','free_updates'];
function removeCustomerStateOverrideParameters(){const clean=new URL(location.href);let changed=false;for(const name of customerStateOverrideParameters){if(clean.searchParams.has(name)){clean.searchParams.delete(name);changed=true;}}if(changed)history.replaceState(null,'',`${clean.pathname}${clean.search}${clean.hash}`);}
removeCustomerStateOverrideParameters();
const ACCOUNT_INIT_TIMEOUT_MS=12000;
const PENDING_SYNC_BUDGET_MS=3500;
const state={authStage:AUTH_STAGES.LOGIN,email:'',session:null,profile:null,section:query.get('section')==='maps'?'maps':'overview',cooldownUntil:0,cooldownTimer:null,notice:'',requestInFlight:false,recoveryEmailSent:false,recoveryIntent:hasRecoveryIntent({hash:location.hash,search:location.search,href:location.href}),processingRecoveryCredential:false,recoveryFailureTemporary:false,resetSubmitAttempts:0,lastResetFailureEvidence:null};
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
document.addEventListener('click',event=>{const menu=event.target.closest('#menu');if(!menu)return;const host=document.querySelector('#site-header'),open=host?.classList.toggle('menu-open')??false;menu.setAttribute('aria-expanded',String(open));});

function shell(content){
  const header=skrekGlobalHeader({activeRoute:'',mode:'map',productBase:canonicalHomeUrl(''),accountBase:canonicalAccountUrl().replace(/#login$/,''),recoveryBase:canonicalRecoveryUrl('recovery-center')});
  return `<header id="site-header" class="global-header-host">${header}</header><main>${content}</main>`;
}
function message(text,type='error'){return `<p class="form-message ${type}" role="status">${esc(text)}</p>`;}
function formMessage(text,type='error'){return `<p id="form-message" class="form-message ${type}" role="status">${esc(text)}</p>`;}
const hashForStage=stage=>({[AUTH_STAGES.LOGIN]:'login',[AUTH_STAGES.NEW_SIGNUP]:'signup',[AUTH_STAGES.VERIFICATION_PENDING]:'verify',[AUTH_STAGES.HISTORICAL_VERIFICATION_PENDING]:'verify-incomplete',[AUTH_STAGES.SET_PASSWORD]:'set-password',[AUTH_STAGES.ACCOUNT_COMPLETE]:'account',[AUTH_STAGES.FORGOT_PASSWORD]:'forgot',[AUTH_STAGES.PASSWORD_RECOVERY_SESSION]:'reset-password',[AUTH_STAGES.RESET_PASSWORD]:'reset-password',[AUTH_STAGES.PASSWORD_RESET_COMPLETE]:'password-reset-complete'}[stage]??'');
function setStage(stage,{replaceHash=true}={}){state.authStage=stage;if(replaceHash){const hash=hashForStage(stage);if(hash)history.replaceState(null,'',`#${hash}`);}render();}
function authCard(title,intro,body,{standalone=false}={}){const content=`<section class="auth-layout"><div class="auth-card"><p class="eyebrow">LEGAVIK ACCOUNT</p><h1>${title}</h1>${intro?`<p>${intro}</p>`:''}${body}</div></section>`;return standalone?`<main>${content}</main>`:shell(content);}
function bind(id,event,handler){document.querySelector(id)?.addEventListener(event,handler);}
function withTimeout(promise,timeoutMs,label){let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(`${label}_TIMEOUT`)),timeoutMs);})]).finally(()=>clearTimeout(timer));}
function renderAccountLoadFailure(){app.dataset.runtimeState='FAILED';app.innerHTML=authCard('客户中心未能正常打开','请重新加载，或返回安全入口后再次进入。',`<div class="auth-links"><button id="reload-account">重新加载</button><a class="secondary-link" href="${canonicalHomeUrl('home')}">返回安全入口</a></div>`);bind('#reload-account','click',()=>location.reload());}
function showFormError(error){const node=document.querySelector('#form-message');if(node)node.outerHTML=formMessage(error?.message??error);}
function showFormNotice(text){const node=document.querySelector('#form-message');if(node)node.outerHTML=formMessage(text,'success');}
function friendly(error,context='general'){return authErrorMessage(error,{context});}
function remainingCooldown(){return Math.max(0,Math.ceil((state.cooldownUntil-Date.now())/1000));}
function updateCooldownUI(){const seconds=remainingCooldown(),button=document.querySelector('[data-email-action]');if(button)button.textContent=seconds?`重新发送（${seconds}s）`:button.dataset.readyLabel??'重新发送';if(!seconds&&state.cooldownTimer){clearInterval(state.cooldownTimer);state.cooldownTimer=null;}}
function startCooldown(){state.cooldownUntil=Date.now()+60000;if(state.cooldownTimer)clearInterval(state.cooldownTimer);updateCooldownUI();state.cooldownTimer=setInterval(updateCooldownUI,1000);}
function resetCooldown(){state.cooldownUntil=0;if(state.cooldownTimer)clearInterval(state.cooldownTimer);state.cooldownTimer=null;updateCooldownUI();}
function duringCooldown(){if(!remainingCooldown())return false;showFormError('请等待倒计时结束后再试。');return true;}
function beginRequest(){if(state.requestInFlight)return false;state.requestInFlight=true;return true;}
function endRequest(){state.requestInFlight=false;}
function setLoading(button,loading,label='处理中…'){if(!button)return;if(loading){button.dataset.idleLabel=button.textContent;button.setAttribute('aria-busy','true');button.textContent=label;}else{button.removeAttribute('aria-busy');if(button.dataset.idleLabel)button.textContent=button.dataset.idleLabel;delete button.dataset.idleLabel;}}
function passwordField({label,id,autocomplete}){return `<label>${label}<span class="password-control"><input id="${id}" type="password" autocomplete="${autocomplete}" required><button type="button" class="password-toggle" data-password-toggle="${id}" aria-label="显示${label}" aria-pressed="false"><svg class="eye-closed" data-eye="closed" aria-hidden="true" viewBox="0 0 24 24"><path d="M3 3l18 18M10.6 6.2A10.7 10.7 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3 3.6M6.2 6.2C3.8 8 2.5 12 2.5 12s3.5 6 9.5 6c1.4 0 2.7-.3 3.8-.8M9.8 9.8A3 3 0 0 0 14.2 14.2"/></svg><svg class="eye-open" data-eye="open" aria-hidden="true" viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.8"/></svg></button></span></label>`;}
function bindPasswordVisibility(){document.querySelectorAll('[data-password-toggle]').forEach(button=>button.addEventListener('click',()=>{const input=document.getElementById(button.dataset.passwordToggle),show=input?.type==='password';if(!input)return;input.type=show?'text':'password';button.setAttribute('aria-pressed',String(show));button.setAttribute('aria-label',`${show?'隐藏':'显示'}${button.dataset.passwordToggle==='confirm'?'确认密码':'密码'}`);}));}
function passwordPolicyChecklist(){return `<p class="password-policy" data-password-policy>${PASSWORD_POLICY_COPY}</p>`;}
function clearFormMessage(){const node=document.querySelector('#form-message');if(node)node.outerHTML='<div id="form-message"></div>';}
function bindPasswordPolicyUI(){const password=document.querySelector('#password'),confirmation=document.querySelector('#confirm');if(!password||!confirmation)return;password.addEventListener('input',clearFormMessage);confirmation.addEventListener('input',clearFormMessage);clearFormMessage();}

function renderLogin(){
  const resetFlow=query.get('reset_flow')==='1';
  const loginLinks=resetFlow?`<div class="auth-links"><a class="secondary-link" href="${canonicalHomeUrl('home')}">返回 LEGAVIK 官网</a></div>`:'<div class="auth-links"><button id="forgot" class="link-button">忘记密码</button><button id="signup" class="link-button">创建账户</button></div>';
  app.innerHTML=authCard('登录 LEGAVIK',resetFlow?'':'进入您的客户中心。',`${state.notice?message(state.notice,'success'):''}<form id="login-form"><label>邮箱<input id="email" type="email" autocomplete="email" required></label>${passwordField({label:'密码',id:'password',autocomplete:'current-password'})}<div id="form-message"></div><button type="submit">登录</button></form>${loginLinks}`,{standalone:resetFlow});state.notice='';bindPasswordVisibility();
  bind('#login-form','submit',async event=>{event.preventDefault();if(!beginRequest())return;const button=event.submitter;setLoading(button,true,'登录中…');const {data,error}=await supabase.auth.signInWithPassword({email:document.querySelector('#email').value.trim(),password:document.querySelector('#password').value});endRequest();if(error){setLoading(button,false);showFormError(friendly(error,'login'));return;}state.session=data.session;await loadAuthenticatedAccount();});
  bind('#forgot','click',()=>{resetCooldown();state.recoveryEmailSent=false;setStage(AUTH_STAGES.FORGOT_PASSWORD);});bind('#signup','click',()=>{resetCooldown();setStage(AUTH_STAGES.NEW_SIGNUP);});
}
function renderSignup(){
  app.innerHTML=authCard('创建 LEGAVIK 账户','先设置您的登录密码，再验证邮箱。',`<form id="signup-form"><label>邮箱地址<input id="email" type="email" autocomplete="email" required></label>${passwordField({label:'密码',id:'password',autocomplete:'new-password'})}${passwordPolicyChecklist()}${passwordField({label:'确认密码',id:'confirm',autocomplete:'new-password'})}<div id="form-message"></div><button type="submit" data-email-action data-ready-label="获取验证码">获取验证码</button><p class="send-status" data-send-status aria-live="polite"></p></form><div class="auth-links"><button id="login" class="link-button">返回登录</button></div>`);bindPasswordVisibility();bindPasswordPolicyUI();updateCooldownUI();
  bind('#signup-form','submit',async event=>{event.preventDefault();const email=document.querySelector('#email').value.trim(),password=document.querySelector('#password').value,confirm=document.querySelector('#confirm').value,validationError=validatePasswordPair(password,confirm);if(validationError){showFormError(validationError);return;}if(duringCooldown()||!beginRequest())return;const button=event.submitter,status=document.querySelector('[data-send-status]');state.email=email;startCooldown();button.setAttribute('aria-busy','true');if(status)status.textContent='正在发送验证码…';const {data,error}=await supabase.auth.signUp({email,password,options:{data:{skrek_account_state:'ACCOUNT_COMPLETE_PENDING_VERIFICATION'},emailRedirectTo:signupCallbackUrl}});endRequest();button.removeAttribute('aria-busy');if(error){resetCooldown();if(status)status.textContent='';showFormError(friendly(error,'signup'));return;}if(data.user&&Array.isArray(data.user.identities)&&data.user.identities.length===0){resetCooldown();if(status)status.textContent='';showFormNotice('该邮箱已经注册使用，请重新登录。');return;}state.notice='验证码已发送，请检查您的邮箱。';setStage(AUTH_STAGES.VERIFICATION_PENDING);});
  bind('#login','click',()=>setStage(AUTH_STAGES.LOGIN));
}
function renderExistingAccount(){
  app.innerHTML=authCard('该邮箱已有 LEGAVIK 账户','请直接登录。',`${message('该邮箱已有 LEGAVIK 账户，请直接登录。','success')}<div class="auth-links"><button id="login" class="primary-link">前往登录</button><button id="continue-incomplete" class="link-button">验证邮箱并继续未完成的账户设置</button></div><div id="form-message"></div>`);
  bind('#login','click',()=>setStage(AUTH_STAGES.LOGIN));
  bind('#continue-incomplete','click',requestHistoricalVerification);
}
async function requestHistoricalVerification(){
  if(duringCooldown()||!beginRequest())return;const {error}=await supabase.auth.signInWithOtp({email:state.email,options:{shouldCreateUser:false,emailRedirectTo:`${authCallbackUrl}?auth_action=incomplete#verify-incomplete`}});endRequest();if(error){showFormError(friendly(error,'otp'));return;}startCooldown();state.notice='验证码已发送，请检查您的邮箱。';setStage(AUTH_STAGES.HISTORICAL_VERIFICATION_PENDING);
}
function renderVerify({historical=false}={}){
  const confirmation=state.notice||'验证码已发送，请检查您的邮箱。';state.notice='';
  app.innerHTML=authCard('输入邮箱验证码',`${confirmation} 验证码有效期为10分钟。`,`<form id="verify-form"><label>6位验证码<input id="otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" required></label><div id="form-message"></div><button type="submit">验证邮箱</button></form><p class="send-status" data-send-status aria-live="polite">验证码已发送，请检查您的邮箱。</p><div class="auth-links"><button id="resend" data-email-action data-ready-label="重新发送" class="link-button">重新发送</button><button id="change" class="link-button">更换邮箱</button></div>`);updateCooldownUI();
  bind('#verify-form','submit',async event=>{event.preventDefault();const token=document.querySelector('#otp').value.trim();if(!/^\d{6}$/.test(token))return showFormError('请输入完整的6位验证码。');if(!beginRequest())return;const button=event.submitter;setLoading(button,true,'验证中…');const {data,error}=await supabase.auth.verifyOtp({email:state.email,token,type:historical?'email':'signup'});endRequest();if(error){setLoading(button,false);showFormError(friendly(error,'otp'));return;}state.session=data.session;if(historical){const kind=accountKindFromMetadata(data.user?.user_metadata);if(kind==='INCOMPLETE_HISTORICAL_ACCOUNT'){setStage(AUTH_STAGES.SET_PASSWORD);return;}await supabase.auth.signOut();state.session=null;state.notice='该邮箱已有 LEGAVIK 账户，请直接登录。';setStage(AUTH_STAGES.LOGIN);return;}const {data:updated,error:updateError}=await supabase.auth.updateUser({data:{...(data.user?.user_metadata??{}),skrek_account_state:'COMPLETE'}});if(updateError){setLoading(button,false);showFormError(friendly(updateError));return;}state.session=updated.user?{...data.session,user:updated.user}:data.session;state.authStage=AUTH_STAGES.ACCOUNT_COMPLETE;await loadAuthenticatedAccount();});
  bind('#resend','click',async event=>{if(duringCooldown()||!beginRequest())return;const button=event.currentTarget,status=document.querySelector('[data-send-status]');startCooldown();button.setAttribute('aria-busy','true');if(status)status.textContent='正在重新发送验证码…';const {error}=historical?await supabase.auth.signInWithOtp({email:state.email,options:{shouldCreateUser:false,emailRedirectTo:`${authCallbackUrl}?auth_action=incomplete#verify-incomplete`}}):await supabase.auth.resend({type:'signup',email:state.email,options:{emailRedirectTo:signupCallbackUrl}});endRequest();button.removeAttribute('aria-busy');if(error){resetCooldown();if(status)status.textContent='';showFormError(friendly(error,'otp'));return;}if(status)status.textContent='新的验证码已发送，请使用最新收到的验证码。';});
  bind('#change','click',()=>setStage(AUTH_STAGES.NEW_SIGNUP));
}
function passwordForm(title,intro,mode){
  const hasSession=Boolean(state.session);
  app.innerHTML=authCard(title,intro,hasSession?`<form id="password-form">${passwordField({label:'新密码',id:'password',autocomplete:'new-password'})}${passwordPolicyChecklist()}${passwordField({label:'确认新密码',id:'confirm',autocomplete:'new-password'})}<div id="form-message"></div><button type="submit">保存并继续</button></form>`:`${message('密码恢复链接无效或已失效，请重新申请。')}<button id="request-recovery">重新申请密码恢复</button>`,{standalone:mode==='reset'});bindPasswordVisibility();bindPasswordPolicyUI();
  if(!hasSession){bind('#request-recovery','click',()=>setStage(AUTH_STAGES.FORGOT_PASSWORD));return;}
  bind('#password-form','submit',async event=>{event.preventDefault();const button=event.submitter,password=document.querySelector('#password').value,confirm=document.querySelector('#confirm').value,validationError=validateNewPassword(password,confirm);if(validationError){showFormError(validationError);return;}if(!beginRequest())return;state.resetSubmitAttempts+=1;setLoading(button,true,'保存中…');const metadata=mode==='historical'?{...(state.session.user.user_metadata??{}),skrek_account_state:'COMPLETE'}:undefined;let data=null,error=null;try{({data,error}=await supabase.auth.updateUser({password,...(metadata?{data:metadata}:{})}));}catch(caught){error=caught;}finally{endRequest();setLoading(button,false);}if(error){const evidence=classifyPasswordUpdateError(error);state.lastResetFailureEvidence={...evidence,hasSession:Boolean(state.session),recoverySession:mode==='reset'&&state.recoveryIntent,requestInFlight:state.requestInFlight,attempt:state.resetSubmitAttempts};if(evidence.category===PASSWORD_UPDATE_CATEGORIES.RECOVERY_SESSION_INVALID||evidence.category===PASSWORD_UPDATE_CATEGORIES.REAUTHENTICATION){state.session=null;state.authStage=AUTH_STAGES.RECOVERY_LINK_FAILURE;state.recoveryFailureTemporary=false;render();return;}showFormError(passwordUpdateCustomerMessage(evidence));return;}state.lastResetFailureEvidence=null;state.session=data?.user?{...state.session,user:data.user}:state.session;if(mode==='reset'){state.authStage=AUTH_STAGES.PASSWORD_RESET_COMPLETE;state.recoveryIntent=false;await supabase.auth.signOut();state.session=null;state.profile=null;history.replaceState(null,'','#password-reset-complete');render();return;}if(mode==='change'){state.notice='密码已成功更新。';setStage(AUTH_STAGES.ACCOUNT_COMPLETE);return;}state.authStage=AUTH_STAGES.ACCOUNT_COMPLETE;await loadAuthenticatedAccount();});
}
function renderPasswordResetComplete(){
  app.innerHTML=authCard('密码已重新设置完成','您的 LEGAVIK 登录密码已成功更新。您现在可以返回 LEGAVIK 网站，使用新密码重新登录。',`<a class="primary-link" href="${canonicalAccountUrl('login',{reset_flow:'1'})}">返回 LEGAVIK 登录</a>`,{standalone:true});
}
function renderRecoveryLinkFailure(){
  const text=state.recoveryFailureTemporary?'暂时无法验证密码重置链接，请检查网络后重试。':'此密码重置链接已失效，请重新申请密码重置邮件。';
  const action=state.recoveryFailureTemporary?'<button id="retry-recovery">重新验证</button>':'<button id="request-recovery">重新申请密码重置</button>';
  app.innerHTML=authCard('无法使用此密码重置链接',text,action);
  bind('#retry-recovery','click',()=>initializeRecoveryCallback());
  bind('#request-recovery','click',()=>{state.recoveryEmailSent=false;setStage(AUTH_STAGES.FORGOT_PASSWORD);});
}
function renderForgot(){
  const sent=state.recoveryEmailSent?message('密码重置请求已提交。请检查您的邮箱，并按照邮件提示设置新密码。','success'):'';
  app.innerHTML=authCard('忘记密码','输入注册邮箱，我们会发送安全的密码重置邮件。',`<form id="forgot-form"><label>注册邮箱<input id="email" type="email" autocomplete="email" value="${esc(state.email)}" required></label>${sent}<div id="form-message"></div><button type="submit" data-email-action data-ready-label="${state.recoveryEmailSent?'重新发送':'发送重置邮件'}">${state.recoveryEmailSent?'重新发送':'发送重置邮件'}</button><p class="send-status" data-send-status aria-live="polite">${state.recoveryEmailSent?'密码重置邮件已发送，请检查您的邮箱。':''}</p></form><div class="auth-links"><button id="login" class="link-button">返回登录</button></div>`);updateCooldownUI();
  bind('#forgot-form','submit',async event=>{event.preventDefault();if(duringCooldown()||!beginRequest())return;state.email=document.querySelector('#email').value.trim();const button=event.submitter,status=document.querySelector('[data-send-status]');startCooldown();button.setAttribute('aria-busy','true');if(status)status.textContent='正在发送密码重置邮件…';const {error}=await supabase.auth.resetPasswordForEmail(state.email,{redirectTo:recoveryCallbackUrl});endRequest();button.removeAttribute('aria-busy');if(error){resetCooldown();state.recoveryEmailSent=false;if(status)status.textContent='';showFormError(friendly(error,'recovery-request'));return;}state.recoveryEmailSent=true;renderForgot();});
  bind('#login','click',()=>setStage(AUTH_STAGES.LOGIN));
}
async function ensureProfile(){
  const {data:{user},error}=await supabase.auth.getUser();
  if(error)throw error;
  if(!user)return null;
  const {data,error:profileError}=await supabase.from('profiles').select('user_id,email,email_verified,username').eq('user_id',user.id).maybeSingle();
  if(profileError)throw profileError;
  if(!data)throw new Error('账户资料尚未完成初始化，请稍后重试。');
  state.profile=data;return data;
}
async function fetchCenter(){
  const [maps,versions,materials,orders,reviews,evidence]=await Promise.all([
    supabase.from('recovery_maps').select('id,recovery_map_id,display_name,plan,status,lifecycle_state,published_at,current_version_id,created_at,updated_at').eq('lifecycle_state','PUBLISHED').eq('status','PUBLISHED').order('published_at',{ascending:false}),
    supabase.from('recovery_map_versions').select('id,recovery_map_id,version_id,version_number,snapshot_id,status,published_at,created_at').order('version_number',{ascending:false}),
    supabase.from('recovery_materials').select('*').order('created_at',{ascending:false}),
    supabase.from('orders').select('*').order('created_at',{ascending:false}),
    supabase.from('annual_reviews').select('*').order('created_at',{ascending:false}),
    supabase.from('recovery_evidence_events').select('recovery_map_version_id,event_type,result,occurred_at').in('event_type',['MAINNET_PUBLISHED','INITIAL_RECOVERY_VERIFICATION','ONLINE_RECOVERY']).order('occurred_at',{ascending:false})
  ]);
  const failure=[maps,versions,materials,orders,reviews,evidence].find(result=>result.error);if(failure)throw failure.error;
  const byMap=versions.data.reduce((result,item)=>{const history=result.get(item.recovery_map_id)??[];history.push(item);result.set(item.recovery_map_id,history);return result;},new Map()),formalMaps=maps.data.map(item=>{const history=byMap.get(item.id)??[],candidate={...item,versions:history};return{...candidate,current_version:authoritativeCurrentVersion(candidate)};}).filter(item=>item.current_version);
  return Object.freeze({maps:formalMaps,materials:customerVisibleMaterials(materials.data),orders:orders.data,reviews:reviews.data,evidence:evidence.data,profile:state.profile});
}
const centerLabels={overview:'总览',maps:'我的 Recovery Map',materials:'恢复与凭证',reviews:'恢复维护',orders:'我的方案与订单',support:'帮助与客服',security:'账户与安全'};
function empty(text,button=''){return `<div class="empty-state"><p>${text}</p>${button}</div>`;}
function displayDate(value,withTime=false){if(!value)return '尚无记录';const date=new Date(value);if(Number.isNaN(date.getTime()))return '尚无记录';const parts=new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',...(withTime?{hour:'2-digit',minute:'2-digit',hourCycle:'h23'}:{})}).formatToParts(date),get=type=>parts.find(part=>part.type===type)?.value;return `${get('year')}/${get('month')}/${get('day')}${withTime?` ${get('hour')}:${get('minute')}`:''}`;}
function recentActivities(data){return[...data.maps.flatMap(item=>{const verification=recoveryStatus(item,data);return[{label:`Recovery Map V${item.current_version.version_number} 已更新`,at:currentVersionPublishedAt(item)},...(verification.verified?[{label:'当前版本恢复验证已通过',at:verification.lastVerifiedAt}]:[])];}),...data.reviews.filter(item=>item.last_reviewed_at).map(item=>({label:'恢复维护检查已完成',at:item.last_reviewed_at}))].filter(item=>item.at).sort((left,right)=>new Date(right.at)-new Date(left.at)).slice(0,5);}
function mapName(item){return item.display_name||`Recovery Map ${item.recovery_map_id.slice(-8)}`;}
function currentVersionLabel(item){return item.current_version?`V${item.current_version.version_number}`:'尚无已发布版本';}
function currentVersionPublishedAt(item){return item.current_version?.published_at||item.updated_at||item.published_at;}
function updateRecoveryMapUrl(item,version=item.current_version){if(!mayUpdateRecoveryVersion(item,version))return null;return canonicalRecoveryUrl('version-update',{mode:'version-update',map_row_id:item.id,recovery_map_id:item.recovery_map_id,version_row_id:version.id,version_id:version.version_id,version_number:String(version.version_number),snapshot_id:version.snapshot_id});}
function recoveryCenterUrl(item,version=item.current_version){return canonicalRecoveryUrl('recovery-center',{map_row_id:item.id,recovery_map_id:item.recovery_map_id,version_row_id:version.id,version_id:version.version_id,version_number:String(version.version_number)});}
function recoveryStatus(item,data){return currentRecoveryVerification(item,data.evidence);}
function recoveryStatusCard(item,data){const status=recoveryStatus(item,data);return `<section class="recovery-verification"><div><p class="eyebrow">RECOVERY VERIFICATION</p><h3>恢复验证：${status.verified?'已通过':'尚未验证'}</h3></div><dl><dt>当前版本</dt><dd>V${status.version}</dd><dt>最近通过时间</dt><dd>${status.lastVerifiedAt?displayDate(status.lastVerifiedAt,true):'尚无记录'}</dd></dl></section>`;}
function versionHistory(item){return `<section class="version-history"><p class="eyebrow">VERSION HISTORY</p><h2>版本记录</h2><div>${item.versions.map(version=>{const current=mayUpdateRecoveryVersion(item,version);return `<article><div><strong>V${version.version_number}</strong><span>${current?'Current':'Historical'}</span></div><p>${current?'更新时间':'创建/发布时间'}：<time datetime="${esc(version.published_at)}">${displayDate(version.published_at,true)}</time></p>${current?`<div class="version-actions"><a class="quiet-action" href="${esc(recoveryCenterUrl(item,version))}">进入我的恢复中心</a><a class="quiet-action" href="${esc(updateRecoveryMapUrl(item,version))}">更新 Recovery Map</a></div>`:'<p class="historical-version-note">历史版本不可更新</p>'}</article>`;}).join('')}</div></section>`;}
function hasMaterial(materials,kind){return materials.some(item=>kind==='kit'?/RECOVERY.?KIT/i.test(item.material_type||item.filename||''):/MAINNET.*EVIDENCE/i.test(item.material_type||item.filename||''));}
function materialStatus(data,latest){const currentMaterials=latest?data.materials.filter(item=>item.recovery_map_version_id===latest.current_version.id):[],publication=latest&&data.evidence.some(item=>item.recovery_map_version_id===latest.current_version.id&&item.event_type==='MAINNET_PUBLISHED'&&String(item.result).toUpperCase()==='PASS'),kit=publication||hasMaterial(currentMaterials,'kit'),evidence=publication||hasMaterial(currentMaterials,'evidence');return{kit,evidence,label:kit&&evidence?'已生成':kit||evidence?'生成记录不完整':'暂无生成记录'};}
function statusSummary(title,value,detail,action){return`<article class="status-summary"><div><p class="eyebrow">${title}</p><strong>${value}</strong><p>${detail}</p></div><button data-section-link="${action.section}">${action.label}</button></article>`;}
function centerContent(data){
  const latest=data.maps[0],review=data.reviews[0],materials=materialStatus(data,latest),activities=recentActivities(data),verification=latest?recoveryStatus(latest,data):null,currentYear=new Date().getFullYear(),currentPlan=latest?.plan&&latest.plan!=='未指定'?latest.plan:'尚未确认';
  if(state.section==='overview')return `<div class="dashboard-heading"><p class="eyebrow">CUSTOMER DASHBOARD</p><h1>总览</h1><p>查看当前 LEGAVIK 恢复准备状态。</p></div><div class="overview-sections">${statusSummary('CURRENT RECOVERY MAP',latest?currentVersionLabel(latest):'尚未创建',latest?`最近更新：${displayDate(currentVersionPublishedAt(latest))} · 恢复验证：${verification.verified?'已通过':'尚未验证'}${verification.lastVerifiedAt?` · ${displayDate(verification.lastVerifiedAt,true)}`:''}`:'尚无已发布的 Recovery Map。',{section:'maps',label:'查看 Recovery Map'})}${statusSummary('RECOVERY REVIEW',review?.status??'尚未开始',review?.last_reviewed_at?`最近检查：${displayDate(review.last_reviewed_at)}`:`${currentYear} 年尚无恢复维护检查记录。`,{section:'reviews',label:'查看维护状态'})}${statusSummary('CURRENT PLAN',currentPlan,'方案状态与付款订单分别显示；Recovery Map 版本不代表付款订单。',{section:'orders',label:'查看方案与订单'})}</div><section class="activity-list"><p class="eyebrow">RECENT ACTIVITY</p><h2>最近活动</h2>${activities.length?`<ol>${activities.map(item=>`<li><strong>${esc(item.label)}</strong><time datetime="${esc(item.at)}">${displayDate(item.at,true)}</time></li>`).join('')}</ol>`:empty('当前没有可显示的客户活动。')}</section>`;
  if(state.section==='maps')return `<div class="dashboard-heading"><p class="eyebrow">MY RECOVERY MAP</p><h1>我的 Recovery Map</h1><p>一个 Recovery Map，包含一个当前版本和完整历史记录。</p></div>${latest?`<div class="record-list lifecycle-map-list">${data.maps.map(item=>`<article data-map-card="${esc(item.id)}"><header><div><h2>${esc(mapName(item))}</h2><p>当前版本：<strong>${currentVersionLabel(item)}</strong></p></div><span class="status-pill">Current</span></header><p>最近更新时间：${displayDate(currentVersionPublishedAt(item),true)}</p>${recoveryStatusCard(item,data)}${versionHistory(item)}</article>`).join('')}</div>`:empty('您还没有已成功发布的 Recovery Map。')}`;
  if(state.section==='materials')return `<div class="dashboard-heading"><p class="eyebrow">RECOVERY & CREDENTIALS</p><h1>恢复与凭证</h1><p>${latest?`当前 Recovery Map：${currentVersionLabel(latest)}`:'尚无已发布的 Recovery Map'}</p></div><p class="security-note">Recovery Kit 和 Mainnet Recovery Evidence 共同组成恢复凭证套件，是恢复对应 Recovery Map 的重要文件。恢复时还需要对应版本的 Recovery Password。请长期妥善保管这些恢复材料，并将恢复凭证套件与 Recovery Password 分开、可靠保存，避免把完整恢复条件集中在同一位置。LEGAVIK 不保存客户的 Recovery Kit、Mainnet Recovery Evidence 或 Recovery Password，因此无法代替客户重新取得完整恢复条件。</p><div class="material-status-grid"><article><h2>Recovery Kit</h2><strong>${materials.kit?'已生成':'暂无生成记录'}</strong></article><article><h2>Mainnet Recovery Evidence</h2><strong>${materials.evidence?'已生成':'暂无生成记录'}</strong></article></div><section class="independent-recovery"><p class="eyebrow">EMERGENCY OPTION</p><h2>独立恢复</h2><p>正常情况下请优先使用“我的恢复中心”。独立恢复用于平台正常入口不可用时的应急准备。</p><div><a class="tertiary-link" download href="./LEGAVIK-Independent-Recovery-Tool-V1.html">下载独立恢复工具</a><button class="tertiary-link" data-independent-explanation>查看独立恢复说明</button></div></section>`;
  if(state.section==='orders')return `<div class="dashboard-heading"><p class="eyebrow">PLAN & ORDERS</p><h1>我的方案与订单</h1></div><section class="current-plan"><p class="eyebrow">CURRENT PLAN / SERVICE ENTITLEMENT</p><h2>${esc(currentPlan)}</h2><p>方案能力来自当前正式服务记录，不由 Recovery Map 版本推断。</p></section><section class="order-history"><p class="eyebrow">ORDER HISTORY</p><h2>付款订单记录</h2>${data.orders.length?`<div class="record-list">${data.orders.map(item=>`<article><h3>${esc(item.order_number||item.plan||'服务订单')}</h3><p>${esc(item.plan||'服务')} · ${Number.isFinite(Number(item.amount_minor))?`${(Number(item.amount_minor)/100).toFixed(2)} ${esc(item.currency||'')}`:'金额待确认'} · ${esc(item.payment_status||item.status||'状态待确认')}</p><time datetime="${esc(item.created_at||'')}">${displayDate(item.created_at)}</time></article>`).join('')}</div>`:empty('暂无付款订单记录')}</section>`;
  if(state.section==='reviews')return `<div class="dashboard-heading"><p class="eyebrow">RECOVERY MAINTENANCE</p><h1>恢复维护</h1><p>Recovery Review 将在下一阶段接入；本页仅显示已有维护记录。</p></div><section class="annual-current"><h2>${currentYear} 年状态</h2><strong>${review?.status??'尚未开始'}</strong><p>${review?.last_reviewed_at?`最近检查：${displayDate(review.last_reviewed_at)}`:'今年尚无恢复维护检查记录。'}</p></section>${data.reviews.length?`<div class="record-list annual-history">${data.reviews.map(item=>`<article><h2>${esc(item.status||'状态未标注')}</h2><p>记录日期：${item.last_reviewed_at?displayDate(item.last_reviewed_at):'尚未完成'}</p></article>`).join('')}</div>`:empty('当前没有恢复维护记录。')}`;
  if(state.section==='support')return `<div class="support-placeholder"><p class="eyebrow">HELP & SUPPORT</p><h1>帮助与客服</h1><p>知识库是当前正式帮助内容来源。未来智能助手将基于同一知识源回答，并在需要时转人工支持。</p><div><a class="primary-link" href="../v3-crypto/index.html#about">联系客服支持</a></div></div>`;
  return `<div class="dashboard-heading"><p class="eyebrow">ACCOUNT & SECURITY</p><h1>账户与安全</h1></div><section class="center-card"><dl><dt>${customerBrand.name} 账户</dt><dd>${esc(state.session.user.email)}</dd><dt>邮箱状态</dt><dd>${state.session.user.email_confirmed_at?'已验证':'未验证'}</dd></dl><p class="security-note">登录密码用于登录 LEGAVIK。Recovery Password 用于恢复 Recovery Map。两者相互独立；修改登录密码不会修改 Recovery Password。</p><div class="security-actions"><button id="change-password">修改登录密码</button></div></section>`;
}
async function renderCenter(){
  app.innerHTML=shell('<section class="loading">正在安全读取您的账户数据…</section>');
  try{if(!state.profile)await withTimeout(ensureProfile(),ACCOUNT_INIT_TIMEOUT_MS,'PROFILE_LOAD');const data=await withTimeout(fetchCenter(),ACCOUNT_INIT_TIMEOUT_MS,'CENTER_DATA_LOAD');state.profile=data.profile;app.innerHTML=shell(`<div class="center-layout"><aside class="center-sidebar"><h2>客户中心</h2>${Object.entries(centerLabels).map(([id,label])=>`<button data-section="${id}" class="${state.section===id?'active':''}">${label}</button>`).join('')}<div class="aside-footer"><button data-section="support">帮助与客服</button><button id="logout">退出登录</button></div></aside><section class="center-main">${centerContent(data)}</section></div><div id="center-overlay"></div>`);document.querySelectorAll('[data-section],[data-section-link]').forEach(button=>button.onclick=()=>{state.section=button.dataset.section||button.dataset.sectionLink;renderCenter();});bind('#logout','click',async()=>{await supabase.auth.signOut();state.session=null;state.profile=null;setStage(AUTH_STAGES.LOGIN);});bind('#change-password','click',()=>passwordForm('修改登录密码','设置新的 LEGAVIK 登录密码。','change'));bind('[data-independent-explanation]','click',()=>{const overlay=document.querySelector('#center-overlay');overlay.innerHTML='<div class="center-explanation-backdrop"><section class="center-explanation" role="dialog" aria-modal="true" aria-labelledby="independent-title"><button class="center-explanation-close" aria-label="关闭">×</button><p class="eyebrow">INDEPENDENT RECOVERY</p><h2 id="independent-title">什么是独立恢复？</h2><p>独立恢复是在 LEGAVIK 正常在线入口不可用时使用的应急方式。正常情况下，请优先进入“我的恢复中心”。</p><p>使用独立恢复仍需同一版本的 Recovery Kit、Mainnet Recovery Evidence 与 Recovery Password。工具本身不包含您的 Recovery Map 明文或 Recovery Password。</p></section></div>';overlay.querySelector('.center-explanation-close').onclick=()=>overlay.replaceChildren();});}catch(error){renderAccountLoadFailure();}
}
function renderPaymentPending(){const identity=state.profile?.username||state.session.user.email.split('@')[0],displayedPrice=purchase.currency&&purchase.price?`${purchase.currency} ${purchase.currency==='USD'?'US$':'A$'}${Number(purchase.price).toLocaleString('en-US')}`:'尚未提供';app.innerHTML=shell(`<section class="auth-layout"><div class="auth-card payment-pending"><p class="eyebrow">PURCHASE · NEXT STEP</p><h1>付款流程待接入</h1><p>您的身份与套餐选择已安全关联。真实付款服务将在下一阶段接入；当前不会创建订单、不会标记付款成功，也不会进入付费创建流程。</p><dl><dt>套餐</dt><dd>${esc(purchase.plan||'尚未选择')}</dd><dt>显示价格</dt><dd>${esc(displayedPrice)}</dd><dt>用户名</dt><dd>${esc(identity)}</dd><dt>邮箱</dt><dd>${esc(state.session.user.email)}</dd></dl><a class="secondary-link" href="${recoveryMapPurchaseUrl}">返回产品与服务</a></div></section>`);}
function continueTestPurchase(){location.replace(canonicalCreateUrl({test_recovery_map:'1'})+'#accounts');}
async function loadAuthenticatedAccount(){state.profile=await withTimeout(ensureProfile(),ACCOUNT_INIT_TIMEOUT_MS,'PROFILE_LOAD');const credentialState=state.session?.user?.user_metadata?.skrek_account_state??'';state.authStage=resolveAuthenticatedStage({stage:state.authStage,hasSession:true,credentialState});if(state.authStage===AUTH_STAGES.ACCOUNT_COMPLETE){await withTimeout(Promise.allSettled([retryPendingPublishedLifecycleSync(),retryPendingPublishedVersionSync()]),PENDING_SYNC_BUDGET_MS,'PENDING_METADATA_SYNC').catch(()=>{});if(purchase.active){if(testRecoveryMap)return continueTestPurchase();return renderPaymentPending();}return renderCenter();}render();}
async function initializeRecoveryCallback(){
  state.processingRecoveryCredential=true;
  const result=await verifyRecoveryCallback({auth:supabase.auth,search:location.search,href:location.href,history});
  state.processingRecoveryCredential=false;
  if(!result.handled)return false;
  if(result.error){state.session=null;state.recoveryFailureTemporary=isTemporaryRecoveryFailure(result.error);state.authStage=AUTH_STAGES.RECOVERY_LINK_FAILURE;render();return true;}
  state.session=result.session;state.recoveryIntent=true;state.recoveryFailureTemporary=false;state.authStage=AUTH_STAGES.PASSWORD_RECOVERY_SESSION;render();return true;
}
async function loadSession(){if(recoveryCallback.present&&await initializeRecoveryCallback())return;const requested=stageFromLocation({hash:location.hash,search:location.search,href:location.href});state.authStage=requested;const {data:{session},error}=await supabase.auth.getSession();if(error){state.session=null;state.authStage=state.recoveryIntent?AUTH_STAGES.RESET_PASSWORD:AUTH_STAGES.LOGIN;return render();}state.session=session;if(session){if(state.recoveryIntent){cleanSuccessfulRecoveryUrl({href:location.href,history});state.authStage=AUTH_STAGES.RESET_PASSWORD;return render();}if(purchase.active&&testRecoveryMap)return continueTestPurchase();return loadAuthenticatedAccount();}state.authStage=resolveAuthenticatedStage({stage:requested,hasSession:false});render();}
function render(){
  if(!configured){app.innerHTML=authCard('账户服务尚未配置','缺少公开的 Supabase 项目配置。','');return;}
  if(state.authStage===AUTH_STAGES.SET_PASSWORD)return passwordForm('完成账户设置','您的账户设置尚未完成。请设置您自己的 LEGAVIK 登录密码。','historical');
  if(state.authStage===AUTH_STAGES.PASSWORD_RECOVERY_SESSION||state.authStage===AUTH_STAGES.RESET_PASSWORD)return passwordForm('设置新密码','请输入新的 LEGAVIK 登录密码。','reset');
  if(state.authStage===AUTH_STAGES.PASSWORD_RESET_COMPLETE)return renderPasswordResetComplete();
  if(state.authStage===AUTH_STAGES.RECOVERY_LINK_FAILURE)return renderRecoveryLinkFailure();
  if(state.authStage===AUTH_STAGES.NEW_SIGNUP)return renderSignup();
  if(state.authStage===AUTH_STAGES.VERIFICATION_PENDING)return renderVerify();
  if(state.authStage===AUTH_STAGES.HISTORICAL_VERIFICATION_PENDING)return renderVerify({historical:true});
  if(state.authStage===AUTH_STAGES.FORGOT_PASSWORD)return renderForgot();
  if(state.authStage===AUTH_STAGES.ACCOUNT_COMPLETE&&state.session)return renderCenter();
  return renderLogin();
}

if(configured){supabase.auth.onAuthStateChange((event,session)=>{if(state.processingRecoveryCredential)return;state.session=session;if(event==='PASSWORD_RECOVERY'||(state.recoveryIntent&&session&&(event==='SIGNED_IN'||event==='INITIAL_SESSION'))){state.recoveryIntent=true;state.authStage=AUTH_STAGES.PASSWORD_RECOVERY_SESSION;queueMicrotask(render);}else if(event==='SIGNED_OUT'){state.session=null;state.profile=null;if(state.authStage!==AUTH_STAGES.PASSWORD_RESET_COMPLETE)state.authStage=AUTH_STAGES.LOGIN;queueMicrotask(render);}});}
state.authStage=stageFromLocation({hash:location.hash,search:location.search,href:location.href});
try{await withTimeout(loadSession(),ACCOUNT_INIT_TIMEOUT_MS,'ACCOUNT_SESSION_INIT');}catch{renderAccountLoadFailure();}
