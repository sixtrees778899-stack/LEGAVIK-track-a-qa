const countCodePoints=value=>[...value].length;
const CATEGORY_TESTS=Object.freeze({
  uppercase:/\p{Lu}/u,
  lowercase:/\p{Ll}/u,
  number:/\p{Nd}/u,
  special:/[^\p{L}\p{N}\s]/u
});
const LABELS=Object.freeze({uppercase:'大写字母',lowercase:'小写字母',number:'数字',special:'特殊字符'});

export function validateRecoveryPassword(password,confirmation,acknowledged,{policy,vaultName=''}={}){
  const issues=[];
  if(!policy||!Number.isInteger(policy.min_code_points)||!Number.isInteger(policy.max_code_points)||!Number.isInteger(policy.minimum_character_classes))throw new TypeError('Password policy configuration is required');
  const value=typeof password==='string'?password:'',length=countCodePoints(value),categories=Object.fromEntries(Object.entries(CATEGORY_TESTS).map(([key,pattern])=>[key,pattern.test(value)])),satisfied=Object.values(categories).filter(Boolean).length;
  if(length<policy.min_code_points)issues.push({code:'PASSWORD_TOO_SHORT',message:`恢复密码至少需要 ${policy.min_code_points} 个字符`});
  if(length>policy.max_code_points)issues.push({code:'PASSWORD_TOO_LONG',message:`恢复密码不能超过 ${policy.max_code_points} 个字符`});
  if(value.trim().length===0)issues.push({code:'PASSWORD_BLANK',message:'恢复密码不能全部由空格组成'});
  if(satisfied<policy.minimum_character_classes){const missing=Object.entries(categories).filter(([,present])=>!present).map(([key])=>LABELS[key]);issues.push({code:'PASSWORD_CLASSES',message:`请至少使用四类字符中的三类；当前还可加入：${missing.join('、')}`});}
  if(value!==confirmation)issues.push({code:'PASSWORD_MISMATCH',message:'两次输入的恢复密码不一致'});
  if(vaultName&&value.normalize('NFC')===vaultName.normalize('NFC'))issues.push({code:'PASSWORD_EQUALS_VAULT_NAME',message:'恢复密码不能与恢复计划名称完全相同'});
  if(policy.weak_passwords.some(item=>item.normalize('NFC').toLocaleLowerCase()===value.normalize('NFC').toLocaleLowerCase()))issues.push({code:'PASSWORD_COMMON',message:'该密码过于常见，请使用更独特的密码短语'});
  if(!acknowledged)issues.push({code:'PASSWORD_ACK_REQUIRED',message:'请先确认您理解平台无法找回恢复密码'});
  const valid=issues.length===0,status=!valid?'不符合要求':length>=20&&satisfied===4?'较强':'基本符合';
  return {valid,status,length,categories,satisfied_classes:satisfied,required_classes:policy.minimum_character_classes,issues};
}
