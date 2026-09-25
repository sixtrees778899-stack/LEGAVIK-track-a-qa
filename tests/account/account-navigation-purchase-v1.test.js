import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const header=readFileSync(new URL('../../src/ui/skrek-global-header.js',import.meta.url),'utf8');
const headerCss=readFileSync(new URL('../../src/ui/skrek-global-header.css',import.meta.url),'utf8');
const bridge=readFileSync(new URL('../../src/account/account-nav-bridge.js',import.meta.url),'utf8');
const product=readFileSync(new URL('../../web/v2/v2-app.js',import.meta.url),'utf8');
const account=readFileSync(new URL('../../src/account/supabase-account-app.js',import.meta.url),'utf8');
const accountHtml=readFileSync(new URL('../../web/account/index.html',import.meta.url),'utf8');
const productCss=readFileSync(new URL('../../web/v2/product-integration.css',import.meta.url),'utf8');
const canonicalLinks=readFileSync(new URL('../../src/ui/canonical-customer-links.js',import.meta.url),'utf8');

test('global navigation keeps independent recovery while account identity is session-aware',()=>{
  assert.match(header,/data-account-state/);
  assert.match(header,/canonicalRecoveryUrl\('recovery-center'\)/);
  assert.match(canonicalLinks,/recovery:'\/web\/recover\.html'/);
  assert.doesNotMatch(header,/v3-crypto\/recover\.html/);
  assert.match(bridge,/session\?\.user\?\.email/);
  assert.doesNotMatch(bridge,/select\('username'\)/);
  assert.match(bridge,/split\('@'\)\[0\]/);
  assert.match(bridge,/persistSession:true/);
  assert.match(headerCss,/menu-open \.nav-actions \.text-button.*display:inline-flex/);
  assert.match(headerCss,/menu-open \.nav-actions \.button.*display:inline-flex/);
});

test('plan selection hands off plan identity to account flow instead of customer center',()=>{
  assert.match(product,/canonicalAccountUrl\('signup',\{purchase:'1',plan/);
  const select=product.slice(product.indexOf('function selectPlan'),product.indexOf('function renderPurchasePlans'));
  assert.doesNotMatch(select,/customer|center|purchase-checkout/);
});

test('approved test deployment preserves identity and bypasses unimplemented payment without writes',()=>{
  assert.match(product,/canonicalAccountUrl\('signup',\{purchase:'1',plan,\.\.\.\(purchaseTestMode\?\{test:'1'\}/);
  assert.match(account,/pagesTestHost=location\.hostname==='sixtrees778899-stack\.github\.io'&&location\.pathname\.startsWith\('\/SKREK-auth-test\/'\)/);
  assert.match(account,/testRecoveryMap=localTestHost\|\|pagesTestHost/);
  assert.match(account,/location\.replace\(canonicalCreateUrl\(\{test_recovery_map:'1'\}\)\+'#accounts'\)/);
  assert.match(account,/if\(purchase\.active\)\{if\(testRecoveryMap\)return continueTestPurchase\(\);return renderPaymentPending\(\);\}/);
  const paymentPending=account.slice(account.indexOf('function renderPaymentPending'),account.indexOf('function continueTestPurchase'));
  assert.doesNotMatch(paymentPending,/\.from\(['"](?:orders|payments)['"]\)|\.insert\(/);
  assert.match(product,/const entryView=versionUpdateMode\?'version-update-loading':testRecoveryMap\?'accounts':'guide'/);
});

test('account pages reuse the complete shared header and recovery CTA retains brand state',()=>{
  assert.match(account,/skrekGlobalHeader/);
  assert.match(account,/global-header-host/);
  assert.match(accountHtml,/skrek-global-header\.[a-z0-9-]+\.css/);
  assert.match(accountHtml,/canonical-entry\.[a-z0-9-]+\.js/);
  assert.match(productCss,/\.guide-top-cta:focus.*linear-gradient\(100deg,#67f2c1,#24db78\)!important/s);
  assert.match(productCss,/translateY\(1px\) scale\(\.99\)/);
});

test('module 5 defaults to no assistance and module 6 has no skip control',()=>{
  assert.match(product,/assistant_decision==='NOT_SET'.*'NOT_NEEDED'/s);
  assert.match(product,/attachmentButton\.disabled=store\.assistant_decision!=='NEED'/);
  assert.match(product,/removeAttachment\(next,file\.attachment_id\)/);
  const message=product.slice(product.indexOf('function renderMessageV2'),product.indexOf('function renderPasswordV2'));
  assert.doesNotMatch(message,/skip-message|暂不填写/);
});
