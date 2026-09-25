import { performance } from 'node:perf_hooks';
import { Pbkdf2Provider, Argon2idProvider, detectKdfCapabilities } from '../src/crypto/kdf-provider.js';

const pbkdf2 = new Pbkdf2Provider();
const results = [];
for (const iterations of [100000, 300000, 600000]) {
  const started = performance.now();
  const key = await pbkdf2.deriveKey('local-non-secret-benchmark', new Uint8Array(16).fill(7), { iterations, hash: 'SHA-256' });
  results.push({ iterations, duration_ms: Number((performance.now() - started).toFixed(2)), output_bytes: key.byteLength });
  key.fill(0);
}
process.stdout.write(`${JSON.stringify({ runtime: process.version, platform: process.platform, architecture: process.arch, capabilities: detectKdfCapabilities([pbkdf2, new Argon2idProvider()]), pbkdf2_hmac_sha256: results, note: 'Local Node Web Crypto measurement; not a browser result.' }, null, 2)}\n`);
