import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const app=await readFile(new URL('../../web/v2/v2-app.js',import.meta.url),'utf8');
const header=await readFile(new URL('../../src/ui/skrek-global-header.js',import.meta.url),'utf8');
const recover=await readFile(new URL('../../web/recover.html',import.meta.url),'utf8');
const cryptoRecover=await readFile(new URL('../../web/v3-crypto/recover.html',import.meta.url),'utf8');
const css=await readFile(new URL('../../web/v2/product-integration.css',import.meta.url),'utf8');
const brandContract=await readFile(new URL('../../src/ui/brand-contract.js',import.meta.url),'utf8');

test('LEGAVIK Brand Master V1 is the shared customer-facing brand asset',()=>{
  assert.match(header,/customerBrand\.logo\.masterV1/);
  for(const source of [brandContract,recover,cryptoRecover]){
    assert.match(source,/legavik-brand-master-v1\.png/);
    assert.match(source,/LEGAVIK/);
    assert.doesNotMatch(source,/skrek-logo-formal\.png|Digital Asset Recovery &amp; Continuity/);
  }
});

test('guide is the approved six-section accordion with two pricing CTAs',()=>{
  assert.match(app,/data-guide-accordion/);
  assert.match(app,/guide-accordion-item/);
  assert.doesNotMatch(app,/guide-module-sections/);
  assert.match(app,/id="guide-start-top"/);
  assert.match(app,/id="guide-start"/);
  assert.match(app,/guide-start-top.*guide-start.*canonicalPricingUrl\(\)/s);
  assert.match(css,/\.guide-top-cta/);
});

test('Module 1 categories are true inline accordions',()=>{
  const source=app.slice(app.indexOf('function renderAccountsAccordion'),app.indexOf('function renderConditionsStructured'));
  assert.match(source,/<section class="catalog-category-row" data-category-row="\$\{id\}">/);
  assert.match(source,/data-catalog-category="\$\{id\}"[\s\S]*?\$\{expanded\?`<div class="catalog-expanded">/);
  assert.match(source,/selected\.length\)\{for\(const account of selected\)removeCatalogAccount/);
  assert.match(source,/class="secondary add-another-account"/);
  assert.match(app,/function toggleCatalogCategory\(category\)[\s\S]*?scrollIntoView\(\{block:'start',behavior:'auto'\}\)/);
  assert.match(css,/\.catalog-category-row\{scroll-margin-top:190px\}/);
});

test('first select and final deselect preserve layout without scroll masking',()=>{
  const source=app.slice(app.indexOf('function renderAccountsAccordion'),app.indexOf('function renderConditionsStructured'));
  assert.match(source,/catalog-category-summary">\$\{summary\?escape\(summary\):'&nbsp;'\}/);
  assert.match(source,/selected-accounts-empty/);
  assert.doesNotMatch(source,/scrollTo\(/);
  assert.match(css,/\.catalog-category-summary\{[^}]*min-height/);
  assert.match(css,/\.selected-accounts-empty\{[^}]*min-height/);
});
