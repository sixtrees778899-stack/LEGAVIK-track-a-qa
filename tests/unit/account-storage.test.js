import test from 'node:test';
import assert from 'node:assert/strict';
import { assertAccountBoundary } from '../../src/account/account-boundary.js';
import { LocalMockAdapter } from '../../src/storage/storage-adapter.js';

test('account boundary accepts management metadata only', () => {
  assert.deepEqual(assertAccountBoundary({ vault_alias: '代号', version_status: 'draft' }), { vault_alias: '代号', version_status: 'draft' });
});
test('account boundary rejects recovery material', () => assert.throws(() => assertAccountBoundary({ recovery_password: 'secret' }), /boundary/i));
test('local storage adapter round trip is isolated from browser persistence', async () => {
  const adapter = new LocalMockAdapter(); const bytes = new Uint8Array([1,2,3]); const locator = await adapter.putCiphertext(bytes, { id: 'test-1' }); assert.deepEqual(await adapter.getCiphertext(locator), bytes);
});
