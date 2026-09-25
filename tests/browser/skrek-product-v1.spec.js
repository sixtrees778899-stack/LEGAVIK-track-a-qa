import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';

const QA_BASE=process.env.CJAS_BROWSER_BASE??'';
const HOME=`${QA_BASE}/web/v3-crypto/index.html?release=product-integration-v1`;
const MAP=`${QA_BASE}/web/v2/index.html?release=product-integration-v1`;
const SHOTS='docs/evidence/skrek-product-v1';
const errors=new WeakMap();

test.beforeAll(async()=>mkdir(SHOTS,{recursive:true}));
test.beforeEach(async({page})=>{
  const record={console:[],page:[],requests:[]};errors.set(page,record);
  page.on('console',message=>{if(message.type()==='error')record.console.push(message.text());});
  page.on('pageerror',error=>record.page.push(error.message));
  page.on('requestfailed',request=>record.requests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText??''}`));
});

test('P0 — direct Product Experience entry renders the complete homepage without a Logo detour',async({page})=>{
  await page.goto(`${QA_BASE}/web/v3-crypto/index.html?release=product-experience-v1`);
  await expect(page).toHaveURL(/#home$/);
  await expect(page.locator('.hero h1')).toContainText('为你的数字资产');
  await expect(page.locator('.hero [data-recovery-map]')).toBeVisible();
});
test('Root cause closure — Homepage and Recovery Map use one global header structure and roundtrip',async({page})=>{
  await page.goto(HOME);const homeStructure=await page.locator('#site-header').evaluate(node=>node.innerHTML.replaceAll(/href="[^"]+"/g,'href').replaceAll(/ class="active"/g,''));
  await page.locator('.hero [data-recovery-map]').click();await expect(page).toHaveURL(/\/web\/v2\/index\.html/);const mapStructure=await page.locator('#site-header').evaluate(node=>node.innerHTML.replaceAll(/href="[^"]+"/g,'href').replaceAll(/ class="active"/g,''));expect(mapStructure).toBe(homeStructure);
  await page.locator('#product-home-logo').click();await expect(page).toHaveURL(/\/web\/v3-crypto\/index\.html.*#home$/);await expect(page.locator('.hero h1')).toContainText('为你的数字资产');
});
test('Recovery Map guide — all six puzzle details open and return without route or scroll errors',async({page})=>{
  await page.goto(HOME);await page.locator('.hero [data-recovery-map]').click();await expect(page.locator('[data-view="guide"]')).toBeVisible();await expect(page.locator('[data-guide-module]')).toHaveCount(6);await page.screenshot({path:`${SHOTS}/recovery-map-guide-desktop.png`,fullPage:true});
  const ids=['accounts','conditions','locations','instructions','assistants','message'];
  for(const id of ids){await page.locator(`[data-guide-module="${id}"]`).click();await expect(page.locator(`[data-module-detail="${id}"]`)).toBeVisible();await expect(page.locator('#detail-back')).toBeVisible();expect(await page.evaluate(()=>scrollY)).toBe(0);await page.screenshot({path:`${SHOTS}/recovery-map-detail-${id}.png`,fullPage:true});await page.locator('#detail-back').click();await expect(page.locator('[data-view="guide"]')).toBeVisible();expect(await page.evaluate(()=>scrollY)).toBe(0);}
});
test('Recovery Map guide — 1440 1280 and 390 responsive baseline',async({page})=>{
  for(const [width,height,label] of [[1440,1000,'1440'],[1280,900,'1280'],[390,844,'390']]){await page.setViewportSize({width,height});await page.goto(`${MAP}&entry=guide`);await expect(page.locator('[data-guide-module]')).toHaveCount(6);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`${SHOTS}/recovery-map-guide-${label}.png`,fullPage:true});await page.locator('[data-guide-module="locations"]').click();await expect(page.locator('[data-module-detail="locations"]')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`${SHOTS}/recovery-map-detail-locations-${label}.png`,fullPage:true});}
});
test.afterEach(async({page})=>{const record=errors.get(page);expect(record.console).toEqual([]);expect(record.page).toEqual([]);expect(record.requests).toEqual([]);});

async function openAccounts(page){await page.goto(MAP);const guideStart=page.locator('#guide-start');if(await guideStart.count()===1)await guideStart.click();else{await page.locator('#next-task').click();await expect(page.locator('h1')).toContainText('开始前');await page.locator('#intro-start').click();}await expect(page.locator('h1')).toHaveText('资产与账户');}
async function choose(page,category,label){await page.locator(`[data-catalog-category="${category}"]`).click();await page.getByRole('button',{name:new RegExp(label)}).click();}
async function addFourAssets(page){
  await choose(page,'CEX','Binance');
  await choose(page,'HOT_WALLET','MetaMask');
  await choose(page,'HARDWARE_WALLET','Ledger');
  await page.locator('[data-catalog-category="CUSTOM"]').click();await page.locator('#show-custom').click();await page.locator('#custom-catalog-name').fill('家庭冷存储方案');await page.locator('#add-custom-catalog').click();
  await expect(page.locator('.selected-accounts fieldset')).toHaveCount(4);
  const binance=page.locator('.selected-accounts fieldset').filter({hasText:'Binance'});await binance.locator('[data-key="region"]').selectOption('Australia');await binance.locator('[data-key="account_type"]').selectOption('Personal');
}
async function completeFourAssetFlow(page){
  await page.locator('#module-continue').click();await expect(page.locator('h1')).toContainText('恢复所需条件');
  for(const fieldset of await page.locator('main fieldset[data-anchor^="conditions:"]').all()){await fieldset.locator('input[type="checkbox"]').first().check();}
  await page.locator('#module-continue').click();await expect(page.locator('h1')).toHaveText('位置与查找');
  const summaries=page.locator('[data-summary-text]');for(let i=0;i<await summaries.count();i++)await summaries.nth(i).fill(`恢复资料位置说明 ${i+1}`);
  await page.locator('#module-continue').click();await expect(page.locator('h1')).toHaveText('恢复与转移步骤');
  const instructions=page.locator('[data-key="instruction_text"]');for(let i=0;i<await instructions.count();i++)await instructions.nth(i).fill(`先核对身份与官方入口，再执行账户 ${i+1} 的恢复步骤。`);
  await page.locator('#module-continue').click();await expect(page.locator('h1')).toHaveText('协助人');await page.locator('#decision').selectOption('NOT_NEEDED');await page.locator('#module-continue').click();
  await expect(page.locator('h1')).toHaveText('给未来恢复人的嘱托');await page.locator('#personal-message').fill('如遇身份或权限冲突，请停止操作并联系官方支持。');await page.locator('#module-continue').click();await expect(page.locator('h1')).toHaveText('检查与完善');
}

test('Journey 1 — SKREK product entry restores Frozen V2 six-module flow',async({page})=>{
  await page.goto(HOME);await page.locator('.hero [data-recovery-map]').click();await expect(page).toHaveURL(/\/web\/v2\/index\.html/);
  await expect(page.locator('[data-view="guide"]')).toBeVisible();await page.locator('#guide-start').click();
  const labels=['资产与账户','恢复条件','位置与查找','恢复与转移步骤','协助人','给未来恢复人的嘱托'];for(const label of labels)await expect(page.locator('#flow-nav')).toContainText(label);
  await expect(page.locator('#flow-nav')).not.toContainText('Review');
  await expect(page.locator('#flow-nav')).not.toContainText('Recovery Report');
  await page.screenshot({path:`${SHOTS}/frozen-v2-six-module-shell.png`,fullPage:true});
});

test('R11 — Recovery Map main content renders and cannot pass with header-only shell',async({page})=>{
  await page.goto(MAP);
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('#app')).not.toBeEmpty();
  await expect(page.locator('.dashboard-hero')).toBeVisible();
  await expect(page.locator('#flow-nav [data-flow]')).toHaveCount(6);
  await page.screenshot({path:`${SHOTS}/r11-recovery-map-main-content.png`,fullPage:true});
});

test('Release Gate — Help, Recovery Center and Independent Recovery entries are operable',async({page})=>{
  await page.goto(MAP);
  await page.locator('#app-help').click();
  await expect(page.locator('.help-drawer')).toBeVisible();
  await page.screenshot({path:`${SHOTS}/14-help-drawer.png`,fullPage:true});
  await page.locator('#close-help').click();
  const center=page.locator('.recovery-center-link');
  await expect(center).toHaveAttribute('href',/v3-crypto\/index\.html/);
  await page.goto(`${QA_BASE}/web/v3-crypto/index.html?release=product-integration-v1#control`);
  await expect(page.locator('main')).toContainText('你的恢复准备中心');
  await page.screenshot({path:`${SHOTS}/15-recovery-center.png`,fullPage:true});
  await page.goto(`${QA_BASE}/web/v3-crypto/recover.html?release=product-integration-v1`);
  await expect(page.locator('#evidence')).toBeVisible();
  await expect(page.locator('#kit')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
  await page.screenshot({path:`${SHOTS}/16-independent-recovery.png`,fullPage:true});
});

test('Journey 2 — aggregated selector multi-select custom persistence and no scroll jump',async({page})=>{
  await openAccounts(page);await addFourAssets(page);await expect(page.locator('main')).toContainText('家庭冷存储方案');
  await page.locator('[data-catalog-category="CUSTOM"]').scrollIntoViewIfNeeded();const before=await page.evaluate(()=>window.scrollY);await page.locator('[data-catalog-category="CUSTOM"]').evaluate(node=>node.click());const after=await page.evaluate(()=>window.scrollY);expect(Math.abs(after-before)).toBeLessThan(8);
  await expect(page.locator('.selected-accounts')).toContainText('Binance');await expect(page.locator('.selected-accounts')).toContainText('MetaMask');
  await page.screenshot({path:`${SHOTS}/aggregated-asset-selector.png`,fullPage:true});
});

test('Journey 3 — four asset types persist through modules 1–6 Review and Report',async({page})=>{
  await openAccounts(page);await addFourAssets(page);await completeFourAssetFlow(page);await expect(page.locator('main')).toContainText('没有阻断问题');
  await page.locator('#to-report').click();await expect(page.locator('h1')).toContainText('预览恢复说明');for(const name of ['Binance','MetaMask','Ledger','家庭冷存储方案'])await expect(page.locator('main')).toContainText(name);
  await page.locator('[data-flow="accounts"]').click();await expect(page.locator('.selected-accounts fieldset')).toHaveCount(4);await expect(page.locator('main')).toContainText('家庭冷存储方案');
  await page.screenshot({path:`${SHOTS}/six-module-report-persistence.png`,fullPage:true});
});

test('Session navigation — Review Preview and Dashboard preserve form data attachments and one draft',async({page})=>{
  await openAccounts(page);await choose(page,'CEX','Binance');const account=page.locator('.selected-accounts fieldset').filter({hasText:'Binance'});await account.locator('[data-key="region"]').selectOption('Australia');await account.locator('[data-key="account_type"]').selectOption('Personal');
  await page.locator('#module-continue').click();await page.locator('[data-condition-account]').first().check();await page.locator('#module-attachments').click();let drawer=page.locator('main[data-view="attachments"]');await drawer.locator('#new-file-account').selectOption('module-summary');await drawer.locator('#file-upload').setInputFiles({name:'session-preserved.txt',mimeType:'text/plain',buffer:Buffer.from('Same-session attachment without secrets.')});await drawer.locator('#upload').click();await expect(drawer.locator('[data-attachment-card]')).toHaveCount(1);await drawer.locator('#module-continue').click();
  await page.locator('[data-flow="accounts"]').click();await page.evaluate(()=>{window.__recoveryMapSessionSentinel='same-document';});await completeFourAssetFlow(page);await expect(page.locator('h1')).toHaveText('检查与完善');await page.locator('#to-report').click();await expect(page.locator('h1')).toHaveText('恢复地图信息预览');
  await page.locator('#report-back').click();await expect(page.locator('h1')).toHaveText('检查与完善');await page.locator('#review-previous').click();await expect(page.locator('h1')).toHaveText('给未来恢复人的嘱托');await page.locator('#module-previous').click();await expect(page.locator('h1')).toHaveText('协助人');
  await page.locator('[data-flow="accounts"]').click();await expect(page.locator('.selected-accounts')).toContainText('Binance');await page.locator('[data-flow="conditions"]').click();await page.locator('#module-attachments').click();drawer=page.locator('main[data-view="attachments"]');await expect(drawer.getByText('session-preserved.txt',{exact:true})).toBeVisible();await drawer.locator('#module-continue').click();
  await page.locator('[data-flow="message"]').click();await page.locator('#module-continue').click();await expect(page.locator('h1')).toHaveText('检查与完善');await page.locator('#to-report').click();await expect(page.locator('h1')).toHaveText('恢复地图信息预览');await expect(page.locator('main')).toContainText('session-preserved.txt');await page.locator('#report-back').click();await page.locator('#back-dashboard').click();await expect(page.locator('.dashboard-hero')).toBeVisible();expect(await page.evaluate(()=>window.__recoveryMapSessionSentinel)).toBe('same-document');await page.locator('#next-task').click();await page.locator('#to-report').click();await expect(page.locator('h1')).toHaveText('恢复地图信息预览');
});

test('Journey 4 — attachment keeps account context and returns to exact module',async({page})=>{
  await openAccounts(page);await choose(page,'CEX','Binance');const account=page.locator('.selected-accounts fieldset').filter({hasText:'Binance'});await account.locator('[data-key="region"]').selectOption('Australia');await account.locator('[data-key="account_type"]').selectOption('Personal');await page.locator('#module-continue').click();await page.locator('[data-condition-account]').first().check();
  await page.locator('#module-attachments').scrollIntoViewIfNeeded();const scrollBefore=await page.evaluate(()=>scrollY);await page.locator('#module-attachments').click();const drawer=page.locator('main[data-view="attachments"]');await expect(drawer.locator('h1')).toContainText('添加附件');expect(await page.evaluate(()=>scrollY)).toBe(scrollBefore);await expect(page.locator('#new-file-account')).toBeEnabled();await expect(page.locator('#new-file-module')).toHaveValue('conditions');await page.screenshot({path:`${SHOTS}/phase1-attachment-drawer.png`});
  await page.locator('#file-upload').setInputFiles({name:'recovery-location.txt',mimeType:'text/plain',buffer:Buffer.from('No secrets. Official recovery material location.')});await page.locator('#upload').click();await expect(page.locator('[data-attachment-card]')).toHaveCount(1);await page.locator('#module-continue').click();await expect(page.locator('h1')).toContainText('恢复所需条件');await page.locator('#module-attachments').click();await expect(page.locator('[data-attachment-card]')).toContainText('recovery-location.txt');
});

test('Phase 1 attachment refinement — six unique entries, contextual drawers and immediate multi-upload feedback',async({page})=>{
  await openAccounts(page);await choose(page,'CEX','Binance');
  const account=page.locator('.selected-accounts fieldset').filter({hasText:'Binance'});await account.locator('[data-key="region"]').selectOption('Australia');await account.locator('[data-key="account_type"]').selectOption('Personal');
  const modules=[['accounts','1'],['conditions','2'],['locations','3'],['instructions','4'],['assistants','5'],['message','6']];
  for(const [module,id] of modules){await page.locator(`[data-flow="${module}"]`).click();await expect(page.locator('#module-attachments')).toHaveCount(1);await expect(page.locator('.module-attachment-zone')).toBeVisible();await page.screenshot({path:`${SHOTS}/phase1-refinement-module-${id}.png`,fullPage:true});}
  await page.locator('[data-flow="conditions"]').click();await page.locator('#module-attachments').scrollIntoViewIfNeeded();const module2Scroll=await page.evaluate(()=>scrollY);await page.locator('#module-attachments').click();let drawer=page.locator('main[data-view="attachments"]');await expect(drawer.locator('.drawer-guidance')).toContainText('为当前恢复模块补充相关资料');await expect(drawer.locator('#new-file-account')).toBeEnabled();expect(await page.evaluate(()=>scrollY)).toBe(module2Scroll);await page.screenshot({path:`${SHOTS}/phase1-refinement-module-2-drawer.png`});await drawer.locator('#module-continue').click();
  await page.locator('[data-flow="message"]').click();await page.locator('#module-attachments').click();drawer=page.locator('main[data-view="attachments"]');await expect(drawer.locator('#new-file-account').locator('..')).toBeHidden();await page.screenshot({path:`${SHOTS}/phase1-refinement-module-6-global-drawer.png`});
  await drawer.locator('#file-upload').setInputFiles({name:'future-note.txt',mimeType:'text/plain',buffer:Buffer.from('Future recovery note without secrets.')});await drawer.locator('#upload').click();await expect(drawer.locator('.attachment-success')).toContainText('附件已加入当前模块');await drawer.locator('#file-upload').setInputFiles({name:'future-guide.txt',mimeType:'text/plain',buffer:Buffer.from('Second recovery guide without secrets.')});await drawer.locator('#upload').click();await expect(drawer.locator('[data-attachment-card]')).toHaveCount(2);await page.screenshot({path:`${SHOTS}/phase1-refinement-upload-success.png`});
  await drawer.locator('#module-continue').click();await expect(page.locator('.module-attachment-feedback')).toContainText('已添加 2 个附件');await page.locator('[data-flow="conditions"]').click();await page.locator('#module-attachments').click();drawer=page.locator('main[data-view="attachments"]');await expect(drawer.locator('[data-attachment-card]')).toHaveCount(0);
});

test('Phase 1 multi-account attachments — live selector ownership module-level scope and no scroll',async({page})=>{
  await openAccounts(page);await choose(page,'CEX','Binance');await page.locator('[data-catalog-platform="bybit"]').click();await choose(page,'DEFI','Compound');
  for(const label of ['Binance','Bybit']){const card=page.locator('.selected-accounts fieldset').filter({hasText:label});await card.locator('[data-key="region"]').selectOption('Australia');await card.locator('[data-key="account_type"]').selectOption('Personal');}
  await page.locator('[data-flow="conditions"]').click();await page.locator('#module-attachments').scrollIntoViewIfNeeded();const before=await page.evaluate(()=>scrollY);await page.locator('#module-attachments').click();let drawer=page.locator('main[data-view="attachments"]'),accounts=drawer.locator('#new-file-account');expect(await accounts.locator('option').allTextContents()).toEqual(expect.arrayContaining(['Binance','Bybit','Compound']));expect(await page.evaluate(()=>scrollY)).toBe(before);await accounts.evaluate(node=>node.size=4);await page.screenshot({path:`${SHOTS}/phase1-multi-account-module-2-drawer.png`});await accounts.evaluate(node=>node.size=1);
  const uploadFor=async(label,name)=>{await accounts.selectOption({label});await drawer.locator('#file-upload').setInputFiles({name,mimeType:'text/plain',buffer:Buffer.from(`${label} recovery attachment without secrets.`)});await drawer.locator('#upload').click();await expect(drawer.locator('.attachment-success')).toContainText('附件已加入当前模块');drawer=page.locator('main[data-view="attachments"]');accounts=drawer.locator('#new-file-account');};
  const group=label=>drawer.locator('.attachment-account-group>h3').getByText(label,{exact:true}).locator('..');
  await uploadFor('Binance','binance-identity-guide.txt');await expect(group('Binance')).toContainText('binance-identity-guide.txt');await page.screenshot({path:`${SHOTS}/phase1-binance-attachment-ownership.png`});
  await uploadFor('Compound','compound-recovery-notes.txt');await expect(group('Compound')).toContainText('compound-recovery-notes.txt');await page.screenshot({path:`${SHOTS}/phase1-compound-attachment-ownership.png`});
  await uploadFor('Bybit','bybit-device-photo.txt');await drawer.locator('#new-file-account').selectOption({label:'Binance'});await expect(group('Binance')).toContainText('binance-identity-guide.txt');
  await drawer.locator('#module-continue').click();await page.locator('#module-attachments').click();drawer=page.locator('main[data-view="attachments"]');for(const [label,name] of [['Binance','binance-identity-guide.txt'],['Compound','compound-recovery-notes.txt'],['Bybit','bybit-device-photo.txt']])await expect(group(label)).toContainText(name);
  await drawer.locator('#module-continue').click();await page.locator('[data-flow="accounts"]').click();await choose(page,'HARDWARE_WALLET','Ledger');await page.locator('[data-flow="conditions"]').click();await page.locator('#module-attachments').click();drawer=page.locator('main[data-view="attachments"]');await expect(drawer.locator('#new-file-account')).toContainText('Ledger');await drawer.locator('#module-continue').click();
  await page.locator('[data-flow="accounts"]').click();page.once('dialog',dialog=>dialog.accept());await page.locator('.selected-accounts fieldset').filter({hasText:'Bybit'}).locator('[data-remove-account]').click();await page.locator('[data-flow="conditions"]').click();await page.locator('#module-attachments').click();drawer=page.locator('main[data-view="attachments"]');await expect(drawer.locator('#new-file-account')).not.toContainText('Bybit');await expect(drawer.getByText('bybit-device-photo.txt',{exact:true})).toHaveCount(0);await drawer.locator('#module-continue').click();
  for(const [module,file] of [['assistants','phase1-module-5-no-account.png'],['message','phase1-module-6-no-account.png']]){await page.locator(`[data-flow="${module}"]`).click();await page.locator('#module-attachments').scrollIntoViewIfNeeded();const scroll=await page.evaluate(()=>scrollY);await page.locator('#module-attachments').click();drawer=page.locator('main[data-view="attachments"]');await expect(drawer.locator('#new-file-account').locator('..')).toBeHidden();expect(await page.evaluate(()=>scrollY)).toBe(scroll);await drawer.evaluate(node=>node.scrollTo(0,0));await page.screenshot({path:`${SHOTS}/${file}`});await drawer.locator('#module-continue').click();}
});

test('Journey 5 — Review issue returns to exact field and Save returns directly to Review',async({page})=>{
  await openAccounts(page);await choose(page,'CEX','Binance');const account=page.locator('.selected-accounts fieldset').filter({hasText:'Binance'});await account.locator('[data-key="account_type"]').selectOption('Personal');await page.locator('[data-flow="message"]').click();await page.locator('#skip-message').check();await page.locator('#module-continue').click();const issue=page.locator('.issue').filter({hasText:'所属地区尚未完成'});await issue.getByRole('button',{name:'返回准确修改'}).click();await expect(page.locator('h1')).toHaveText('资产与账户');await expect(page.locator('[data-key="region"]')).toBeFocused();await page.locator('[data-key="region"]').selectOption('Australia');await page.locator('#module-continue').click();await expect(page.locator('h1')).toHaveText('检查与完善');await expect(page.locator('main')).not.toContainText('所属地区尚未完成');
});

test('Open defects — Review recalculates every direct edit and restores newly removed data',async({page})=>{
  await openAccounts(page);await choose(page,'CEX','Binance');await page.locator('[data-catalog-platform="bybit"]').click();
  for(const label of ['Binance','Bybit'])await page.locator('.selected-accounts fieldset').filter({hasText:label}).locator('[data-key="account_type"]').selectOption('Personal');
  await page.locator('[data-flow="message"]').click();await page.locator('#skip-message').check();await page.locator('#module-continue').click();
  await expect(page.locator('main')).toContainText('所属地区尚未完成');await page.locator('.issue').filter({hasText:'所属地区尚未完成'}).first().getByRole('button',{name:'返回准确修改'}).click();
  for(const label of ['Binance','Bybit'])await page.locator('.selected-accounts fieldset').filter({hasText:label}).locator('[data-key="region"]').selectOption('Australia');
  await page.locator('#module-continue').click();await expect(page.locator('main')).not.toContainText('所属地区尚未完成');
  await page.locator('[data-flow="accounts"]').click();await page.locator('.selected-accounts fieldset').filter({hasText:'Bybit'}).locator('[data-key="region"]').selectOption('');
  await page.locator('[data-flow="message"]').click();await page.locator('#module-continue').click();await expect(page.locator('main')).toContainText('Bybit');await expect(page.locator('main')).toContainText('所属地区尚未完成');
});

test('Open defects — Module 3 attachment ownership works across CEX wallet DeFi and custom accounts',async({page})=>{
  await openAccounts(page);await choose(page,'CEX','Binance');await page.locator('[data-catalog-platform="bybit"]').click();await choose(page,'HARDWARE_WALLET','Ledger');await choose(page,'HOT_WALLET','MetaMask');await choose(page,'DEX','Uniswap');await choose(page,'DEFI','Compound');await page.locator('[data-catalog-category="CUSTOM"]').click();await page.locator('#show-custom').click();await page.locator('#custom-catalog-name').fill('家庭恢复项目');await page.locator('#add-custom-catalog').click();
  for(const label of ['Binance','Bybit']){const card=page.locator('.selected-accounts fieldset').filter({hasText:label});await card.locator('[data-key="region"]').selectOption('Australia');await card.locator('[data-key="account_type"]').selectOption('Personal');}
  await page.locator('[data-flow="conditions"]').click();for(const fieldset of await page.locator('main fieldset[data-anchor^="conditions:"]').all())await fieldset.locator('input[type="checkbox"]').first().check();
  await page.locator('[data-flow="locations"]').click();await page.locator('#module-attachments').click();let drawer=page.locator('main[data-view="attachments"]');
  for(const label of ['Binance','Bybit','Ledger','MetaMask','Uniswap','Compound','家庭恢复项目']){const value=await drawer.locator('#new-file-account option').evaluateAll((options,needle)=>options.find(option=>option.textContent.includes(needle))?.value,label);expect(value).toBeTruthy();await drawer.locator('#new-file-account').selectOption(value);expect(await drawer.locator('#new-file-conditions input:checked').count()).toBeGreaterThan(0);const filename=`${label.replace(/[^a-z0-9]/gi,'custom')}-location.txt`;await drawer.locator('#file-upload').setInputFiles({name:filename,mimeType:'text/plain',buffer:Buffer.from(`${label} location guide without secrets.`)});await drawer.locator('#upload').click();drawer=page.locator('main[data-view="attachments"]');const group=drawer.locator('.attachment-account-group>h3').filter({hasText:label}).locator('..');await expect(group).toContainText(filename);}
  await drawer.locator('#module-continue').click();await expect(page.locator('h1')).toHaveText('位置与查找');await page.locator('#module-attachments').click();await expect(page.locator('[data-attachment-card]')).toHaveCount(7);await page.screenshot({path:`${SHOTS}/open-defect-module-3-seven-owner-attachments.png`});
});

test('Root cause closure — Module 3 blocks missing conditions and clears coverage on account switching',async({page})=>{
  await openAccounts(page);await choose(page,'CEX','Binance');await choose(page,'DEFI','Compound');await choose(page,'HARDWARE_WALLET','Ledger');
  const binanceCard=page.locator('.selected-accounts fieldset').filter({hasText:'Binance'});await binanceCard.locator('[data-key="region"]').selectOption('Australia');await binanceCard.locator('[data-key="account_type"]').selectOption('Personal');
  await page.locator('[data-flow="conditions"]').click();await page.locator('fieldset').filter({hasText:'Binance'}).locator('input[value="email"]').check();await page.locator('fieldset').filter({hasText:'Compound'}).locator('input').first().check();
  await page.locator('[data-flow="locations"]').click();const attachmentEntry=page.locator('#module-attachments');await attachmentEntry.scrollIntoViewIfNeeded();const before=await page.evaluate(()=>scrollY);await attachmentEntry.evaluate(node=>node.click());let drawer=page.locator('main[data-view="attachments"]'),selector=drawer.locator('#new-file-account');
  const values={};for(const label of ['Binance','Compound','Ledger'])values[label]=await selector.locator('option').evaluateAll((options,needle)=>options.find(option=>option.textContent.includes(needle))?.value,label);
  await selector.selectOption(values.Binance);await expect(drawer.locator('#new-file-conditions')).toContainText('注册邮箱');expect(await drawer.locator('#new-file-conditions input:checked').count()).toBeGreaterThan(0);
  await selector.selectOption(values.Compound);await expect(drawer.locator('#new-file-conditions')).not.toContainText('注册邮箱');expect(await drawer.locator('#new-file-conditions input:checked').count()).toBeGreaterThan(0);
  await selector.selectOption(values.Ledger);await expect(drawer.locator('.location-attachment-precondition')).toContainText('请先在“恢复所需条件与资料”中设置该账户的恢复条件');await expect(drawer.locator('#file-upload')).toBeDisabled();await expect(drawer.locator('#upload')).toBeDisabled();
  await selector.selectOption(values.Binance);await expect(drawer.locator('.location-attachment-precondition')).toHaveCount(0);await expect(drawer.locator('#new-file-conditions')).toContainText('注册邮箱');expect(await drawer.locator('#new-file-conditions input:checked').count()).toBeGreaterThan(0);await drawer.locator('#file-upload').setInputFiles({name:'binance-location.txt',mimeType:'text/plain',buffer:Buffer.from('Binance location without secrets.')});await drawer.locator('#upload').click();drawer=page.locator('main[data-view="attachments"]');const binanceGroup=drawer.locator('.attachment-account-group>h3').filter({hasText:'Binance'}).locator('..'),compoundGroup=drawer.locator('.attachment-account-group>h3').filter({hasText:'Compound'}).locator('..');await expect(binanceGroup).toContainText('binance-location.txt');await expect(compoundGroup).toHaveCount(0);
  await drawer.locator('#module-continue').click();expect(Math.abs(await page.evaluate(()=>scrollY)-before)).toBeLessThan(8);
});

test('Release Gate — every aggregated category and platform control is reversible',async({page})=>{
  await openAccounts(page);const groups=['CEX','DEX','HOT_WALLET','HARDWARE_WALLET','DEFI','MULTISIG'];let tested=0;
  for(const group of groups){await page.locator(`[data-catalog-category="${group}"]`).click();const ids=await page.locator('[data-catalog-platform]').evaluateAll(nodes=>nodes.map(node=>node.dataset.catalogPlatform));expect(ids.length).toBeGreaterThan(0);for(const id of ids){const button=page.locator(`[data-catalog-platform="${id}"]`);await button.scrollIntoViewIfNeeded();const before=await page.evaluate(()=>scrollY);await button.evaluate(node=>node.click());expect(Math.abs(await page.evaluate(()=>scrollY)-before)).toBeLessThan(8);await expect(page.locator(`[data-catalog-platform="${id}"]`)).toHaveAttribute('aria-pressed','true');const selectedBefore=await page.evaluate(()=>scrollY);await page.locator(`[data-catalog-platform="${id}"]`).evaluate(node=>node.click());expect(Math.abs(await page.evaluate(()=>scrollY)-selectedBefore)).toBeLessThan(8);await expect(page.locator(`[data-catalog-platform="${id}"]`)).toHaveAttribute('aria-pressed','false');tested+=2;}}
  await page.locator('[data-catalog-category="HOT_WALLET"]').click();await page.locator('#catalog-search').fill('MetaMask');await expect(page.locator('[data-catalog-platform="metamask"]')).toBeVisible();await page.locator('[data-catalog-category="CUSTOM"]').click();await page.locator('#show-custom').click();await page.locator('#custom-catalog-name').fill('将被取消');await page.locator('#cancel-custom-catalog').click();await expect(page.locator('#custom-catalog-name')).toHaveCount(0);await page.locator('#show-custom').click();await page.locator('#custom-catalog-name').fill('自验收自定义项目');await page.locator('#add-custom-catalog').click();await expect(page.locator('.selected-accounts')).toContainText('自验收自定义项目');expect(tested).toBeGreaterThanOrEqual(30);
});

test('Release Gate — full home-to-Version journey, readiness and Preview roundtrip',async({page})=>{
  await page.goto(HOME);await page.screenshot({path:`${SHOTS}/01-homepage.png`,fullPage:true});await page.locator('.hero [data-recovery-map]').click();await page.screenshot({path:`${SHOTS}/02-recovery-map.png`,fullPage:true});await page.locator('#next-task').click();await page.locator('#intro-start').click();await choose(page,'CEX','Binance');await page.screenshot({path:`${SHOTS}/03-module-1-selected.png`,fullPage:true});const account=page.locator('.selected-accounts fieldset').filter({hasText:'Binance'});await account.locator('[data-key="region"]').selectOption('Australia');await account.locator('[data-key="account_type"]').selectOption('Personal');await page.locator('#module-continue').click();await page.locator('[data-condition-account][value="email"]').check();await page.screenshot({path:`${SHOTS}/04-module-2.png`,fullPage:true});await page.locator('#module-continue').click();await page.locator('[data-summary-text]').fill('纸质资料柜内的账户索引，不含任何密码。');await page.screenshot({path:`${SHOTS}/05-module-3.png`,fullPage:true});await page.locator('#module-continue').click();await page.locator('[data-key="instruction_text"]').fill('进入官方恢复入口，核对身份后按官方流程处理。');await page.screenshot({path:`${SHOTS}/06-module-4.png`,fullPage:true});await page.locator('#module-continue').click();await page.locator('#decision').selectOption('NOT_NEEDED');await page.screenshot({path:`${SHOTS}/07-module-5.png`,fullPage:true});await page.locator('#module-continue').click();await page.locator('#personal-message').fill('发生身份冲突时停止并联系官方。');await page.screenshot({path:`${SHOTS}/08-module-6.png`,fullPage:true});await page.locator('#module-previous').click();await expect(page.locator('#decision')).toHaveValue('NOT_NEEDED');await page.locator('#module-continue').click();await expect(page.locator('#personal-message')).toHaveValue('发生身份冲突时停止并联系官方。');await page.locator('#module-continue').click();await expect(page.locator('main')).toContainText('没有阻断问题');await page.screenshot({path:`${SHOTS}/09-review.png`,fullPage:true});await page.locator('#to-report').click();await expect(page.locator('.readiness-summary strong')).toHaveText('100%');await expect(page.locator('main')).toContainText('纸质资料柜内的账户索引');await page.screenshot({path:`${SHOTS}/10-preview.png`,fullPage:true});await page.locator('#report-review').click();await page.locator('[data-flow="message"]').click();await page.locator('#personal-message').fill('更新后的嘱托：遇到异常立即停止。');await page.screenshot({path:`${SHOTS}/11-back-to-edit.png`,fullPage:true});await page.locator('#module-continue').click();await page.locator('#to-report').click();await expect(page.locator('main')).toContainText('更新后的嘱托');await page.locator('#password').click();await page.locator('#payment-continue').click();await page.locator('#password-value').fill('Release-Gate-River-27!');await page.locator('#password-confirm').fill('Release-Gate-River-27!');await page.locator('#ack').check();await page.screenshot({path:`${SHOTS}/12-create-process.png`,fullPage:true});await page.locator('#generate').click();await expect(page.locator('h1')).toContainText('已创建');await page.screenshot({path:`${SHOTS}/13-create-success.png`,fullPage:true});
});

test('Release Gate — attachment add capacity delete and over-limit fail closed',async({page})=>{
  await openAccounts(page);await choose(page,'CEX','Binance');const account=page.locator('.selected-accounts fieldset').filter({hasText:'Binance'});await account.locator('[data-key="region"]').selectOption('Australia');await account.locator('[data-key="account_type"]').selectOption('Personal');await page.locator('#module-continue').click();await page.locator('[data-condition-account]').first().check();await page.locator('#module-attachments').click();const drawer=page.locator('main[data-view="attachments"]');await drawer.locator('.upload-policy summary').click();await expect(drawer.locator('.upload-policy')).toContainText('禁止上传');await drawer.locator('#file-upload').setInputFiles({name:'gate-note.txt',mimeType:'text/plain',buffer:Buffer.from('Release gate attachment without secrets.')});await drawer.locator('#upload').click();await expect(drawer.locator('[data-attachment-card]')).toContainText('gate-note.txt');const download=page.waitForEvent('download');await drawer.locator('[data-view-file]').click();await download;await drawer.locator('[data-replace-file]').setInputFiles({name:'gate-note-replaced.txt',mimeType:'text/plain',buffer:Buffer.from('Replacement without secrets.')});await expect(drawer.locator('[data-attachment-card]')).toContainText('gate-note-replaced.txt');await drawer.locator('[data-delete-file]').click();await expect(drawer.locator('[data-attachment-card]')).toHaveCount(0);await drawer.locator('#file-upload').setInputFiles({name:'too-large.txt',mimeType:'text/plain',buffer:Buffer.alloc(10*1024*1024+1,65)});await drawer.locator('#upload').click();await expect(drawer.locator('#message')).toContainText('单个附件不得超过 10 MiB');await expect(drawer.locator('[data-attachment-card]')).toHaveCount(0);
});

test('Release Gate — summary, itemized and module controls retain one Draft',async({page})=>{
  await openAccounts(page);await choose(page,'CEX','Binance');const account=page.locator('.selected-accounts fieldset').filter({hasText:'Binance'});await account.locator('[data-key="region"]').selectOption('Australia');await account.locator('[data-key="account_type"]').selectOption('Institutional');await page.locator('#module-continue').click();await page.locator('[data-condition-account][value="email"]').check();await page.locator('[data-condition-account][value="phone"]').check();await page.locator('#module-continue').click();await page.locator('[data-clear-all]').click();await expect(page.locator('[data-summary-account]:checked')).toHaveCount(0);await page.locator('[data-select-all]').click();await expect(page.locator('[data-summary-account]:checked')).toHaveCount(2);await page.locator('[data-toggle-itemized]').click();await page.locator('[data-expand-condition][value="phone"]').check();await expect(page.locator('[data-location][data-condition="phone"]')).toHaveCount(3);await page.locator('[data-location][data-condition="phone"][data-key="location_type"]').fill('纸质');await page.locator('[data-location][data-condition="phone"][data-key="location_name"]').fill('资料柜');await page.locator('[data-location][data-condition="phone"][data-key="description"]').fill('标记为官方手机号资料');await page.locator('[data-summary-text]').fill('邮箱资料位于账户索引。');await page.locator('#module-continue').click();await page.locator('#module-previous').click();await expect(page.locator('[data-location][data-condition="phone"][data-key="location_name"]')).toHaveValue('资料柜');
});

for(const [name,width] of [['desktop',1440],['laptop',1280],['mobile',390]])test(`Responsive ${name} has no horizontal overflow`,async({page})=>{await page.setViewportSize({width,height:name==='mobile'?844:900});await openAccounts(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)).toBe(false);await page.screenshot({path:`${SHOTS}/frozen-v2-responsive-${name}.png`,fullPage:true});});

test('V3 productization — Before You Begin, six instructions and secure-session autosave',async({page})=>{
  await page.goto(MAP);await page.locator('#next-task').click();await expect(page.locator('h1')).toContainText('开始前');await expect(page.locator('.before-begin li')).toHaveCount(6);await page.screenshot({path:`${SHOTS}/03-before-you-begin.png`,fullPage:true});
  await page.locator('#intro-start').click();await expect(page.locator('.module-instructions')).toBeVisible();await page.screenshot({path:`${SHOTS}/04-module-1-grouped-selector.png`,fullPage:true});
  await choose(page,'CEX','Binance');const account=page.locator('.selected-accounts fieldset').filter({hasText:'Binance'});await account.locator('[data-key="region"]').selectOption('Australia');await account.locator('[data-key="account_type"]').selectOption('Personal');
  await page.locator('[data-flow="conditions"]').click();await page.locator('[data-flow="accounts"]').click();await expect(page.locator('.selected-accounts')).toContainText('Binance');await expect(page.locator('#save-state')).toContainText('自动保存');
  for(const module of ['conditions','locations','instructions','assistants','message']){await page.locator(`[data-flow="${module}"]`).click();await expect(page.locator('.module-instructions')).toBeVisible();}
});

test('V3 productization — wallet fields simplify and Module 6 must be explicitly resolved',async({page})=>{
  await openAccounts(page);await choose(page,'HOT_WALLET','MetaMask');const wallet=page.locator('.selected-accounts fieldset').filter({hasText:'MetaMask'});await expect(wallet.locator('[data-key="region"]')).toHaveCount(0);await expect(wallet.locator('[data-key="account_type"]')).toHaveCount(0);
  await page.locator('[data-flow="message"]').click();await expect(page.locator('#skip-message')).not.toBeChecked();await page.locator('#app-home').click();await expect(page.locator('#report')).toHaveCount(0);await page.locator('#next-task').click();await page.locator('[data-flow="message"]').click();await page.locator('#skip-message').check();await page.locator('#module-continue').click();await expect(page.locator('h1')).toHaveText('检查与完善');
});

test('V3 productization — global Module 5 attachment is not exposed as an account choice',async({page})=>{
  await openAccounts(page);await choose(page,'CEX','Binance');const account=page.locator('.selected-accounts fieldset').filter({hasText:'Binance'});await account.locator('[data-key="region"]').selectOption('Australia');await account.locator('[data-key="account_type"]').selectOption('Personal');await page.locator('[data-flow="assistants"]').click();await page.locator('#decision').selectOption('NEED');await page.locator('#module-attachments').click();const drawer=page.locator('main[data-view="attachments"]');await expect(drawer.locator('h1')).toHaveText('添加附件');await expect(drawer.locator('#new-file-account').locator('..')).toBeHidden();await expect(drawer.locator('#new-file-module')).toHaveValue('assistants');
});

test('V3 Golden Journey — local create, material delivery, independent recovery and Recovered Guide',async({page})=>{
  await openAccounts(page);await choose(page,'CEX','Binance');const account=page.locator('.selected-accounts fieldset').filter({hasText:'Binance'});await account.locator('[data-key="region"]').selectOption('Australia');await account.locator('[data-key="account_type"]').selectOption('Personal');
  await page.locator('#module-continue').click();await page.locator('[data-condition-account][value="email"]').check();await page.locator('#module-continue').click();await page.locator('[data-summary-text]').fill('账户索引存放在家庭文件柜。');await page.locator('#module-continue').click();await page.locator('[data-key="instruction_text"]').fill('从官方入口核对身份后开始恢复。');await page.locator('#module-continue').click();await page.locator('#decision').selectOption('NOT_NEEDED');await page.locator('#module-continue').click();await page.locator('#skip-message').check();await page.locator('#module-continue').click();await page.locator('#to-report').click();await page.screenshot({path:`${SHOTS}/16-recovery-report.png`,fullPage:true});await page.locator('#password').click();await page.screenshot({path:`${SHOTS}/18-prepare-recovery-version.png`,fullPage:true});await page.locator('#payment-continue').click();await page.locator('#password-value').fill('Golden-River-Map-27!');await page.locator('#password-confirm').fill('Golden-River-Map-27!');await page.locator('#ack').check();await page.screenshot({path:`${SHOTS}/19-recovery-password.png`,fullPage:true});
  const createStart=Date.now();await page.locator('#generate').click();await expect(page.locator('h1')).toContainText('已创建');const createMs=Date.now()-createStart;await page.screenshot({path:`${SHOTS}/21-local-success.png`,fullPage:true});
  await page.evaluate(()=>Object.defineProperty(window,'showSaveFilePicker',{value:undefined,configurable:true}));const kitDownload=page.waitForEvent('download');await page.locator('#kit').click();const kit=await kitDownload;const kitPath=await kit.path();const archiveDownload=page.waitForEvent('download');await page.locator('#archive').click();const archive=await archiveDownload;const archivePath=await archive.path();
  await page.goto(`${QA_BASE}/web/recover.html`);await page.locator('#kit').setInputFiles(kitPath);await page.locator('#archive').setInputFiles(archivePath);await page.locator('#password').fill('Golden-River-Map-27!');await page.screenshot({path:`${SHOTS}/22-independent-recovery.png`,fullPage:true});const recoveryStart=Date.now();await page.locator('#recover').click();await expect(page.locator('.recovered-guide')).toBeVisible();const recoveryMs=Date.now()-recoveryStart;await page.screenshot({path:`${SHOTS}/24-recovery-guide.png`,fullPage:true});await page.locator('#view-recovered-map').click();await expect(page.locator('#recovered-map')).toContainText('Binance');await page.screenshot({path:`${SHOTS}/25-recovered-map.png`,fullPage:true});expect(createMs).toBeLessThan(30000);expect(recoveryMs).toBeLessThan(30000);console.log(`SKREK_LOCAL_PERFORMANCE create_ms=${createMs} recovery_ms=${recoveryMs}`);
});
