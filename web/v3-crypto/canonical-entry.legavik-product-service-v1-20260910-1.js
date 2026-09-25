(()=>{
  const main=document.querySelector('#main'),gate=globalThis.SKREK_RUNTIME_GATE;
  if(!gate){main.dataset.runtimeState='FAILED';main.innerHTML='<section role="alert" class="runtime-failure"><p>LEGAVIK</p><h1>页面加载未完成</h1><p>请重新打开当前页面。</p></section>';return;}
  gate.boot({
    rootId:'main',
    canonicalPath:'/web/v3-crypto/index.html',
    bundleMarker:'productBundleRelease',
    scripts:[
      {src:'../account/public-config.legavik-product-service-v1-20260910-1.js'},
      {src:'../account/account-nav-bridge.legavik-product-service-v1-20260910-1.bundle.js'},
      {src:'./product-knowledge-pack-v1.legavik-product-service-v1-20260910-1.js'},
      {src:'./approved-knowledge.legavik-product-service-v1-20260910-1.js'},
      {src:'./product-v1.legavik-product-service-v1-20260910-1.bundle.js',type:'module',id:'legavik-product-app'}
    ]
  });
})();
