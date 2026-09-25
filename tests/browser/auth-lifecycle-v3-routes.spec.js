import {test,expect} from '@playwright/test';

const account='/web/account/index.html';

async function openMockRecovery(page,onUserUpdate){
  const user={id:'00000000-0000-4000-8000-000000000099',aud:'authenticated',role:'authenticated',email:'reset-test@example.invalid',user_metadata:{skrek_account_state:'COMPLETE'}};
  await page.route('**/auth/v1/verify',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({access_token:'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJleHAiOjQxMDI0NDQ4MDB9.',refresh_token:'synthetic-retry-refresh',expires_in:3600,token_type:'bearer',user})}));
  await page.route('**/auth/v1/user',async route=>onUserUpdate(route,user));
  await page.route('**/auth/v1/logout**',async route=>route.fulfill({status:204,body:''}));
  await page.goto(`${account}?token_hash=retry-test-token&type=recovery&auth_action=recovery#reset-password`);
  await expect(page.getByRole('heading',{name:'设置新密码'})).toBeVisible();
}

test('new signup is visibly password-first',async({page})=>{
  await page.goto(`${account}#signup`);
  await expect(page.getByRole('heading',{name:'创建 SKREK 账户'})).toBeVisible();
  await expect(page.getByLabel('邮箱地址')).toBeVisible();
  await expect(page.getByLabel('密码',{exact:true})).toBeVisible();
  await expect(page.locator('#confirm')).toBeVisible();
  await expect(page.getByRole('button',{name:'获取验证码'})).toBeVisible();
  await expect(page.getByText('密码至少10位，并同时包含大写字母、小写字母、数字和特殊字符。')).toHaveCount(1);
  await expect(page.locator('[data-policy-rule]')).toHaveCount(0);
  await expect(page.getByLabel('用户名')).toHaveCount(0);
});

test('Auth helper, status and error text share the auxiliary size on desktop and mobile',async({page})=>{
  for(const width of [1280,390]){
    await page.setViewportSize({width,height:844});
    await page.goto(`${account}#signup`);
    await page.getByLabel('邮箱地址').fill('visual-test@example.invalid');
    await page.getByLabel('密码',{exact:true}).fill('short');
    await page.locator('#confirm').fill('short');
    await page.getByRole('button',{name:'获取验证码'}).click();
    await expect(page.getByText('密码至少需要10位。')).toBeVisible();
    const sizes=await page.evaluate(()=>({intro:getComputedStyle(document.querySelector('.auth-card > p:not(.eyebrow)')).fontSize,policy:getComputedStyle(document.querySelector('.password-policy')).fontSize,error:getComputedStyle(document.querySelector('.form-message')).fontSize,status:getComputedStyle(document.querySelector('.send-status')).fontSize}));
    expect(new Set(Object.values(sizes))).toEqual(new Set(['14px']));
  }
});

test('signup uses the shared policy and makes no request for a local failure',async({page})=>{
  let signups=0;
  await page.route('**/auth/v1/signup**',async route=>{signups+=1;await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({user:{id:'00000000-0000-4000-8000-000000000003',identities:[{id:'identity'}]},session:null})});});
  await page.goto(`${account}#signup`);
  await page.getByLabel('邮箱地址').fill('policy-test@example.invalid');
  await page.getByLabel('密码',{exact:true}).fill('lowercase1!');
  await page.locator('#confirm').fill('lowercase1!');
  await page.getByRole('button',{name:'获取验证码'}).click();
  await expect(page.getByText('密码至少需要包含1个大写字母。')).toBeVisible();
  expect(signups).toBe(0);
  await page.getByLabel('密码',{exact:true}).fill('Lowercase1!');
  await expect(page.getByText('密码至少需要包含1个大写字母。')).toHaveCount(0);
  await page.locator('#confirm').fill('Lowercase1!');
  await page.getByRole('button',{name:'获取验证码'}).click();
  await expect.poll(()=>signups).toBe(1);
});

test('forgot-password request uses one customer-facing send surface',async({page})=>{
  await page.goto(`${account}#forgot`);
  await expect(page.getByRole('heading',{name:'忘记密码'})).toBeVisible();
  await expect(page.getByRole('button',{name:'发送重置邮件'})).toHaveCount(1);
  await expect(page.getByLabel('注册邮箱')).toBeVisible();
});

test('forgot request starts countdown immediately and remains enumeration safe',async({page})=>{
  let releaseRequest;
  const pending=new Promise(resolve=>{releaseRequest=resolve;});
  let recoverCalls=0;
  let verificationCalls=0;
  await page.route('**/auth/v1/recover**',async route=>{recoverCalls+=1;await pending;await route.fulfill({status:200,contentType:'application/json',body:'{}'});});
  await page.route('**/auth/v1/verify',async route=>{verificationCalls+=1;await route.abort();});
  await page.goto(`${account}#forgot`);
  await page.getByLabel('注册邮箱').fill('not-registered@example.invalid');
  await page.getByRole('button',{name:'发送重置邮件'}).click();
  await expect(page.getByRole('button',{name:/重新发送（(?:60|59)s）/})).toBeVisible({timeout:1000});
  await expect(page.getByText('正在发送密码重置邮件…')).toBeVisible();
  await expect.poll(()=>recoverCalls).toBe(1);
  await page.getByRole('button',{name:/重新发送/}).click();
  expect(recoverCalls).toBe(1);
  releaseRequest();
  await expect(page.getByText('密码重置请求已提交。请检查您的邮箱，并按照邮件提示设置新密码。')).toBeVisible();
  await expect(page.getByText(/如果几分钟后仍未收到邮件/)).toHaveCount(0);
  await expect(page.getByText(/如果这是您的 SKREK 注册邮箱|该邮箱未注册/)).toHaveCount(0);
  expect(verificationCalls).toBe(0);
});

test('completed existing account remains on signup with inline login guidance',async({page})=>{
  await page.route('**/auth/v1/signup**',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({user:{id:'00000000-0000-4000-8000-000000000002',identities:[]},session:null})}));
  await page.goto(`${account}#signup`);
  await page.getByLabel('邮箱地址').fill('existing@example.invalid');
  await page.getByLabel('密码',{exact:true}).fill('Existing-Test-2026!');
  await page.locator('#confirm').fill('Existing-Test-2026!');
  await page.getByRole('button',{name:'获取验证码'}).click();
  await expect(page.getByRole('heading',{name:'创建 SKREK 账户'})).toBeVisible();
  await expect(page.getByText('该邮箱已经注册使用，请重新登录。')).toBeVisible();
  await expect(page.getByRole('button',{name:'返回登录'})).toBeVisible();
});

test('password visibility controls are accessible and preserve values',async({page})=>{
  await page.goto(`${account}#signup`);
  const password=page.getByLabel('密码',{exact:true});
  await password.fill('Visibility-Test-2026!');
  await expect(password).toHaveAttribute('type','password');
  await expect(page.locator('[data-password-toggle="password"] [data-eye="closed"]')).toBeVisible();
  await expect(page.locator('[data-password-toggle="password"] [data-eye="open"]')).toBeHidden();
  await page.getByRole('button',{name:'显示密码'}).click();
  await expect(password).toHaveAttribute('type','text');
  await expect(password).toHaveValue('Visibility-Test-2026!');
  await expect(page.locator('[data-password-toggle="password"] [data-eye="open"]')).toBeVisible();
  await expect(page.locator('[data-password-toggle="password"] [data-eye="closed"]')).toBeHidden();
  await page.getByRole('button',{name:'隐藏密码'}).click();
  await expect(password).toHaveAttribute('type','password');
});

test('recovery intent without a token renders a dedicated link failure',async({page})=>{
  await page.goto(`${account}?auth_action=recovery#reset-password`);
  await expect(page.getByRole('heading',{name:'无法使用此密码重置链接'})).toBeVisible();
  await expect(page.getByRole('button',{name:'重新申请密码重置'})).toHaveCount(1);
  await expect(page.getByRole('heading',{name:'忘记密码'})).toHaveCount(0);
  await expect(page.getByRole('heading',{name:'登录 SKREK'})).toHaveCount(0);
  await expect(page.getByText('客户中心',{exact:true})).toHaveCount(0);
});

test('fresh browser consumes token_hash, establishes recovery session and completes reset',async({page})=>{
  const tokenHash='synthetic-server-issued-token-hash';
  const user={id:'00000000-0000-4000-8000-000000000001',aud:'authenticated',role:'authenticated',email:'recovery-test@example.invalid',user_metadata:{skrek_account_state:'COMPLETE'}};
  let verifyBody=null;
  await page.route('**/auth/v1/verify',async route=>{
    verifyBody=route.request().postDataJSON();
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      access_token:'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJleHAiOjQxMDI0NDQ4MDB9.',
      refresh_token:'synthetic-refresh-token',expires_in:3600,token_type:'bearer',user
    })});
  });
  await page.route('**/auth/v1/user',async route=>{
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(user)});
  });
  await page.route('**/auth/v1/logout**',async route=>route.fulfill({status:204,body:''}));
  await page.goto(`${account}?token_hash=${tokenHash}&type=recovery&auth_action=recovery#reset-password`);
  await expect(page.getByRole('heading',{name:'设置新密码'})).toBeVisible();
  expect(verifyBody).toMatchObject({token_hash:tokenHash,type:'recovery'});
  expect(page.url()).not.toContain('token_hash');
  expect(page.url()).toContain('auth_action=recovery#reset-password');
  const persisted=await page.evaluate(()=>JSON.stringify({...localStorage,...sessionStorage}));
  expect(persisted).not.toContain(tokenHash);
  await page.getByLabel('新密码',{exact:true}).fill('Recovery-Test-2026!');
  await page.locator('#confirm').fill('Recovery-Test-2026!');
  await page.getByRole('button',{name:'保存并继续'}).click();
  await expect(page.getByRole('heading',{name:'密码已重新设置完成'})).toBeVisible();
  await expect(page.getByRole('link',{name:'返回 SKREK 登录'})).toHaveCount(1);
  await expect(page.getByText('客户中心',{exact:true})).toHaveCount(0);
  await expect(page.getByRole('heading',{name:'忘记密码'})).toHaveCount(0);
});

test('mismatch makes no update request and corrected retry succeeds',async({page})=>{
  let updates=0;
  await openMockRecovery(page,async(route,user)=>{updates+=1;await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(user)});});
  await page.getByLabel('新密码',{exact:true}).fill('Corrected-Test-2026!');
  await page.locator('#confirm').fill('Mismatch-Test-2026!');
  await page.getByRole('button',{name:'保存并继续'}).click();
  await expect(page.getByText('两次输入的密码不一致。')).toBeVisible();
  expect(updates).toBe(0);
  await page.locator('#confirm').fill('Corrected-Test-2026!');
  await expect(page.getByText('两次输入的密码不一致。')).toHaveCount(0);
  await page.getByRole('button',{name:'保存并继续'}).click();
  await expect(page.getByRole('heading',{name:'密码已重新设置完成'})).toBeVisible();
  expect(updates).toBe(1);
});

test('all local password policy failures make zero update requests and use current values',async({page})=>{
  let updates=0;
  await openMockRecovery(page,async(route,user)=>{updates+=1;await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(user)});});
  const password=page.getByLabel('新密码',{exact:true}),confirmation=page.locator('#confirm'),submit=page.getByRole('button',{name:'保存并继续'});
  const cases=[
    ['Aa1!short','密码至少需要10位。'],
    ['lowercase1!','密码至少需要包含1个大写字母。'],
    ['UPPERCASE1!','密码至少需要包含1个小写字母。'],
    ['NoNumbers!!','密码至少需要包含1个数字。'],
    ['NoSpecial123','密码至少需要包含1个特殊字符。']
  ];
  for(const [value,error] of cases){
    await password.fill(value);await confirmation.fill(value);await submit.click();
    await expect(page.getByText(error)).toBeVisible();expect(updates).toBe(0);
    await password.fill(`${value}x`);await expect(page.getByText(error)).toHaveCount(0);
  }
  await password.fill('CurrentValid1!');await confirmation.fill('CurrentValid1!');await submit.click();
  await expect(page.getByRole('heading',{name:'密码已重新设置完成'})).toBeVisible();
  expect(updates).toBe(1);
});

test('temporary update failure releases loading and retry succeeds',async({page})=>{
  let updates=0;
  await openMockRecovery(page,async(route,user)=>{updates+=1;if(updates===1){await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({code:'unexpected_failure',msg:'Temporary service unavailable'})});return;}await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(user)});});
  await page.getByLabel('新密码',{exact:true}).fill('Network-Retry-2026!');
  await page.locator('#confirm').fill('Network-Retry-2026!');
  const submit=page.getByRole('button',{name:'保存并继续'});
  await submit.click();
  await expect(page.getByText('网络或服务暂时不可用，请稍后重试。')).toBeVisible();
  await expect(submit).not.toHaveAttribute('aria-busy','true');
  await submit.click();
  await expect(page.getByRole('heading',{name:'密码已重新设置完成'})).toBeVisible();
  expect(updates).toBe(2);
});

test('same-password policy error is specific and recovery retry remains usable',async({page})=>{
  let updates=0;
  await openMockRecovery(page,async(route,user)=>{updates+=1;if(updates===1){await route.fulfill({status:422,contentType:'application/json',body:JSON.stringify({code:'same_password',msg:'New password should be different from the old password.'})});return;}await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(user)});});
  await page.getByLabel('新密码',{exact:true}).fill('Previous-Password-2026!');
  await page.locator('#confirm').fill('Previous-Password-2026!');
  await page.getByRole('button',{name:'保存并继续'}).click();
  await expect(page.getByText('新密码不能与当前密码相同，请设置不同的密码。')).toBeVisible();
  await expect(page.getByRole('heading',{name:'设置新密码'})).toBeVisible();
  await page.getByLabel('新密码',{exact:true}).fill('Different-Password-2026!');
  await expect(page.getByText('新密码不能与当前密码相同，请设置不同的密码。')).toHaveCount(0);
  await page.locator('#confirm').fill('Different-Password-2026!');
  await page.getByRole('button',{name:'保存并继续'}).click();
  await expect(page.getByRole('heading',{name:'密码已重新设置完成'})).toBeVisible();
  expect(updates).toBe(2);
});

test('invalid recovery session terminates update retry and shows link failure',async({page})=>{
  let updates=0;
  await openMockRecovery(page,async route=>{updates+=1;await route.fulfill({status:401,contentType:'application/json',body:JSON.stringify({code:'session_not_found',msg:'Auth session missing'})});});
  await page.getByLabel('新密码',{exact:true}).fill('Expired-Session-2026!');
  await page.locator('#confirm').fill('Expired-Session-2026!');
  await page.getByRole('button',{name:'保存并继续'}).click();
  await expect(page.getByRole('heading',{name:'无法使用此密码重置链接'})).toBeVisible();
  await expect(page.getByRole('button',{name:'重新申请密码重置'})).toBeVisible();
  expect(updates).toBe(1);
});

test('password reset completion is dedicated and contains one return action',async({page})=>{
  await page.goto(`${account}#password-reset-complete`);
  await expect(page.getByRole('heading',{name:'密码已重新设置完成'})).toBeVisible();
  await expect(page.getByRole('link',{name:'返回 SKREK 登录'})).toHaveCount(1);
  await expect(page.locator('#login-form')).toHaveCount(0);
});

test('account shell logo and required public navigation resolve to existing public surfaces',async({page})=>{
  await page.goto(`${account}#login`);
  await expect(page.locator('#product-home-logo img')).toBeVisible();
  await expect(page.locator('#product-home-logo')).toHaveAttribute('href',/v3-crypto\/index\.html/);
  for(const label of ['数字资产','安全与隐私','产品与服务','知识库','专业合作','联系我们']){
    await expect(page.getByRole('link',{name:label})).toHaveAttribute('href',/v3-crypto\/index\.html/);
  }
  await expect(page.getByRole('link',{name:'我的恢复中心'})).toHaveAttribute('href',/recover\.html/);
});
