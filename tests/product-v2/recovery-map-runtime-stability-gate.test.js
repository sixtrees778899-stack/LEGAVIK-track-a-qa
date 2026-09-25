import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const gate=readFileSync(new URL('../../web/canonical-runtime-gate.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../../web/v2/v2-app.js',import.meta.url),'utf8');

const deployment='legavik-recovery-map-runtime-stability-20260916-1';
const flush=async()=>{for(let index=0;index<8;index+=1)await Promise.resolve();};
function runtimeHarness(){
  const root={dataset:{},innerHTML:'healthy recovery map'},scripts=[],timers=[];
  const location={hostname:'localhost',protocol:'http:',origin:'http://localhost',pathname:'/web/v2/index.html',search:`?release=${deployment}`,hash:'',href:`http://localhost/web/v2/index.html?release=${deployment}`};
  const document={
    documentElement:{dataset:{v2BundleRelease:deployment}},
    body:{append(script){scripts.push(script);}},
    getElementById(){return root;},
    querySelector(selector){return selector.includes('legavik-deployment')?{content:deployment}:null;},
    createElement(){return{remove(){},onload:null,onerror:null,src:'',type:'',id:''};}
  };
  const context={URL,URLSearchParams,location,document,history:{replaceState(){}},fetch:async()=>({ok:true,json:async()=>({deployment_identity:deployment})}),setTimeout(callback){timers.push(callback);return timers.length;},clearTimeout(){},console};
  context.globalThis=context;
  vm.runInNewContext(gate,context);
  return{gate:context.SKREK_RUNTIME_GATE,root,scripts,timers};
}

test('READY is the sole terminal startup transition and cancels its timeout',()=>{
  assert.match(gate,/startupControllers=new WeakMap/);
  assert.match(gate,/state='READY';clearTimeout\(timeout\)/);
  assert.match(gate,/state!=='STARTING'\|\|!identityMatches\(\)/);
  assert.match(gate,/controller\?\.isReady\(\)/);
});

test('ordinary creation explicitly signals application readiness to the shared gate',()=>{
  assert.match(app,/if\(!versionUpdateMode\)globalThis\.SKREK_RUNTIME_GATE\?\.markReady\(app\)/);
});

test('startup configuration reads retry transient browser cancellation without changing product data',()=>{
  assert.match(app,/for\(let attempt=0;attempt<3;attempt\+=1\)/);
  assert.match(app,/fetch\(path,\{cache:'no-store'\}\)/);
  assert.match(app,/throw Object\.assign\(new Error\('本地配置加载失败'\)/);
});

test('terminal failure remains available for a runtime that never becomes ready',()=>{
  assert.match(gate,/state='STARTUP_FAILED'/);
  assert.match(gate,/title:'页面加载未完成'/);
});

test('post-READY stale startup timeout is ignored',async()=>{
  const runtime=runtimeHarness();
  runtime.gate.boot({rootId:'app',scripts:[{src:'/bundle.js',type:'module'}],bundleMarker:'v2BundleRelease',timeoutMs:30000});
  await flush();
  assert.equal(runtime.gate.markReady(runtime.root),true);
  const healthy=runtime.root.innerHTML;
  runtime.timers[0]();await flush();
  assert.equal(runtime.root.dataset.runtimeState,'READY');
  assert.equal(runtime.root.dataset.startupState,'READY');
  assert.equal(runtime.root.innerHTML,healthy);
});

test('application READY is not accepted before manifest identity validation',async()=>{
  const runtime=runtimeHarness();
  runtime.gate.boot({rootId:'app',scripts:[{src:'/bundle.js',type:'module'}],bundleMarker:'v2BundleRelease'});
  assert.equal(runtime.gate.markReady(runtime.root),false);
  assert.notEqual(runtime.root.dataset.startupState,'READY');
  await flush();
  assert.equal(runtime.gate.markReady(runtime.root),true);
});

test('post-READY delayed script load callback is ignored',async()=>{
  const runtime=runtimeHarness();
  runtime.gate.boot({rootId:'app',scripts:[{src:'/bundle.js',type:'module'}],bundleMarker:'v2BundleRelease'});
  await flush();assert.equal(runtime.scripts.length,1);
  assert.equal(runtime.gate.markReady(runtime.root),true);
  const healthy=runtime.root.innerHTML;
  runtime.scripts[0].onload();await flush();
  assert.equal(runtime.root.dataset.runtimeState,'READY');
  assert.equal(runtime.root.innerHTML,healthy);
});

test('post-READY delayed script error callback cannot render startup failure',async()=>{
  const runtime=runtimeHarness();
  runtime.gate.boot({rootId:'app',scripts:[{src:'/bundle.js',type:'module'}],bundleMarker:'v2BundleRelease'});
  await flush();assert.equal(runtime.scripts.length,1);
  assert.equal(runtime.gate.markReady(runtime.root),true);
  const healthy=runtime.root.innerHTML;
  runtime.scripts[0].onerror();await flush();
  runtime.timers.at(-1)();await flush();
  runtime.scripts.at(-1).onerror();await flush();
  assert.equal(runtime.root.dataset.runtimeState,'READY');
  assert.equal(runtime.root.innerHTML,healthy);
});
