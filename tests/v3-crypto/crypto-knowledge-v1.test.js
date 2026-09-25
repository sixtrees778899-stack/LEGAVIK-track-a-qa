import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import vm from 'node:vm';

const root=new URL('../../',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('knowledge/approved/crypto-v1/manifest.json',root),'utf8'));
const generated=await readFile(new URL('web/v3-crypto/approved-knowledge.generated.js',root),'utf8');
const context={};
vm.runInNewContext(generated,context);
const articles=context.SKREK_APPROVED_KNOWLEDGE;

test('crypto v1 manifest publishes exactly 18 complete unique articles',async()=>{
  assert.equal(manifest.articles.length,18);
  assert.equal(new Set(manifest.articles.map(item=>item.title)).size,18);
  assert.ok(manifest.articles.every(item=>item.status==='PUBLISHED'&&item.published===true));
  for(const item of manifest.articles){
    const file=new URL(`knowledge/approved/crypto-v1/${item.source_file}`,root);
    assert.ok((await stat(file)).isFile());
    assert.ok((await readFile(file,'utf8')).trim().length>100);
  }
});

test('generated public bundle exposes 18 articles and strips internal metadata',()=>{
  assert.equal(articles.length,18);
  assert.equal(new Set(articles.map(item=>item.title)).size,18);
  const customerText=articles.map(item=>item.markdown).join('\n');
  assert.doesNotMatch(customerText,/APPROVED DRAFT|NOT PUBLISHED|相关 Recovery Map 模块|Internal Knowledge|AI Retrieval Metadata|Needs Review|Risk Notes|Applicable Region/i);
  assert.ok(articles.every(item=>item.markdown.includes('快速了解')));
  assert.ok(articles.every(item=>item.markdown.includes('Last Verified')));
});

test('search bundle is generated from published manifests without internal content',()=>{
  const searchText=articles.map(item=>item.searchText).join('\n');
  for(const term of ['2FA','手机','Ledger','Passphrase','Seed Phrase','Safe','signer','threshold','冻结','DeFi','客服','Email','Imported Account'])assert.match(searchText,new RegExp(term,'i'));
  assert.doesNotMatch(searchText,/APPROVED DRAFT|NOT PUBLISHED|Internal Knowledge|Needs Review|Risk Notes/i);
});
