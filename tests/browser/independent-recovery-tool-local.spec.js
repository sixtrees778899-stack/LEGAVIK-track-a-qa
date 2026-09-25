import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

test('saved standalone tool launches from local storage without platform dependencies',async({page})=>{
  const artifact=path.resolve('artifacts/independent-recovery-tool-v1/LEGAVIK-Independent-Recovery-Tool-V1.html');
  const requests=[];
  page.on('request',request=>requests.push(request.url()));
  await page.goto(pathToFileURL(artifact).href);
  await expect(page).toHaveTitle('LEGAVIK Independent Recovery Tool V1');
  await expect(page.getByRole('heading',{name:'独立恢复 Recovery Map'})).toBeVisible();
  await expect(page.getByLabel('Mainnet Recovery Evidence')).toBeVisible();
  await expect(page.getByLabel('Recovery Kit')).toBeVisible();
  await expect(page.getByLabel('Recovery Password')).toBeVisible();
  await expect(page.getByRole('button',{name:'开始独立恢复'})).toBeVisible();
  expect(requests).toEqual([pathToFileURL(artifact).href]);
  const html=await page.content();
  for(const forbidden of ['supabase.co','service_role','SIGN_TRANSACTION','createTransaction'])expect(html.toLowerCase()).not.toContain(forbidden.toLowerCase());
});
