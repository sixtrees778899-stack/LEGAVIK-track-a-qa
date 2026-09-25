const ruleDefinitions=[
  {id:'length',label:'至少10位',message:'密码至少需要10位。',test:value=>value.length>=10},
  {id:'uppercase',label:'包含大写字母',message:'密码至少需要包含1个大写字母。',test:value=>/[A-Z]/.test(value)},
  {id:'lowercase',label:'包含小写字母',message:'密码至少需要包含1个小写字母。',test:value=>/[a-z]/.test(value)},
  {id:'number',label:'包含数字',message:'密码至少需要包含1个数字。',test:value=>/\d/.test(value)},
  {id:'special',label:'包含特殊字符',message:'密码至少需要包含1个特殊字符。',test:value=>/[^A-Za-z0-9]/.test(value)}
];

export const SKREK_PASSWORD_POLICY=Object.freeze({
  version:'SKREK_PASSWORD_POLICY_V1',
  expectedSupabasePolicy:'min_length=10;lowercase=true;uppercase=true;digit=true;symbol=true',
  minimumLength:10,
  rules:Object.freeze(ruleDefinitions.map(rule=>Object.freeze(rule)))
});

export const PASSWORD_POLICY_COPY='密码至少10位，并同时包含大写字母、小写字母、数字和特殊字符。';

export function passwordRuleStates(password=''){
  const value=String(password);
  return SKREK_PASSWORD_POLICY.rules.map(rule=>({id:rule.id,label:rule.label,valid:rule.test(value)}));
}

export function validatePasswordPair(password='',confirmation=''){
  const value=String(password),confirmed=String(confirmation);
  if(!value)return '请输入新密码。';
  if(!confirmed)return '请再次输入密码。';
  if(value!==confirmed)return '两次输入的密码不一致。';
  const failed=SKREK_PASSWORD_POLICY.rules.find(rule=>!rule.test(value));
  return failed?.message??'';
}
