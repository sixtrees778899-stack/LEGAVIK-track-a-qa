(()=>{
  const main=document.querySelector('#main'),gate=globalThis.SKREK_RUNTIME_GATE;
  if(!gate){main.dataset.runtimeState='FAILED';main.innerHTML='<section role="alert" class="runtime-failure"><p>LEGAVIK</p><h1>页面加载未完成</h1><p>请重新打开当前页面。</p></section>';return;}
  gate.boot({
    rootId:'main',
    canonicalPath:'/web/v3-crypto/index.html',
    bundleMarker:'productBundleRelease',
    scripts:[
      {src:'../account/public-config.legavik-routing-runtime-stability-20260909-1.js'},
      {src:'../account/account-nav-bridge.legavik-routing-runtime-stability-20260909-1.bundle.js'},
      {src:'./product-knowledge-pack-v1.legavik-routing-runtime-stability-20260909-1.js'},
      {src:'./approved-knowledge.legavik-routing-runtime-stability-20260909-1.js'},
      {src:'./product-v1.legavik-routing-runtime-stability-20260909-1.bundle.js',type:'module',id:'legavik-product-app'}
    ]
  });
})();
