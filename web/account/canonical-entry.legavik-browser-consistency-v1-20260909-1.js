(()=>{
  const app=document.querySelector('#account-app'),gate=globalThis.SKREK_RUNTIME_GATE;
  if(!gate){app.innerHTML='<main><section role="alert"><h1>当前入口不受支持</h1><p>请使用正式 HTTPS 测试入口。</p><a href="https://sixtrees778899-stack.github.io/SKREK-auth-test/web/account/index.html?section=maps#center">打开正式 HTTPS 测试入口</a></section></main>';return;}
  const approved=gate.boot({rootId:'account-app',canonicalPath:'/web/account/index.html',bundleMarker:'accountBundleRelease',scripts:[{src:'./public-config.legavik-browser-consistency-v1-20260909-1.js'},{src:'./account-nav-bridge.legavik-browser-consistency-v1-20260909-1.bundle.js'},{src:'./account-app.legavik-browser-consistency-v1-20260909-1.bundle.js',type:'module',id:'account-app-script'}]});
  if(!approved)return;
  let finished=false;
  const fail=()=>{if(finished||app?.dataset.runtimeState!=='LOADING')return;finished=true;app.dataset.runtimeState='FAILED';app.innerHTML='<main><section class="auth-layout"><div class="auth-card"><h1>客户中心未能正常打开</h1><p>请重新打开当前页面。</p><div class="auth-links"><a class="secondary-link" href="https://sixtrees778899-stack.github.io/SKREK-auth-test/web/v3-crypto/index.html?release=legavik-browser-consistency-v1-20260909-1#home">返回 LEGAVIK 首页</a></div></div></section></main>';};
  new MutationObserver(()=>{if(app&&!app.querySelector('.loading')&&!app.textContent.includes('正在打开 LEGAVIK 客户中心')){app.removeAttribute('data-account-initializing');gate.markReady(app);finished=true;}}).observe(app,{childList:true,subtree:true});
  addEventListener('error',fail);addEventListener('unhandledrejection',fail);setTimeout(fail,12000);
})();
