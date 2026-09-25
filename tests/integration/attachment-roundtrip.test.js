import test from 'node:test';
import assert from 'node:assert/strict';
import { mapWizardDraftToKnowledge } from '../../src/ui/knowledge-mapper.js';
import { createVaultArtifacts, recoverVaultArtifacts } from '../../src/ui/vault-pipeline.js';
import { recoverAttachmentForDownload } from '../../src/recovery/attachment-recovery.js';
import { cryptoEngine } from '../../src/crypto/crypto-engine.js';

const password = 'Attachment round trip 2026';
const draft = { modules: { 'wallet-assets': [{ 'wallet-exists':'yes', 'wallet-label':'附件恢复验证', 'wallet-custom':[] }], 'exchange-custody':[{ 'exchange-used':'no' }], 'devices-locations':[{ 'primary-device':'测试设备', 'device-location':'测试位置' }], 'contacts-assistance':[{ 'has-assistant':'yes', 'assistant-role':'测试联系人' }], 'recovery-orders-warnings':[{ 'first-action':'验证附件', 'expected-result':'字节一致', 'failure-action':'立即停止', 'risk-warning':'不一致时禁止下载' }] }, customCategories:[] };
const cases = [
  ['docx', '恢复说明 中文.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', Uint8Array.from([0x50,0x4b,0x03,0x04,0x14,0,0,0,0,0,0x44,0x4f,0x43,0x58])],
  ['pdf', '恢复说明.pdf', 'application/pdf', new TextEncoder().encode('%PDF-1.7\n%CJAS\n%%EOF\n')],
  ['png', '设备照片.png', 'image/png', Uint8Array.from([137,80,78,71,13,10,26,10,0,0,0,0,73,69,78,68])],
  ['txt', '步骤说明.txt', 'text/plain', new TextEncoder().encode('中文恢复步骤\r\nLine 2')],
  ['json', 'metadata.json', 'application/json', new TextEncoder().encode('{"版本":1,"ok":true}')],
  ['binary', '原始数据<>:"/\\|?*.bin', 'application/octet-stream', Uint8Array.from({length:256},(_,index)=>index)]
];

async function roundTrip([kind, displayName, mediaType, source], snapshotId = `attachment-${kind}-v1`) {
  const id = `attachment-${kind}`;
  const metadata = { id, display_name:displayName, media_type:mediaType, size:source.byteLength, sha256:await cryptoEngine.hashHex(source) };
  const knowledgeGraph = mapWizardDraftToKnowledge(draft, { now:'2026-08-01T00:00:00.000Z', attachmentMetadata:[metadata] });
  const artifacts = await createVaultArtifacts({ knowledgeGraph, attachmentPayloads:{[id]:source}, password, wizardConfigVersion:1, vaultId:'attachment-vault', snapshotId, createdAt:'2026-08-01T00:00:00.000Z' });
  const recovered = await recoverVaultArtifacts({ kitBytes:artifacts.kitBytes, archiveBytes:artifacts.archiveBytes, password });
  return { artifacts, recovered, attachment:await recoverAttachmentForDownload(recovered.snapshot, id), source, id };
}

for (const item of cases) test(`${item[0]} attachment restores byte-for-byte with MIME and safe filename`, async () => {
  const { attachment, source } = await roundTrip(item);
  assert.deepEqual(attachment.bytes, source);
  assert.equal(attachment.mimeType, item[2]);
  assert.ok(attachment.filename.length > 0);
  assert.doesNotMatch(attachment.filename, /[\\/:*?"<>|\u0000-\u001f]/);
});

test('attachment download validation is fail-closed for reference, length, SHA-256, MIME and version corruption', async () => {
  const { recovered, id } = await roundTrip(cases[3]);
  await assert.rejects(() => recoverAttachmentForDownload(recovered.snapshot, 'attachment-missing'), /reference/i);
  for (const mutate of [
    snapshot => { snapshot.knowledge_graph.attachments[0].size += 1; },
    snapshot => { snapshot.knowledge_graph.attachments[0].sha256 = '0'.repeat(64); },
    snapshot => { snapshot.knowledge_graph.attachments[0].media_type = 'text/plain; charset=utf-8'; },
    snapshot => { snapshot.snapshot_schema_version = 999; },
    snapshot => { snapshot.attachment_payloads[id] = snapshot.attachment_payloads[id].slice(1); }
  ]) {
    const damaged = structuredClone(recovered.snapshot); mutate(damaged);
    await assert.rejects(() => recoverAttachmentForDownload(damaged, id));
  }
});

test('two attachment versions recover independently and cross-version materials fail', async () => {
  const v1 = await roundTrip(cases[5], 'attachment-binary-v1');
  const changed = [...cases[5]]; changed[3] = Uint8Array.from([9,8,7,6,5,4,3,2,1]);
  const v2 = await roundTrip(changed, 'attachment-binary-v2');
  assert.deepEqual(v1.attachment.bytes, cases[5][3]);
  assert.deepEqual(v2.attachment.bytes, changed[3]);
  await assert.rejects(() => recoverVaultArtifacts({ kitBytes:v1.artifacts.kitBytes, archiveBytes:v2.artifacts.archiveBytes, password }));
});
