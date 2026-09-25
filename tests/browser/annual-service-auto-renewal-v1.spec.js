import {test,expect} from '@playwright/test';

const deployment='legavik-customer-terminology-20260910-1';
const pricing=`/web/v3-crypto/index.html?release=${deployment}#pricing`;

test('plan keeps renewal out of the main card and requires a deliberate confirmation choice',async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pricing);
  await expect(page.locator('#main')).toHaveAttribute('data-runtime-state','READY');
  await expect(page.getByText('LEGAVIK PLANS')).toBeVisible();
  await expect(page.getByText('首年服务价格')).toBeVisible();
  await expect(page.locator('.pricing-detail')).not.toContainText('第二年');
  await page.getByRole('button',{name:'选择此方案'}).click();
  const dialog=page.getByRole('dialog',{name:'确认标准版'});
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('首个12个月服务周期')).toBeVisible();
  await expect(dialog.getByText('下一个12个月服务周期')).toBeVisible();
  await expect(dialog).toContainText('USD 480 / 年');
  await expect(dialog).toContainText('默认按月分期支付： USD 40 × 12期');
  await expect(dialog).not.toContainText(/\d{4}年\d{1,2}月\d{1,2}日/);
  await expect(dialog.getByRole('button',{name:'继续账户与购买'})).toBeDisabled();
  await dialog.getByLabel('开启第二年年度维护服务').check();
  await expect(dialog.getByText(/今天第二年费用 USD 0/)).toBeVisible();
  await expect(dialog.getByRole('button',{name:'继续账户与购买'})).toBeEnabled();
  expect(errors).toEqual([]);
});

test('currency switching updates first-year and renewal prices together',async({page})=>{
  await page.goto(pricing);
  await page.getByRole('button',{name:'AUD'}).click();
  await expect(page.getByText(/AUD 1,680/).first()).toBeVisible();
  await page.getByRole('button',{name:'选择此方案'}).click();
  const dialog=page.getByRole('dialog',{name:'确认标准版'});
  await expect(dialog.getByText(/AUD 672/).first()).toBeVisible();
  await expect(dialog.getByText(/AUD 56.*12期/).first()).toBeVisible();
});
