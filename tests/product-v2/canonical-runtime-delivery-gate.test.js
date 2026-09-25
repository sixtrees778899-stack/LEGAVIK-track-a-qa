import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CURRENT_TEST_RELEASE} from '../../src/ui/canonical-customer-links.js';

const read=path=>readFileSync(new URL(`../../${path}`,import.meta.url),'utf8');
const gate=read('web/canonical-runtime-gate.js');
const manifest=JSON.parse(read('web/release-manifest.json'));
const htmlPaths=['web/v3-crypto/index.html','web/account/index.html','web/v2/index.html','web/recover.html'];

test('all customer entries and manifest use one deployment identity',()=>{
  assert.equal(manifest.deployment_identity,CURRENT_TEST_RELEASE);
  for(const path of htmlPaths){
    const html=read(path);
    assert.match(html,new RegExp(`name="legavik-deployment" content="${CURRENT_TEST_RELEASE}"`));
    assert.match(html,new RegExp(`canonical-runtime-gate\\.${CURRENT_TEST_RELEASE}\\.js`));
    assert.doesNotMatch(html,/\?(?:v|build|release)=/);
  }
  assert.match(gate,new RegExp(`deployment='${CURRENT_TEST_RELEASE}'`));
  assert.match(gate,/cache:'no-store'/);
});

test('manifest proves every immutable asset identity',()=>{
  assert.ok(manifest.assets.length>=20);
  for(const asset of manifest.assets){
    assert.match(asset.path,new RegExp(`\\.${CURRENT_TEST_RELEASE}\\.`));
    assert.equal(createHash('sha256').update(readFileSync(new URL(`../../${asset.path}`,import.meta.url))).digest('hex'),asset.sha256);
  }
});

test('homepage has a runtime gate and no partial static product fallback',()=>{
  const html=read('web/v3-crypto/index.html');
  assert.match(html,/data-runtime-state="BOOT"/);
  assert.match(html,/正在打开当前页面/);
  assert.doesNotMatch(html,/Recovery Readiness|0%|开始建立 Recovery Map/);
  assert.match(gate,/VERSION_CHECK/);
  assert.match(gate,/VERSION_MISMATCH/);
  assert.match(gate,/runtimeState='FAILED'/);
});

test('stale version has one controlled upgrade attempt and then fails closed',()=>{
  assert.match(gate,/get\('runtime_upgrade'\)===target/);
  assert.match(gate,/upgrade:true/);
  assert.match(gate,/location\.replace\(currentUrl/);
  assert.match(gate,/页面加载未完成/);
  assert.doesNotMatch(gate,/location\.reload/);
});

test('formal delivery remains canonical HTTPS and byte-identical',()=>{
  assert.match(gate,/location\.protocol==='https:'/);
  assert.match(gate,/approvedPaths\.has\(url\.pathname\)/);
  assert.match(gate,/verifiedUrl===deliveredUrl/);
  assert.doesNotMatch(gate,/file:/);
});

test('all entry helpers retain resilient terminal timeouts',()=>{
  assert.match(read('web/account/canonical-entry.js'),/setTimeout\(fail,30000\)/);
  assert.match(read('web/v2/canonical-entry.js'),/setTimeout\(renderFailure,30000\)/);
  assert.match(read('web/canonical-entry-recovery.js'),/12000/);
});

test('runtime gate retries transient manifest and bundle failures before customer-safe failure',()=>{
  assert.match(gate,/const retry=async/);
  assert.match(gate,/attempts=3/);
  assert.match(gate,/attempts:2/);
  assert.match(gate,/timeoutMs=30000/);
});

test('runtime watchdog accepts an application that has already reached the matching READY state',()=>{
  assert.match(gate,/root\?\.dataset\.runtimeState==='READY'/);
  assert.match(gate,/document\.documentElement\.dataset\[bundleMarker\]===deployment/);
  assert.match(gate,/if\(applicationReady\(\)\)\{finished=true;return;\}/);
});
