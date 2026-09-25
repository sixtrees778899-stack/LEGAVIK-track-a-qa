import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createMainnetEvidence,assertKitEvidencePair,validateMainnetEvidence,quoteMainnetArchive,broadcastMainnetArchive} from '../../src/ui/mainnet-connector.js';
import {cryptoEngine} from '../../src/crypto/crypto-engine.js';

const root=new URL('../../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const txid='A'.repeat(43),snapshotId='v2-integration-snapshot',archiveBytes=new TextEncoder().encode('single-v3-archive');

test('ordinary local Recovery Map test flow detects and connects the wallet before quoting',async()=>{
  const calls=[];
  const wallet={getPermissions:async()=>[],connect:async permissions=>{calls.push(permissions);},getActiveAddress:async()=>'test-address'};
  const fetchImpl=async url=>({ok:true,status:200,text:async()=>url.includes('/price/')?'1000000000':'5000000000'});
  const quote=await quoteMainnetArchive({archiveBytes,wallet,fetchImpl});
  assert.deepEqual(calls,[['ACCESS_ADDRESS']]);
  assert.equal(quote.quote_ar,0.001);
  assert.equal(quote.balance_before_ar,0.005);
  await assert.rejects(()=>quoteMainnetArchive({archiveBytes,wallet:{...wallet,connect:async()=>{throw new Error('CONNECT_REJECTED');}},fetchImpl}),/CONNECT_REJECTED/);
});

test('V3 Evidence preserves the Archive and Recovery Kit creation identity',async()=>{
  const hash=await cryptoEngine.hashHex(archiveBytes),artifacts={archiveBytes,archiveName:`CJAS-Vault-${snapshotId}.cjasvault`,ciphertextSha256:hash,snapshot:{snapshot_id:snapshotId}};
  const evidence=createMainnetEvidence({artifacts,sourceSize:123,sourceSha256:'b'.repeat(64)});
  assert.equal(evidence.archive_size,archiveBytes.length);
  assert.equal(evidence.archive_sha256,hash);
  assert.equal(evidence.recovery_kit_identifier,snapshotId);
  assertKitEvidencePair({kit:{snapshot_id:snapshotId},evidence});
  assert.throws(()=>assertKitEvidencePair({kit:{snapshot_id:'another-snapshot'},evidence}),/不属于同一次创建/);
  assert.equal(validateMainnetEvidence({...evidence,txid}).txid,txid);
});

test('connector broadcasts the supplied V3 Archive exactly once and never creates another Archive',async()=>{
  const hash=await cryptoEngine.hashHex(archiveBytes),artifacts={archiveBytes,archiveName:'one.cjasvault',ciphertextSha256:hash,snapshot:{snapshot_id:snapshotId}},evidence={...createMainnetEvidence({artifacts,sourceSize:1,sourceSha256:'c'.repeat(64)}),balance_before_ar:1};
  let createCalls=0,signCalls=0,uploadedChunks=0;
  const transaction={id:txid,reward:'123',addTag(){}};
  const wallet={getPermissions:async()=>['SIGN_TRANSACTION']};
  const uploader={isComplete:false,uploadedChunks:0,totalChunks:1,pctComplete:0,async uploadChunk(){uploadedChunks++;this.uploadedChunks=1;this.pctComplete=100;this.isComplete=true;}};
  const arweave={createTransaction:async({data})=>{createCalls++;assert.equal(data,archiveBytes);return transaction;},transactions:{sign:async tx=>{signCalls++;assert.equal(tx,transaction);},getUploader:async tx=>{assert.equal(tx,transaction);return uploader;}}};
  const result=await broadcastMainnetArchive({artifacts,evidence,arweave,wallet});
  assert.equal(result.txid,txid);
  assert.equal(result.broadcasts,1);
  assert.equal(createCalls,1);
  assert.equal(signCalls,1);
  assert.equal(uploadedChunks,1);
  await assert.rejects(()=>broadcastMainnetArchive({artifacts,evidence:{...evidence,txid,broadcasts:1},arweave,wallet}),/禁止重复交易/);
});

test('failed upload retries the same signed transaction without a second signature or fee',async()=>{
  const hash=await cryptoEngine.hashHex(archiveBytes),artifacts={archiveBytes,archiveName:'retry.cjasvault',ciphertextSha256:hash,snapshot:{snapshot_id:snapshotId}},evidence={...createMainnetEvidence({artifacts,sourceSize:1,sourceSha256:'d'.repeat(64)}),balance_before_ar:1};
  let createCalls=0,signCalls=0,uploaderCalls=0,signedTransaction=null;
  const transaction={id:txid,reward:'123',addTag(){}};
  const wallet={getPermissions:async()=>['SIGN_TRANSACTION']};
  const arweave={createTransaction:async()=>{createCalls++;return transaction;},transactions:{sign:async()=>{signCalls++;},getUploader:async()=>{uploaderCalls++;if(uploaderCalls===1)return{isComplete:false,uploadedChunks:0,totalChunks:1,pctComplete:0,async uploadChunk(){throw new Error('UPLOAD_INTERRUPTED');}};return{isComplete:false,uploadedChunks:0,totalChunks:1,pctComplete:0,async uploadChunk(){this.uploadedChunks=1;this.pctComplete=100;this.isComplete=true;}};}}};
  await assert.rejects(()=>broadcastMainnetArchive({artifacts,evidence,arweave,wallet,onTransactionSigned:tx=>{signedTransaction=tx;}}),/可安全重试同一笔已签名交易/);
  assert.equal(signedTransaction,transaction);
  const result=await broadcastMainnetArchive({artifacts,evidence,arweave,wallet,signedTransaction});
  assert.equal(result.txid,txid);
  assert.equal(createCalls,1);
  assert.equal(signCalls,1);
});

test('V3 customer flow uses one Archive, isolates internal controls and binds real uploader progress',async()=>{
  const [source,recovery,html,server]=await Promise.all([read('web/v2/v2-app.js'),read('web/recover.js'),read('web/v2/index.html'),read('tools/static-server.mjs')]);
  assert.match(source,/artifacts=await createVaultArtifacts/);
  assert.match(source,/broadcastMainnetArchive\(\{artifacts,evidence:mainnetEvidence/);
  assert.match(source,/archiveBytes:artifacts\.archiveBytes/);
  assert.match(source,/internalMainnetTest\?`<section id="internal-mainnet-control"/);
  assert.match(source,/!internalMainnetTest\?`<section id="mainnet-experience-control"/);
  assert.match(source,/mainnetExperienceTest=localTestHost&&!internalMainnetTest&&\(queryParams\.get\('mainnet_experience_test'\)==='1'\|\|testRecoveryMap\)/);
  assert.match(source,/else\{document\.querySelector\('#mainnet-experience-control'\)\.hidden=false;await quoteV3Mainnet\(\);\}/);
  assert.match(source,/我已核对并明确确认本次显示的真实 Mainnet 费用/);
  assert.match(source,/确认费用并调起钱包签名/);
  assert.match(source,/signedTransaction:pendingMainnetTransaction/);
  assert.match(source,/assertCreatePreflight/);
  assert.match(source,/assertQuoteBinding/);
  assert.match(source,/saveOperationCheckpoint/);
  assert.match(source,/reconcileMainnetTransaction/);
  assert.match(source,/onTransactionSigned:async tx=>\{pendingMainnetTransaction=tx/);
  assert.match(source,/上传未完成；系统将先核对同一 TxID，再安全重试/);
  assert.match(source,/onProgress:item=>setGenerationStage\(2,`正在上传到长期存储网络 \$\{item\.pct_complete\}% · \$\{item\.uploaded_chunks\} \/ \$\{item\.total_chunks\} 个上传分块`,item\.pct_complete\)/);
  assert.match(source,/Recovery-Kit-LEGAVIK-\$\{snapshotId\}/);
  assert.match(source,/Mainnet-Recovery-Evidence-LEGAVIK-\$\{snapshotId\}/);
  assert.match(recovery,/verifyMainnetArchive\(\{evidence\}\)/);
  assert.match(recovery,/recoverVaultArtifacts\(\{kitBytes,archiveBytes,password\}\)/);
  assert.doesNotMatch(recovery,/archive-file|Local Encrypted Backup/);
  assert.match(html,/canonical-entry\.legavik-[a-z0-9-]+\.js/);
  assert.match(html,/meta name="legavik-deployment" content="legavik-[a-z0-9-]+"/);
  assert.match(server,/script-src 'self' https:\/\/unpkg\.com/);
  assert.match(source,/const wallet=await waitForWalletProvider\(\)/);
  assert.ok(source.indexOf('async function quoteV3Mainnet')<source.indexOf('async function broadcastV3Mainnet'));
  const quoteBody=source.slice(source.indexOf('async function quoteV3Mainnet'),source.indexOf('async function broadcastV3Mainnet'));
  assert.doesNotMatch(quoteBody,/loadArweaveSdk/);
  assert.match(source,/handler_fired:true,canonical_store_ready:false,attachment_bytes_ready:false/);
  assert.match(source,/阶段：\$\{normalized\.stage\} · 错误：\$\{normalized\.code\}/);
  assert.match(source,/<div id="message"><\/div><\/section>/);
  assert.doesNotMatch(source,/style="width:0%"/);
  assert.match(source,/最终恢复材料暂不可下载/);
  assert.match(source,/publishMaterialsReady\(currentOperation,mainnetEvidence\)/);
  assert.match(source,/customer_active_wait_ms/);
  assert.match(source,/mainnet_final_verify_ms/);
  assert.match(source,/background_verification:'PASS'/);
  const verifyBody=source.slice(source.indexOf('async function completeVerifiedMainnet'),source.indexOf('async function resumeV3Mainnet'));
  assert.ok(verifyBody.indexOf('verifyMainnetArchive')<verifyBody.indexOf("status:'READY_FOR_INDEPENDENT_RECOVERY'"));
  const broadcastBody=source.slice(source.indexOf('async function broadcastV3Mainnet'),source.indexOf('function applyRestoredOperation'));
  assert.match(broadcastBody,/await completeVerifiedMainnet\(customerWaitStarted\)/);
  assert.match(source,/addEventListener\('beforeunload'/);
  assert.match(source,/back\.disabled=publishSafetyLocked/);
});
