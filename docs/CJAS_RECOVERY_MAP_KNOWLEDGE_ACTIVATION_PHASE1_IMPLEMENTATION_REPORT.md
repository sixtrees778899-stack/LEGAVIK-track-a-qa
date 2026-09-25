# CJAS Recovery Map Knowledge Activation Phase 1 Implementation Report

Date: 2026-08-02

Branch: `feature/week3-recovery-experience`

## 1. Modified files

- `src/knowledge/recovery-activation-resolver.js`: Approved/fresh/scope/product-eligibility selection and fail-closed regional resolution.
- `src/review/activation-rules.js`: account-aware Activation review issues and escalation classification.
- `src/ui/knowledge-activation-mapper.js`: single UI → Mapper → Schema v2 boundary and condition synchronization.
- `src/ui/recovery-map-mapper-v2.js`: exact condition-to-account references plus projection into existing Schema v2 fields.
- `src/ui/recovery-dashboard-model.js`: optional in-memory activation context and Drill state.
- `src/ui/module-status-v2.js`: Dashboard can display the exact Mapper review result.
- `config/recovery-map/v2/activation-phase1-zh-CN.json`: three platforms, neutral factor templates, paths, Guidance and Drill configuration.
- `config/recovery-map/v2/presentation-zh-CN.json`, `config/recovery-map/v2/modules.json`: six-module order and configuration-driven controls.
- `web/app-v2.js`, `web/phase-c.css`: dynamic account/factor flow, conservative fallback, precise Review and Drill UI.
- `tests/unit/knowledge-activation-phase1.test.js`, `tests/unit/phase-c-dashboard-mapper.test.js`: Phase 1 and regression coverage.
- `docs/RECOVERY_MAP_ACTIVATION_PHASE1_COMPATIBILITY.md`: frozen-schema compatibility contract.

No Crypto Engine, Recovery Kit, Snapshot or Knowledge Schema v2 file was modified.

## 2. Resolver implementation

The Resolver accepts platform, registration geography, account class, App/Web mode and enabled factors. A deterministic Claim must be platform-exact, `APPROVED`, unexpired, not `INTERNAL_ONLY`, product-eligible and scope compatible. Matching order is exact region, explicit Global, then fail-closed. `Other` and `UNCONFIRMED_ENTITY` are never wildcards.

Only OKX US and Coinbase EEA currently have exact regional operational matches. Binance Australia, OKX Australia and Coinbase Australia enter conservative mode; no US or EEA policy is reused.

## 3. Claim-to-UI mapping

Claim references remain internal in configuration. The UI groups them into customer tasks and never displays Claim ID, Rule ID, Source ID, evidence grade, confidence calculations or legal-entity codes. Reviewed, Draft, Rejected, Stale and Internal-only knowledge cannot produce deterministic questions.

## 4. Dynamic questions

Binance, OKX and Coinbase personal accounts receive configuration-driven factor choices. Selected factors automatically create condition rows for email, phone, password existence, Authenticator, passkey, security key, identity-material existence, new device, withdrawal allowlist, fund-password existence or a custom condition. Users record only availability, location hint and fallback path; secret values are not requested.

## 5. Regional fallback

When no exact Approved scope exists, the product allows neutral fact capture and displays a conservative official-confirmation notice. It does not import a waiting period, KYC flow, withdrawal rule or legal process from another region.

## 6. Review localization

Every Activation issue contains platform, account, module, field/condition, reason, fix, blocking/skippable status, escalation level and navigation target. Existing Schema v2 product rules are enriched through the same Mapper so older location/step issues receive the same platform/account precision. Any Draft change invalidates the prior review.

## 7. Recovery Drill

The UI records materials checked, holder login verified, security factors verified, destination confirmed, small transfer status and official-escalation readiness. Path A, B and C display only their applicable checks. No API, login or transaction is performed. The UI explicitly distinguishes user-recorded verification from CJAS Lab verification.

## 8. Schema and compatibility

Knowledge Schema v2 remains frozen. Optional Draft-only activation and Drill state is projected into existing `platform_hint`, `asset_refs` and constrained `custom_fields`. Snapshot schema remains version 1 containing Knowledge Schema v2, and Recovery Kit/Archive container formats are unchanged. v1/v2 dispatch and independent recovery tests remain passing.

Baseline SHA-256:

- Schema v2: `1adf680ef61789d0ca9ef832506c6494089b155eb84b5498733a1ca30e239566`
- Crypto Engine: `8ead95ee5aac09fddf6fd1126b17c987966719fa42804bf38f00417f1ebed8ed`
- Recovery Kit Builder: `0b341ecff2bf5d1fa164f51f6d41da006bd70fecb365b66a137605bdab4b81d2`
- Snapshot Builder: `191c9ecdc840f6a2f9f4502901396caa7993dbec6ca27d555645d95266b8490a`

## 9. Tests

- Command: `npm test`
- Result: 189/189 PASS.
- New tests: 12 Phase 1 tests, including three-platform generation, exact region, no cross-region Claim, safe fallback, lifecycle/eligibility filtering, account references, precise Review, Draft recomputation, A/B/C paths, Drill projection, institutional fail-closed and activated Kit/Archive independent recovery.
- `git diff --check`: PASS.
- Platinum catalog validation: PASS; Claim totals remain 117 Approved / 19 Reviewed / 11 Draft / 3 Rejected.

## 10. Security

- Command: `npm run check:security`
- Result: PASS, 0 findings.
- No external upload, wallet, exchange API, telemetry or persistent browser Draft storage was added.
- No password, OTP, Authenticator Seed, recovery-code set, identity-document original or API Secret field was added.

## 11. Chrome and Safari status

- In-app Chromium local smoke test: PASS for Dashboard loading, Binance Australia account configuration, generated factor rows, account linkage, conservative fallback, Review blocking and no browser console errors.
- Chrome: automated/shared browser behavior is covered; CEO real Chrome experience remains PENDING.
- Safari: existing download fallback automated tests PASS; real Safari Phase 1 experience remains PENDING.

## 12. Git commit

To be recorded after the final local commit. No push or merge is authorized.

## 13. Current risks

- No Phase 1 Claim is explicitly Global; Australian accounts intentionally receive conservative guidance rather than deterministic regional policy.
- Binance serving entities remain unresolved.
- OKX deterministic operational knowledge is US-only.
- Coinbase deterministic EEA transfer knowledge does not establish an Australian operational flow.
- Recovery Drills are official-only/user-recorded and are not CJAS Lab verified.
- Institutional, Prime, Vault, succession and disputed-authority flows require official or human escalation.

## 14. CEO experience steps

Open `http://127.0.0.1:8080/` and test:

1. Binance / Australia / Personal / App.
2. OKX / Australia / Personal / App.
3. Coinbase / Australia / Personal / App.
4. OKX / United States to confirm an exact regional match, then switch to Australia to confirm US knowledge disappears.
5. Select Official or Legal Escalation and confirm no direct takeover steps are shown.
6. For each account, select factors, confirm generated rows are linked to that account, complete locations/steps, inspect Review return targets, generate Kit/Archive and recover at `http://127.0.0.1:8080/web/recover.html`.

Safari should additionally confirm the existing default-download fallback and independent attachment recovery.

## 15. SAFE TO START Phase 2

**NO — Phase 1 requires CEO Chrome and Safari experience acceptance and Product Architect final review.**
