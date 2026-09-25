import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {createGenericArtifacts} from '../../tools/ar-generic-file-mainnet-pilot/pilot-core.js';
import {assertBatchSelection,BATCH_LIMITS,mapConcurrent,pairRecoveryMaterials} from '../../tools/ar-generic-batch-mainnet-pilot/batch-core.js';

const here=dirname(fileURLToPath(import.meta.url)),root=join(here,'../..');
const [html,app,recoverHtml,recover]=await Promise.all(['index.html','app.js','recover.html','recover.js'].map(name=>readFile(join(root,'tools/ar-generic-batch-mainnet-pilot',name),'utf8')));

test('Batch limits are bounded and selection rejects duplicate names or excess total bytes',()=>{
  assert.deepEqual(BATCH_LIMITS,{max_total_bytes:50*1024*1024,local_concurrency:2,network_concurrency:3,max_fee_ar_per_file:0.12});assert.equal('max_files' in BATCH_LIMITS,false);
  assert.equal(assertBatchSelection([{name:'a.pdf',size:1},{name:'b.txt',size:2}]).total_original_bytes,3);
  assert.throws(()=>assertBatchSelection([{name:'A.pdf',size:1},{name:'a.PDF',size:2}]),/同名/);
  assert.throws(()=>assertBatchSelection([{name:'a.mov',size:50*1024*1024+1}]),/超过50MB/);
  assert.equal(assertBatchSelection(Array.from({length:30},(_,i)=>({name:`${i}.txt`,size:1}))).file_count,30);
});

test('bounded concurrency isolates failures without dropping successful results',async()=>{
  let active=0,maximum=0;const results=await mapConcurrent([1,2,3,4],2,async value=>{active++;maximum=Math.max(maximum,active);await new Promise(resolve=>setTimeout(resolve,3));active--;if(value===3)throw new Error('expected');return value*2;});
  assert.equal(maximum,2);assert.deepEqual(results.map(x=>x.status),['PASS','PASS','FAIL','PASS']);assert.equal(results[3].value,8);
});

test('Recovery materials pair by immutable Kit identifier and reject cross-batch or duplicates',async()=>{
  const password='Batch Test Strong 密码 123!';const a=await createGenericArtifacts({bytes:new TextEncoder().encode('a'),filename:'a.txt',mimeType:'text/plain',password}),b=await createGenericArtifacts({bytes:new TextEncoder().encode('b'),filename:'b.txt',mimeType:'text/plain',password});
  const evidence=artifact=>({network:'Arweave Mainnet',txid:'A'.repeat(43),archive_size:artifact.archiveBytes.length,archive_sha256:artifact.archiveSha256,recovery_kit_identifier:artifact.pilotId});
  const pairs=pairRecoveryMaterials([{name:'a.json',evidence:evidence(a)},{name:'b.json',evidence:evidence(b)}],[{name:'b.cjas',bytes:b.kitBytes},{name:'a.cjas',bytes:a.kitBytes}]);assert.equal(pairs[0].kitEntry.parsed.snapshot_id,a.pilotId);assert.equal(pairs[1].kitEntry.parsed.snapshot_id,b.pilotId);
  assert.throws(()=>pairRecoveryMaterials([{name:'a.json',evidence:evidence(a)}],[{name:'b.cjas',bytes:b.kitBytes}]),/找不到/);
  assert.throws(()=>pairRecoveryMaterials([{name:'a.json',evidence:evidence(a)},{name:'again.json',evidence:evidence(a)}],[{name:'a.cjas',bytes:a.kitBytes}]),/重复/);
});

test('Batch creator reuses generic artifacts and immutable per-file Evidence with controlled concurrency',()=>{
  assert.match(html,/type="file" multiple/);assert.match(html,/文件数量不设固定上限/);assert.match(html,/50 MiB/);assert.match(app,/createGenericArtifacts/);assert.match(app,/materialFilename\('Recovery-Kit'/);assert.match(app,/materialFilename\('Mainnet-Recovery-Evidence'/);assert.match(app,/mapConcurrent\(valid,BATCH_LIMITS\.local_concurrency/);assert.match(app,/mapConcurrent\(state\.items,BATCH_LIMITS\.network_concurrency,broadcastItem/);assert.match(app,/if\(item\.evidence\.broadcasts\)/);for(const status of ['PENDING','ENCRYPTED','BROADCASTING','EVIDENCE READY','MAINNET VERIFIED','FAILED'])assert.match(app,new RegExp(status));assert.equal((app.match(/transactions\.post/g)??[]).length,1);assert.equal((app.match(/transactions\.sign/g)??[]).length,1);assert.doesNotMatch(app,/localStorage|sessionStorage|indexedDB|console\./);
});

test('Batch recovery accepts only multiple Evidence Kits and one password, then verifies every file',()=>{
  assert.match(recoverHtml,/evidence-files[^>]+multiple/);assert.match(recoverHtml,/kit-files[^>]+multiple/);assert.match(recoverHtml,/id="download-all"/);assert.match(recover,/pairRecoveryMaterials/);assert.match(recover,/verifyGatewaysParallel/);assert.match(recover,/expectedSize:evidence\.archive_size/);assert.match(recover,/expectedHash:evidence\.archive_sha256/);assert.match(recover,/sha===pair\.evidence\.source_sha256/);assert.match(recover,/mapConcurrent\(pairs,BATCH_LIMITS\.network_concurrency/);assert.match(recover,/for\(const result of state\.results\)await saveRecovered/);assert.match(recover,/下载此文件/);assert.doesNotMatch(`${recoverHtml}\n${recover}`,/id="original|id="archive-file|SIGN_TRANSACTION|transactions\.post|localStorage|sessionStorage/);
});
