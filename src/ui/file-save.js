import { ValidationError } from '../shared/errors.js';
import { normalizeMimeType } from '../shared/mime-type.js';
import { sanitizeFilename } from '../shared/sanitize-filename.js';

const extensionFor = (name) => { const match = /(?:^|\.)([A-Za-z0-9]{1,16})$/.exec(name); return match ? `.${match[1].toLowerCase()}` : undefined; };

export async function saveBytesLocally({ bytes, suggestedName, mimeType, picker = globalThis.showSaveFilePicker, documentRef = globalThis.document, urlApi = globalThis.URL, BlobCtor = globalThis.Blob, schedule = globalThis.setTimeout }) {
  if (!(bytes instanceof Uint8Array)) throw new ValidationError('INVALID_SAVE_BYTES', 'File bytes are invalid');
  const filename = sanitizeFilename(suggestedName), type = normalizeMimeType(mimeType), blob = new BlobCtor([bytes.slice()], { type });
  if (typeof picker === 'function') {
    try {
      const extension = extensionFor(filename), options = { suggestedName: filename };
      if (extension) options.types = [{ description: 'CJAS local file', accept: { [type]: [extension] } }];
      const handle = await picker(options), writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return { status: 'saved', method: 'file-picker', filename };
    } catch (error) {
      if (error?.name === 'AbortError') return { status: 'cancelled', method: 'file-picker', filename };
      if (!['NotAllowedError', 'NotSupportedError', 'SecurityError', 'TypeError'].includes(error?.name)) throw error;
    }
  }
  if (!documentRef?.createElement || !urlApi?.createObjectURL || !urlApi?.revokeObjectURL) throw new ValidationError('DOWNLOAD_UNAVAILABLE', 'Browser download is unavailable');
  const url = urlApi.createObjectURL(blob), link = documentRef.createElement('a');
  try {
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    link.style.display = 'none';
    documentRef.body?.append(link);
    link.click();
  } finally {
    link.remove();
    schedule(() => urlApi.revokeObjectURL(url), 30_000);
  }
  return { status: 'download-started', method: 'browser-download', filename };
}
