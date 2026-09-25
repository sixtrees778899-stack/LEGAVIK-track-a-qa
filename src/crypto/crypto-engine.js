import { CryptoError, ValidationError } from '../shared/errors.js';
import { concatBytes, utf8 } from '../shared/encoding.js';

const subtle = globalThis.crypto?.subtle;
if (!subtle) throw new Error('Web Crypto API is required');

function requireBytes(value, name, length) {
  if (!(value instanceof Uint8Array)) throw new ValidationError('INVALID_BYTES', `${name} must be Uint8Array`);
  if (length && value.byteLength !== length) throw new ValidationError('INVALID_LENGTH', `${name} must be ${length} bytes`);
}

export class CryptoEngine {
  generateDataKey() { const key = new Uint8Array(32); globalThis.crypto.getRandomValues(key); return key; }
  generateNonce() { const nonce = new Uint8Array(12); globalThis.crypto.getRandomValues(nonce); return nonce; }
  async hash(bytes) { requireBytes(bytes, 'bytes'); return new Uint8Array(await subtle.digest('SHA-256', bytes)); }
  async hashHex(bytes) { return Array.from(await this.hash(bytes), (b) => b.toString(16).padStart(2, '0')).join(''); }

  async encryptSnapshot(snapshotBytes, { dataKey, nonce = this.generateNonce(), aad = utf8.encode('CJAS-VAULT-SNAPSHOT-V1') } = {}) {
    requireBytes(snapshotBytes, 'snapshotBytes'); requireBytes(dataKey, 'dataKey', 32); requireBytes(nonce, 'nonce', 12); requireBytes(aad, 'aad');
    const key = await subtle.importKey('raw', dataKey, 'AES-GCM', false, ['encrypt']);
    const ciphertext = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv: nonce, additionalData: aad, tagLength: 128 }, key, snapshotBytes));
    return { algorithm: 'AES-256-GCM', nonce, aad, ciphertext };
  }

  async decryptSnapshot(envelope, { dataKey, expectedAad } = {}) {
    if (!envelope || envelope.algorithm !== 'AES-256-GCM') throw new ValidationError('UNSUPPORTED_CIPHER', 'Unsupported snapshot cipher');
    requireBytes(dataKey, 'dataKey', 32); requireBytes(envelope.nonce, 'nonce', 12); requireBytes(envelope.aad, 'aad'); requireBytes(envelope.ciphertext, 'ciphertext');
    if (expectedAad && !this.constantTimeEqual(envelope.aad, expectedAad)) throw new CryptoError('AAD_MISMATCH', 'Snapshot context does not match');
    try {
      const key = await subtle.importKey('raw', dataKey, 'AES-GCM', false, ['decrypt']);
      return new Uint8Array(await subtle.decrypt({ name: 'AES-GCM', iv: envelope.nonce, additionalData: envelope.aad, tagLength: 128 }, key, envelope.ciphertext));
    } catch { throw new CryptoError('DECRYPT_FAILED', 'Snapshot authentication failed'); }
  }

  constantTimeEqual(a, b) {
    if (!(a instanceof Uint8Array) || !(b instanceof Uint8Array) || a.length !== b.length) return false;
    let diff = 0; for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]; return diff === 0;
  }

  wipeSensitiveReference(bytes) {
    if (bytes instanceof Uint8Array) bytes.fill(0);
    return { best_effort_only: true, limitation: 'JavaScript runtimes may retain copies outside application control.' };
  }
}

export const cryptoEngine = new CryptoEngine();
