import {createClient} from '@supabase/supabase-js';
import {canonicalAccountUrl} from '../ui/canonical-customer-links.js';

const config=globalThis.SKREK_PUBLIC_CONFIG??{};
let identity='';

function displayName(session){return (session?.user?.email??'').split('@')[0];}

function paint(){
  document.querySelectorAll('[data-account-state]').forEach(link=>{
    const label=identity||'登录 / 注册',href=canonicalAccountUrl(identity?'center':'login'),aria=identity?`${identity}，进入客户中心`:'登录或注册';
    if(link.textContent!==label)link.textContent=label;
    if(link.getAttribute('href')!==href)link.setAttribute('href',href);
    if(link.getAttribute('aria-label')!==aria)link.setAttribute('aria-label',aria);
  });
}

if(config.supabaseUrl&&config.supabaseAnonKey){
  const client=globalThis.LEGAVIK_SUPABASE_CLIENT??=createClient(config.supabaseUrl,config.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}});
  client.auth.getSession().then(({data:{session}})=>{
    identity=displayName(session);
    paint();
  });
  client.auth.onAuthStateChange((_event,session)=>{identity=displayName(session);paint();});
}
new MutationObserver(paint).observe(document.documentElement,{childList:true,subtree:true});
paint();
