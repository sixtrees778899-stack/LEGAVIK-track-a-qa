# RECOVERY MAP V2 REGRESSION MATRIX

Source of truth: `web/v2/v2-app.js`, `src/product-v2/`, and the approved V2 platform/rule configuration. The SKREK entry must route into this application shell; the simplified Product Experience draft is not an authority for Recovery Map behavior.

| Frozen V2 requirement | Current build | Canonical owner | Status |
|---|---|---|---|
| Six modules | 资产与账户、恢复条件、位置与查找、恢复与转移步骤、协助人、给未来恢复人的嘱托 | `MODULE_IDS` | PASS |
| Module order | Frozen order followed by Review and Recovery Report | `PRODUCT_FLOW` | PASS |
| Fields and controls | Existing region, account type, conditions, summary/itemized location, steps, assistants and message controls retained | `ProductActions` | PASS |
| Required/optional logic | One Canonical Validator remains authoritative | `validateProductStore` | PASS |
| Aggregated asset selector | Search, grouped multi-select, cancellation and custom item feed canonical accounts | presentation + `ProductActions.addAccount` | PASS |
| Persistence | One Application Shell, one Draft and one revision sequence across modules | `createApplicationState` | PASS |
| Attachments | Context lock, add, replace, delete, reassign, count and capacity remain unified | `attachment-manager.js` | PASS |
| Preview / Report | All six module projections and account-first attachment projection | `projectReport` | PASS |
| Recovery Readiness | Visible percentage derives from the same six module statuses and reaches 100 only when Generation is allowed | Validation Receipt | PASS |
| Navigation | Previous, continue, Dashboard and direct Review return retain Draft state | `application-state.js` | PASS |
| Back / edit | Exact Issue anchor and Preview-to-edit roundtrip | `review_context` | PASS |
| Custom item | Custom platform remains isolated and survives module and Preview roundtrips | canonical account | PASS |
| Security messages | Secret-entry prohibition remains visible in module and attachment UI | presentation policy | PASS |
| Scroll integrity | Non-navigation controls preserve the active section; explicit navigation alone changes destination | presentation layer | PASS |

No frozen Schema v2, Crypto Engine, Snapshot, Recovery Kit, Archive, or independent-recovery format is changed by this restoration.
