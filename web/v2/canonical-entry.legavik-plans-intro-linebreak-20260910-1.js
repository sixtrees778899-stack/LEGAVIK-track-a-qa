(()=>{
  const app=document.querySelector('#app'),gate=globalThis.SKREK_RUNTIME_GATE;
  if(!gate){app.innerHTML='<section class="card" role="alert"><h1>当前入口不受支持</h1><p>请使用正式 HTTPS 测试入口。</p><a class="button" href="https://sixtrees778899-stack.github.io/SKREK-auth-test/web/account/index.html?section=maps#center">打开正式 HTTPS 测试入口</a></section>';return;}
  const legacyPricingEntry=location.hash==='#purchase-plans'||new URLSearchParams(location.search).get('entry')==='purchase-plans';
  if(legacyPricingEntry){location.replace(gate.currentUrl(gate.deployment,{path:'/web/v3-crypto/index.html',hash:'#pricing'}));return;}
  const pagesRuntime=location.origin===gate.canonicalOrigin;
  const appScript=pagesRuntime?'./v2-app.legavik-plans-intro-linebreak-20260910-1.bundle.js':'./v2-app.js';
  const approved=gate.boot({rootId:'app',canonicalPath:'/web/v2/index.html',bundleMarker:'recoveryMapBundleRelease',scripts:[{src:'../account/public-config.legavik-plans-intro-linebreak-20260910-1.js'},{src:'../account/account-nav-bridge.legavik-plans-intro-linebreak-20260910-1.bundle.js'},{src:appScript,type:'module',id:'recovery-map-app'}]});
  if(!approved)return;
  const renderFailure=()=>{if(!app||app.dataset.runtimeState!=='LOADING')return;app.dataset.runtimeState='FAILED';app.innerHTML='<section class="card initialization-failure" role="alert"><h1>Recovery Map 未能正常打开</h1><p>请重新打开当前页面。</p><div class="actions"><a class="button secondary" href="../account/index.html?section=maps&release=legavik-plans-intro-linebreak-20260910-1#center">返回客户中心</a></div></section>';};
  setTimeout(renderFailure,30000);
})();
