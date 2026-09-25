import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {
  APPROVED_TEST_ORIGIN,
  CURRENT_TEST_RELEASE,
  canonicalAccountUrl,
  canonicalCreateUrl,
  canonicalHomeUrl,
  canonicalRecoveryUrl
} from '../../src/ui/canonical-customer-links.js';

const [html,product,header,bridge,account,map,recovery]=await Promise.all([
  '../../web/v3-crypto/index.html',
  '../../web/v3-crypto/product-v1.js',
  '../../src/ui/skrek-global-header.js',
  '../../src/account/account-nav-bridge.js',
  '../../src/account/supabase-account-app.js',
  '../../web/v2/v2-app.js',
  '../../web/recover.js'
].map(path=>readFile(new URL(path,import.meta.url),'utf8')));

const assertCanonical=value=>{
  const url=new URL(value);
  assert.equal(url.protocol,'https:');
  assert.equal(url.origin,APPROVED_TEST_ORIGIN);
  assert.equal(url.searchParams.get('release'),CURRENT_TEST_RELEASE);
  assert.equal(url.searchParams.has('deploy'),false);
  assert.doesNotMatch(value,/localhost|127\.0\.0\.1|file:/);
};

test('canonical resolver owns every customer destination and injects one current release',()=>{
  for(const url of [
    canonicalHomeUrl(),
    canonicalAccountUrl('login'),
    canonicalAccountUrl('signup'),
    canonicalAccountUrl('center',{section:'maps'}),
    canonicalCreateUrl(),
    canonicalRecoveryUrl('recovery-center')
  ])assertCanonical(url);
});

test('header, account state, home CTA, purchase and recovery handoff use the shared resolver',()=>{
  assert.match(header,/canonicalHomeUrl|canonicalAccountUrl|canonicalRecoveryUrl/);
  assert.match(bridge,/canonicalAccountUrl/);
  assert.match(product,/canonicalCreateUrl/);
  assert.match(product,/canonicalRecoveryUrl/);
  assert.match(account,/canonicalCreateUrl/);
  assert.match(account,/canonicalHomeUrl/);
  assert.match(map,/canonicalAccountUrl/);
  assert.match(map,/canonicalHomeUrl/);
  assert.match(recovery,/canonicalCreateUrl/);
});

test('homepage fallback and runtime sources contain no stale customer entry release or relative destination',()=>{
  const surface=[html,product,header,bridge,account,map,recovery].join('\n');
  for(const stale of ['global-nav-v1','product-experience-v1','product-integration-v1','recovery-map-current-v2'])assert.doesNotMatch(surface,new RegExp(stale));
  assert.doesNotMatch(surface,/location\.href=`?\.\.\/(?:account|recover|v2)\/|href="\.\.\/(?:account|recover|v2)\//);
  assert.match(html,new RegExp(`legavik-deployment" content="${CURRENT_TEST_RELEASE}`));
  assert.match(html,new RegExp(`canonical-entry\\.${CURRENT_TEST_RELEASE}\\.js`));
});
