import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRecoveryMapDraft} from '../../src/product-v2/model.js';
import {ProductActions} from '../../src/product-v2/actions.js';
import {addAttachment} from '../../src/product-v2/attachment-manager.js';

const source=readFileSync(new URL('../../web/v2/v2-app.js',import.meta.url),'utf8');
const rules={limits:{max_attachment_bytes:1024,max_version_bytes:4096,max_attachments:10}};

function locationStore(){
  let store=createRecoveryMapDraft();
  store=ProductActions.addAccount(store,{account_id:'account-a',platform_id:'binance',platform_name:'Binance',region:'Australia',account_type:'Personal',display_label:'Binance'},{expected_revision:store.draft_revision});
  store=ProductActions.setConditionSelection(store,'account-a',{selected_condition_ids:['email']},{expected_revision:store.draft_revision});
  return store;
}

const input=covered=>({attachment_id:'location-file',bytes:new Uint8Array([1,2,3]),byte_length:3,file_name:'location.pdf',mime_type:'application/pdf',module_id:'locations',platform_id:'binance',account_id:'account-a',field_or_condition_id:'email',purpose:'汇总位置说明',covered_condition_ids:covered});

test('account-specific location attachment preserves explicit recovery-condition ownership',async()=>{
  const store=locationStore();
  const saved=await addAttachment(store,input(['email']),{rules,hash:async()=> 'a'.repeat(64)});
  assert.equal(saved.attachments['location-file'].purpose,'汇总位置说明');
  assert.deepEqual(saved.attachments['location-file'].covered_condition_ids,['email']);
});

test('module-summary location attachment remains valid without checkbox coverage',async()=>{
  const store=locationStore();
  const saved=await addAttachment(store,{...input([]),field_or_condition_id:'module-summary'},{rules,hash:async()=> 'b'.repeat(64)});
  assert.deepEqual(saved.attachments['location-file'].covered_condition_ids,[]);
});

test('upload UI reports the missing frozen requirement instead of a generic retry error',()=>{
  assert.match(source,/context\?\.module_id==='locations'[\s\S]*scope!==MODULE_SUMMARY_SCOPE[\s\S]*#new-file-conditions input:checked/);
  assert.match(source,/error\.textContent='请选择该附件需要覆盖的恢复条件。'/);
  assert.match(source,/if\(account&&\['conditions','locations','instructions'\]\.includes\(context\?\.module_id\)\)/);
});
