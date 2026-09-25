import {test,expect} from '@playwright/test';

const pricing='/web/v3-crypto/index.html#pricing';
const center=(plan,remaining)=>`/web/account/index.html?lifecycle_preview=1&service_plan=${encodeURIComponent(plan)}&free_updates=${remaining}#center`;

test('Pricing FAQ opens single-update and upgrade placeholder confirmations',async({page})=>{
  await page.goto(pricing);
  const updateFaq=page.getByText('如果只需要临时更新一次，怎么办？').locator('..');
  await updateFaq.locator('summary').click();
  await updateFaq.getByRole('button',{name:'购买单次恢复地图更新'}).click();
  let dialog=page.getByRole('dialog',{name:'单次恢复地图内容更新'});
  await expect(dialog).toContainText('USD 199 / 次');
  await expect(dialog).toContainText('当前不会创建订单或收费');
  await dialog.getByRole('button',{name:'关闭确认'}).click();
  const upgradeFaq=page.getByText('以后可以升级到更高一级服务吗？').locator('..');
  await upgradeFaq.locator('summary').click();
  await upgradeFaq.getByRole('button',{name:'升级当前服务'}).click();
  dialog=page.getByRole('dialog',{name:'升级当前服务'});
  await expect(dialog).toContainText('USD 599');
  await expect(dialog).toContainText('已经支付的当前年度服务费用不会重复收取');
});

test('Customer Center uses included updates before any paid update CTA',async({page})=>{
  await page.goto(center('Essential',1));
  await expect(page.getByText('本年度剩余免费更新：1次')).toBeVisible();
  await expect(page.getByRole('link',{name:'开始更新'})).toBeVisible();
  await expect(page.getByRole('button',{name:'购买单次更新'})).toHaveCount(0);
  await expect(page.locator('.service-management')).not.toContainText('USD 199');
});

test('Customer Center paid update and plan-specific upgrade entries stay distinct',async({page})=>{
  await page.goto(center('Essential',0));
  await expect(page.locator('.service-management')).toContainText('USD 199 / 次');
  await expect(page.getByRole('heading',{name:'升级至标准版'})).toBeVisible();
  await page.getByRole('button',{name:'购买单次更新'}).click();
  await expect(page.getByRole('dialog',{name:'单次恢复地图内容更新'})).toContainText('AUD 280 / 次');
  await page.getByRole('button',{name:'关闭确认'}).click();
  await page.goto(center('Standard',0));
  await expect(page.getByRole('button',{name:'咨询 / 升级传承定制版'})).toBeVisible();
  await page.goto(center('Legacy / Private',0));
  await expect(page.getByRole('heading',{name:'管理定制服务'})).toBeVisible();
  await expect(page.getByRole('button',{name:'升级当前服务'})).toHaveCount(0);
});
