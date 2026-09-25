import test from 'node:test';
import assert from 'node:assert/strict';
import { loadJson } from '../helpers/load-fixture.js';
import { buildSnapshot, snapshotBytes } from '../../src/snapshot/snapshot-builder.js';
import { cryptoEngine } from '../../src/crypto/crypto-engine.js';
import { Pbkdf2Provider } from '../../src/crypto/kdf-provider.js';
import { RecoveryKitBuilder } from '../../src/recovery-kit/recovery-kit-builder.js';
import { LocalMockAdapter } from '../../src/storage/storage-adapter.js';
import { RecoveryService } from '../../src/recovery/recovery-service.js';

test('complete local recovery works in a new service instance', async () => {
  const knowledge = await loadJson('../fixtures/knowledge-valid.json');
  const attachmentBytes = new TextEncoder().encode('测试附件');
  const kdf = new Pbkdf2Provider();
  const kits = new RecoveryKitBuilder();
  const store = new LocalMockAdapter();
  const snapshot = await buildSnapshot({
    snapshotId: 'snap-integration-0001', vaultId: 'vault-integration-0001',
    wizardConfigVersion: 1, createdAt: '2026-07-31T00:00:00.000Z',
    knowledgeGraph: knowledge, attachmentPayloads: { 'attachment-guide-1': attachmentBytes }
  });
  const plaintext = snapshotBytes(snapshot);
  const dataKey = cryptoEngine.generateDataKey();
  const encrypted = await cryptoEngine.encryptSnapshot(plaintext, { dataKey });
  const ciphertextEnvelope = new TextEncoder().encode(JSON.stringify({
    nonce: Buffer.from(encrypted.nonce).toString('base64url'),
    ciphertext: Buffer.from(encrypted.ciphertext).toString('base64url')
  }));
  const locatorSet = await store.putCiphertext(ciphertextEnvelope, { id: 'ciphertext-integration-0001' });
  const ciphertextHash = await cryptoEngine.hashHex(ciphertextEnvelope);
  const kit = await kits.createKit({
    password: 'correct horse battery staple', dataKey, snapshotId: snapshot.snapshot_id,
    ciphertextSha256: ciphertextHash, storageLocators: locatorSet.locators,
    kdfProvider: kdf, createdAt: snapshot.created_at, kdfParameters: { iterations: 100000, hash: 'SHA-256' }
  });
  const recovery = new RecoveryService({
    kitBuilder: kits, storageAdapter: store, kdfProvider: kdf
  });
  const recovered = await recovery.recover({
    kitBytes: kit, password: 'correct horse battery staple', expectedSnapshotId: snapshot.snapshot_id,
    expectedCiphertextSha256: ciphertextHash, envelopeDecoder: bytes => {
      const envelope = JSON.parse(new TextDecoder().decode(bytes));
      return { algorithm: 'AES-256-GCM', nonce: new Uint8Array(Buffer.from(envelope.nonce, 'base64url')), aad: encrypted.aad, ciphertext: new Uint8Array(Buffer.from(envelope.ciphertext, 'base64url')) };
    }
  });
  assert.equal(recovered.snapshot_id, snapshot.snapshot_id);
  assert.deepEqual(recovered.knowledge_graph, snapshot.knowledge_graph);
});
