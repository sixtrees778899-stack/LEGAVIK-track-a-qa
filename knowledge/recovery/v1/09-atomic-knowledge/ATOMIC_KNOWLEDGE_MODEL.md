# Atomic Knowledge Model v1

Atomic Knowledge Items are stored as JSON Lines: Pilot 5 claims in `PILOT5_ITEMS.jsonl` and the subsequent 72 completeness claims in `ALL17_COMPLETION_CLAIMS.jsonl`. Gate decisions are append-only records in `CLAIM_APPROVAL_DECISIONS.jsonl` and `ALL17_CLAIM_APPROVAL_DECISIONS.jsonl`; the latest decision for a knowledge ID is the effective lifecycle status and preserves the pre-gate submission state in the item file.

## Required fields

| Field | Contract |
|---|---|
| `knowledge_id` | Stable `AKI-{PLATFORM}-{NNN}` identifier |
| `platform_id`, `platform_name` | Stable platform identity and display name |
| `asset_category` | `CEX`, `SOFTWARE_WALLET`, `HARDWARE_WALLET` |
| `custody_model` | `CUSTODIAL` or `SELF_CUSTODY` |
| `scenario` | Retrieval scenario, never a free-form secret |
| `recovery_path` | `A_HOLDER_RECOVERY`, `B_ACTIVE_HANDOFF`, `C_LEGAL_FALLBACK`, `SELF_CUSTODY_TECHNICAL`, `SAFETY` |
| `claim_type` | Allowed enum below |
| `claim` | One independently testable proposition |
| `official_source_id` | Source ID, or `null` only for CJAS guidance/unconfirmed claim |
| `source_section` | Page heading or precise supporting location; `N/A` only when source is null |
| `evidence_grade` | `A`, `A/B`, `B`, `B/C`, `C`, `D` |
| `jurisdiction`, `product_region` | Explicit applicability; `GLOBAL_UNCONFIRMED` when unknown |
| `checked_at`, `review_due_at` | ISO dates |
| `lifecycle_status` | `DRAFT`, `REVIEWED`, `APPROVED`, `STALE`, `RETIRED` |
| `product_eligibility` | `INELIGIBLE`, `CANDIDATE`, `ELIGIBLE` |
| `supersedes` | Earlier knowledge IDs, or empty array |
| `notes` | Scope, caveat or review requirement |

## Claim types

`OFFICIAL_FACT`, `CJAS_GUIDANCE`, `RISK_WARNING`, `STOP_CONDITION`, `UNCONFIRMED`, `TIME_SENSITIVE`.

## Validation gates

- `OFFICIAL_FACT` and `TIME_SENSITIVE` require an official source ID and precise source section.
- `UNCONFIRMED` must be grade `D`, `DRAFT` and `INELIGIBLE`.
- `STALE` and `RETIRED` are always product-ineligible.
- Only `APPROVED` may be `ELIGIBLE`; `REVIEWED` is at most `CANDIDATE`.
- `CJAS_GUIDANCE` must cite the official facts it builds on in `notes`; it may not masquerade as an official platform instruction.
- One item contains one proposition. Combining login, recovery and transfer in one claim is invalid.

## Product-use eligibility

Approval does not grant every use. The decision ledger allows only: `ELIGIBLE_FOR_GUIDANCE`, `ELIGIBLE_FOR_TEMPLATE`, `ELIGIBLE_FOR_AI_SUPPORT`, `ELIGIBLE_FOR_RULE_ENGINE`, `INTERNAL_ONLY`. `INTERNAL_ONLY` cannot coexist with another use. Legal/estate claims default to internal human escalation even when the platform fact is approved.
