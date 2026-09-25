# CJAS Recovery Knowledge Base Batch 1 Report

Status: COMPLETE — PENDING CEO AND PRODUCT ARCHITECT REVIEW
Checked at: 2026-08-02 (Australia/Sydney)

## Delivery counts

| Metric | Count | Definition |
|---|---:|---|
| Platforms | 17 | 7 CEX + 5 software wallets + 5 hardware wallets |
| Structured platform sections | 306 | 17 platform files × 18 required sections; these are not Atomic Knowledge Items |
| Recovery rules | 24 | RK-001–RK-024 |
| Templates | 4 | CEX, Software Wallet, Hardware Wallet, Multi Wallet |
| Guidance entries | 8 | G-01–G-08 |
| AI FAQs | 12 | FAQ-01–FAQ-12 |
| Official source records | 48 | 47 unique official URLs; one official Ledger page supports two separately graded claims |
| Open questions | 10 | OQ-01–OQ-10 |

## Evidence Grade distribution

- A: 18
- A/B: 17
- B: 8
- B/C: 3
- C: 2
- D: 0 source records; unconfirmed conclusions are isolated as D-level open questions

Grades apply to cited propositions, not to platform quality or safety. C/D content cannot become automated guidance or an AI certainty claim.

## Scope and safety

This batch creates a documentation-only knowledge layer. It does not modify or connect UI, Recovery Map, Schema, Crypto Engine, Recovery Kit, Snapshot, wallet, network, telemetry, deployment or mainnet behavior. It stores no user secret, credential or real recovery material.

## Open questions

The blocking research gaps are Rabby's official recovery documentation, regional CEX policy differences, legacy/current Coinbase timing, wallet cloud/seedless version scope, hardware model behavior, CEX estate paths and cross-vendor derivation compatibility. See `08-open-questions/OPEN_QUESTIONS.md`.

## Batch 2 recommendation

Prioritize evidence depth rather than adding a broad brand list:

1. Resolve Rabby and Trust Wallet official-document gaps.
2. Build jurisdiction-aware CEX recovery and deceased-account evidence for the existing seven platforms.
3. Add chain/derivation-path recovery guidance for Bitcoin, Ethereum/EVM and Solana without storing secrets.
4. Research only a small set of materially different custody patterns: smart accounts, institutional custody and multisig as advanced paths.
5. Define source expiry, revalidation and human-approval workflow before wiring this knowledge into product rules or AI Support.

No Batch 2 implementation should begin before this batch is reviewed.
