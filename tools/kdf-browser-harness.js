const output = document.querySelector('#result');
document.querySelector('#run').addEventListener('click', async () => {
  const started = performance.now();
  const salt = new Uint8Array(16).fill(7);
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode('compatibility-test'), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, material, 256);
  output.textContent = JSON.stringify({ userAgent: navigator.userAgent, platform: navigator.platform, pbkdf2: { available: true, outputBytes: bits.byteLength, durationMs: Math.round(performance.now() - started) }, argon2id: { available: false, reason: 'No audited implementation bundled; no fallback attempted' }, testedAt: new Date().toISOString() }, null, 2);
});
