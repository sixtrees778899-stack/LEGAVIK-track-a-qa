import {test,expect} from '@playwright/test';

const release='legavik-mainline-load-stability-20260925-1';
const url=`http://127.0.0.1:8080/web/v2/index.html?test_recovery_map=1&release=${release}`;

test('Recovery Map remains ready beyond the 30 second runtime watchdog',async({page})=>{
  test.setTimeout(90000);
  await page.goto(url,{waitUntil:'networkidle'});
  await expect(page.locator('#app')).toHaveAttribute('data-runtime-state','READY');
  await expect(page.getByText('页面加载未完成')).toHaveCount(0);
  await page.waitForTimeout(65000);
  await expect(page.locator('#app')).toHaveAttribute('data-runtime-state','READY');
  await expect(page.getByText('页面加载未完成')).toHaveCount(0);
  await expect(page.locator('#app')).not.toContainText('请重新打开当前页面');
});

test('fresh tab and hard refresh initialize the exact release',async({page})=>{
  await page.goto(url,{waitUntil:'networkidle'});
  await expect(page.locator('html')).toHaveAttribute('data-legavik-deployment',release);
  await expect(page.locator('html')).toHaveAttribute('data-recovery-map-bundle-release',release);
  await page.reload({waitUntil:'networkidle'});
  await expect(page.locator('#app')).toHaveAttribute('data-runtime-state','READY');
  await expect(page.getByText('页面加载未完成')).toHaveCount(0);
});
