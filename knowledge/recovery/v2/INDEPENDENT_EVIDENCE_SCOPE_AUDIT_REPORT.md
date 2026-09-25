# CJAS Platinum Phase 1 Independent Evidence & Scope Audit Report

Audit date: 2026-08-02
Input baseline: commit `102b296edee1721f9aec610b3e472e4a85467dcc`

## 1. 150条Claim逐条审计结果

All 150 rows were re-evaluated without inheriting the prior candidate decision. The consolidated row-by-row register is `150_CLAIM_AUDIT_RESULTS.md`; full claim text, source section, four tags and rationale are in each platform’s `14-claims/CLAIM_REGISTER.md`, `claims.jsonl` and `audit-decisions.jsonl`.

## 2. Claim去重前后

- Before: 150.
- Independent after audit: 147.
- Semantic duplicates merged/rejected: 3.
- Downgraded: 33.
- Approved retained: 117.

The exact merge pairs and reasons are in `CLAIM_DEDUPLICATION_REPORT.md`.

## 3. Final lifecycle distribution

| Platform | Approved | Reviewed | Draft | Rejected | Stale |
|---|---:|---:|---:|---:|---:|
| Binance | 35 | 10 | 4 | 1 | 0 |
| OKX | 40 | 4 | 5 | 1 | 0 |
| Coinbase | 42 | 5 | 2 | 1 | 0 |
| Total | 117 | 19 | 11 | 3 | 0 |

Downgrades primarily reflect compound propositions, inference presented too broadly, unsupported generic exit guidance, legal/entity uncertainty and semantic duplication.

## 4. Binance entity and region coverage

| Scope | Result |
|---|---|
| Binance Global educational content | Supported only within cited Academy educational scope; serving entity unconfirmed |
| Binance.US | Not established by this evidence set |
| Australia | Not established |
| EEA / UK / other local entities | Not established |
| Password/security concepts | Partially Approved |
| Lost email/phone/Authenticator operational reset | Insufficient entity-level evidence |
| Passkey/security key | Security concept supported; implementation/entity scope limited |
| KYC/face recovery | Insufficient |
| Withdrawal whitelist/Satoshi Test | Approved only within cited educational/Travel Rule scope |
| Withdrawal appeal | Insufficient |
| Death/incapacity | Human/legal escalation; no confirmed entity process |

No Binance Claim is labelled Global.

## 5. OKX regional coverage

| Scope | Result |
|---|---|
| OKX US | 50 source-scoped candidates; 40 remain Approved |
| OKX Australia | No deterministic reuse authorized |
| OKX EEA | No deterministic reuse authorized |
| OKX Global/other entity | Unconfirmed |

US reset, factor and withdrawal pages support US-only answers. The serving legal entity is still `UNCONFIRMED_ENTITY`; risk controls and cooling periods remain time-sensitive and account-state specific.

## 6. Coinbase product and regional coverage

| Scope | Result |
|---|---|
| Coinbase Retail | Core access, 2FA and recovery facts supported with serving entity unconfirmed |
| EEA Retail sends | CBP-S09-only regional facts |
| Coinbase Vault | Not covered |
| Coinbase Advanced | Not generalized from Retail |
| Coinbase Prime/Institutional | Not covered and prohibited from Retail templates |
| Executor/deceased | Internal-only, Human escalation |
| Incapacity/POA | Incomplete and jurisdiction-sensitive |

## 7. Control-right A–H coverage

| Layer | Claims |
|---|---:|
| A Account Discovery | 2 |
| B Access | 47 |
| C Authentication | 23 |
| D Account Recovery | 14 |
| E Operational Control | 15 |
| F Withdrawal / Send | 24 |
| G Verified Transfer | 14 |
| H Legal / Official Succession | 11 |

A–D evidence is not used to infer E–G. Login does not equal send authority; factor reset does not equal unrestricted withdrawal; succession is not a default holder-recovery path.

## 8. Product eligibility

| Eligibility | Approved Claims |
|---|---:|
| TEMPLATE_ELIGIBLE | 109 |
| GUIDANCE_ELIGIBLE | 110 |
| AI_SUPPORT_ELIGIBLE | 110 |
| RULE_ENGINE_ELIGIBLE | 43 |
| DRILL_ELIGIBLE | 48 |
| INTERNAL_ONLY | 7 |

Eligibility is explicit per claim. Reviewed/Draft/Rejected rows have no deterministic product use. Rule records remain candidates and are not connected to an engine.

## 9. Recovery Drill audit

All three drills are `OFFICIAL_ONLY_NOT_LAB_VERIFIED`. Checklist references resolve only to Approved, Drill-eligible claims. Each drill now prohibits KYC bypass and third-party impersonation, requires the account holder’s controlled destination, requires applicable cooldown observation and cannot mark Verified without required evidence. No step is marked Lab Verified.

## 10. Succession Passport audit

All three Passports now separate prepared materials, official recovery paths, holder actions, owner-directed transfer, third-party restrictions, legal escalation, untested steps, status, region/entity and last verification. All are `CANDIDATE_NOT_LAB_VERIFIED`; secret values and full recovery materials remain forbidden.

## 11. Globally usable conclusions

None of the 150 platform Claims is marked Global. General CJAS safety principles may be reused only as explicitly labelled `CJAS_GUIDANCE`, with the narrowest supporting scope and no platform guarantee.

## 12. Region-specific conclusions

- OKX operational facts: United States only.
- Coinbase EU sending/address-control facts: EEA only.
- Coinbase general recovery facts: Retail product, serving entity unconfirmed.
- Binance facts: educational Binance Global variant, serving entity applicability unconfirmed.

## 13. Mandatory human escalation

Death, incapacity, executor/probate, disputed authority, serving-entity uncertainty, account-specific risk restriction, KYC failure and any official/Lab conflict require human or official escalation. Seven Approved legal/succession claims are Internal-only.

## 14. Recovery Lab readiness

**CONDITIONAL YES FOR A SEPARATELY AUTHORIZED LAB PLAN.** Lab execution must use holder-owned test accounts, no impersonation, no KYC bypass, controlled low-value destinations, explicit transaction-cost approval, anonymized tester IDs and the required Lab labels. This report does not authorize transactions or testing.

## 15. Formal Platinum upgrades

**None.** No platform has Lab replication, independent tester evidence or confirmed complete region/legal-entity coverage.

## 16. Platforms remaining Platinum Candidate

Binance, OKX and Coinbase all remain `PLATINUM CANDIDATE`.

## 17. Tier 2 readiness

**NO — NOT SAFE / NOT AUTHORIZED.** Phase 1 should first receive CEO architecture acceptance and, if authorized, controlled Recovery Lab evidence.

## Four-Label Governance Audit

1. Four-label completeness: **100%** across 150 Claims, 150 Rules, 150 Guidance records, 300 FAQ cases, 3 Templates, 3 Drills, 3 Passports and 24 Source records.
2. Scope unclear: **150 Claims have `UNCONFIRMED_ENTITY`**; 94 also use non-global `Other` geography, while 50 are US and 6 are EEA.
3. Official recheck only / not Lab tested: **150 Claims**.
4. CJAS Lab tested: **0**.
5. Verified Tester: **0**.
6. Confidence: **HIGH 0 / MEDIUM 117 / LOW 33**.
7. Expired: **0**; earliest review due is 2026-11-02. No item is represented as Lab Verified.
8. Downgraded due to audit/four-label scope: **33 Claims**.
9. Four-label migration: **COMPLETE for Phase 1 artifacts**.
10. Formal Platinum eligibility: **NO for all three platforms**.

## Safety boundary

Only `knowledge/recovery/v2/` changed. No UI, Recovery Map, Schema, Crypto, Snapshot, Recovery Kit, business code, AI service, new platform, push, merge or deployment was performed.
