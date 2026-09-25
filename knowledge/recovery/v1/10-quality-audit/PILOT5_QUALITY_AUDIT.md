# Pilot 5 Quality Audit

Status: internal quality review only. All source-backed claims remain `REVIEWED`, not `APPROVED`.

## Binance

- Confirmed: general account security controls and existence of inheritance planning guidance (BIN-01/02).
- Evidence insufficient: exact lost-email/Authenticator recovery, withdrawal waiting period, operational deceased-account path and regional differences.
- New official sources needed: region-specific account-recovery, factor-reset, withdrawal-control and estate support pages.
- Product-template candidates: record region/entity, redacted account identifier, enabled factors, whitelist state, official entry URL; never secrets.
- Not product-ready: procedural recovery steps, waiting times, required identity evidence and estate outcome.

## Coinbase

- Confirmed: lost email/2-step recovery entry exists (CB-01); deceased claim document set and Executor Services path are explicit (CB-02).
- Evidence insufficient: universal current withdrawal delay after recovery and cross-region estate applicability.
- New official sources needed: current retail sending restrictions after account recovery and regional variants.
- Product-template candidates: three-path separation, enabled factors, identity readiness, transfer controls, estate authority documents by reference only.
- Not product-ready: legacy Pro timing and any claim that credentials confer ownership.

## MetaMask

- Confirmed: SRP/password roles, SRP restore, account discovery, and separately imported account behavior (MM-01–04).
- Evidence insufficient: exact current behavior for every social-login/backup-and-sync configuration and chain.
- New official sources needed: stable product matrix for Google/Apple/Telegram and backup-and-sync scope.
- Product-template candidates: creation type, public addresses, networks, imported/hardware-account existence, controlled-location references and address verification.
- Not product-ready: a universal statement that every account automatically returns after one login.

## Ledger

- Confirmed: device-loss recovery using backup, PIN versus recovery-phrase roles, Passphrase-derived addresses and irreversible Passphrase loss (LED-01–04).
- Evidence insufficient: universal model/firmware PIN behavior and optional Recovery Key compatibility.
- New official sources needed: current model matrix and device-specific reset/retry behavior.
- Product-template candidates: model, backup format, Passphrase existence, public addresses, companion app, address check and small test.
- Not product-ready: model-independent retry counts or treating Recovery Key as required.

## Trezor

- Confirmed: model/period-dependent backup formats, device-loss recovery, unrecoverable device-plus-backup loss, Passphrase behavior and Model One backup check (TRZ-01–05).
- Evidence insufficient: a single procedure for all models and every SLIP39 configuration.
- New official sources needed: current model-by-model backup/check matrix and explicit threshold recovery procedures.
- Product-template candidates: model/creation period, backup format and threshold, Passphrase existence, public addresses and stop conditions.
- Not product-ready: generalizing Model One steps or assuming a word count from brand alone.

## Cross-cutting conclusion

Technical access, legal ownership and authorization are separate. The audit supports candidate form fields and safety wording, but no deterministic product output until claim-level approval.
