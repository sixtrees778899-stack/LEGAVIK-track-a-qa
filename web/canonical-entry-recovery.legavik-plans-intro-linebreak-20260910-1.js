(()=>{
  const app=document.querySelector('#app'),gate=globalThis.SKREK_RUNTIME_GATE;
  if(!gate){app.innerHTML='<section class="card" role="alert"><h1>当前入口不受支持</h1><p>请使用正式 HTTPS 测试入口。</p><a href="https://sixtrees778899-stack.github.io/SKREK-auth-test/web/recover.html">打开正式 HTTPS 测试入口</a></section>';return;}
  const query=new URLSearchParams(location.search),diagnosticRelease='legavik-plans-intro-linebreak-20260910-1',diagnosticMode=query.get('mode')==='version-update'&&query.get('version_number')==='4';
  if(diagnosticMode){
    const releaseIdentity=document.querySelector('meta[name="skrek-release"]')?.content??'';
    const validEntry=location.protocol==='https:'&&location.origin===gate.canonicalOrigin&&location.pathname===`${gate.canonicalBase}/web/recover.html`&&(query.get('release')??query.get('deploy'))===diagnosticRelease&&releaseIdentity===diagnosticRelease;
    const canonicalDiagnosticUrl=new URL(`${gate.canonicalOrigin}${gate.canonicalBase}/web/recover.html`);
    for(const [key,value] of query)if(key!=='deploy'&&key!=='release')canonicalDiagnosticUrl.searchParams.append(key,value);
    canonicalDiagnosticUrl.searchParams.set('release',diagnosticRelease);
    if(!validEntry){
      app.innerHTML=`<section class="card" role="alert"><h1>当前入口已过期</h1><p>请使用最新的安全入口继续恢复。</p><a class="button" href="${canonicalDiagnosticUrl.href}">打开最新安全入口</a></section>`;
      return;
    }
    document.documentElement.dataset.diagnosticRelease=diagnosticRelease;
  }
  const pagesRuntime=location.origin===gate.canonicalOrigin;
  const appScript=pagesRuntime?'./recover.legavik-plans-intro-linebreak-20260910-1.bundle.js':'./recover.js';
  const approved=gate.boot({rootId:'app',canonicalPath:'/web/recover.html',bundleMarker:'recoveryBundleRelease',scripts:[{src:appScript,type:'module',id:'recovery-app-script'}]});
  if(!approved)return;
  setTimeout(()=>{if(app?.dataset.runtimeState!=='LOADING')return;app.dataset.runtimeState='FAILED';app.innerHTML='<section class="card initialization-failure" role="alert"><h1>安全工作区未能正常打开</h1><p>请重新打开当前页面。</p><div class="actions"><a class="button secondary" href="./account/index.html?section=maps&release=legavik-plans-intro-linebreak-20260910-1#center">返回客户中心</a></div></section>';},12000);
})();
