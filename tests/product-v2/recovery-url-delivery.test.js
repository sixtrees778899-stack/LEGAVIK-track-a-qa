import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import http from 'node:http';
import {ensureTestServer,inspectServer,verifyHttpResources} from '../../tools/launch-test-environment.mjs';

const root=new URL('../../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const freePort=async()=>{
  const reservation=http.createServer();
  await new Promise(resolve=>reservation.listen(0,'127.0.0.1',resolve));
  const port=reservation.address().port;
  await new Promise(resolve=>reservation.close(resolve));
  return port;
};
const stop=child=>new Promise(resolve=>{if(!child||child.exitCode!==null)return resolve();child.once('exit',resolve);child.kill('SIGTERM');});

test('all product-facing recovery links consume the canonical route helper',async()=>{
  const [route,canonical,header,completion,account]=await Promise.all([
    read('src/ui/recovery-route.js'),read('src/ui/canonical-customer-links.js'),read('src/ui/skrek-global-header.js'),read('web/v2/v2-app.js'),read('src/account/supabase-account-app.js')
  ]);
  assert.match(route,/RECOVERY_PATH='\/web\/recover\.html'/);
  assert.match(route,/pathname\.indexOf\('\/web\/'\)/);
  assert.match(canonical,/canonicalRecoveryUrl/);
  assert.match(header,/canonicalRecoveryUrl\('recovery-center'\)/);
  assert.match(completion,/canonicalRecoveryUrl\('post-creation'\)/);
  assert.match(account,/canonicalRecoveryUrl\('recovery-center'\)/);
  for(const source of [header,completion,account])assert.doesNotMatch(source,/v3-crypto\/recover\.html/);
});

test('canonical recovery route preserves a GitHub Pages project prefix',async()=>{
  const {recoveryUrl}=await import('../../src/ui/recovery-route.js');
  assert.equal(recoveryUrl('post-creation',{pathname:'/SKREK-auth-test/web/v2/index.html'}),'/SKREK-auth-test/web/recover.html?source=post-creation');
  assert.equal(recoveryUrl('recovery-center',{pathname:'/SKREK-auth-test/web/account/index.html'}),'/SKREK-auth-test/web/recover.html?source=recovery-center');
  assert.equal(recoveryUrl('post-creation',{pathname:'/web/v2/index.html'}),'/web/recover.html?source=post-creation');
});

test('legacy file opening shows an explicit test-server safeguard',async()=>{
  const html=await read('web/v3-crypto/recover.html');
  assert.match(html,/当前页面需要通过 LEGAVIK 测试服务打开/);
  assert.match(html,/请使用由测试启动器提供的 HTTP 地址/);
  assert.doesNotMatch(html,/正在进入统一恢复中心/);
});

test('launcher starts, identifies, reuses and restarts the expected server',async()=>{
  const port=await freePort();
  let first,second;
  try{
    first=await ensureTestServer({port});
    assert.equal(first.reused,false);
    assert.equal((await inspectServer(port)).valid,true);
    await verifyHttpResources(port);
    const reused=await ensureTestServer({port});
    assert.equal(reused.reused,true);
    await stop(first.child);first=null;
    second=await ensureTestServer({port});
    assert.equal(second.reused,false);
    await verifyHttpResources(port);
  }finally{
    await stop(first?.child);await stop(second?.child);
  }
});

test('launcher refuses a different process on the configured port',async()=>{
  const port=await freePort(),wrong=http.createServer((_request,response)=>{response.writeHead(200);response.end('other service');});
  await new Promise(resolve=>wrong.listen(port,'127.0.0.1',resolve));
  try{
    await assert.rejects(()=>ensureTestServer({port}),/非预期服务占用/);
  }finally{
    await new Promise(resolve=>wrong.close(resolve));
  }
});
