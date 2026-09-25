# LEGAVIK Approved Baseline Index

This index contains non-sensitive recovery pointers only. The machine-readable source is `governance/release-manifest.json`.

Governance bindings: `governance/COMPATIBILITY_MATRIX.md`, `governance/artifact-provenance.json`, and `governance/external-config-snapshot.json`. Every future Freeze or Release must update all three records.

| Date | Milestone | Commit | Tag | Release | Tests | Status |
|---|---|---|---|---|---|---|
| 2026-07-31 | Code06 CJAS v1.0 Mainnet PASS | `de12de6d2982396f47348d81f7c20d8a708140c7` | `code06-cjas-v1.0-mainnet-pass` | Historical not verified | Mainnet recovery and SHA evidence PASS | Known-good anchor |
| 2026-08-28 | Attachment Center and Review | `250d82b0c9e2f765c5d761a2fa415e1435dcfb7e` | `cjas-v3-attachment-center-review-approved-250d82b` | Historical not verified | Approved baseline | CEO approved |
| 2026-08-29 | Mainnet Known-Good Core | `196da773972bfce7bdd0cf4d9387ef8872e37eef` | `cjas-v3-known-good-core-mainnet-20260829` | Historical not verified | 54/54 + real Mainnet E2E PASS | CEO approved known-good |
| 2026-08-29 | Recovery Workspace sequence | `d48213450fb50a777d55f5f8c71283260ca72b68` | Step 1 / Step 2 / Batch 1 / Create Resume tags | Historical not verified | Approved workspace sequence | CEO approved |
| 2026-08-30 | Unified Recovery / Real E2E / Batch A1 | `392c84f615f898a05d44272427a64822d05b3c46` | Unified Recovery / Step 3 / Batch A1 tags | Historical not verified | Approved E2E and delivery gates | CEO approved |
| 2026-08-31 | Recovery Workspace Phase 1/2 | `b0cc069c99b70e36c151732192f97123e8400aa6` | Phase 1 / Phase 2 tags | Historical not verified | Phase 1/2 PASS | CEO approved |
| 2026-09-01 | Local Sensitive Hardening | `1ecb9627ad2fa1eb04daacd0240fa174dcbb62aa` | `cjas-v3-local-sensitive-hardening-approved-20260901` | Historical not verified | Stage 1/2 PASS | CEO approved |
| 2026-09-06 | LEGAVIK Brand Migration + Auth Reset | `dc88f02c638ece22711266a61b5913f9e58b6f44` | `legavik-v3-brand-freeze-20260906` | `legavik-auth-reset-login-20260906-2` | 711/711 PASS | CEO PASS + frozen |
| 2026-09-06 | Current Approved Baseline | `dc88f02c638ece22711266a61b5913f9e58b6f44` | Brand Freeze + Weekly Backup | `legavik-auth-reset-login-20260906-2` | 711/711 PASS | Current approved |
| 2026-09-06 | Weekly Backup | `dc88f02c638ece22711266a61b5913f9e58b6f44` | `legavik-v3-weekly-backup-20260906` | `legavik-auth-reset-login-20260906-2` | Remote SHA verified | Remote backup |
| 2026-09-10 | LEGAVIK Product & Service V1 | `97a5b9bbf900c83c5003d852fddbc0d3538ef4b5` | `legavik-v3-product-service-v1-freeze-20260910` | `legavik-plans-intro-linebreak-20260910-1` | 13/13 contract + 22/22 browser/runtime PASS | CEO Product PASS + final freeze |

## Current non-sensitive state

- Formal branch: `codex/product-pricing-v1`
- Canonical live URL: `https://sixtrees778899-stack.github.io/SKREK-auth-test/web/v3-crypto/index.html?release=legavik-plans-intro-linebreak-20260910-1#pricing`
- Supabase project ref: `kkpipnlvercivdykflet`
- Migration head: `20260903120000` — local/remote matched 6/6 on 2026-09-06
- Auth Email brand / From Name: `LEGAVIK`
- SMS: `NOT IN ACTIVE PRODUCT`
- Stripe: `NOT IN ACTIVE PRODUCT`
- AI customer service: `NOT IN ACTIVE PRODUCT`

## Verified remote tag synchronization

| Tag | Milestone | Commit | Date | Type | Approval | Superseded by higher freeze |
|---|---|---|---|---|---|---|
| `cjas-v3-attachment-center-review-approved-250d82b` | Attachment Center and Review | `250d82b0c9e2f765c5d761a2fa415e1435dcfb7e` | 2026-08-28 | CEO Approved | Yes | Yes |
| `cjas-v3-create-resume-boundary-approved-20260829` | Create Resume Boundary | `5386a7089bb0b3dc9c4f784d50d7621483f48aa1` | 2026-08-29 | CEO Approved | Yes | Yes |
| `cjas-v3-frontend-safe-closure-part1-20260828` | Frontend Safe Closure Part 1 | `67cb82ebab84cacf1a057e9c4aebddfb5239e591` | 2026-08-28 | Recovery Anchor | Known-good | Yes |
| `cjas-v3-help-stable-baseline-20260828` | Recovery Help Stable Baseline | `a8e90c1037c7f830e9a33dbba827850e9002b2d8` | 2026-08-28 | Recovery Anchor | Known-good | Yes |
| `cjas-v3-known-good-core-mainnet-20260829` | Known-Good Core Mainnet | `196da773972bfce7bdd0cf4d9387ef8872e37eef` | 2026-08-29 | Recovery Anchor | CEO approved | Yes |
| `cjas-v3-local-sensitive-hardening-approved-20260901` | Local Sensitive Hardening | `1ecb9627ad2fa1eb04daacd0240fa174dcbb62aa` | 2026-09-01 | CEO Approved | Yes | Yes |
| `cjas-v3-recovery-workspace-batch1-baseline-20260829` | Recovery Workspace Batch 1 | `bd7aee1d0ddb38f6ce491d328ffbac1a16d31414` | 2026-08-29 | Recovery Anchor | Known-good | Yes |
| `cjas-v3-recovery-workspace-phase1-approved-20260831` | Recovery Workspace Phase 1 | `537d24cca689b8bf0a21f2d30215cdafe16c13dd` | 2026-08-31 | CEO Approved | Yes | Yes |
| `cjas-v3-recovery-workspace-phase2-approved-20260831` | Recovery Workspace Phase 2 | `b0cc069c99b70e36c151732192f97123e8400aa6` | 2026-08-31 | CEO Approved | Yes | Yes |
| `cjas-v3-recovery-workspace-step1-approved-20260829` | Recovery Workspace Step 1 | `c189b7d0cf2e50a23c625802ab00a3e0d43cbddb` | 2026-08-29 | CEO Approved | Yes | Yes |
| `cjas-v3-recovery-workspace-step2-remediation-approved-20260829` | Recovery Workspace Step 2 | `d48213450fb50a777d55f5f8c71283260ca72b68` | 2026-08-29 | CEO Approved | Yes | Yes |
| `cjas-v3-step3-real-e2e-approved-20260830` | Step 3 Real E2E | `5a4eef7b804d1b00ab828763004c5ef59374221b` | 2026-08-30 | CEO Approved | Yes | Yes |
| `cjas-v3-unified-recovery-approved-20260830` | Unified Recovery | `2b260dd0a992a4a727cda92a943bbc5d8eeacc1f` | 2026-08-30 | CEO Approved | Yes | Yes |
| `code06-cjas-v1.0-mainnet-pass` | Code06 Mainnet PASS | `de12de6d2982396f47348d81f7c20d8a708140c7` | 2026-07-31 | Recovery Anchor | Known-good | Yes |
| `legavik-v3-product-service-v1-freeze-20260910` | LEGAVIK Product & Service V1 | `97a5b9bbf900c83c5003d852fddbc0d3538ef4b5` | 2026-09-10 | CEO Freeze | Yes | No |

Existing lightweight tags remain unchanged. A higher freeze does not invalidate an earlier recovery anchor.
