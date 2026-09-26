import {test,expect} from '@playwright/test';

const accountUrl='/web/account/index.html#login';
const user={id:'00000000-0000-4000-8000-000000000088',aud:'authenticated',role:'authenticated',email:'published-no-entitlement@example.invalid',email_confirmed_at:'2026-09-26T00:00:00.000Z',user_metadata:{skrek_account_state:'COMPLETE'}};
const session={access_token:'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJleHAiOjQxMDI0NDQ4MDB9.',refresh_token:'customer-center-resilience-refresh',expires_in:3600,token_type:'bearer',user};
const mapId='10000000-0000-4000-8000-000000000088';
const currentVersionId='20000000-0000-4000-8000-000000000088';

async function mockCustomerCenter(page,{failure='',timeout=''}={}){
  await page.addInitScript(()=>{globalThis.__LEGAVIK_CENTER_TEST_TIMEOUT_MS=75;});
  await page.route('**/auth/v1/token**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(session)}));
  await page.route('**/auth/v1/user**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(user)}));
  await page.route('**/rest/v1/**',async route=>{
    const url=new URL(route.request().url()),resource=url.pathname.includes('/rpc/')?'entitlement':url.pathname.split('/').at(-1);
    if(resource===timeout){await new Promise(resolve=>setTimeout(resolve,250));}
    if(resource===failure||resource===timeout)return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({code:'TEMPORARY_READ_FAILURE',message:'temporary read failure'})});
    const rows={
      profiles:[{user_id:user.id,email:user.email,email_verified:true,username:null}],
      recovery_maps:[{id:mapId,recovery_map_id:'map-resilience-v1',display_name:'已发布 Recovery Map',plan:'Standard',status:'PUBLISHED',lifecycle_state:'PUBLISHED',published_at:'2026-09-26T00:00:00.000Z',current_version_id:currentVersionId,created_at:'2026-09-25T00:00:00.000Z',updated_at:'2026-09-26T00:00:00.000Z'}],
      recovery_map_versions:[
        {id:currentVersionId,recovery_map_id:mapId,version_id:'version-v3',version_number:3,snapshot_id:'snapshot-v3',status:'CURRENT',published_at:'2026-09-26T00:00:00.000Z',created_at:'2026-09-26T00:00:00.000Z'},
        {id:'20000000-0000-4000-8000-000000000087',recovery_map_id:mapId,version_id:'version-v2',version_number:2,snapshot_id:'snapshot-v2',status:'HISTORICAL',published_at:'2026-09-25T00:00:00.000Z',created_at:'2026-09-25T00:00:00.000Z'},
        {id:'20000000-0000-4000-8000-000000000086',recovery_map_id:mapId,version_id:'version-v1',version_number:1,snapshot_id:'snapshot-v1',status:'HISTORICAL',published_at:'2026-09-24T00:00:00.000Z',created_at:'2026-09-24T00:00:00.000Z'}
      ],
      recovery_materials:[],orders:[],annual_reviews:[],entitlement:[]
    };
    return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(rows[resource]??[])});
  });
}

async function login(page){await page.goto(accountUrl);await page.getByLabel('邮箱').fill(user.email);await page.getByLabel('密码',{exact:true}).fill('Customer-Test-2026!');await page.getByRole('button',{name:'登录'}).click();}

test('published maps with history and no ACTIVE_TEST entitlement open normally after refresh',async({page})=>{
  await mockCustomerCenter(page);
  await login(page);
  await expect(page.getByRole('heading',{name:'总览'})).toBeVisible();
  await expect(page.getByText('已发布 Recovery Map')).toBeVisible();
  await expect(page.getByText('V3 ·')).toBeVisible();
  await expect(page.getByText('尚未确认',{exact:true})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading',{name:'总览'})).toBeVisible();
  await expect(page.getByText('已发布 Recovery Map')).toBeVisible();
});

for(const [resource,label] of [['entitlement','当前方案'],['orders','订单'],['annual_reviews','年度检查'],['recovery_materials','恢复资料状态']]){
  test(`${resource} failure degrades only its customer-center region`,async({page})=>{
    await mockCustomerCenter(page,{failure:resource==='annual_reviews'?'annual_reviews':resource});
    await login(page);
    await expect(page.getByRole('heading',{name:'总览'})).toBeVisible();
    await expect(page.getByText('已发布 Recovery Map')).toBeVisible();
    await expect(page.getByText(new RegExp(`${label}暂时无法读取`))).toBeVisible();
    await expect(page.getByText('客户中心未能正常打开')).toHaveCount(0);
  });
}

test('one optional read timeout retries once then degrades without blocking maps',async({page})=>{
  let orderRequests=0;
  page.on('request',request=>{if(new URL(request.url()).pathname.endsWith('/orders'))orderRequests+=1;});
  await mockCustomerCenter(page,{timeout:'orders'});
  await login(page);
  await expect(page.getByRole('heading',{name:'总览'})).toBeVisible();
  await expect(page.getByText('已发布 Recovery Map')).toBeVisible();
  await expect(page.getByText(/订单暂时无法读取/)).toBeVisible();
  expect(orderRequests).toBe(2);
});
