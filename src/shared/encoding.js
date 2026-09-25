import { ValidationError } from './errors.js';

export const utf8 = { encode: (value) => new TextEncoder().encode(value), decode: (bytes) => new TextDecoder('utf-8', { fatal: true }).decode(bytes) };
export function bytesToBase64Url(bytes) {
  let binary = ''; for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
export function base64UrlToBytes(value, { maxBytes = 64 * 1024 * 1024 } = {}) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]*$/.test(value)) throw new ValidationError('INVALID_BASE64URL', 'Invalid base64url value');
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  let binary; try { binary = atob(padded); } catch { throw new ValidationError('INVALID_BASE64URL', 'Invalid base64url value'); }
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  if (bytes.byteLength > maxBytes) throw new ValidationError('VALUE_TOO_LARGE', 'Decoded value exceeds allowed size');
  return bytes;
}
export function concatBytes(...parts) {
  const result = new Uint8Array(parts.reduce((sum, part) => sum + part.byteLength, 0));
  let offset = 0; for (const part of parts) { result.set(part, offset); offset += part.byteLength; } return result;
}
