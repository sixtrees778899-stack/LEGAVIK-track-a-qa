# Generic Single-File Mainnet Pilot Rulebook

## Input rules

- Maximum size is exactly `10 * 1024 * 1024 = 10,485,760 bytes`; zero-byte files fail closed.
- DOCX: `.docx`, exact OOXML MIME, ZIP magic, and ZIP directory evidence for `[Content_Types].xml` and `word/document.xml`.
- PNG: `.png`, `image/png`, exact eight-byte PNG signature.
- JPEG: `.jpg` or `.jpeg`, `image/jpeg`, SOI and EOI markers.
- MP3: `.mp3`, `audio/mpeg`, and either ID3 or MPEG frame-sync evidence.
- PDF/TXT: controlled extension and MIME (or empty browser MIME), plus PDF magic or valid UTF-8 text without NUL bytes.
- HEIC/HEIF: controlled extension and MIME aliases (or empty browser MIME), ISO-BMFF `ftyp`, and a HEIF-family brand.
- M4A: `.m4a`, controlled MIME aliases (or empty browser MIME), and ISO-BMFF `ftyp`.
- WAV: `.wav`, controlled MIME aliases (or empty browser MIME), and RIFF/WAVE signature.
- MP4/MOV: controlled extension and MIME aliases (or empty browser MIME), and ISO-BMFF `ftyp`.
- Filename is reduced to its final path component, control characters are removed, and unsafe separators are replaced. Validation never relies on extension alone.

## Archive and cryptography

The Archive contains a fixed header, version, nonce, authenticated AAD, minimal filename/MIME/type metadata, original size and SHA-256, and exactly one AES-256-GCM ciphertext. It must not contain Base64, number arrays, Data URLs, plaintext previews, or duplicate file bytes. Overhead above 4,096 bytes blocks quoting.

The harness calls the stable `cryptoEngine`, KDF provider, and Recovery Kit builder. It does not change frozen crypto, Snapshot, Archive, or Kit implementations.

## Password and sensitive data

Password fields use `type=password`; values never enter URL, dataset, storage, Evidence, Archive metadata, logs, screenshots, or tests. Tests inspect only presence/type. Inputs and local references are cleared after artifact creation. Recovery Kit, Archive, Evidence, source files, and recovered files are download-only and prohibited from Git.

## Quote and transaction boundary

Quote-only may request `ACCESS_ADDRESS`, public balance, and gateway price. It cannot sign, post, upload, generate a TxID, retry, or charge AR. A later broadcast must require explicit per-file authorization, use the in-memory Archive, be idempotent, and allow exactly one wallet confirmation and one transaction.

## Errors and cleanup

All customer errors are Chinese business messages. Internal codes, secrets, and bytes are not logged. Object URLs are revoked after use and on page exit. Network errors fail closed without automatic retry.

## Outcomes

- `PASS`: every authorized Mainnet and independent recovery criterion passes.
- `BLOCKED`: safe completion needs missing customer material, wallet availability, explicit authorization, or an external service.
- `FAIL`: validation, integrity, security, upload, download, decryption, byte identity, or real open/play verification fails.
- Pre-broadcast readiness is reported only as `READY FOR DOCX CUSTOMER TEST`, `BLOCKED`, or `FAIL`.
