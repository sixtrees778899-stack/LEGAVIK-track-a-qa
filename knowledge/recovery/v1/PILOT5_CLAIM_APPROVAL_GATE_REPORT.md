# CJAS Pilot 5 Claim Approval Gate Report

Status: COMPLETE — PENDING CEO AND PRODUCT ARCHITECT ACCEPTANCE
Date: 2026-08-02

## 1. Forty-claim decisions

| Claim | Decision | Basis / restriction |
|---|---|---|
| AKI-BIN-001 | REVIEWED | Composite and broad educational source |
| AKI-BIN-002 | DRAFT | No operational lost-email source |
| AKI-BIN-003 | DRAFT | No exact Authenticator/reset-restriction source |
| AKI-BIN-004 | REVIEWED | Unsourced CJAS handoff guidance |
| AKI-BIN-005 | DRAFT | Education is not an estate process |
| AKI-BIN-006 | REVIEWED | Multiple stops; imprecise claim binding |
| AKI-BIN-007 | REVIEWED | Composite CJAS record guidance |
| AKI-BIN-008 | DRAFT | Post-recovery withdrawal state unsupported |
| AKI-CB-001 | APPROVED | Current official lost-email/2-step path |
| AKI-CB-002 | APPROVED | Explicit deceased-claim document set; internal only |
| AKI-CB-003 | APPROVED | Explicit Executor Services steps; internal only |
| AKI-CB-004 | APPROVED | Explicit current beneficiary limitation; internal only/time-sensitive |
| AKI-CB-005 | REVIEWED | CJAS handoff recommendation, not Coinbase policy |
| AKI-CB-006 | APPROVED | Current CB-01 explicitly supports scoped ID-recovery timing/restriction |
| AKI-CB-007 | REVIEWED | Composite CJAS record guidance |
| AKI-CB-008 | REVIEWED | Legal inference exceeds page scope |
| AKI-MM-001 | APPROVED | SRP-wallet password reset explicitly supported |
| AKI-MM-002 | APPROVED | Local password/SRP roles explicitly separated |
| AKI-MM-003 | APPROVED | Derived-account discovery explicitly described |
| AKI-MM-004 | APPROVED | Imported accounts require independent recovery material |
| AKI-MM-005 | APPROVED | Direct official non-sharing warning |
| AKI-MM-006 | REVIEWED | Address-check recommendation not directly sourced |
| AKI-MM-007 | REVIEWED | Legal authority outside technical source scope |
| AKI-MM-008 | REVIEWED | Composite CJAS record guidance |
| AKI-LED-001 | APPROVED | Device-loss recovery with compatible backup path |
| AKI-LED-002 | APPROVED | PIN and recovery backup roles distinguished |
| AKI-LED-003 | APPROVED | Missing Passphrase consequence explicit |
| AKI-LED-004 | APPROVED | Passphrase address separation explicit |
| AKI-LED-005 | APPROVED | Secret-request stop directly supported |
| AKI-LED-006 | APPROVED | Optional compatibility-scoped Recovery Key fact |
| AKI-LED-007 | REVIEWED | Small-test guidance lacks direct source |
| AKI-LED-008 | REVIEWED | Composite CJAS record guidance |
| AKI-TRZ-001 | APPROVED | Model/period-scoped backup-format matrix |
| AKI-TRZ-002 | APPROVED | Compatible-backup restoration supported |
| AKI-TRZ-003 | APPROVED | Device-plus-backup loss consequence explicit |
| AKI-TRZ-004 | APPROVED | Passphrase non-recovery consequence explicit |
| AKI-TRZ-005 | APPROVED | Threshold-share requirement supported |
| AKI-TRZ-006 | APPROVED | Official secret-request stop condition |
| AKI-TRZ-007 | APPROVED | Correctly limited Model One backup check |
| AKI-TRZ-008 | REVIEWED | Composite CJAS record guidance |

The authoritative rationale, product uses and stop/escalation for each item are in `09-atomic-knowledge/CLAIM_APPROVAL_DECISIONS.jsonl`.

## 2–5. Counts

- Approved: 23
- Reviewed: 13
- Draft: 4
- Rejected: 0
- Stale: 0

## 6. Approved distribution

| Platform | Approved | Reviewed | Draft | Rejected |
|---|---:|---:|---:|---:|
| Binance | 0 | 4 | 4 | 0 |
| Coinbase | 5 | 3 | 0 | 0 |
| MetaMask | 5 | 3 | 0 | 0 |
| Ledger | 6 | 2 | 0 | 0 |
| Trezor | 7 | 1 | 0 | 0 |

## 7. Evidence gaps

Seventeen non-approved claims are recorded in `CLAIM_EVIDENCE_GAPS.md` with required official material, scope, risk and template-block status. Binance operational recovery and post-recovery withdrawal evidence is the largest blocking gap.

## 8. Product-use eligibility

- Eligible for Guidance: 20 claims
- Eligible for Template: 17 claims
- Eligible for AI Support: 20 claims
- Eligible for Rule Engine candidate evaluation: 12 claims
- Approved but Internal Only: 3 Coinbase legal/estate claims

Uses are explicit per decision and are not inherited merely from APPROVED status.

## 9. AI retest

All 22 offline cases passed the approval filter: 16 deterministic/partial responses, 5 explicit “当前知识库无法确认”, and 1 manual legal escalation. No answer requested secrets, mixed handoff with estate fallback or used REVIEWED/DRAFT facts as certainty.

## 10. Product Template Ready status

- Binance: NOT READY.
- Coinbase: READY FOR LIMITED HOLDER-RECOVERY MAPPING; estate facts remain internal/manual.
- MetaMask: READY FOR CORE TECHNICAL MAPPING.
- Ledger: READY FOR CORE TECHNICAL MAPPING.
- Trezor: READY FOR CORE TECHNICAL MAPPING.
- Pilot 5 overall: NOT READY because Binance has no APPROVED critical recovery claim.

## 11. Knowledge that may enter Recovery Map candidate mapping

Only these Template-eligible IDs: `AKI-CB-001`, `AKI-CB-006`; `AKI-MM-001`–`AKI-MM-004`; `AKI-LED-001`–`AKI-LED-004`, `AKI-LED-006`; `AKI-TRZ-001`–`AKI-TRZ-005`, `AKI-TRZ-007`. Mapping must preserve platform/product/model scope and checked/review dates.

## 12. Knowledge still excluded from product

All 13 REVIEWED, 4 DRAFT and all `INTERNAL_ONLY` legal claims are excluded from automated product use. Waiting periods outside the explicitly scoped Coinbase ID-recovery claim, global estate/KYC claims, guaranteed recovery, credential-based ownership, cross-brand compatibility and unsourced small-test wording remain prohibited.

## 13. SAFE TO START Recovery Map Refactor

NO. The blocking condition is incomplete Pilot 5 product coverage: Binance has zero APPROVED claims and the overall Pilot 5 template gate is NOT READY. Limited claim-to-field design may be reviewed separately, but business-code refactoring is not authorized.

## 14. SAFE TO START Batch 2

NO. Batch 2 remains not authorized; first resolve or formally defer the 17 Pilot 5 evidence gaps and obtain acceptance of this gate.
