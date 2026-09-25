import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  AUTH_STAGES,
  accountKindFromMetadata,
  authErrorMessage,
  hasRecoveryIntent,
  resolveAuthenticatedStage,
  stageFromLocation
} from '../../src/account/auth-state-machine.js';

const app=readFileSync(new URL('../../src/account/supabase-account-app.js',import.meta.url),'utf8');
const authUx=readFileSync(new URL('../../web/account/auth-ux.css',import.meta.url),'utf8');
const block=(start,end)=>app.slice(app.indexOf(start),app.indexOf(end,app.indexOf(start)));

test('new signup is password-first and never generates a temporary credential',()=>{
  const signup=block('function renderSignup()','function renderExistingAccount()');
  assert.match(signup,/id:'password'/);
  assert.match(signup,/id:'confirm'/);
  assert.match(signup,/validatePasswordPair\(password,confirm\)/);
  assert.match(signup,/if\(validationError\)\{showFormError\(validationError\);return;}/);
  assert.match(signup,/auth\.signUp\(\{email,password,/);
  assert.match(signup,/ACCOUNT_COMPLETE_PENDING_VERIFICATION/);
  assert.doesNotMatch(app,/temporaryPassword|crypto\.getRandomValues/);
  assert.equal((signup.match(/auth\.signUp\(/g)??[]).length,1);
});

test('signup and reset share one password contract and clear stale errors on edit',()=>{
  assert.match(app,/import \{PASSWORD_POLICY_COPY,validatePasswordPair\} from '\.\/password-policy\.js'/);
  assert.match(app,/function passwordPolicyChecklist\(\)/);
  assert.match(app,/function bindPasswordPolicyUI\(\)/);
  assert.match(app,/password\.addEventListener\('input',clearFormMessage\)/);
  assert.match(app,/confirmation\.addEventListener\('input',clearFormMessage\)/);
  assert.doesNotMatch(app,/function validPassword/);
});

test('password policy UI is one line and Auth notices share one auxiliary type scale',()=>{
  assert.match(app,/return `<p class="password-policy" data-password-policy>\$\{PASSWORD_POLICY_COPY\}<\/p>`/);
  assert.doesNotMatch(app,/data-policy-rule|policy-met/);
  assert.match(authUx,/\.auth-card > p:not\(\.eyebrow\),[\s\S]*\.auth-card \.form-message,[\s\S]*\.auth-card \.send-status,[\s\S]*\.auth-card \.password-policy[\s\S]*font-size: 14px/);
  assert.doesNotMatch(authUx,/\.password-policy ul|\.password-policy li/);
});

test('new account cannot become complete before signup OTP verification',()=>{
  assert.equal(resolveAuthenticatedStage({stage:AUTH_STAGES.VERIFICATION_PENDING,hasSession:false,credentialState:'ACCOUNT_COMPLETE_PENDING_VERIFICATION'}),AUTH_STAGES.VERIFICATION_PENDING);
  const verify=block('function renderVerify','function passwordForm');
  assert.match(verify,/verifyOtp\(\{email:state\.email,token,type:historical\?'email':'signup'\}\)/);
  assert.match(verify,/skrek_account_state:'COMPLETE'/);
  assert.match(verify,/state\.authStage=AUTH_STAGES\.ACCOUNT_COMPLETE;await loadAuthenticatedAccount\(\)/);
  assert.match(verify,/if\(historical\)[\s\S]*SET_PASSWORD[\s\S]*return;}const \{data:updated[\s\S]*ACCOUNT_COMPLETE/);
});

test('completed signup is guided to login while historical setup requires ownership verification',()=>{
  const existing=block('function renderExistingAccount','async function requestHistoricalVerification');
  assert.match(existing,/该邮箱已有 LEGAVIK 账户，请直接登录/);
  assert.match(existing,/前往登录/);
  const historical=block('async function requestHistoricalVerification','function renderVerify');
  assert.match(historical,/signInWithOtp/);
  assert.match(historical,/shouldCreateUser:false/);
  assert.equal(accountKindFromMetadata({skrek_account_state:'PASSWORD_REQUIRED'}),'INCOMPLETE_HISTORICAL_ACCOUNT');
  assert.equal(resolveAuthenticatedStage({stage:AUTH_STAGES.LOGIN,hasSession:true,credentialState:'PASSWORD_REQUIRED'}),AUTH_STAGES.SET_PASSWORD);
});

test('historical account password creation completes without a username gate',()=>{
  const password=block('function passwordForm','function renderPasswordResetComplete');
  assert.match(password,/mode==='historical'/);
  assert.match(password,/skrek_account_state:'COMPLETE'/);
  assert.match(password,/state\.authStage=AUTH_STAGES\.ACCOUNT_COMPLETE;await loadAuthenticatedAccount\(\)/);
  assert.doesNotMatch(app,/renderAccountCompletion|completion-form|claim_username/);
});

test('real recovery callback shapes have irreversible recovery priority',()=>{
  for(const location of [
    {hash:'#reset-password'},
    {search:'?auth_action=recovery&code=abc'},
    {href:'https://example.test/account#access_token=x&type=recovery'}
  ]){
    assert.equal(hasRecoveryIntent(location),true);
    assert.equal(stageFromLocation(location),AUTH_STAGES.RESET_PASSWORD);
  }
  assert.equal(resolveAuthenticatedStage({stage:AUTH_STAGES.RESET_PASSWORD,hasSession:true,credentialState:'COMPLETE'}),AUTH_STAGES.RESET_PASSWORD);
  assert.equal(resolveAuthenticatedStage({stage:AUTH_STAGES.PASSWORD_RECOVERY_SESSION,hasSession:true,credentialState:'COMPLETE'}),AUTH_STAGES.PASSWORD_RECOVERY_SESSION);
});

test('recovery email targets an explicit stable recovery intent and cannot route to Forgot or Center',()=>{
  const forgot=block('function renderForgot','async function ensureProfile');
  assert.match(forgot,/resetPasswordForEmail/);
  assert.match(app,/auth_action=recovery#reset-password/);
  const load=block('async function loadSession','function render()');
  assert.match(load,/if\(state\.recoveryIntent\)\{cleanSuccessfulRecoveryUrl\(\{href:location\.href,history\}\);state\.authStage=AUTH_STAGES\.RESET_PASSWORD;return render\(\);\}/);
  assert.doesNotMatch(load,/FORGOT_PASSWORD/);
  assert.match(load,/return loadAuthenticatedAccount\(\)/);
});

test('token-hash recovery is verified before generic session routing',()=>{
  assert.match(app,/recoveryCallback\.present&&await initializeRecoveryCallback\(\)/);
  assert.match(app,/verifyRecoveryCallback\(\{auth:supabase\.auth/);
  assert.match(app,/PASSWORD_RECOVERY_SESSION/);
  assert.match(app,/RECOVERY_LINK_FAILURE/);
  assert.doesNotMatch(app,/localStorage|sessionStorage|indexedDB/i);
});

test('completed existing signup stays inline with the approved notice',()=>{
  const signup=block('function renderSignup()','function renderExistingAccount()');
  assert.match(signup,/该邮箱已经注册使用，请重新登录。/);
  assert.match(signup,/showFormNotice\('该邮箱已经注册使用，请重新登录。'\)/);
  assert.doesNotMatch(signup,/state\.notice='该邮箱已经注册使用|setStage\(AUTH_STAGES\.LOGIN\);return;}startCooldown/);
  assert.doesNotMatch(signup,/renderExistingAccount\(\)/);
});

test('successful reset enters a dedicated completion state without auto-login',()=>{
  const password=block('function passwordForm','function renderPasswordResetComplete');
  assert.match(password,/state\.authStage=AUTH_STAGES\.PASSWORD_RESET_COMPLETE/);
  assert.match(password,/await supabase\.auth\.signOut\(\)/);
  const completion=block('function renderPasswordResetComplete','function renderForgot');
  assert.match(completion,/密码已重新设置完成/);
  assert.match(completion,/返回 LEGAVIK 登录/);
  assert.match(completion,/canonicalAccountUrl\('login',\{reset_flow:'1'\}\)/);
  assert.match(completion,/\{standalone:true\}/);
  assert.doesNotMatch(completion,/login-form|renderCenter|signIn/);
});

test('reset completion enters a focused login while normal login keeps the site shell',()=>{
  const login=block('function renderLogin()','function renderSignup()');
  assert.match(login,/query\.get\('reset_flow'\)==='1'/);
  assert.match(login,/\{standalone:resetFlow\}/);
  assert.match(login,/返回 LEGAVIK 官网/);
  assert.match(login,/resetFlow\?'':\'进入您的客户中心。\'/);
  assert.match(login,/resetFlow\?.*返回 LEGAVIK 官网.*忘记密码.*创建账户/s);
  assert.doesNotMatch(login,/resetFlow\?.*忘记密码.*返回 LEGAVIK 官网/s);
});

test('only the active email recovery password form uses the standalone shell',()=>{
  const password=block('function passwordForm','function renderPasswordResetComplete');
  assert.match(password,/\{standalone:mode==='reset'\}/);
  assert.match(app,/function authCard\(title,intro,body,\{standalone=false\}=\{\}\)/);
  assert.match(app,/return standalone\?`<main>\$\{content\}<\/main>`:shell\(content\)/);
  assert.match(password,/mode==='historical'/);
  assert.match(app,/passwordForm\('修改登录密码'[^\n]+,'change'\)/);
});

test('OTP and reset sends enforce one request, in-flight guard and visible 60-second cooldown',()=>{
  assert.match(app,/cooldownUntil=Date\.now\(\)\+60000/);
  assert.match(app,/重新发送（\$\{seconds\}s）/);
  assert.match(app,/if\(duringCooldown\(\)\|\|!beginRequest\(\)\)return/);
  const resend=block("bind('#resend'","bind('#change'");
  assert.equal((resend.match(/auth\.resend\(/g)??[]).length,1);
  assert.match(resend,/startCooldown\(\)/);
  assert.match(resend,/新的验证码已发送，请使用最新收到的验证码/);
  const forgot=block("bind('#forgot-form'", "bind('#login'",);
  assert.equal((forgot.match(/resetPasswordForEmail\(/g)??[]).length,1);
  assert.match(forgot,/startCooldown\(\)[\s\S]*resetPasswordForEmail/);
  assert.match(forgot,/if\(error\)\{resetCooldown\(\)/);
  assert.doesNotMatch(forgot,/如果这是您的 SKREK 注册邮箱|该邮箱未注册/);
  assert.match(app,/密码重置请求已提交。请检查您的邮箱，并按照邮件提示设置新密码。/);
  assert.doesNotMatch(app,/如果几分钟后仍未收到邮件/);
});

test('countdown has one visible seconds source and buttons expose interaction feedback',()=>{
  assert.equal((app.match(/\$\{seconds\}/g)??[]).length,1);
  assert.doesNotMatch(app,/秒后可重新发送/);
  assert.match(authUx,/button:hover/);
  assert.match(authUx,/button:active/);
  assert.match(authUx,/aria-busy="true"/);
});

test('signup, login and reset password fields provide accessible visibility controls',()=>{
  assert.match(app,/function passwordField/);
  assert.match(app,/data-password-toggle/);
  assert.match(app,/aria-pressed="false"/);
  assert.match(app,/input\.type=show\?'text':'password'/);
  assert.match(app,/data-eye="closed"/);
  assert.match(app,/data-eye="open"/);
  assert.match(authUx,/\.eye-open \{ display: none/);
  assert.match(authUx,/aria-pressed="true".*\.eye-open/);
  assert.match(authUx,/\.password-toggle/);
});

test('reset submission validates locally, always releases lock and preserves retry evidence',()=>{
  const password=block('function passwordForm','function renderPasswordResetComplete');
  assert.match(password,/validateNewPassword\(password,confirm\)/);
  assert.match(password,/if\(validationError\)\{showFormError\(validationError\);return;}/);
  assert.match(password,/finally\{endRequest\(\);setLoading\(button,false\);}/);
  assert.match(password,/classifyPasswordUpdateError\(error\)/);
  assert.match(password,/hasSession:Boolean\(state\.session\)/);
  assert.match(password,/recoverySession:mode==='reset'&&state\.recoveryIntent/);
  assert.match(password,/attempt:state\.resetSubmitAttempts/);
});

test('logout clears authenticated state and normal login remains password-based',()=>{
  assert.match(app,/signInWithPassword\(\{email:[^}]+password:/);
  assert.match(app,/SIGNED_OUT[\s\S]*state\.session=null;state\.profile=null/);
  assert.match(app,/persistSession:true/);
});

test('customer-safe errors distinguish OTP, login, recovery and network failures',()=>{
  assert.equal(authErrorMessage({message:'Invalid login credentials'},{context:'login'}),'邮箱或密码不正确。');
  assert.match(authErrorMessage({message:'Incorrect OTP code'},{context:'otp'}),/不正确/);
  assert.match(authErrorMessage({message:'Token has expired'},{context:'otp'}),/失效/);
  assert.doesNotMatch(authErrorMessage({message:'Token is invalid'},{context:'otp'}),/失效/);
  assert.match(authErrorMessage({message:'Network request failed'}),/网络/);
  assert.equal(authErrorMessage({message:'Password is too weak and needs more characters'}),'密码至少10位，并同时包含大写字母、小写字母、数字和特殊字符。');
  assert.equal(authErrorMessage({message:'internal diagnostic detail'}),'操作未完成，请稍后重试。');
});
