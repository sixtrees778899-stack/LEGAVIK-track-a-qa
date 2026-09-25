import {test,expect} from '@playwright/test';

const deployment='legavik-customer-terminology-20260910-1';
const home=`/web/v3-crypto/index.html?release=${deployment}#home`;

test('canonical homepage and current Plans load from one deployment',async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(home);
  await expect(page.locator('#main')).toHaveAttribute('data-runtime-state','READY');
  await expect(page.getByText('为你的数字资产')).toBeVisible();
  await page.getByRole('link',{name:'产品与服务'}).click();
  await expect(page.getByText('LEGAVIK PLANS')).toBeVisible();
  await expect(page.getByText('基础版',{exact:true}).first()).toBeVisible();
  await expect(page.getByText('标准版',{exact:true}).first()).toBeVisible();
  await expect(page.getByText('传承定制版',{exact:true}).first()).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-product-bundle-release',deployment);
  expect(errors).toEqual([]);
});

test('warm cached N-1 HTML upgrades once to N without clearing browser data',async({page})=>{
  let staleServed=false;
  await page.route('**/web/v3-crypto/index.html*',async route=>{
    if(staleServed)return route.continue();
    staleServed=true;
    const response=await route.fetch();
    const html=(await response.text()).replaceAll(`content="${deployment}"`,'content="legavik-stale-n-minus-1"');
    await route.fulfill({response,body:html,headers:{...response.headers(),'content-type':'text/html; charset=utf-8'}});
  });
  await page.goto(`/web/v3-crypto/index.html?release=legavik-stale-n-minus-1#pricing`);
  await expect(page).toHaveURL(new RegExp(`release=${deployment}#pricing$`));
  await expect(page.locator('#main')).toHaveAttribute('data-runtime-state','READY');
  await expect(page.getByText('LEGAVIK PLANS')).toBeVisible();
});

test('transient manifest failures recover without exposing the terminal failure page',async({page})=>{
  let attempts=0;
  await page.route('**/web/release-manifest.json*',async route=>{
    attempts+=1;
    if(attempts<3)return route.abort('connectionreset');
    return route.continue();
  });
  await page.goto(home);
  await expect(page.locator('#main')).toHaveAttribute('data-runtime-state','READY');
  await expect(page.getByText('页面加载未完成')).toHaveCount(0);
  expect(attempts).toBeGreaterThanOrEqual(3);
});

test('background and foreground preserve a ready current runtime',async({page,context})=>{
  await page.goto(home);
  await expect(page.locator('#main')).toHaveAttribute('data-runtime-state','READY');
  const other=await context.newPage();
  await other.goto('about:blank');
  await page.bringToFront();
  await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
  await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
  await expect(page.locator('#main')).toHaveAttribute('data-runtime-state','READY');
  await expect(page.getByText('页面加载未完成')).toHaveCount(0);
});
