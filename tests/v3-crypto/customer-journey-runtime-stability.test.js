import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {canonicalPricingUrl,CURRENT_TEST_RELEASE} from '../../src/ui/canonical-customer-links.js';

const read=path=>readFileSync(new URL(`../../${path}`,import.meta.url),'utf8');
const map=read('web/v2/v2-app.js');
const mapEntry=read('web/v2/canonical-entry.js');
const account=read('src/account/supabase-account-app.js');
const nav=read('src/account/account-nav-bridge.js');
const metadata=read('src/account/recovery-metadata-client.js');

test('all unpurchased Recovery Map starts hand off to the single canonical Pricing page',()=>{
  assert.equal(canonicalPricingUrl(),`https://sixtrees778899-stack.github.io/LEGAVIK-track-a-qa/web/v3-crypto/index.html?release=${CURRENT_TEST_RELEASE}#pricing`);
  assert.match(map,/guide-start-top[\s\S]*location\.assign\(canonicalPricingUrl\(\)\)/);
  assert.match(map,/purchaseState\.purchaseCompleted\?navTo\(id\):location\.assign\(canonicalPricingUrl\(\)\)/);
  assert.match(account,/href:eligible\?recoveryMapCreateUrl:recoveryMapPurchaseUrl,label:eligible\?'开始建立':'选择服务方案'/);
  assert.doesNotMatch(account,/pricing-products-v2/);
});

test('legacy public Pricing entry is retired to canonical current Pricing',()=>{
  assert.match(mapEntry,/location\.hash==='#purchase-plans'/);
  assert.match(mapEntry,/path:'\/web\/v3-crypto\/index\.html',hash:'#pricing'/);
});

test('customer surfaces share one persistent auto-refreshing auth client',()=>{
  for(const source of [account,nav,metadata])assert.match(source,/globalThis\.LEGAVIK_SUPABASE_CLIENT/);
  assert.match(account,/autoRefreshToken:true/);
  assert.match(nav,/detectSessionInUrl:true,flowType:'pkce'/);
});
