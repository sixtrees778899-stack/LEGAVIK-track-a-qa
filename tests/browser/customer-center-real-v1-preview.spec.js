import {test,expect} from '@playwright/test';

const release='legavik-customer-terminology-20260910-1';
const base=`http://127.0.0.1:8080/web/account/index.html?release=${release}&lifecycle_preview=1`;

async function loginWithEmptyLifecycle(page){
  const user={id:'00000000-0000-4000-8000-000000000055',aud:'authenticated',role:'authenticated',email:'empty-center@example.invalid',email_confirmed_at:'2026-09-02T00:00:00.000Z',user_metadata:{skrek_account_state:'COMPLETE'}};
  const session={access_token:'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJleHAiOjQxMDI0NDQ4MDB9.',refresh_token:'synthetic-empty-center-refresh',expires_in:3600,token_type:'bearer',user};
  await page.route('**/auth/v1/token**',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(session)}));
  await page.route('**/auth/v1/user**',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(user)}));
  await page.route('**/rest/v1/**',async route=>{
    const url=new URL(route.request().url()),table=url.pathname.split('/').at(-1),profile={user_id:user.id,email:user.email,email_verified:true,username:null};
    const body=table==='profiles'&&url.searchParams.get('select')==='*'?profile:table==='profiles'?[profile]:[];
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
  await page.goto('http://127.0.0.1:8080/web/account/index.html#login');
  await page.getByLabel('邮箱').fill(user.email);
  await page.getByLabel('密码',{exact:true}).fill('Customer-Test-2026!');
  await page.getByRole('button',{name:'登录'}).click();
  await expect(page.getByRole('heading',{name:'总览'})).toBeVisible();
}

test('authenticated empty Customer Center hides Recent Maps and opens canonical Pricing',async({page})=>{
  await loginWithEmptyLifecycle(page);
  await expect(page.getByText('尚未创建',{exact:true})).toBeVisible();
  await expect(page.getByRole('heading',{name:'创建第一份 Recovery Map'})).toBeVisible();
  await expect(page.locator('.recent-maps')).toHaveCount(0);
  await expect(page.getByText('最近的 Recovery Map')).toHaveCount(0);
  await page.getByRole('link',{name:'开始建立'}).click();
  await expect(page).toHaveURL(new RegExp(`/web/v3-crypto/index\\.html\\?release=${release}#pricing$`));
  await expect(page.getByText('LEGAVIK PLANS',{exact:true})).toBeVisible();
});

test('controlled lifecycle preview uses the production Customer Center dashboard renderer',async({page})=>{
  await page.goto(base);
  await expect(page.getByRole('heading',{name:'总览'})).toBeVisible();
  await expect(page.getByText('我的首份 Recovery Map')).toBeVisible();
  await expect(page.getByText('当前版本：V1')).toBeVisible();
  await expect(page.getByText('当前版本',{exact:true}).first()).toBeVisible();
  await expect(page.locator('.recent-maps')).toBeVisible();
  await expect(page.getByText('重新获取 Evidence')).toHaveCount(0);
});

test('My Recovery Map shows one real V1 history entry and no fake versions',async({page})=>{
  await page.goto(`${base}&section=maps`);
  await expect(page.getByRole('heading',{name:'我的 Recovery Map'})).toBeVisible();
  await expect(page.getByText('我的首份 Recovery Map')).toBeVisible();
  await page.getByRole('button',{name:'查看版本信息'}).click();
  await expect(page.locator('.version-history')).toHaveAttribute('open','');
  await expect(page.locator('.version-history strong')).toHaveText('V1');
  await expect(page.locator('.version-history strong')).toHaveCount(1);
  await expect(page.getByText('V2',{exact:true})).toHaveCount(0);
});
