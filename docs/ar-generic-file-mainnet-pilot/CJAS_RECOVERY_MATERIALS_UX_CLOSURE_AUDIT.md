# CJAS V3 Recovery Materials UX Closure & Historical Recovery Audit

## Status

Core materials and WAV clean-room integrity: PASS. Historical ~60 second WAV stage attribution: BLOCKED because that completed browser run predates stage instrumentation and cannot be truthfully reconstructed.

## Materials contract

- Recovery Kit — REQUIRED
- Mainnet Recovery Evidence — REQUIRED
- Recovery Password — REQUIRED
- Local Encrypted Backup — OPTIONAL / RECOMMENDED

Local Encrypted Backup is not read by the normal Mainnet recovery page. It is a recommended offline encrypted fallback if Mainnet is temporarily unavailable.

## Naming and pairing

Creation, download, and recovery UI use the four customer names above. New downloads share `CJAS-<recovery_kit_identifier>` and append `Recovery-Kit`, `Mainnet-Recovery-Evidence`, or `Local-Encrypted-Backup`; internal formats are unchanged.

Recovery parses both files and compares `Recovery Kit.snapshot_id` with `Mainnet Recovery Evidence.recovery_kit_identifier` before any gateway download or decryption. Mismatch fails closed with: “这两份恢复材料不属于同一次创建，请选择对应的一组文件。”

## Save location

Manual material buttons use `showSaveFilePicker` when available and invoked by a direct user action. Cancellation is not marked saved. Browsers without it use a temporary anchor/Object URL download. Mainnet Recovery Evidence automatic delivery uses the reliable download fallback because a picker requires transient user activation; the persistent manual button supports Save As on compatible Chrome/Edge. Safari retains its standard download behavior.

## WAV evidence

- TxID: `8Gl30fnj3XBW5pY0yoE8sdqsyzmtl-VqLjrw26IKeX4`
- Source bytes: `2,133,368`
- Source SHA-256: `bbd2e5e3d90ee4887298ccd74b5c7c4f818ecc2962b72255c9916697e53e45f4`
- Mainnet Archive bytes: `2,133,544`
- Mainnet Archive SHA-256: `b5fc293fc86c2aa3ae0b1c5adbe3a6f1974998a31cbad5dd90527d9a3e903e7a`
- Existing recovered WAV bytes: `2,133,368`
- Existing recovered WAV SHA-256: `bbd2e5e3d90ee4887298ccd74b5c7c4f818ecc2962b72255c9916697e53e45f4`
- Byte/hash result: PASS
- Fresh read-only gateway check: HTTP 200; response/first byte 1.134 s; complete download 3.283 s; exact bytes/hash PASS.

The earlier approximately 60-second observation is not attributable to WAV size, Archive verification, or current gateway throughput. The old run did not record individual stages, so a confirmed historical bottleneck is unavailable. The recovery page now records Evidence read/parse, TxID extraction, every gateway attempt and result, response wait, body download, Archive hash, Kit read/parse, KDF/unlock, decrypt, recovered hash, export, and total time.

## Historical recovery audit

| Format | TxID / Archive evidence source | Hidden state audit | Classification |
|---|---|---|---|
| PDF | Browser-generated Evidence JSON; upload handler automatically called `exportEvidence()` after TxID | New session used Evidence + Kit + password; no original/local Archive; no browser storage/query/manual TxID | VALID CUSTOMER-INDEPENDENT RECOVERY |
| DOCX | Generic pilot automatically downloaded Evidence after Mainnet byte/hash gate; TxID `iWKjNGPknhqIereqDhIglhwAF8MTNIbbH0iX01hX2s0` | Recovery reads TxID/size/hash from selected JSON; no storage/query/local Archive | VALID CUSTOMER-INDEPENDENT RECOVERY |
| PNG | Generic pilot auto-downloaded `cjas-png-mainnet-evidence-1786164192260.json`; TxID `Rs1sTyLbQdpoRSNNoZ2WPAtBu4GfndPzXzOUNQ0CEIQ` | Same generic evidence-only recovery path | VALID CUSTOMER-INDEPENDENT RECOVERY |
| JPG/JPEG | Generic pilot auto-downloaded `cjas-jpeg-mainnet-evidence-1786164575655.json`; TxID `g7yUxWmNggWhO4i6EUulwz-R7036RrisE36lwNs25Sc` | Same generic evidence-only recovery path | VALID CUSTOMER-INDEPENDENT RECOVERY |
| MP3 | Generic pilot auto-downloaded `cjas-mp3-mainnet-evidence-1786167540788.json` | Same generic evidence-only recovery path; later MP3-Evidence/WAV-Kit screenshot was a mismatched retry, not the accepted MP3 story | VALID CUSTOMER-INDEPENDENT RECOVERY |
| MP4 | Generic Evidence `CJAS-generic-mp4-f015b9236c21175a-1786176135111-Mainnet-Recovery-Evidence.json`; TxID `uuIhs2z2YxRGA1L7h36ud6tboJcg7zHb35Ea2VzNxPQ` | Generic clean-room page consumed only customer Evidence + matching Kit + password; no original/local backup, storage, query parameter, or hardcoded transaction data | VALID CUSTOMER-INDEPENDENT RECOVERY |

No relevant harness uses `localStorage`, `sessionStorage`, IndexedDB, URL query parameters, or Local Encrypted Backup to provide TxID/Archive integrity values. The general historical cause of “recovery without an explicit Evidence click” is automatic Evidence download after broadcast verification. MP4 is the disclosed exception because its one-off recovery page also hardcoded that pilot's values.

## Compatibility and safety

- Data structure change: NONE.
- Crypto, Archive, Recovery Kit, Snapshot, Recovery Map V2: unchanged.
- Mainnet broadcasts during closure: 0.
- New AR fees: 0.
- Automated tests: 301/301 PASS.
- Security scan: 0 findings.
- `git diff --check`: PASS.
