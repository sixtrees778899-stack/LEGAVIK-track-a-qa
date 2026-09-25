import { STANDARD_MODULE_IDS } from '../knowledge/schema-v2.js';
import { ValidationError } from '../shared/errors.js';

const clone=value=>structuredClone(value);
const ID=/^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$/;

export function createRecoveryDraftV2({vaultTitle='我的恢复地图',planType='crypto-assets'}={}){
  return{draft_version:2,vault_title:vaultTitle,plan_type:planType,modules:Object.fromEntries(STANDARD_MODULE_IDS.map(id=>[id,{entries:[]}])) ,custom_modules:[],activation_context:null,recovery_drill:{},location_summaries:{},rulebook_version:'1.1.0',version_state:{current_version:1,based_on_version:null,generated:false}};
}

export function saveActivationContext(draft,context){
  if(!context||typeof context!=='object'||Array.isArray(context))throw new ValidationError('INVALID_ACTIVATION_CONTEXT','平台配置无效');
  const next=clone(draft);next.activation_context=clone(context);return next;
}

export function saveRecoveryDrill(draft,drill){
  if(!drill||typeof drill!=='object'||Array.isArray(drill))throw new ValidationError('INVALID_RECOVERY_DRILL','恢复演练状态无效');
  const next=clone(draft);next.recovery_drill=clone(drill);return next;
}

export function saveModuleEntries(draft,moduleId,entries){
  if(!draft?.modules?.[moduleId]||!Array.isArray(entries))throw new ValidationError('INVALID_MODULE_DRAFT','模块草稿无效');
  const next=clone(draft);next.modules[moduleId].entries=clone(entries);return next;
}

export function addCustomModule(draft,{id,name}){
  if(!ID.test(id??'')||STANDARD_MODULE_IDS.includes(id)||!String(name??'').trim()||draft.modules[id])throw new ValidationError('INVALID_CUSTOM_MODULE','其他重要信息模块无效');
  const next=clone(draft),order=70+next.custom_modules.length*10;next.custom_modules.push({id,name:String(name).normalize('NFC').trim(),order,enabled:true});next.modules[id]={entries:[]};return next;
}

export function updateCustomModule(draft,id,{name,move=0}={}){
  const next=clone(draft),index=next.custom_modules.findIndex(item=>item.id===id);if(index<0)throw new ValidationError('CUSTOM_MODULE_NOT_FOUND','其他重要信息模块不存在');
  if(name!==undefined){if(!String(name).trim())throw new ValidationError('INVALID_CUSTOM_MODULE_NAME','模块名称不能为空');next.custom_modules[index].name=String(name).normalize('NFC').trim();}
  const target=Math.max(0,Math.min(next.custom_modules.length-1,index+move));if(target!==index){const[item]=next.custom_modules.splice(index,1);next.custom_modules.splice(target,0,item);next.custom_modules.forEach((item,i)=>item.order=70+i*10);}return next;
}

export function deleteCustomModule(draft,id){
  if(STANDARD_MODULE_IDS.includes(id))throw new ValidationError('STANDARD_MODULE_PROTECTED','标准模块不能删除');
  const next=clone(draft);if(!next.custom_modules.some(item=>item.id===id))throw new ValidationError('CUSTOM_MODULE_NOT_FOUND','其他重要信息模块不存在');next.custom_modules=next.custom_modules.filter(item=>item.id!==id);delete next.modules[id];return next;
}

export function attachmentCenterRows(attachments,moduleLabels,policy){
  const values=[...attachments],used=values.reduce((sum,item)=>sum+item.byte_length,0);return{rows:values.map(item=>({...item,source_module:moduleLabels[item.source_module_id]??moduleLabels[item.module_refs[0]]??null,source_modules:item.module_refs.map(id=>moduleLabels[id]??id),association_count:item.module_refs.length})),used_bytes:used,remaining_bytes:Math.max(0,policy.limits.max_version_bytes-used),count:values.length,max_count:policy.limits.max_attachments};
}

export function associateAttachment(attachments,id,moduleRefs,allowedModuleIds){
  if(!Array.isArray(moduleRefs)||moduleRefs.some(ref=>!allowedModuleIds.includes(ref)))throw new ValidationError('INVALID_ATTACHMENT_MODULE','附件模块关联无效');
  return attachments.map(item=>item.id===id?{...item,module_refs:[...new Set(moduleRefs)]}:item);
}
