# LEGAVIK Long-Term Compatibility Matrix

Product baseline: `97a5b9bbf900c83c5003d852fddbc0d3538ef4b5`

Release: `legavik-plans-intro-linebreak-20260910-1`

Last verification: `2026-09-10`

| Contract | Last verified | Verified product commit | Test / evidence source | Status |
|---|---|---|---|---|
| Current App → V1 Recovery | 2026-09-06 | `dc88f02c638ece22711266a61b5913f9e58b6f44` | `tests/integration/recovery-flow.test.js`; `tests/account/recovery-map-version-publish-rpc.test.js`; Code06 Mainnet baseline | PASS |
| Current App → V2 Recovery | 2026-09-06 | `dc88f02c638ece22711266a61b5913f9e58b6f44` | `tests/integration/recovery-v2.test.js`; `tests/product-v2/recovery-workspace-final.test.js` | PASS |
| Current App → V3 / Current Recovery | 2026-09-06 | `dc88f02c638ece22711266a61b5913f9e58b6f44` | `tests/product-v2/core-create-recovery-regression.test.js`; current approved baseline 711/711 | PASS |
| Historical Kit / Evidence compatibility | 2026-09-06 | `dc88f02c638ece22711266a61b5913f9e58b6f44` | `tests/integration/recovery-flow.test.js`; `tests/integration/recovery-v2.test.js`; sanitized Known-Good Mainnet evidence | PASS |
| Attachment Contract | 2026-09-06 | `dc88f02c638ece22711266a61b5913f9e58b6f44` | `tests/integration/attachment-roundtrip.test.js`; `tests/product-v2/version-update-state-integrity.test.js` | PASS |
| Version RPC | 2026-09-06 | `dc88f02c638ece22711266a61b5913f9e58b6f44` | `tests/account/recovery-map-version-publish-rpc.test.js` | PASS |
| Create regression | 2026-09-06 | `dc88f02c638ece22711266a61b5913f9e58b6f44` | `tests/product-v2/core-create-recovery-regression.test.js` | PASS |
| Update regression | 2026-09-06 | `dc88f02c638ece22711266a61b5913f9e58b6f44` | `tests/product-v2/version-update-flow.test.js`; `tests/product-v2/version-update-state-integrity.test.js` | PASS |
| Recovery regression | 2026-09-06 | `dc88f02c638ece22711266a61b5913f9e58b6f44` | `tests/integration/recovery-flow.test.js`; `tests/integration/recovery-v2.test.js`; `tests/product-v2/recovery-workspace-final.test.js` | PASS |
| Product & Service V1 Freeze regression | 2026-09-10 | `97a5b9bbf900c83c5003d852fddbc0d3538ef4b5` | 13/13 pricing contract tests; 22/22 Chromium/WebKit Pricing and deployment consistency tests; live Chrome/Safari warm-cache verification | PASS |

Verification run: 51/51 non-destructive compatibility tests PASS. No Mainnet broadcast was performed.

The 2026-09-10 Product & Service V1 presentation release did not modify recovery, attachment, Version RPC, Create, Update, Crypto, Snapshot, Archive, Recovery Kit, database, or Mainnet contracts; their last verified evidence remains 2026-09-06.

## Mandatory release gate

Every future Freeze or Release must update this matrix, `artifact-provenance.json`, and `external-config-snapshot.json`. A release without all three updates is not a complete governed release.

Bindings: `governance/release-manifest.json` and `governance/APPROVED_BASELINES.md`.
