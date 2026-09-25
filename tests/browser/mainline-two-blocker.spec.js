import {test,expect} from '@playwright/test';

const url='/web/v2/index.html?test_recovery_map=1&release=mainline-two-blocker-local';

async function openAccounts(page){
  await page.goto(url);
  await page.waitForFunction(()=>document.querySelector('h1,#guide-start,#next-task'));
  if(await page.locator('h1').getByText('资产与账户',{exact:true}).count())return;
  const guideStart=page.locator('#guide-start');
  if(await guideStart.count())await guideStart.click();
  else{await page.locator('#next-task').click();await page.locator('#intro-start').click();}
  await expect(page.locator('h1')).toHaveText('资产与账户');
}

test('Module 3 attachment reports missing account coverage and succeeds after correction',async({page})=>{
  await openAccounts(page);
  await page.locator('[data-catalog-category="HARDWARE_WALLET"]').click();
  await page.getByRole('button',{name:/Ledger/}).click();
  await page.locator('[data-flow="conditions"]').click();
  await page.locator('fieldset').filter({hasText:'Ledger'}).locator('input[type="checkbox"]').first().check();
  await page.locator('[data-flow="locations"]').click();
  await page.locator('#module-attachments').click();
  const drawer=page.locator('main[data-view="attachments"]');
  await drawer.locator('#new-file-account').selectOption({label:'Ledger'});
  const coverage=drawer.locator('#new-file-conditions input[type="checkbox"]');
  await coverage.first().uncheck();
  await drawer.locator('#file-upload').setInputFiles({name:'ledger-location.txt',mimeType:'text/plain',buffer:Buffer.from('QA location description without secrets.')});
  await drawer.locator('#upload').click();
  await expect(drawer.locator('#attachment-upload-error')).toHaveText('请选择该附件需要覆盖的恢复条件。');
  await coverage.first().check();
  await drawer.locator('#upload').click();
  await expect(drawer.locator('.attachment-success')).toContainText('附件已加入当前模块');
});

test('delivered normal-flow script verifies Mainnet before rendering Delivery',async({request})=>{
  const response=await request.get('/web/v2/v2-app.js');
  expect(response.ok()).toBe(true);
  const source=await response.text();
  expect(source).toMatch(/await completeVerifiedMainnet\(customerWaitStarted\)/);
  expect(source).not.toMatch(/pendingMainnetTransaction=null;await saveOperationCheckpoint\(\);current='downloads';render\(\)/);
  expect(source).not.toMatch(/mainnetEvidence\?\.txid\)\{mainnetEvidence\.background_verification='PENDING';current='downloads'/);
});
