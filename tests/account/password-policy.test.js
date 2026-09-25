import test from 'node:test';
import assert from 'node:assert/strict';
import {PASSWORD_POLICY_COPY,SKREK_PASSWORD_POLICY,passwordRuleStates,validatePasswordPair} from '../../src/account/password-policy.js';

test('shared policy is the authoritative Supabase-aligned five-rule contract',()=>{
  assert.equal(SKREK_PASSWORD_POLICY.minimumLength,10);
  assert.equal(SKREK_PASSWORD_POLICY.expectedSupabasePolicy,'min_length=10;lowercase=true;uppercase=true;digit=true;symbol=true');
  assert.deepEqual(SKREK_PASSWORD_POLICY.rules.map(rule=>rule.id),['length','uppercase','lowercase','number','special']);
  assert.equal(PASSWORD_POLICY_COPY,'密码至少10位，并同时包含大写字母、小写字母、数字和特殊字符。');
});

test('validation has deterministic missing, mismatch, then rule order',()=>{
  const cases=[
    ['', '', '请输入新密码。'],
    ['ValidPass1!', '', '请再次输入密码。'],
    ['ValidPass1!', 'Different1!', '两次输入的密码不一致。'],
    ['Aa1!short', 'Aa1!short', '密码至少需要10位。'],
    ['lowercase1!', 'lowercase1!', '密码至少需要包含1个大写字母。'],
    ['UPPERCASE1!', 'UPPERCASE1!', '密码至少需要包含1个小写字母。'],
    ['NoNumbers!!', 'NoNumbers!!', '密码至少需要包含1个数字。'],
    ['NoSpecial123', 'NoSpecial123', '密码至少需要包含1个特殊字符。'],
    ['ValidPass1!', 'ValidPass1!', '']
  ];
  for(const [password,confirmation,expected] of cases)assert.equal(validatePasswordPair(password,confirmation),expected);
});

test('live checklist derives from the same rule definitions',()=>{
  assert.deepEqual(passwordRuleStates('ValidPass1!').map(rule=>rule.valid),[true,true,true,true,true]);
  assert.deepEqual(passwordRuleStates('lowercase1!').map(rule=>rule.valid),[true,false,true,true,true]);
});
