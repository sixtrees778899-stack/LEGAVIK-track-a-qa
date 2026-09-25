import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {createUnifiedVaultArtifacts,recoverUnifiedFiles,UNIFIED_LIMITS,uploadSignedTransaction,validateIncomingFiles,validateUnifiedEvidence} from '../../tools/ar-unified-multi-file-mainnet-pilot/pilot-core.js';
import {validateSnapshot} from '../../src/snapshot/snapshot-builder.js';

const here=dirname(fileURLToPath(import.meta.url)),root=join(here,'../..'),folder=join(root,'tools/ar-unified-multi-file-mainnet-pilot');
const [html,app,recoverHtml,recover,pilotCore]=await Promise.all(['index.html','app.js','recover.html','recover.js','pilot-core.js'].map(name=>readFile(join(folder,name),'utf8')));
const fakeFile=(name,type,bytes)=>({name,type,size:bytes.length,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)});

test('files append across repeated selections without overwrite and only total 50 MiB limits count',async()=>{
  const text=new TextEncoder().encode('hello'),png=Uint8Array.from([137,80,78,71,13,10,26,10]);const first=await validateIncomingFiles([fakeFile('note.txt','text/plain',text)]),second=await validateIncomingFiles([fakeFile('image.png','image/png',png)],first);assert.equal(first.length,1);assert.equal(second.length,1);assert.equal('max_files'in UNIFIED_LIMITS,false);
  await assert.rejects(()=>validateIncomingFiles([fakeFile('note.txt','text/plain',text)],first),/已存在/);
  const huge={file:{name:'large.mov',size:UNIFIED_LIMITS.max_total_original_bytes},bytes:new Uint8Array(),identity:{}};await assert.rejects(()=>validateIncomingFiles([fakeFile('extra.txt','text/plain',text)],[huge]),/超过50 MiB/);
});

test('mixed files become one frozen Snapshot one Archive one Kit and recover byte-for-byte',async()=>{
  const text=new TextEncoder().encode('CJAS unified text'),png=Uint8Array.from([137,80,78,71,13,10,26,10,1,2,3]),items=[...(await validateIncomingFiles([fakeFile('note.txt','text/plain',text)])),...(await validateIncomingFiles([fakeFile('image.png','image/png',png)]))],password='Unified Strong 密码 2026!';const artifacts=await createUnifiedVaultArtifacts({items,password,idFactory:(()=>{let n=0;return()=>`test-${++n}`;})(),createdAt:'2026-08-09T00:00:00.000Z'});assert.equal(artifacts.fileCount,2);assert.equal(artifacts.snapshot.knowledge_graph.attachments.length,2);assert.equal((await validateSnapshot(artifacts.snapshot)).valid,true);assert.ok(artifacts.archiveBytes.length);assert.ok(artifacts.kitBytes.length);
  const restored=await recoverUnifiedFiles({archiveBytes:artifacts.archiveBytes,kitBytes:artifacts.kitBytes,password});assert.equal(restored.files.length,2);assert.deepEqual(restored.files.map(x=>x.filename),['note.txt','image.png']);assert.deepEqual(restored.files[0].bytes,text);assert.deepEqual(restored.files[1].bytes,png);assert.ok(restored.files.every(x=>x.sha_match&&x.byte_match));
});

test('Evidence remains the existing single-transaction shape and fails closed',()=>{
  const valid={network:'Arweave Mainnet',txid:'A'.repeat(43),archive_size:123,archive_sha256:'a'.repeat(64),recovery_kit_identifier:'unified-test'};assert.equal(validateUnifiedEvidence(valid),valid);assert.throws(()=>validateUnifiedEvidence({...valid,archive_size:0.5}),/无法识别/);assert.throws(()=>validateUnifiedEvidence({...valid,txid:'bad'}),/无法识别/);
});

test('creator exposes additive multi-select delete capacity and exactly one Mainnet transaction',()=>{
  assert.match(html,/type="file" multiple/);assert.match(html,/追加文件/);assert.match(html,/50 MiB/);assert.match(app,/state\.items\.push\(\.\.\.added\)/);assert.match(app,/state\.items=state\.items\.filter/);assert.match(app,/createUnifiedVaultArtifacts/);assert.equal((app.match(/transactions\.sign/g)??[]).length,1);assert.equal((app.match(/transactions\.post/g)??[]).length,0);assert.equal((app.match(/uploadSignedTransaction/g)??[]).length,2);assert.doesNotMatch(app,/localStorage|sessionStorage|indexedDB|console\./);
  assert.doesNotMatch(`${app}\n${pilotCore}`,/max_mainnet_fee_ar|0\.12 AR/);
});

test('one signed transaction uses chunks and records upload telemetry',async()=>{
  let calls=0;const uploader={isComplete:false,uploadedChunks:0,totalChunks:3,pctComplete:0,async uploadChunk(){calls++;this.uploadedChunks=calls;this.pctComplete=calls/3*100;this.isComplete=calls===3;}};const result=await uploadSignedTransaction({arweave:{transactions:{getUploader:async()=>uploader}},transaction:{id:'T'.repeat(43)}});assert.equal(calls,3);assert.equal(result.txid,'T'.repeat(43));assert.equal(result.upload_strategy,'ARWEAVE_CHUNK_UPLOADER');assert.equal(result.chunk_count,3);assert.equal(result.chunks.length,3);
});

test('recovery accepts one Evidence one Kit one password and delivers all plus individual fallback',()=>{
  assert.match(recoverHtml,/id="evidence" type="file"/);assert.match(recoverHtml,/id="kit" type="file"/);assert.match(recoverHtml,/id="download-all"/);assert.match(recover,/recoverUnifiedFiles/);assert.match(recover,/verifyGatewaysParallel/);assert.match(recover,/expectedSize:evidence\.archive_size/);assert.match(recover,/expectedHash:evidence\.archive_sha256/);assert.match(recover,/for\(const file of state\.files\)await saveFile/);assert.match(recover,/下载此文件/);assert.doesNotMatch(`${recoverHtml}\n${recover}`,/transactions\.sign|transactions\.post|localStorage|sessionStorage/);
});
