import test from 'node:test';
import assert from 'node:assert/strict';
import {PASSWORD_UPDATE_CATEGORIES,classifyPasswordUpdateError,passwordUpdateCustomerMessage,validateNewPassword} from '../../src/account/password-reset-submission.js';

test('local password validation rejects mismatch and weak input before network',()=>{
  assert.equal(validateNewPassword('Valid-Password-2026!','different'),'两次输入的密码不一致。');
  assert.equal(validateNewPassword('Short1!','Short1!'),'密码至少需要10位。');
  assert.equal(validateNewPassword('longpassword','longpassword'),'密码至少需要包含1个大写字母。');
  assert.equal(validateNewPassword('Valid-Password-2026!','Valid-Password-2026!'),'');
});

test('same-password response retains exact safe code/status category',()=>{
  const evidence=classifyPasswordUpdateError({name:'AuthApiError',code:'same_password',status:422,message:'New password should be different from the old password.'});
  assert.deepEqual(evidence,{category:PASSWORD_UPDATE_CATEGORIES.SAME_PASSWORD,name:'AuthApiError',code:'same_password',status:422});
  assert.equal(passwordUpdateCustomerMessage(evidence.category),'新密码不能与当前密码相同，请设置不同的密码。');
});

test('password policy, session, rate limit and network errors are safely classified',()=>{
  const weak=classifyPasswordUpdateError({code:'weak_password',status:422,reasons:['characters','pwned','not-safe-to-copy']});
  assert.deepEqual(weak.reasons,['characters','pwned']);
  assert.equal(weak.category,PASSWORD_UPDATE_CATEGORIES.PASSWORD_POLICY);
  assert.match(passwordUpdateCustomerMessage(weak),/已知泄露数据/);
  assert.equal(classifyPasswordUpdateError({name:'AuthSessionMissingError'}).category,PASSWORD_UPDATE_CATEGORIES.RECOVERY_SESSION_INVALID);
  assert.equal(classifyPasswordUpdateError({status:429}).category,PASSWORD_UPDATE_CATEGORIES.RATE_LIMIT);
  assert.equal(classifyPasswordUpdateError(new Error('Network request failed')).category,PASSWORD_UPDATE_CATEGORIES.NETWORK);
});
