import { ValidationError } from './errors.js';
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
function normalize(value, seen) {
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.normalize('NFC');
  if (typeof value === 'number') { if (!Number.isFinite(value)) throw new ValidationError('NON_FINITE_NUMBER', 'Canonical JSON rejects non-finite numbers'); return Object.is(value, -0) ? 0 : value; }
  if (Array.isArray(value)) return value.map((item) => normalize(item, seen));
  if (typeof value !== 'object') throw new ValidationError('UNSUPPORTED_VALUE', `Canonical JSON rejects ${typeof value}`);
  if (seen.has(value)) throw new ValidationError('CYCLIC_VALUE', 'Canonical JSON rejects cyclic values');
  seen.add(value); const result = {};
  for (const key of Object.keys(value).sort()) {
    if (FORBIDDEN_KEYS.has(key)) throw new ValidationError('FORBIDDEN_KEY', `Forbidden key: ${key}`);
    if (value[key] === undefined) throw new ValidationError('UNDEFINED_VALUE', `Undefined value at ${key}`);
    result[key.normalize('NFC')] = normalize(value[key], seen);
  }
  seen.delete(value); return result;
}
export function canonicalize(value) { return JSON.stringify(normalize(value, new WeakSet())); }
export function canonicalBytes(value) { return new TextEncoder().encode(canonicalize(value)); }
