import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanSuccessfulRecoveryUrl,readRecoveryCallback,verifyRecoveryCallback} from '../../src/account/recovery-callback.js';

test('reads the server-issued recovery credential without browser storage',()=>{
  const callback=readRecoveryCallback('?token_hash=one-time-value&type=recovery&auth_action=recovery');
  assert.deepEqual(callback,{present:true,validShape:true,tokenHash:'one-time-value',type:'recovery'});
});

test('fresh-browser callback verifies token_hash and removes it only after success',async()=>{
  const calls=[];
  let replaced='';
  const auth={verifyOtp:async input=>{calls.push(input);return {data:{session:{user:{id:'customer'}}},error:null};}};
  const result=await verifyRecoveryCallback({
    auth,
    search:'?token_hash=one-time-value&type=recovery&auth_action=recovery',
    href:'https://example.test/account?token_hash=one-time-value&type=recovery&auth_action=recovery#reset-password',
    history:{replaceState(_state,_title,url){replaced=url;}}
  });
  assert.equal(result.session.user.id,'customer');
  assert.deepEqual(calls,[{token_hash:'one-time-value',type:'recovery'}]);
  assert.equal(replaced,'/account?auth_action=recovery#reset-password');
  assert.doesNotMatch(replaced,/one-time-value|token_hash/);
});

test('invalid or used credential is not removed and cannot create a session',async()=>{
  let replacements=0;
  const error=new Error('Token has expired or is invalid');
  const result=await verifyRecoveryCallback({
    auth:{verifyOtp:async()=>({data:{session:null},error})},
    search:'?token_hash=used&type=recovery',
    href:'https://example.test/account?token_hash=used&type=recovery#reset-password',
    history:{replaceState(){replacements+=1;}}
  });
  assert.equal(result.session,null);
  assert.equal(result.error,error);
  assert.equal(replacements,0);
});

test('malformed recovery callback is rejected before verification',async()=>{
  let calls=0;
  const result=await verifyRecoveryCallback({
    auth:{verifyOtp:async()=>{calls+=1;}},
    search:'?type=recovery',
    href:'https://example.test/account?type=recovery#reset-password',
    history:{replaceState(){}}
  });
  assert.equal(result.error.message,'MALFORMED_RECOVERY_CALLBACK');
  assert.equal(calls,0);
});

test('routing intent without a direct credential is delegated to supabase-js bootstrap',()=>{
  assert.deepEqual(readRecoveryCallback('?auth_action=recovery'),{
    present:false,validShape:false,tokenHash:'',type:''
  });
});

test('PKCE code is not misclassified as a malformed token-hash callback',()=>{
  assert.deepEqual(readRecoveryCallback('?auth_action=recovery&code=pkce-code'),{
    present:false,validShape:false,tokenHash:'',type:''
  });
});

test('URL cleanup preserves recovery routing but no credential',()=>{
  let replaced='';
  cleanSuccessfulRecoveryUrl({href:'https://example.test/account?token_hash=secret&type=recovery',history:{replaceState(_a,_b,url){replaced=url;}}});
  assert.equal(replaced,'/account?auth_action=recovery#reset-password');
});

test('successful PKCE/session cleanup removes the one-time code',()=>{
  let replaced='';
  cleanSuccessfulRecoveryUrl({href:'https://example.test/account?auth_action=recovery&code=one-time-code',history:{replaceState(_a,_b,url){replaced=url;}}});
  assert.equal(replaced,'/account?auth_action=recovery#reset-password');
  assert.doesNotMatch(replaced,/one-time-code|code=/);
});
