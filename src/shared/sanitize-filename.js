export function sanitizeFilename(value, fallback = 'recovered-file') {
  const basename = String(value ?? '').normalize('NFC').split(/[\\/]/).filter(Boolean).at(-1) ?? '';
  const safe = basename.replace(/[:*?"<>|\u0000-\u001f\u007f]/g, '_').replace(/^\.+/, '').trim().slice(0, 180);
  return safe || fallback;
}
