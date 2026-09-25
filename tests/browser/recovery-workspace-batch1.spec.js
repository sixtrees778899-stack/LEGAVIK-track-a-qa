import {test,expect} from '@playwright/test';
import {buildRecoveryWorkspaceHtml} from '../../web/map-view.js';

const URL='http://127.0.0.1:8080/web/recover.html?release=recovery-workspace-batch1';
const snapshot={snapshot_version:1,knowledge_graph:{schema_version:2,vault_title:'Recovery Map',reviewed_at:'2026-08-29T00:00:00.000Z',assets:[{id:'binance',label:'Binance',condition_refs:['condition-email'],contact_refs:[],attachment_refs:[],custom_field_refs:[]}],recovery_conditions:[{id:'condition-email',type:'email',asset_refs:['binance'],location_refs:[],custom_field_refs:[]}],locations:[],contacts:[],recovery_steps:[],attachments:[],personal_message:{text:'请先核对账户和附件。',attachment_refs:[],disclaimer_acknowledged:true},custom_fields:[{id:'metadata-binance-account-type',module_ref:'assets-accounts',label:'账户类型',field_type:'text',value:'CEX'}]}};

test('legacy My Recovery Center URL converges on the shared recovery entry',async({page})=>{
  await page.goto('http://127.0.0.1:8080/web/v3-crypto/recover.html');
  await expect(page).toHaveURL(/\/web\/recover\.html\?source=legacy-compatibility/);
  await expect(page.getByRole('heading',{name:'Mainnet 独立恢复'})).toBeVisible();
  await expect(page.getByRole('button',{name:'开始独立恢复'})).toBeVisible();
  for(const label of ['Mainnet Recovery Evidence','Recovery Kit','Recovery Password'])await expect(page.getByLabel(label)).toBeVisible();
});

test('file protocol legacy opening immediately explains that the test server is required',async({page})=>{
  await page.goto('file:///Users/hanhuitao/Documents/CJAS-mainnet/web/v3-crypto/recover.html');
  await expect(page.getByRole('heading',{name:'当前页面需要通过 SKREK 测试服务打开。'})).toBeVisible();
  await expect(page.getByText('请使用由测试启动器提供的 HTTP 地址。')).toBeVisible();
  await expect(page.getByText('正在进入统一恢复中心…')).toHaveCount(0);
});

test('post-creation recovery URL uses the same shared recovery entry',async({page})=>{
  await page.goto('http://127.0.0.1:8080/web/recover.html?source=post-creation');
  await expect(page.getByRole('heading',{name:'Mainnet 独立恢复'})).toBeVisible();
  await expect(page.getByRole('button',{name:'开始独立恢复'})).toBeVisible();
  await expect(page.locator('script[src*="recover.js"]')).toHaveCount(1);
});

for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]])test(`Recovery Workspace Batch 1 ${name} layout`,async({page})=>{
  await page.setViewportSize({width,height});
  await page.goto(URL);
  const html=buildRecoveryWorkspaceHtml(snapshot);
  await page.locator('#app').evaluate((node,markup)=>{node.innerHTML=markup;},html);
  await expect(page.getByRole('heading',{name:'你的 Recovery Map 已成功恢复'})).toBeVisible();
  await expect(page.getByText('如何理解和使用这份 Recovery Map')).toBeVisible();
  await expect(page.getByText('填写人原始档案',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
  await page.locator('[data-workspace-section="01"] > summary').click();
  await expect(page.getByText('01｜第一次使用，请按这个顺序')).toBeVisible();
  await expect(page.locator('.recovery-guide-item')).toHaveCount(4);
  await expect(page.locator('.recovery-guide-item[open]')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
});

for(const fixture of ['complete','boundary'])for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]])test(`Recovery Workspace ${fixture} preview ${name}`,async({page})=>{
  await page.setViewportSize({width,height});
  await page.goto(`http://127.0.0.1:8080/web/recovery-workspace-preview.html?internal_preview=1&fixture=${fixture}`);
  await expect(page.getByText('PREVIEW / INTERNAL TEST')).toBeVisible();
  await expect(page.getByRole('heading',{name:'你的 Recovery Map 已成功恢复'})).toBeVisible();
  await expect(page.getByText('填写人原始档案',{exact:true})).toBeVisible();
  if(fixture==='complete'){await page.locator('[data-workspace-section="02"] > summary').click();await page.locator('[data-account-target="binance"]').click();await expect(page.locator('[data-workspace-section="04"]')).toHaveAttribute('open','');await expect(page.locator('#recovery-account-binance')).toHaveAttribute('open','');await expect(page.locator('#recovery-account-binance').getByText('Alex Chen')).toHaveCount(0);await page.locator('[data-workspace-section="05"] > summary').click();await expect(page.locator('[data-workspace-section="05"]').getByText('Alex Chen')).toBeVisible();}
  else{await page.locator('[data-workspace-section="03"] > summary').click();await expect(page.getByText(/没有留下在线文字说明，但留下了 2 个相关附件/)).toBeVisible();await page.locator('[data-workspace-section="05"] > summary').click();await expect(page.getByText('填写人未留下协助人信息。')).toBeVisible();}
  await expect(page.locator('[data-attachment-action="view"]')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
});

test('Account Overview keeps only the selected recovery account open',async({page})=>{
  await page.goto('http://127.0.0.1:8080/web/recovery-workspace-preview.html?internal_preview=1&fixture=complete');
  await page.locator('[data-workspace-section="02"] > summary').click();
  const assertOnlyOpen=async accountId=>{
    await page.locator(`[data-account-target="${accountId}"]`).click();
    await expect(page.locator('[data-workspace-section="04"]')).toHaveAttribute('open','');
    await expect(page.locator(`#recovery-account-${accountId}`)).toHaveAttribute('open','');
    expect(await page.locator('.map-account[open]').evaluateAll(accounts=>accounts.map(account=>account.dataset.accountId))).toEqual([accountId]);
    await expect(page.locator(`#recovery-account-${accountId}`)).toBeFocused();
  };
  for(const accountId of ['binance','uniswap','ledger','metamask','binance','binance','ledger'])await assertOnlyOpen(accountId);
  await expect(page.locator('[data-workspace-section="06"]')).not.toHaveAttribute('open','');
});

test('top-level, account, and inner headings remain distinct with multiple sections open',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('http://127.0.0.1:8080/web/recovery-workspace-preview.html?internal_preview=1&fixture=complete');
  await page.locator('[data-workspace-section="03"] > summary').click();
  await page.locator('[data-workspace-section="04"] > summary').click();
  await page.locator('#recovery-account-ledger > summary').click();
  await expect(page.locator('[data-workspace-section="03"]')).toHaveAttribute('open','');
  await expect(page.locator('[data-workspace-section="04"]')).toHaveAttribute('open','');
  await expect(page.locator('#recovery-account-ledger')).toHaveAttribute('open','');
  await expect(page.locator('#recovery-account-ledger').getByText('收起账户')).toBeVisible();
  await expect(page.locator('[data-workspace-section="04"] > summary').getByText('收起')).toBeVisible();
  await expect(page.locator('#recovery-account-ledger .content-step')).toHaveCount(5);
  const hierarchy=await page.evaluate(()=>{const top=getComputedStyle(document.querySelector('[data-workspace-section="04"] > summary')),account=getComputedStyle(document.querySelector('#recovery-account-ledger > summary')),inner=getComputedStyle(document.querySelector('#recovery-account-ledger .map-account-body > .account-recovery-part > h4'));return{topBackground:top.backgroundColor,accountBackground:account.backgroundColor,topWeight:top.fontWeight,accountSize:account.fontSize,innerSize:inner.fontSize,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth};});
  expect(hierarchy.topBackground).not.toBe(hierarchy.accountBackground);
  expect(hierarchy.innerSize).not.toBe(hierarchy.accountSize);
  expect(hierarchy.overflow).toBe(false);
});
