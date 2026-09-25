# CJAS Existing 17 Platforms Recovery & Control Completeness Report

Status: AUDIT COMPLETE — PENDING CEO AND PRODUCT ARCHITECT REVIEW
Checked at: 2026-08-02

## 1. 已完成审计平台

All 17 existing platforms: Binance, OKX, Coinbase, Kraken, Bybit, Bitget, KuCoin, MetaMask, Rabby, Trust Wallet, Phantom, OKX Wallet, Ledger, Trezor, OneKey, Keystone and SafePal. No Batch 2 platform was added.

## 2. 仍不完整平台

All 17 remain incomplete under the strict A–F definition because none has an approved platform-specific Verified Transfer path. Recovery evidence is strongest for Coinbase holder recovery, Bitget, KuCoin, MetaMask, Phantom, OKX Wallet, Ledger, Trezor, OneKey and SafePal; that does not make A–F complete.

## 3. 每个平台主要缺失信息

- Binance: operational lost-email/Authenticator recovery, withdrawal state, succession and verified transfer.
- OKX: non-US scope, owner handoff/succession and verified transfer.
- Coinbase: approved verified small transfer and active-handoff guidance.
- Kraken: complete holder lost-factor recovery and end-to-end withdrawal/verification.
- Bybit: accessible holder-recovery evidence, succession and verified transfer.
- Bitget: owner-directed handoff, succession and verified small transfer.
- KuCoin: owner-directed handoff, succession and verified small transfer.
- MetaMask: approved address/small-transfer verification and legal-authority guidance.
- Rabby: nearly all official recovery mechanics.
- Trust Wallet: stable dedicated recovery source, cloud/import scope and verified transfer.
- Phantom: approved cross-chain verified transfer and version scope.
- OKX Wallet: cloud-region/derivation scope and verified transfer.
- Ledger: approved verified transfer and model-specific operational details.
- Trezor: approved verified transfer and broader model check matrix.
- OneKey: model matrix, cross-wallet address derivation and verified transfer.
- Keystone: Passphrase, firmware/reset, derivation and verified transfer.
- SafePal: derivation compatibility and verified transfer.

## 4–6. Evidence and Claim statistics

- Existing official source records: 48; new records: 0.
- Official pages operationally rechecked in this audit: 21 requests; inaccessible/insufficient pages were not treated as evidence.
- New Atomic Claims: 72 for the previously non-atomic 12 platforms.
- Existing Atomic Claims revised: 0; Pilot 5 decisions remain unchanged.
- New source-bound REVIEWED claims: 41.
- New UNCONFIRMED DRAFT claims: 31.
- Whole catalog: 112 Claims = 23 APPROVED + 54 REVIEWED + 35 DRAFT; 0 REJECTED, 0 STALE.

## 7. Recovery Completeness Cards

All 17 A–F cards are in `12-completeness/ALL17_RECOVERY_COMPLETENESS_CARDS.md` and mirrored in `knowledge-catalog.json`. Result: 0 `TECHNICAL CONTROL PATH COMPLETE`; no numeric score is used.

## 8. CEX conclusions

- Account-holder recovery: complete or materially documented for Coinbase, Bitget and KuCoin; US-scoped OKX is documented but transfer incomplete; others remain incomplete.
- Owner-directed transfer: technically plausible through normal withdrawals, but no platform in this audit has a complete approved handoff plus verified-small-transfer claim set.
- Third-party login: never treated as legal control. KYC, factor reset, GSL/whitelists, risk review and withdrawal locks can still block funds.
- Transfer restrictions: verified examples include Coinbase ID recovery, OKX US phone/email changes, Bitget recovery, KuCoin email reset, Bybit address/security settings and Kraken funding controls.
- Succession: Coinbase and Kraken publish official paths; all others remain unconfirmed in the current set.

## 9. Self-custody conclusions

- Core control materials: SRP/seed, independent private keys/keystores, exact Passphrase and threshold shares as applicable; passwords/PINs are generally local controls in the documented products.
- Designated third party: technical recovery is conditional on every required material and correct derivation/address; this does not establish legal authority.
- Transfer verification: all self-custody cards remain PARTIAL because an approved platform-specific address check plus small-transfer path is absent.
- Permanent loss: missing SRP/private key where no alternative exists, missing exact Passphrase, insufficient threshold shares, or loss of both device access and required backup can be unrecoverable depending on product.

## 10. Platforms fully supporting product templates

None under the strict A–F definition. Existing limited/core Claim mapping remains available for Coinbase, MetaMask, Ledger and Trezor; it is not a full end-to-end template.

## 11. Platforms still excluded from Recovery Map product integration

All 17 are excluded from a full production template. Only the 17 previously approved Template-eligible Pilot 5 Claims may be used for separately authorized mapping design. New 72 Claims are REVIEWED/DRAFT and cannot be consumed as certainty.

## 12. Deterministic AI support

Only previously approved, unexpired and AI-eligible Pilot 5 claims support limited deterministic answers: Coinbase, MetaMask, Ledger and Trezor. Binance and the other 12 new claim sets cannot provide deterministic answers until claim approval.

## 13. Mandatory manual/official escalation

- Any CEX third-party access, death/incapacity, ownership or KYC issue.
- Any factor recovery outside the exact official product/region scope.
- Any frozen account, failed facial/identity review or manual withdrawal review.
- Any self-custody address mismatch, missing Passphrase/share/key, unknown derivation path or suspected secret exposure.
- Any request for password, OTP, SRP, private key, Passphrase or remote control.

## 14. SAFE TO START Recovery Map business refactor

NO. Sole gate condition: no platform has an approved A–F Verified Transfer path, and 12 newly atomicized platforms have not passed Claim Approval Gate.

## 15. SAFE TO START Batch 2

NO. Existing 17-platform evidence and approval gaps must be resolved or formally deferred first; Batch 2 remains unauthorized.
