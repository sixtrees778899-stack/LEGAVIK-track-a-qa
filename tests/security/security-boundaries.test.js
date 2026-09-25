import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

async function sourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory() ? sourceFiles(path.join(dir, entry.name)) : [path.join(dir, entry.name)]));
  return nested.flat().filter(file => file.endsWith('.js'));
}

test('core source does not persist recovery material in browser storage', async () => {
  for (const file of await sourceFiles('src')) {
    const text = await readFile(file, 'utf8');
    if(!/recovery-metadata-client\.js$|mainnet-stability\.js$/.test(file))assert.doesNotMatch(text, /\b(localStorage|sessionStorage|indexedDB)\b/i, file);
    assert.doesNotMatch(text,/storage\?\.setItem\([^,]+,\s*JSON\.stringify\((?:password|snapshot|draft|attachments?|recoveryKit|kitBytes|archiveBytes)\)/i,file);
  }
});

test('core source contains no console logging', async () => {
  for (const file of await sourceFiles('src')) {
    const text = await readFile(file, 'utf8');
    assert.doesNotMatch(text, /\bconsole\s*\./, file);
  }
});

test('core source contains no wallet or mainnet integration', async () => {
  for (const file of await sourceFiles('src')) {
    const text = await readFile(file, 'utf8');
    assert.doesNotMatch(text, /\b(arconnect|wander|window\.arweaveWallet|transactions\.post)\b/i, file);
  }
});
