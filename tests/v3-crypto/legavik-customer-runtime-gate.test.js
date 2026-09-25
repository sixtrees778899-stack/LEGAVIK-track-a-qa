import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root=new URL('../../',import.meta.url);
const runtimeFiles=[
  'src/account/supabase-account-app.js','web/account/index.html',
  'web/v2/v2-app.js','web/v3-crypto/product-v1.js','web/v3-crypto/product-content.js',
  'web/v3-crypto/product-knowledge-pack-v1.js','web/v3-crypto/approved-knowledge.generated.js',
  'web/map-view.js','web/recover.js'
];
const routeStates=[
  'auth/signup','auth/login','auth/otp','auth/forgot-password','auth/reset-password','auth/loading','auth/success','auth/error',
  'center/overview','center/maps','center/materials','center/reviews','center/orders','center/support','center/security','center/empty','center/loading','center/error','center/success',
  'create/guide','create/before','create/dashboard','create/module-1','create/module-2','create/module-3','create/module-4','create/module-5','create/module-6','create/add-attachment','create/manage-attachments','create/review','create/report','create/password','create/storage','create/downloads','create/completion',
  'update/start','update/unlock','update/dashboard','update/module-1','update/module-2','update/module-3','update/module-4','update/module-5','update/module-6','update/add-attachment','update/manage-attachments','update/password','update/storage','update/downloads','update/completion',
  'recovery/entry','recovery/progress','recovery/materials','recovery/password','recovery/map','recovery/attachment-download','recovery/loading','recovery/error','recovery/success',
  'support/faq','support/knowledge','support/professionals','support/contact','support/modal','support/toast','support/tooltip','support/confirmation','support/warning'
];

function customerText(source){
  return source
    .replaceAll('/SKREK-auth-test/','')
    .replaceAll('/LEGAVIK-track-a-qa/','')
    .replaceAll('SKREK_PUBLIC_CONFIG','')
    .replaceAll('SKREK_PRODUCT_KNOWLEDGE','')
    .replaceAll('SKREK_APPROVED_KNOWLEDGE','')
    .replaceAll('skrekGlobalHeader','')
    .replaceAll('__CJAS_V4_MODULE3_DIAGNOSTICS__','')
    .replaceAll('__CJAS_V2_DIAGNOSTICS__','')
    .replaceAll('__CJAS_MODULE_EXPORT_PREPARATION__','')
    .replace(/LEGAVIK_Module[^'"`]+/g,'')
    .replace(/LEGAVIK-Recovery-Guide-V1\.pdf/g,'')
    .replace(/"id":\s*"SKREK-[^"]+"/g,'')
    .replace(/(?:hello|partners)@skrek\.com/g,'');
}

test('customer runtime inventory enumerates every required route and dynamic state',()=>{
  assert.equal(routeStates.length,69);
  for(const family of ['auth/','center/','create/','update/','recovery/','support/'])assert.ok(routeStates.some(state=>state.startsWith(family)));
});

test('customer-visible runtime contains no legacy or misspelled brand residue',()=>{
  const pattern=/(?:\bSKREK\b|\bSkrek\b|\bCJAS\b|Digital Asset Recovery & Continuity|\bLegvik\b|\bLegvic\b|\bLagvik\b)/;
  for(const file of runtimeFiles){
    const source=customerText(readFileSync(new URL(file,root),'utf8'));
    assert.doesNotMatch(source,pattern,file);
  }
});

test('approved internal compatibility identifiers remain intact',()=>{
  const account=readFileSync(new URL('src/account/supabase-account-app.js',root),'utf8');
  const create=readFileSync(new URL('web/v2/v2-app.js',root),'utf8');
  const knowledge=readFileSync(new URL('web/v3-crypto/approved-knowledge.generated.js',root),'utf8');
  assert.match(account,/SKREK_PUBLIC_CONFIG/);
  assert.match(create,/__CJAS_V2_DIAGNOSTICS__/);
  assert.match(create,/LEGAVIK_Module5_/);
  assert.match(knowledge,/globalThis\.SKREK_APPROVED_KNOWLEDGE/);
  assert.match(knowledge,/"id": "SKREK-CRYPTO-V1-001"/);
});
