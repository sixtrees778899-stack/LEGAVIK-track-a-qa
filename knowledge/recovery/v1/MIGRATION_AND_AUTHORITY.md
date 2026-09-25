# Migration and Authority

## Authority decision

`knowledge/recovery/v1/` is the sole candidate authority for all future Recovery Map templates, Guidance, Review rules and AI Support retrieval. `knowledge/recovery-research/v1/` is a read-only Pilot research archive. Runtime and product tooling must never read both trees.

This quality gate does not connect either tree to runtime code.

## Pilot disposition

| Pilot artifact | Disposition | Authoritative destination |
|---|---|---|
| `CEX/binance.md` | MIGRATED_AND_SUPERSEDED | `01-platforms/cex/binance.md` plus Atomic Items |
| `CEX/coinbase.md` | MIGRATED_AND_SUPERSEDED | `01-platforms/cex/coinbase.md` plus Atomic Items |
| `SOFTWARE_WALLETS/metamask.md` | MIGRATED_AND_SUPERSEDED | `01-platforms/software-wallets/metamask.md` plus Atomic Items |
| `HARDWARE_WALLETS/ledger.md` | MIGRATED_AND_SUPERSEDED | `01-platforms/hardware-wallets/ledger.md` plus Atomic Items |
| `HARDWARE_WALLETS/trezor.md` | MIGRATED_AND_SUPERSEDED | `01-platforms/hardware-wallets/trezor.md` plus Atomic Items |
| `SOURCES/index.md` | MIGRATED_AND_SUPERSEDED | `06-sources/SOURCE_INDEX.md` |
| `RECOVERY_REQUIREMENT_MATRIX.md` | REPLACED | `07-matrix/RECOVERY_REQUIREMENT_MATRIX.md` |
| `OPEN_QUESTIONS.md` | MIGRATED_AND_EXTENDED | `08-open-questions/OPEN_QUESTIONS.md` |
| `TAXONOMY.md` | PARTIALLY_MIGRATED | Atomic model and matrix enums; archive remains rationale |
| `SOURCE_POLICY.md` | MIGRATED_AND_EXTENDED | governance, stale and source policies in authority tree |
| reports/progress | ARCHIVED | historical evidence only; never product input |

## Enforcement

- New product integrations must be configured with exactly one authority root.
- Pilot paths are forbidden in product, AI and template configuration.
- Superseded Pilot content remains in Git for audit history and is not deleted or rewritten.
- A migration is complete only when its claims have stable IDs, source binding and lifecycle state.
