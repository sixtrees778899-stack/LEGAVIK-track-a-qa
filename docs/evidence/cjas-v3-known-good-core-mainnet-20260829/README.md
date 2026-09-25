# CJAS V3 Known-Good Core Baseline — 2026-08-29

Status: CEO-approved real Mainnet E2E PASS. This is a protected known-good baseline, not the final core freeze.

## Recorded evidence

- Recovery Map version: `version-v2-local`
- Operation ID: `e8600164-9c5d-4be7-b70e-3e37854f80ee`
- Snapshot / Recovery Kit identifier: `v2-c4b0d109-667a-495e-8d0d-6cb7b0170904`
- Archive SHA-256: `af646e7745ce32c0469ab147815000585ce087765653ee20ba8045d5eed0a7b5`
- Mainnet TxID: `aBuyeEN2UwYUVyQe7Az7PRRkr5931H0f21LhNNAyry4`
- Mainnet download hash matched the local encrypted archive: PASS
- Gateway/background verification: PASS
- Independent recovery and recovered-file verification: PASS

The real test used approximately 44 MB of mixed attachments. It included videos of approximately 23+ MB and 20 MB, plus images, documents, text, and other files. Every single file was below 30 MB and the total was below 50 MB.

No Recovery Password, private key, seed phrase, wallet export, wallet address, customer attachment content, Recovery Kit, or encrypted Archive is stored in this repository evidence folder.

## Fixed regression contract

The baseline regression covers multiple accounts; Module 1/2 generated Canonical documents; Module 3/4, Module 5, and Module 6 attachments; document, image, text-bearing fixture data, audio, and video; Snapshot; Archive; Recovery Kit; Mainnet-operation durability/idempotency; Evidence; independent recovery; and byte-for-byte recovered attachment integrity.

Real Mainnet broadcast remains a manual gated acceptance test and is not repeated by automated regression.

Automated baseline result: 54/54 PASS (52 core/Mainnet contract tests plus 2 real Chromium IndexedDB persistence tests). The repository security scanner reports its expected `browser_persistence` governance finding for the approved durable checkpoint implementation in `src/ui/mainnet-stability.js`; this finding is recorded rather than suppressed.
