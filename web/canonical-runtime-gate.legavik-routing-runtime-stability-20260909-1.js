(()=>{
  const canonicalOrigin='https://sixtrees778899-stack.github.io';
  const canonicalBase='/SKREK-auth-test';
  const deployment='legavik-routing-runtime-stability-20260909-1';
  const approvedPaths=new Set([`${canonicalBase}/web/v3-crypto/index.html`,`${canonicalBase}/web/account/index.html`,`${canonicalBase}/web/v2/index.html`,`${canonicalBase}/web/recover.html`]);
  const requestedDeployment=()=>{const query=new URLSearchParams(location.search);return query.get('release')??query.get('deployment')??query.get('deploy')??query.get('build');};
  const pageDeployment=()=>document.querySelector('meta[name="legavik-deployment"]')?.content??document.querySelector('meta[name="skrek-release"]')?.content??'';
  const localHarness=['localhost','127.0.0.1'].includes(location.hostname);
  const isSupportedSurface=()=>localHarness||(location.protocol==='https:'&&location.origin===canonicalOrigin&&approvedPaths.has(location.pathname));
  const currentUrl=(target,{path=location.pathname,hash=location.hash,params=null,upgrade=false}={})=>{const resolvedPath=localHarness?path:(path.startsWith(canonicalBase)?path:`${canonicalBase}${path.startsWith('/')?path:`/${path}`}`);const url=new URL(`${localHarness?location.origin:canonicalOrigin}${resolvedPath}`);const source=params??new URLSearchParams(location.search);for(const[key,value]of source)if(!['release','deployment','deploy','build','runtime_upgrade'].includes(key))url.searchParams.append(key,value);url.searchParams.set('release',target);if(upgrade)url.searchParams.set('runtime_upgrade',target);url.hash=hash;return url.href;};
  const failureMarkup=({title,message,url})=>`<section role="alert" class="runtime-failure"><p>LEGAVIK</p><h1>${title}</h1><p>${message}</p><a href="${url}">重新打开当前页面</a></section>`;
  const renderFailure=(root,{kind='bundle',target=deployment,canonicalPath=location.pathname}={})=>{if(!root)return;root.dataset.runtimeState='FAILED';root.innerHTML=failureMarkup(kind==='unsupported'?{title:'当前入口不受支持',message:'请使用 LEGAVIK 正式安全入口。',url:currentUrl(target,{path:`${canonicalBase}/web/v3-crypto/index.html`,hash:'#home'})}:{title:'页面加载未完成',message:'请重新打开当前页面。',url:currentUrl(target,{path:canonicalPath})});};
  const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const retry=async(task,{attempts=3,delays=[250,750]}={})=>{let lastError;for(let attempt=0;attempt<attempts;attempt+=1){try{return await task(attempt);}catch(error){lastError=error;if(attempt<attempts-1)await pause(delays[Math.min(attempt,delays.length-1)]);}}throw lastError;};
  const readManifest=async()=>retry(async()=>{const manifestUrl=localHarness?'/web/release-manifest.json':`${canonicalOrigin}${canonicalBase}/web/release-manifest.json`;const response=await fetch(`${manifestUrl}?ts=${Date.now()}`,{cache:'no-store'});if(!response.ok)throw new Error('manifest unavailable');return response.json();});
  const upgrade=(root,manifest,canonicalPath)=>{const target=manifest?.deployment_identity??manifest?.release;if(!target)return renderFailure(root,{canonicalPath});if(new URLSearchParams(location.search).get('runtime_upgrade')===target)return renderFailure(root,{target,canonicalPath});root.dataset.runtimeState='VERSION_MISMATCH';location.replace(currentUrl(target,{path:canonicalPath,upgrade:true}));};
  const loadScript=({src,type,id})=>retry(attempt=>new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=attempt?`${src}${src.includes('?')?'&':'?'}runtime_retry=${attempt}`:src;if(type)script.type=type;if(id)script.id=id;script.onload=resolve;script.onerror=()=>{script.remove();reject(new Error('bundle unavailable'));};document.body.append(script);}),{attempts:2,delays:[400]});
  const boot=({rootId,scripts,canonicalPath=location.pathname,bundleMarker,timeoutMs=30000})=>{
    const root=document.getElementById(rootId);if(root)root.dataset.runtimeState='BOOT';document.documentElement.dataset.legavikDeployment=deployment;
    if(!isSupportedSurface()){renderFailure(root,{kind:'unsupported',canonicalPath});return false;}
    if(root)root.dataset.runtimeState='VERSION_CHECK';let finished=false;
    const timeout=setTimeout(()=>{if(!finished){finished=true;renderFailure(root,{canonicalPath});}},timeoutMs);
    (async()=>{try{const manifest=await readManifest();const target=manifest?.deployment_identity??manifest?.release;
      if(target!==deployment||pageDeployment()!==deployment||(requestedDeployment()&&requestedDeployment()!==deployment))return upgrade(root,manifest,canonicalPath);
      if(root)root.dataset.runtimeState='LOADING';for(const script of scripts)await loadScript(script);
      if(bundleMarker&&document.documentElement.dataset[bundleMarker]!==deployment)return upgrade(root,manifest,canonicalPath);
      finished=true;clearTimeout(timeout);if(new URLSearchParams(location.search).get('runtime_upgrade')===deployment)history.replaceState(null,'',currentUrl(deployment,{path:canonicalPath}));if(root)root.dataset.runtimeState='READY';
    }catch{if(!finished){finished=true;clearTimeout(timeout);renderFailure(root,{canonicalPath});}}})();return true;
  };
  const deliveryMatches=(verifiedUrl,deliveredUrl)=>verifiedUrl===deliveredUrl&&(()=>{try{const url=new URL(deliveredUrl);return url.protocol==='https:'&&url.origin===canonicalOrigin&&approvedPaths.has(url.pathname)&&url.searchParams.get('release')===deployment;}catch{return false;}})();
  const markReady=root=>{if(root&&['BOOT','VERSION_CHECK','LOADING'].includes(root.dataset.runtimeState))root.dataset.runtimeState='READY';};
  globalThis.SKREK_RUNTIME_GATE=Object.freeze({boot,deliveryMatches,markReady,renderFailure,readManifest,currentUrl,canonicalOrigin,canonicalBase,release:deployment,deployment});
})();
