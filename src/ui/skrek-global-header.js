import {canonicalAccountUrl,canonicalHomeUrl,canonicalRecoveryUrl} from './canonical-customer-links.js';
import {customerBrand} from './brand-contract.js';

export const SKREK_GLOBAL_NAV=[
  ['digital-assets','数字资产'],['security','安全与隐私'],['pricing','产品与服务'],
  ['knowledge','知识库'],['professionals','专业合作'],['about','联系我们']
];

const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

export function skrekGlobalHeader({brand=customerBrand,activeRoute='home',mode='product',productBase=canonicalHomeUrl(''),accountBase=canonicalAccountUrl('',{}).replace(/#$/,''),logoBase=customerBrand.logo.masterV1,recoveryBase=canonicalRecoveryUrl('recovery-center')}={}){
  const wordmark=esc(brand?.wordmark??customerBrand.wordmark),logoAlt=esc(brand?.logo?.alt??customerBrand.logo.alt);
  const href=id=>mode==='map'?`${productBase}#${id}`:`#${id}`;
  return `<div class="nav-shell"><a id="product-home-logo" class="wordmark" data-route="home" href="${href('home')}" aria-label="${wordmark}首页"><img src="${logoBase}" alt="${logoAlt}"></a><nav aria-label="主要导航">${SKREK_GLOBAL_NAV.map(([id,label])=>`<a data-route="${id}" href="${href(id)}" class="${activeRoute===id?'active':''}">${label}</a>`).join('')}</nav><div class="nav-actions"><a class="text-button account-state-link" data-account-state href="${accountBase}#login">登录 / 注册</a><a class="button small recovery-center-link" href="${recoveryBase}">我的恢复中心</a><button id="menu" class="menu" aria-label="打开导航" aria-expanded="false">☰</button></div></div>`;
}
