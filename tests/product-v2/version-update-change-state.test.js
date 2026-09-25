import test from 'node:test';
import assert from 'node:assert/strict';
import {versionUpdateContentFingerprint,versionUpdateHasContentChanges} from '../../src/product-v2/version-update-change-state.js';

const base=()=>({
  draft_id:'update-draft',draft_revision:0,created_at:'2026-09-01T00:00:00Z',updated_at:'2026-09-01T00:00:00Z',
  accounts:{a:{account_id:'a',platform_name:'Example',updated_at:'2026-09-01T00:00:00Z'}},
  attachments:{},version:{version_number:2,status:'DRAFT',draft_revision:0,created_at:'2026-09-01T00:00:00Z'}
});

test('revision and timestamp churn do not count as a real Update change',()=>{
  const source=base(),baseline=versionUpdateContentFingerprint(source),next=structuredClone(source);
  next.draft_revision=7;next.version.draft_revision=7;next.updated_at='2026-09-04T00:00:00Z';next.accounts.a.updated_at='2026-09-04T00:00:00Z';
  assert.equal(versionUpdateHasContentChanges(next,baseline),false);
});

test('module field add, edit, and delete each count as a real Update change',()=>{
  const source=base(),baseline=versionUpdateContentFingerprint(source);
  for(const mutate of [
    value=>{value.accounts.a.region={value:'AU'};},
    value=>{value.accounts.a.platform_name='Changed';},
    value=>{delete value.accounts.a.platform_name;}
  ]){const next=structuredClone(source);mutate(next);assert.equal(versionUpdateHasContentChanges(next,baseline),true);}
});

test('attachment add, replacement, and deletion enter the same Update change state',()=>{
  const source=base();source.attachments.old={attachment_id:'old',file_name:'old.pdf',sha256:'a'.repeat(64),byte_length:10,bytes:new Uint8Array([1]),updated_at:'2026-09-01T00:00:00Z'};
  const baseline=versionUpdateContentFingerprint(source),added=structuredClone(source),replaced=structuredClone(source),removed=structuredClone(source);
  added.attachments.new={attachment_id:'new',file_name:'new.pdf',sha256:'b'.repeat(64),byte_length:20,bytes:new Uint8Array([2])};
  replaced.attachments.old.sha256='c'.repeat(64);replaced.attachments.old.byte_length=11;replaced.attachments.old.bytes=new Uint8Array([3]);
  delete removed.attachments.old;
  assert.equal(versionUpdateHasContentChanges(added,baseline),true);
  assert.equal(versionUpdateHasContentChanges(replaced,baseline),true);
  assert.equal(versionUpdateHasContentChanges(removed,baseline),true);
});
