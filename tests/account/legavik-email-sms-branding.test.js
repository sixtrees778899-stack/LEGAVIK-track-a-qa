import test from 'node:test';
import assert from 'node:assert/strict';
import {LEGAVIK_AUTH_BRANDING,renderRepresentativeSamples} from '../../supabase/branding/legavik-auth-branding.mjs';

const forbidden=[/SKREK/i,/CJAS/i,/Digital Asset Recovery & Continuity/i,/Legvik/i,/Legvic/i,/Lagvik/i,/测试服务/i,/\bdebug\b/i,/\binternal\b/i];
const patch=LEGAVIK_AUTH_BRANDING.managementApiPatch;
const customerVisible=value=>String(value).replace(/(?:href|src)="https:\/\/sixtrees778899-stack\.github\.io\/SKREK-auth-test\/[^\"]+"/gi,'');

test('all supported auth email subjects and bodies use the locked LEGAVIK brand',()=>{
  const subjects=Object.entries(patch).filter(([key])=>key.startsWith('mailer_subjects_'));
  const bodies=Object.entries(patch).filter(([key])=>key.startsWith('mailer_templates_'));
  assert.equal(subjects.length,13);
  assert.equal(bodies.length,13);
  for(const [key,value] of [...subjects,...bodies]){
    assert.match(value,/LEGAVIK/,key);
    for(const pattern of forbidden)assert.doesNotMatch(customerVisible(value),pattern,key);
  }
});

test('email actions retain Supabase security variables and use text-only branding',()=>{
  for(const key of ['mailer_templates_invite_content','mailer_templates_email_change_content']){
    assert.match(patch[key],/\{\{ \.ConfirmationURL \}\}/,key);
  }
  assert.match(patch.mailer_templates_recovery_content,/token_hash=\{\{ \.TokenHash \}\}&type=recovery&auth_action=recovery&release=legavik-auth-reset-login-20260906-2#reset-password/);
  assert.doesNotMatch(patch.mailer_templates_recovery_content,/\{\{ \.ConfirmationURL \}\}/);
  assert.doesNotMatch(patch.mailer_templates_recovery_content,/data-brand-header/);
  assert.match(patch.mailer_templates_confirmation_content,/data-brand-header/);
  for(const key of ['mailer_templates_confirmation_content','mailer_templates_magic_link_content','mailer_templates_reauthentication_content']){
    assert.match(patch[key],/\{\{ \.Token \}\}/,key);
  }
  for(const [key,value] of Object.entries(patch).filter(([key])=>key.startsWith('mailer_templates_'))){
    assert.doesNotMatch(value,/<img\b|background-image|data:image|<svg\b/i,key);
    assert.match(value,/>LEGAVIK</,key);
  }
  assert.equal(patch.smtp_sender_name,'LEGAVIK');
});

test('SMS remains concise, branded, and preserves the provider OTP variable',()=>{
  assert.match(patch.sms_template,/^LEGAVIK 验证码：\{\{ \.Code \}\}/);
  assert.ok(patch.sms_template.length<80);
  for(const pattern of forbidden)assert.doesNotMatch(patch.sms_template,pattern);
});

test('representative samples contain no customer-facing legacy brand residue',()=>{
  const samples=renderRepresentativeSamples();
  assert.deepEqual(Object.keys(samples),['signupOtp','resetPassword','securityNotification','otpSms']);
  for(const [name,value] of Object.entries(samples)){
    assert.match(value,/LEGAVIK/,name);
    for(const pattern of forbidden)assert.doesNotMatch(customerVisible(value),pattern,name);
  }
  assert.match(samples.resetPassword,/https:\/\/sixtrees778899-stack\.github\.io\/SKREK-auth-test\/web\/account\/index\.html\?token_hash=sample-token-hash&type=recovery&auth_action=recovery&release=legavik-auth-reset-login-20260906-2#reset-password/);
});
