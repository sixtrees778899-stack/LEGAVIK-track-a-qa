import test from 'node:test';
import assert from 'node:assert/strict';
import { Pbkdf2Provider, Argon2idProvider, detectKdfCapabilities } from '../../src/crypto/kdf-provider.js';

test('PBKDF2-HMAC-SHA-256 produces deterministic standard output', async () => {
  const provider = new Pbkdf2Provider();
  const params = { iterations: 100000, hash: 'SHA-256' };
  const salt = new Uint8Array(16).fill(7);
  const a = await provider.deriveKey('compatibility-test', salt, params);
  const b = await provider.deriveKey('compatibility-test', salt, params);
  assert.deepEqual(a, b);
  assert.equal(a.byteLength, 32);
});

test('Argon2id absence is explicit and never falls back', async () => {
  const capabilities = detectKdfCapabilities([new Pbkdf2Provider(), new Argon2idProvider()]);
  assert.equal(capabilities[0].available, true);
  assert.equal(capabilities[1].available, false);
  await assert.rejects(() => new Argon2idProvider().deriveKey('x', new Uint8Array(16), { memory_kib: 65536, iterations: 3, parallelism: 1 }), /unavailable/i);
});
