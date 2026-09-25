import test from 'node:test';import assert from 'node:assert/strict';
import { canonicalize } from '../../src/shared/canonical-json.js';import { sanitizeFilename } from '../../src/shared/sanitize-filename.js';
test('canonical JSON sorts fields',()=>assert.equal(canonicalize({z:1,a:2}),'{"a":2,"z":1}'));
test('canonical JSON normalizes Unicode',()=>assert.equal(canonicalize({text:'e\u0301'}),canonicalize({text:'é'})));
test('canonical JSON rejects unsupported values',()=>assert.throws(()=>canonicalize({value:undefined}),/Undefined/));
test('filename sanitizer removes path and control characters',()=>assert.equal(sanitizeFilename('../危险/文件\u0000.txt'),'文件_.txt'));
test('filename sanitizer provides fallback',()=>assert.equal(sanitizeFilename('...'),'recovered-file'));
