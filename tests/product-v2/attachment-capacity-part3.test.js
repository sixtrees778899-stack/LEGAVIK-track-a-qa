import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRecoveryMapDraft } from '../../src/product-v2/model.js';
import { ProductActions } from '../../src/product-v2/actions.js';
import { addAttachment,attachmentCapacity } from '../../src/product-v2/attachment-manager.js';
import { assertAttachmentAllowed } from '../../src/ui/attachment-policy.js';

const root=new URL('../../',import.meta.url);
const json=async path=>JSON.parse(await readFile(new URL(path,root)));
const basePolicy=await json('config/attachments/v1.json');
const rules=await json('config/recovery-map/v2/living-rules-v2.json');
const source=await readFile(new URL('web/v2/v2-app.js',root),'utf8');
const MiB=1048576;
const testPolicy=structuredClone(basePolicy);
testPolicy.limits.max_attachment_bytes=30*MiB;
const hash=async()=> 'c'.repeat(64);
const file=(name,size)=>({name,type:'application/pdf',size,arrayBuffer:async()=>new ArrayBuffer(size)});
const accountStore=()=>ProductActions.addAccount(createRecoveryMapDraft({draftId:'attachment-capacity-part3'}),{account_id:'binance-main',platform_id:'binance',platform_name:'Binance',region:'Australia',account_type:'Personal',display_label:'Binance'},{expected_revision:0});
const input=(id,size)=>({attachment_id:id,file:file(`${id}.pdf`,size),platform_id:'binance',account_id:'binance-main',module_id:'accounts',field_or_condition_id:'accounts',purpose:'资产与账户资料',covered_condition_ids:[]});

test('normal policy keeps 10 MiB while the local Recovery Map test path allows 30 MiB',()=>{
  assert.equal(basePolicy.limits.max_attachment_bytes,10*MiB);
  assert.match(source,/if\(testRecoveryMap\)attachmentPolicy\.limits\.max_attachment_bytes=30\*1048576/);
  assert.equal(testPolicy.limits.max_attachment_bytes,30*MiB);
});

test('20 MiB and 30 MiB files are read and registered under the test policy',async()=>{
  let store=accountStore();
  store=await addAttachment(store,input('twenty',20*MiB),{rules,policy:testPolicy,hash});
  assert.equal(store.attachments.twenty.bytes.byteLength,20*MiB);
  store=await addAttachment(store,input('thirty',30*MiB),{rules,policy:testPolicy,hash});
  assert.equal(store.attachments.thirty.bytes.byteLength,30*MiB);
  assert.equal(attachmentCapacity(store,testPolicy).used_bytes,50*MiB);
});

test('multiple attachments may approach 50 MiB but crossing 50 MiB is rejected',async()=>{
  let store=accountStore();
  store=await addAttachment(store,input('twenty',20*MiB),{rules,policy:testPolicy,hash});
  store=await addAttachment(store,input('twenty-nine',29*MiB),{rules,policy:testPolicy,hash});
  assert.equal(attachmentCapacity(store,testPolicy).used_bytes,49*MiB);
  await assert.rejects(addAttachment(store,input('two-more',2*MiB),{rules,policy:testPolicy,hash}),error=>error.code==='VAULT_TOO_LARGE');
  assert.equal(Object.keys(store.attachments).length,2);
});

test('100 attachments are the internal guard and the 101st is rejected with product language',()=>{
  assert.equal(basePolicy.limits.max_attachments,100);
  const current=Array.from({length:100},(_,index)=>({attachment_id:`file-${index}`,byte_length:1}));
  assert.throws(()=>assertAttachmentAllowed(file('file-101.pdf',1),current,testPolicy),error=>error.code==='TOO_MANY_ATTACHMENTS'&&/整理现有附件或联系支持/.test(error.message));
});

test('customer-facing upload notice does not advertise the internal attachment count guard',()=>{
  const notice=source.slice(source.indexOf('const uploadPolicyNotice'),source.indexOf('function showBusinessError'));
  assert.doesNotMatch(notice,/最多附件|max_attachments|\/ 20/);
  assert.match(notice,/总容量 ≤/);
});

test('Part 2 presentation contract remains intact',()=>{
  for(const marker of ['attachmentDisplayStats','attachment-module-library','attachment-type-stats','compact-upload-card','review-overview','uploadCard.before(host)'])assert.match(source,new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
});
