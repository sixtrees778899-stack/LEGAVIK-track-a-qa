import { ProductActions } from './actions.js';

export function validatePendingAccount(input={}){
  const missing=[];
  if(!String(input.platform_id??'').trim())missing.push('平台');
  if(!String(input.region??'').trim())missing.push('注册国家或地区');
  if(!String(input.account_type??'').trim())missing.push('账户类型');
  return{valid:missing.length===0,missing};
}

export function hasPendingAccount(input={}){
  return['platform_id','region','account_type','display_label'].some(key=>String(input[key]??'').trim());
}

export function commitPendingAccount(store,input,{accountId,platformName,clock}={}){
  if(!hasPendingAccount(input))return{store,added:false,account_id:null,revision_before:store.draft_revision,revision_after:store.draft_revision};
  const check=validatePendingAccount(input);
  if(!check.valid)throw Object.assign(new Error(`请补充新增账户的${check.missing.join('、')}。`),{code:'PENDING_ACCOUNT_INCOMPLETE',missing:check.missing});
  const revisionBefore=store.draft_revision,id=accountId;
  if(!id)throw new Error('ACCOUNT_ID_REQUIRED');
  const next=ProductActions.addAccount(store,{account_id:id,platform_id:input.platform_id,platform_name:platformName,region:input.region,account_type:input.account_type,display_label:input.display_label??''},{expected_revision:revisionBefore,clock});
  if(!next.accounts[id]||next.draft_revision!==revisionBefore+1)throw new Error('新增账户未能写入当前恢复地图，请重试。');
  return{store:next,added:true,account_id:id,revision_before:revisionBefore,revision_after:next.draft_revision};
}
