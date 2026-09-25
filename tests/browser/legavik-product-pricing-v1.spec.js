import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';

const SHOTS='docs/evidence/legavik-product-pricing-v2';
const URL='/web/v3-crypto/index.html#pricing';
const drawerSections=['这个方案帮您解决什么问题','适合哪些客户','首年具体包含','第二年年度维护服务'];

test.beforeAll(async()=>mkdir(SHOTS,{recursive:true}));

for(const viewport of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]){
  test(`${viewport.name} Pricing V2 complete customer journey`,async({page})=>{
    const errors=[];page.on('console',message=>{if(message.type()==='error')errors.push(`${message.text()} @ ${message.location().url}:${message.location().lineNumber}`);});page.on('pageerror',error=>errors.push(error.message));
    await page.setViewportSize({width:viewport.width,height:viewport.height});await page.goto(URL);
    await expect(page.locator('.pricing-intro h1')).toHaveCount(0);await expect(page.locator('.pricing-intro .kicker')).toHaveText('LEGAVIK PLANS');await expect(page.locator('.pricing-intro')).toContainText('把重要的数字资产恢复信息系统整理清楚');await expect(page.locator('.pricing-intro')).toContainText('恢复凭证套件和恢复密码始终由您掌握');await expect(page.locator('.pricing-intro strong')).toHaveText('选择适合您的服务方案。');await expect(page.locator('.pricing-plan-list button')).toHaveCount(3);
    for(const plan of ['Essential','Standard','Legacy / Private']){
      await page.locator(`[data-pricing-plan="${plan}"]`).click();await expect(page.locator('.pricing-detail')).toContainText({Essential:'基础版',Standard:'标准版','Legacy / Private':'传承定制版'}[plan]);
      await expect(page.locator('.pricing-detail>.pricing-action .pricing-buy')).toHaveText('选择此方案');await expect(page.locator('.pricing-value>section>h3')).toHaveCount(0);
      await page.locator('[data-plan-detail]').click();const drawer=page.locator('[role="dialog"]');await expect(drawer).toBeVisible();
      for(const heading of drawerSections)await expect(drawer).toContainText(heading);
      if(plan==='Essential')await expect(drawer).toContainText('恢复密钥文件、链上恢复凭证和恢复密码三者缺一不可');
      if(plan==='Legacy / Private')await expect(drawer).toContainText('典型场景');
      await page.locator('.plan-detail-close').click();
    }
    await page.locator('[data-pricing-comparison]').click();await expect(page.locator('#pricing-comparison-panel')).toHaveClass(/open/);await expect(page.locator('.pricing-comparison thead th')).toHaveCount(4);await expect(page.locator('.pricing-comparison')).toContainText('客户自主安排');
    await page.locator('[data-pricing-common]').click();await expect(page.locator('.pricing-comparison-scroll.common')).toBeVisible();
    await expect(page.locator('.annual-value-item')).toHaveCount(3);await expect(page.locator('.pricing-faq details')).toHaveCount(3);
    for(const faq of await page.locator('.pricing-faq details').all())expect(await faq.getAttribute('open')).toBeNull();
    await page.locator('.pricing-faq details').first().locator('summary').click();await expect(page.locator('.pricing-faq details').first()).toHaveAttribute('open','');
    await expect(page.locator('main')).not.toContainText(/MOST POPULAR|Initial Recovery Readiness Review|Continuity|核心恢复材料|SKREK|CJAS|非破坏性/);
    await page.locator('[data-pricing-plan="Standard"]').click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);await page.screenshot({path:`${SHOTS}/pricing-v2-${viewport.name}.png`,fullPage:true});
  });
}

test('USD and AUD fixed prices switch together and persist',async({page})=>{
  await page.goto(URL);await page.locator('[data-pricing-currency="AUD"]').click();
  await expect(page.locator('.pricing-detail')).toContainText('AUD 1,680');await expect(page.locator('.annual-care')).toContainText('AUD 336 / 年');await expect(page.locator('.pricing-faq')).toContainText('AUD 280 / 次');
  await page.reload();await expect(page.locator('[data-pricing-currency="AUD"]')).toHaveClass(/active/);await expect(page.locator('.pricing-detail')).toContainText('AUD 1,680');
  await page.locator('[data-pricing-currency="USD"]').click();await expect(page.locator('.pricing-detail')).toContainText('USD 1,199');await expect(page.locator('.annual-care')).toContainText('USD 240 / 年');
});

for(const region of [{code:'AU',currency:'AUD'},{code:'NZ',currency:'AUD'},{code:'US',currency:'USD'}]){
  test(`${region.code} region defaults to ${region.currency}`,async({page})=>{
    await page.addInitScript(code=>Object.defineProperty(globalThis,'LEGAVIK_PRICING_REGION',{value:code}),region.code);await page.goto(URL);
    await expect(page.locator(`[data-pricing-currency="${region.currency}"]`)).toHaveClass(/active/);
  });
}

test('drawer purchase CTA preserves canonical account handoff with selected currency',async({page})=>{
  await page.goto(URL);await page.locator('[data-pricing-currency="AUD"]').click();await page.locator('[data-plan-detail]').click();await page.locator('.plan-detail-drawer [data-buy-plan="Standard"]').click();
  const dialog=page.getByRole('dialog',{name:'确认标准版'});await dialog.getByLabel('到期前再决定').check();await dialog.getByRole('button',{name:'继续账户与购买'}).click();
  await expect(page).toHaveURL(/\/web\/account\/index\.html.*plan=Standard.*currency=AUD.*price=1680/);
});
