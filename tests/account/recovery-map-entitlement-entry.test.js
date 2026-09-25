import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../../web/v2/v2-app.js',import.meta.url),'utf8');

test('Recovery Map creation uses the authoritative entitlement RPC helper',()=>{
  assert.match(app,/readAuthoritativeServiceEntitlement\(supabase\)/);
  assert.match(app,/canCreateRecoveryMap\(entitlement\)/);
  assert.match(app,/selectedPlan:'Standard'/);
});

test('guide entry does not use the legacy local purchase flag as its gate',()=>{
  assert.match(app,/guide-start-top'[\s\S]*enterAuthoritativeRecoveryMapCreation/);
  assert.doesNotMatch(app,/guide-start-top'[\s\S]{0,240}purchaseState\.purchaseCompleted/);
});
