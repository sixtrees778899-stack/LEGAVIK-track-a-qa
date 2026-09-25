import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {customerBrand} from '../../src/ui/brand-contract.js';
import {skrekGlobalHeader} from '../../src/ui/skrek-global-header.js';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');

test('customer-facing brand contract locks name, tagline, category and approved master asset',()=>{
  assert.deepEqual(customerBrand,{name:'LEGAVIK',wordmark:'LEGAVIK',tagline:'Digital Asset Recovery & Legacy',category:'Digital Asset Recovery Infrastructure',logo:{masterV1:'../assets/legavik-brand-master-v1.png',alt:'LEGAVIK — Digital Asset Recovery & Legacy'},browserTitle:'LEGAVIK · Digital Asset Recovery & Legacy',shortDescription:'为重要数字资产留下清晰、可恢复的路径。'});
});

test('shared header uses the approved LEGAVIK master and alt text with canonical navigation intact',()=>{
  const html=skrekGlobalHeader();
  assert.match(html,/legavik-brand-master-v1\.png/);
  assert.match(html,/alt="LEGAVIK — Digital Asset Recovery &amp; Legacy"/);
  assert.match(html,/aria-label="LEGAVIK首页"/);
  assert.match(html,/https:\/\/sixtrees778899-stack\.github\.io\/SKREK-auth-test\/web\/account\/index\.html/);
});

test('canonical shared surfaces expose LEGAVIK titles, SEO, logo and official tagline',()=>{
  const homepage=read('../../web/v3-crypto/index.html');
  const account=read('../../web/account/index.html');
  const create=read('../../web/v2/index.html');
  const recovery=read('../../web/recover.html');
  assert.match(homepage,/<title>LEGAVIK · Digital Asset Recovery &amp; Legacy<\/title>/);
  assert.match(homepage,/Digital Asset Recovery Infrastructure/);
  assert.match(account,/<title>登录 \| LEGAVIK<\/title>/);
  assert.match(create,/<title>LEGAVIK Recovery Map<\/title>/);
  assert.match(recovery,/legavik-brand-master-v1\.png/);
  assert.match(recovery,/LEGAVIK — Digital Asset Recovery &amp; Legacy/);
});

test('shared brand layer has no old customer-facing brand or misspelling residue',()=>{
  const shared=[read('../../src/ui/brand-contract.js'),read('../../src/ui/skrek-global-header.js'),read('../../web/v3-crypto/brand-config.js'),read('../../web/v3-crypto/index.html'),read('../../web/recover.html')].join('\n');
  for(const residue of [/Digital Asset Recovery & Continuity/i,/\bLegvik\b/i,/\bLegvic\b/i,/\bLagvik\b/i])assert.doesNotMatch(shared,residue);
  assert.doesNotMatch(shared,/skrek-logo-formal\.png/i);
});
