# Generic Single-File Mainnet Pilot Acceptance Contract

## Per-file acceptance

Each allowlisted format story is isolated and must pass local format validation, AES-256-GCM encryption, minimal Archive overhead, Recovery Kit delivery, authorized one-time Mainnet broadcast where required, HTTP 200 download, Archive length/hash validation, new-session recovery without source/local Archive/upload state, restored size/hash identity, and real open/play review.

The final whitelist is PDF, DOCX, TXT, PNG, JPG/JPEG, HEIC/HEIF, MP3, M4A, WAV, MP4, and MOV. Previously verified types use regression checks; new Mainnet closure runs proceed M4A, WAV, TXT, HEIC/HEIF, then MOV.

## Evidence contract

Evidence records status, network, source identity/size/hash, Archive identity/size/hash, TxID, broadcast and first-download timestamps, gateway/status, quote/actual fee, public wallet address, balances, signing/upload timings, format version, Kit identifier, and broadcast count. It excludes password, Data Key, private wallet material, seed phrase, and plaintext bytes.

## Broadcast safety

Before explicit authorization the page contains no signing or posting path. A later gate must bind approval to the current file, Archive SHA-256, quote ceiling, and one broadcast. Refresh/retry must not create another transaction.

## Recovery delivery

Delivery uses authenticated recovered bytes, sanitized original filename, correct MIME, explicit download and repeat-download buttons, and timely Object URL revocation. Any mismatch fails closed before a file is offered.

## Freeze contract

Recovery Map V2, PDF Story A, and MP4 Pilot files and tags remain byte-for-byte unchanged. No push, merge, deploy, batch snapshot, production UI, or customer material is authorized.
