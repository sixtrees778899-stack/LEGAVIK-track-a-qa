import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {canCreateRecoveryMap,normalizeServiceEntitlement,readAuthoritativeServiceEntitlement} from '../../src/account/service-entitlement.js';

const activeStandard={enrollment_id:'qa-enrollment',plan_code:'STANDARD',status:'ACTIVE_TEST',enrollment_source:'TEST_PLAN_SELECTION',review_used:0,review_allowance:2,update_used:0,update_allowance:2};

test('authoritative STANDARD ACTIVE_TEST unlocks normal Recovery Map creation',()=>{
  const entitlement=normalizeServiceEntitlement([activeStandard]);
  assert.equal(entitlement.planLabel,'Standard');
  assert.equal(canCreateRecoveryMap(entitlement),true);
});

test('missing, inactive, or non-Standard entitlement stays fail-closed',()=>{
  assert.equal(normalizeServiceEntitlement([]),null);
  assert.equal(normalizeServiceEntitlement({...activeStandard,status:'EXPIRED'}),null);
  assert.equal(normalizeServiceEntitlement({...activeStandard,plan_code:'ESSENTIAL'}),null);
  assert.equal(canCreateRecoveryMap(null),false);
});

test('reader uses only the authoritative entitlement RPC and propagates failures',async()=>{
  const calls=[];
  const entitlement=await readAuthoritativeServiceEntitlement({rpc:async(name)=>{calls.push(name);return{data:[activeStandard],error:null};}});
  assert.deepEqual(calls,['get_service_entitlement_v1']);
  assert.equal(entitlement.status,'ACTIVE_TEST');
  await assert.rejects(()=>readAuthoritativeServiceEntitlement({rpc:async()=>({data:null,error:new Error('RPC_FAILED')})}),/RPC_FAILED/);
});

test('Customer Center displays entitlement and gates only the existing normal create route',async()=>{
  const source=await readFile(new URL('../../src/account/supabase-account-app.js',import.meta.url),'utf8');
  assert.match(source,/readAuthoritativeServiceEntitlement\(supabase\)/);
  assert.match(source,/data\.entitlement\?\.planLabel/);
  assert.match(source,/eligible\?recoveryMapCreateUrl:recoveryMapPurchaseUrl/);
  for(const forbidden of ['Fresh Resume','FRESH_RESUME_V1','repair upload','unfinished operation'])assert.doesNotMatch(source,new RegExp(forbidden,'i'));
});
