export const APPROVED_TEST_ORIGIN='https://sixtrees778899-stack.github.io';
export const APPROVED_TEST_BASE='/LEGAVIK-track-a-qa';
export const CURRENT_TEST_RELEASE='legavik-mainline-customer-center-resilience-20260926-1';
export const CURRENT_DEPLOYMENT_ID=CURRENT_TEST_RELEASE;

const ROUTES=Object.freeze({
  home:'/web/v3-crypto/index.html',
  account:'/web/account/index.html',
  create:'/web/v2/index.html',
  recovery:'/web/recover.html'
});

export function canonicalCustomerUrl(route,{params={},hash=''}={}){
  const pathname=ROUTES[route];
  if(!pathname)throw new TypeError(`Unknown canonical customer route: ${route}`);
  const url=new URL(`${APPROVED_TEST_BASE}${pathname}`,APPROVED_TEST_ORIGIN);
  for(const[key,value]of Object.entries(params))if(value!==undefined&&value!==null&&value!=='')url.searchParams.set(key,String(value));
  url.searchParams.delete('deploy');
  url.searchParams.delete('build');
  url.searchParams.set('release',CURRENT_DEPLOYMENT_ID);
  url.hash=hash?`#${String(hash).replace(/^#/,'')}`:'';
  return url.href;
}

export const canonicalHomeUrl=(hash='home')=>canonicalCustomerUrl('home',{hash});
export const canonicalPricingUrl=()=>canonicalHomeUrl('pricing');
export const canonicalAccountUrl=(hash='login',params={})=>canonicalCustomerUrl('account',{params,hash});
export const canonicalCreateUrl=(params={})=>canonicalCustomerUrl('create',{params:{entry:'guide',...params}});
export const canonicalRecoveryUrl=(source='recovery-center',params={})=>canonicalCustomerUrl('recovery',{params:{source,...params}});
