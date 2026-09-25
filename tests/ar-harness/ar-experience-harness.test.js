import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRecoveryDelivery,FILE_ROLE_MATRIX} from '../../tools/ar-experience-harness/recovery-delivery.js';

const html=await readFile('tools/ar-experience-harness/index.html','utf8');
const js=await readFile('tools/ar-experience-harness/app.js','utf8');

test('Harness is isolated from frozen Recovery Map V2',()=>{
  assert.match(html,/AR Mainnet Experience Harness V1/);
  assert.doesNotMatch(js,/web\/v2|src\/product-v2/);
  assert.match(js,/recoverVaultArtifacts/);
});

test('V1.1 is locked to the authorized PDF Pilot and 0.01 AR total gate',()=>{
  assert.match(js,/pilot:'PDF'/);assert.match(html,/accept="\.pdf,application\/pdf"/);
  assert.match(js,/MAX_SINGLE_AR=0\.01/);assert.match(js,/MAX_TOTAL_AR=0\.01/);
  assert.match(js,/actualAR>MAX_SINGLE_AR\|\|actualAR>MAX_TOTAL_AR/);
});

test('wallet extension signing is used without secret or wallet persistence',()=>{
  assert.match(js,/arweaveWallet\.connect/);assert.match(js,/transactions\.sign/);assert.match(js,/transactions\.post/);
  assert.doesNotMatch(`${html}\n${js}`,/JWK|seed phrase|private key|localStorage|sessionStorage|indexedDB/i);
});

test('download hash is verified before stable browser recovery',()=>{
  const hashCheck=js.indexOf("if(archiveHash!==state.record.archive_sha256)");
  const recovery=js.indexOf('recoverVaultArtifacts({');
  assert.ok(hashCheck>0&&recovery>hashCheck);
  assert.match(js,/GATEWAYS=/);assert.match(js,/sha256_match/);assert.match(js,/decrypt_ms/);
});

test('original and recovered PDF hashes are compared and evidence can cross sessions',()=>{
  assert.match(js,/original_sha256/);assert.match(js,/recovered_sha256/);assert.match(js,/recoverAttachmentForDownload/);
  assert.match(html,/Mainnet Evidence JSON/);assert.match(js,/importEvidence/);
});

test('original PDF is optional and recovered bytes become an explicit download',()=>{
  assert.match(html,/可选，仅用于本次测试的一致性校验，不参与恢复/);
  assert.match(js,/if\(original\)/);assert.match(js,/createRecoveryDelivery/);
  assert.match(html,/下载恢复文件/);assert.match(html,/再次下载/);
});

test('recovery download preserves filename MIME bytes and revokes every Object URL',()=>{
  const source=new Uint8Array([37,80,68,70]),created=[],revoked=[],clicks=[];
  const documentRef={body:{appendChild(){}},createElement:()=>({click(){clicks.push(this.download);},remove(){}})};
  const urlApi={createObjectURL(blob){created.push(blob);return`blob:${created.length}`;},revokeObjectURL(url){revoked.push(url);}};
  const delivery=createRecoveryDelivery({bytes:source,filename:'恢复文件.pdf',mimeType:'application/pdf',sha256:'a'.repeat(64)});
  const schedule=callback=>callback();delivery.download({documentRef,urlApi,schedule});delivery.download({documentRef,urlApi,schedule});
  assert.deepEqual(clicks,['恢复文件.pdf','恢复文件.pdf']);assert.equal(created[0].type,'application/pdf');assert.equal(created[0].size,source.length);assert.deepEqual(revoked,['blob:1','blob:2']);
});

test('Kit and Archive roles remain distinct without changing frozen formats',()=>{
  assert.deepEqual(FILE_ROLE_MATRIX.map(item=>item.extension),['.cjas','.cjasvault']);
  assert.equal(FILE_ROLE_MATRIX[0].wrapped_data_key,true);assert.equal(FILE_ROLE_MATRIX[0].uploaded_mainnet,false);
  assert.equal(FILE_ROLE_MATRIX[1].encrypted_archive,true);assert.equal(FILE_ROLE_MATRIX[1].uploaded_mainnet,true);
  assert.match(js,/recoveryKitBuilder\.parseKit/);assert.match(js,/Recovery Kit 文件类型或内部结构不正确/);
});

test('wrong password and bad Kit fail closed before file delivery',()=>{
  const parseIndex=js.indexOf('recoveryKitBuilder.parseKit');
  const networkIndex=js.indexOf("setRecoveryStage('正在连接 Arweave Mainnet')");
  const deliveryIndex=js.indexOf('state.recoveryDelivery=createRecoveryDelivery');
  assert.ok(parseIndex>0&&networkIndex>parseIndex&&deliveryIndex>networkIndex);
  assert.match(js,/恢复密码不正确、Recovery Kit 损坏/);assert.match(js,/state\.recoveryDelivery=null/);
});

test('broadcast evidence and Kit download state are explicit',()=>{
  assert.match(html,/主网恢复凭证已生成，请保存/);assert.match(html,/下载主网恢复凭证/);
  assert.match(js,/kitDownloadRequested/);assert.match(js,/evidenceDownloadRequested/);assert.match(js,/beforeunload/);
  assert.match(html,/可选，不是主网独立恢复必需文件/);
});
