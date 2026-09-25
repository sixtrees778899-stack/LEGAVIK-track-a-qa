import { ValidationError } from './errors.js';

const MIME_TYPE_RE = /^[a-z0-9][a-z0-9!#$&^_.+-]{0,126}\/[a-z0-9][a-z0-9!#$&^_.+-]{0,126}$/i;

export function normalizeMimeType(value) {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (!MIME_TYPE_RE.test(normalized)) throw new ValidationError('INVALID_MIME_TYPE', 'Attachment MIME type is invalid');
  return normalized;
}
