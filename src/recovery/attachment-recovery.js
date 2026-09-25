import { validateSnapshot } from '../snapshot/snapshot-builder.js';
import { base64UrlToBytes } from '../shared/encoding.js';
import { ValidationError } from '../shared/errors.js';
import { normalizeMimeType } from '../shared/mime-type.js';
import { sanitizeFilename } from '../shared/sanitize-filename.js';
import { cryptoEngine } from '../crypto/crypto-engine.js';

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

export async function recoverAttachmentForDownload(snapshot, attachmentId) {
  const validation = await validateSnapshot(snapshot);
  if (!validation.valid) throw new ValidationError('INVALID_SNAPSHOT', 'Attachment recovery validation failed', validation.errors);
  if (typeof attachmentId !== 'string' || !attachmentId) throw new ValidationError('INVALID_ATTACHMENT_REFERENCE', 'Attachment reference is invalid');

  const matches = snapshot.knowledge_graph.attachments.filter((item) => item.id === attachmentId);
  if (matches.length !== 1) throw new ValidationError('INVALID_ATTACHMENT_REFERENCE', 'Attachment reference is missing or ambiguous');
  if (!hasOwn(snapshot.attachment_payloads, attachmentId)) throw new ValidationError('ATTACHMENT_MISSING', 'Attachment payload is missing');

  const metadata = matches[0];
  const mimeType = normalizeMimeType(metadata.media_type);
  const bytes = base64UrlToBytes(snapshot.attachment_payloads[attachmentId], { maxBytes: 1024 ** 3 });
  const expectedLength = snapshot.knowledge_graph.schema_version === 2 ? metadata.byte_length : metadata.size;
  if (bytes.byteLength !== expectedLength) throw new ValidationError('ATTACHMENT_LENGTH_MISMATCH', 'Attachment length does not match its manifest');
  if (await cryptoEngine.hashHex(bytes) !== metadata.sha256) throw new ValidationError('ATTACHMENT_HASH_MISMATCH', 'Attachment SHA-256 does not match its manifest');

  return { bytes: bytes.slice(), filename: sanitizeFilename(metadata.display_name), mimeType, sha256: metadata.sha256 };
}
