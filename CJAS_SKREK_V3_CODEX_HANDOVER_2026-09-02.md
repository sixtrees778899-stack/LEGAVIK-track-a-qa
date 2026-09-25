# CJAS / SKREK V3 — Codex Execution Handover

**Document date:** 2026-09-02 (Australia/Sydney)  
**Repository:** `/Users/hanhuitao/Documents/CJAS-mainnet`  
**Purpose:** Give a new Codex conversation an accurate execution state so it can continue the currently authorized Customer Center Real V1 Lifecycle work without redesigning or reopening frozen product contracts.

> Security note: this document contains no token, Recovery Password, Recovery Kit content, encryption key, wallet credential, or other secret.

## 1. Project roles and execution rules

### CEO

- Defines product acceptance, business boundaries, real-environment authorization, paid Mainnet authorization, and final freeze approval.
- Performs only essential customer actions in real acceptance: safe test data, Recovery Password entry, wallet connection, fee confirmation, and manual signature.
- Must not be asked to run terminal commands, debug code, move state files, clear browser databases, relay messages between agents, or perform engineering diagnosis.

### ChatGPT Product Architect / COO

- Owns product-contract interpretation, architecture review, priorities, red lines, and approval recommendations.
- Distinguishes implementation readiness from real Product PASS.
- Reviews evidence before authorizing fixes, migration, freeze, or the next product phase.

### Codex

- Executes approved implementation, inspection, testing, evidence collection, environment operations, and reporting.
- Must protect existing approved work and preserve unrelated user changes.
- Must stop at diagnosis when an unauthorized defect or boundary violation is found.
- Must not expose secrets, execute an unapproved paid Mainnet transaction, or broaden scope.

### Permanent workflow

`Freeze → Inspect → Report → Approve → Fix → Re-test`

- No automatic fix without explicit authorization.
- No commit or tag without explicit CEO authorization.
- `Implementation PASS ≠ Product PASS`.
- `Mock PASS / Unit PASS ≠ Real Product PASS`.
- A mandatory Product PASS gate failure requires evidence and a stop, not a symptom patch.

## 2. Formal frozen baselines

### 2.1 Recovery Map V2 Final Freeze

- **Status:** FINAL FREEZE / behavior protected by all later approved baselines.
- **Release-gate commit:** `1ae5ca6` (`fix(product): enforce Recovery Map V2 release gate`).
- **Dedicated V2 final-freeze tag:** no uniquely named dedicated V2 tag was found locally. Do not invent one.
- **Latest carrying anchor:** `1ecb9627ad2fa1eb04daacd0240fa174dcbb62aa` / `cjas-v3-local-sensitive-hardening-approved-20260901`.
- **Frozen boundary:** legal customer state, Module contracts, Generation Preflight, Snapshot, Archive, Crypto, Recovery Kit, Evidence, Mainnet publication contract, and recovery compatibility.
- **May Frozen Core be modified?** No, unless a separately diagnosed P0 receives explicit CEO/Product Architect approval.

### 2.2 Known-Good Mainnet Core

- **Status:** Real Create → Mainnet → Independent Recovery PASS baseline.
- **Commit:** `196da773972bfce7bdd0cf4d9387ef8872e37eef`.
- **Tag:** `cjas-v3-known-good-core-mainnet-20260829`.
- **Boundary:** wallet/signature/upload/TxID/Evidence/Recovery Kit/independent recovery behavior.
- **Frozen Core modification:** prohibited without explicit approval.

### 2.3 Create / Resume Boundary

- **Status:** PASS + APPROVED.
- **Commit:** `5386a7089bb0b3dc9c4f784d50d7621483f48aa1`.
- **Tag:** `cjas-v3-create-resume-boundary-approved-20260829`.
- **Boundary:** new Create first render is independent of heavy historical-operation load; valid resume remains explicit and idempotent.
- **Frozen Core modification:** no.

### 2.4 Step 3 Real E2E Generation Contract

- **Status:** Real E2E PASS + APPROVED.
- **Commit:** `5a4eef7b804d1b00ab828763004c5ef59374221b`.
- **Tag:** `cjas-v3-step3-real-e2e-approved-20260830`.
- **Boundary:** `publishable=true → Generation Preflight PASS → Snapshot PASS → Archive PASS → Recovery Kit PASS → Mainnet reachable → Recovery PASS`.
- **Frozen Core modification:** prohibited.

### 2.5 Unified Recovery Flow

- **Status:** PASS + APPROVED.
- **Commit:** `2b260dd0a992a4a727cda92a943bbc5d8eeacc1f`.
- **Tag:** `cjas-v3-unified-recovery-approved-20260830`.
- **Boundary:** two entrances, one canonical `/web/recover.html` flow, one recovery engine, one renderer, one workspace.
- **Frozen Core modification:** prohibited.

### 2.6 Batch A1 Approved UI and Production Gate

- **Status:** PASS + APPROVED.
- **Commit:** `392c84f615f898a05d44272427a64822d05b3c46`.
- **Tag:** `cjas-v3-batch-a1-approved-20260830`.
- **Boundary:** approved Review/password UI and production historical-operation banner hard gate.
- **Production invariant:** historical-operation/resume banner count is always `0` in production customer render.
- **Frozen Core modification:** no.

### 2.7 Recovery Workspace Phase 1

- **Status:** PASS + FROZEN.
- **Commit:** `537d24cca689b8bf0a21f2d30215cdafe16c13dd`.
- **Tag:** `cjas-v3-recovery-workspace-phase1-approved-20260831`.
- **Boundary:** approved 01–07 information architecture, guidance, standalone Assistant section, download-only attachments, and visual hierarchy.
- **Frozen Core modification:** no.

### 2.8 Recovery Workspace Phase 2

- **Status:** PASS + FROZEN.
- **Commit:** `b0cc069c99b70e36c151732192f97123e8400aa6`.
- **Tag:** `cjas-v3-recovery-workspace-phase2-approved-20260831`.
- **Boundary:** approved account-material-source mapping and recovery workspace product contract.
- **Frozen Core modification:** no.

### 2.9 Local Sensitive Data Hardening Stage 1 + Stage 2

- **Status:** PASS + FROZEN; current recovery anchor.
- **Commit:** `1ecb9627ad2fa1eb04daacd0240fa174dcbb62aa`.
- **Tag:** `cjas-v3-local-sensitive-hardening-approved-20260901`.
- **Boundary:** pre-password sensitive state is memory-only; post-password resumable state is one authenticated encrypted checkpoint; no plaintext Draft/Snapshot/attachment persistence; deterministic sanitization at stable completion; no backend recovery-secret custody.
- **Frozen Core modification:** no.

## 3. Current recovery anchor

- **Commit:** `1ecb9627ad2fa1eb04daacd0240fa174dcbb62aa`
- **Tag:** `cjas-v3-local-sensitive-hardening-approved-20260901`
- **Branch:** `codex/post-known-good-core-bugfix-20260829`

This anchor predates the uncommitted Customer Center Real V1 Lifecycle implementation. The current approved Real V1 changes are intentionally layered on top of it and are not frozen yet. **Do not reset, clean, overwrite, revert, stash, or discard the working tree.**

## 4. Customer Center Real V1 Lifecycle

### Implemented behavior

- A formal lifecycle record is created only after stable publication:
  - valid TxID;
  - Evidence `READY_FOR_INDEPENDENT_RECOVERY`;
  - verification `PASS`;
  - operation `COMPLETE`;
  - completion checkpoint and sensitive-data sanitization boundary reached.
- Draft, `LOCAL_ENCRYPTED`, upload-in-progress, TxID-only, unverified, uncertain, and failed operations do not become formal V1.
- Lifecycle metadata synchronization is isolated from publication success. A metadata failure does not rebroadcast, recreate materials, charge twice, or turn a successful Mainnet publication into a failed creation.
- Failed metadata synchronization is retryable using non-secret pending lifecycle metadata.

### Identity and version model

- **Recovery Map ID:** persistent identity of the product lifecycle.
- **Version ID:** immutable identity of a published version.
- **Operation ID:** identity of one publication attempt.
- First formal successful publication is explicitly stored as `version_number = 1` / `V1`.
- V1 status is `CURRENT`; `recovery_maps.current_version_id` points to the V1 row.
- The schema leaves room for future V1 Historical / V2 Current behavior, but V1 → V2 is not implemented or authorized.

### Ownership and RLS design

- Owner identity comes from `auth.uid()` inside the security-definer RPC; no client owner ID is trusted.
- `recovery_map_versions` has RLS enabled.
- Own-row select/insert/update/delete policies are defined; direct authenticated table grant is select-only, while formal creation uses the RPC.
- Anonymous access is revoked.
- Remote authenticated Customer A/B/anonymous validation is still required before Product PASS.

### Customer Center source of truth

- Dashboard, **My Recovery Map**, and Version History use the same formal lifecycle source.
- Only `PUBLISHED` lifecycle records with a valid current `CURRENT` version are presented.
- Mock/demo data is not presented as the customer's real V1.
- Legacy `LOCAL_ENCRYPTED` metadata is not treated as V1 Current.
- Version History shows exactly one V1 for a first publication; no fake V2/V3.
- Customer Center does not productize Evidence re-download, Recovery Kit re-download, password reset, or recovery-key retrieval.

### Idempotency

- Unique constraints cover `(user_id, version_id)`, `(user_id, operation_id)`, and `(recovery_map_id, version_number)`.
- Duplicate callback/retry converges on one V1.
- A mismatched repeat raises `LIFECYCLE_IDEMPOTENCY_CONFLICT` rather than silently creating another version.

### Verified implementation evidence

- **Targeted lifecycle tests:** `9/9 PASS`.
- **Relevant regression:** `115/115 PASS`.
- **Local Sensitive Data Stage 1/2:** PASS.
- **Production Resume Banner gate:** PASS.
- **Generation Red-Line contract:** PASS.
- **Module 5 contract:** PASS.
- **Frozen Core touched:** NO.
- **Unintended changes:** 0.

### Current status

**Implementation PASS / CEO ACCEPTED**  
**NOT Product PASS**  
**NOT Frozen**

Product PASS still requires remote migration, real RLS isolation, one controlled authenticated Mainnet V1, logout/login persistence, remote self-custody inspection, production UI gate, and final relevant regression.

## 5. Current working tree

- **Branch:** `codex/post-known-good-core-bugfix-20260829`
- **HEAD:** `1ecb9627ad2fa1eb04daacd0240fa174dcbb62aa`
- **Status:** DIRTY by design; approved Real V1 work is uncommitted.

### Modified files

1. `src/account/recovery-metadata-client.js`
2. `src/account/supabase-account-app.js`
3. `src/ui/mainnet-stability.js`
4. `tests/account/account-center-v1.test.js`
5. `web/account/account-app.bundle.js`
6. `web/account/account.css`
7. `web/account/index.html`
8. `web/account/recovery-metadata-client.bundle.js`
9. `web/v2/v2-app.js`

### Untracked files

1. `supabase/migrations/20260901120000_recovery_map_v1_lifecycle.sql`
2. `tests/account/customer-center-real-v1-lifecycle.test.js`
3. `tests/browser/customer-center-real-v1-preview.spec.js`

### Classification

- All 12 paths are attributable to the approved Customer Center Real V1 Lifecycle implementation and its tests/bundles.
- No unrelated working-tree change was found.
- Frozen Core was not touched.
- This handover Markdown is a documentation artifact requested by the CEO; it must not be mistaken for product implementation.

## 6. Supabase current state

- **Target project:** SKREK-V3.
- **Project ref:** `kkpipnlvercivdykflet`.
- The linked project ref matches the application Supabase endpoint.
- A secure `SUPABASE_ACCESS_TOKEN` is present in the current Codex process. Its value must never be displayed, logged, committed, or copied into this document.

### Latest read-only Gate 1 evidence

- **Account-level `projects list`: FAIL** with `insufficient account privileges`.
- **Linked project identity/config match: PASS**.
- **Remote migration status readable: PASS**.
- Remote migration inspection returned:
  - 4 matched local/remote migrations;
  - 1 local-only migration: `20260901120000`.

### Interpretation / open question

- Token injection itself is successful.
- The token's project-scoped database/migration permissions are sufficient to initialize the database login role and read linked-project migration status.
- The failing check is the broader account-level project-list endpoint, which is outside the stated project-only token scope.
- New Codex must first confirm that this account-level endpoint is not a required gate for the approved Real V1 migration path. Do not widen token permissions merely to make `projects list` pass.

## 7. Token permission model

The current token is intentionally minimal and temporary.

- **Resource scope:** Project only.
- **Project:** SKREK-V3 only.
- **Project Settings:** Read.
- **Database:** Read-write.
- **Migrations:** Read-write.
- **All unrelated permissions:** None.
- **Expiry:** Temporary, 7 days.
- **Secret handling:** Never output, log, screenshot, commit, or ask the CEO to paste the value into chat.

## 8. Unique local-only migration

### Identity

- **File:** `supabase/migrations/20260901120000_recovery_map_v1_lifecycle.sql`
- **Timestamp:** `20260901120000`
- **Remote state:** local-only; not applied as of this handover.

### Purpose

Create the non-secret, authenticated Customer Center V1 lifecycle model and idempotent stable-publication RPC.

### Schema objects affected

- Adds `display_name`, `lifecycle_state`, `published_at`, and later `current_version_id` to `public.recovery_maps`.
- Creates `public.recovery_map_versions` for immutable non-secret version metadata.
- Adds version uniqueness/idempotency constraints.
- Enables RLS and defines own-row policies on `recovery_map_versions`.
- Revokes anonymous access and limits authenticated direct access.
- Creates/replaces `public.record_published_recovery_map_v1(...)`.
- Adds a descriptive table comment.

### Safety assessment

- The migration exactly matches the approved Customer Center Real V1 Lifecycle scope.
- It contains no Recovery Password, Resume key, DEK, KEK, wrapped DEK, Recovery Kit bytes, plaintext Snapshot/Draft, attachment plaintext, or decrypt-capable secret column.
- It does not modify Snapshot, Archive, Crypto, Recovery Kit, Evidence format, Recovery Engine, Generation Preflight, or Mainnet transaction format.
- It uses `drop ... if exists` only to replace the named trigger/policies before recreating them. It does not drop lifecycle data tables, truncate data, or delete customer records.
- No destructive or unrelated data migration was found.
- **Frozen Core touched:** NO.
- **Action during this handover:** NOT APPLIED.

## 9. Next execution path

Execute in this order and stop on any mandatory failure:

1. **Read-only diagnose Authentication FAIL.** Reproduce the account-level permission failure and linked-project migration success without exposing the token.
2. **Confirm token sufficiency.** Determine whether project-scoped Database/Migrations read-write permission is sufficient for the approved path; do not demand unrelated account-level scope.
3. **Confirm migration scope.** Re-read `20260901120000_recovery_map_v1_lifecycle.sql`; ensure the working copy is unchanged and only Real V1 lifecycle work.
4. **Apply only the approved migration.** Verify it appears remotely exactly once. No ad-hoc migration.
5. **Real RLS validation.** Customer A own read/authorized write; Customer B cannot read/write A; anonymous cannot access protected rows. Backend evidence is mandatory.
6. **Controlled authenticated customer.** Use dedicated test accounts, never CEO personal production account.
7. **Small-file real Mainnet V1.** Use the standard customer path and one manually authorized wallet signature/fee. No stress test.
8. **Stable Complete gate.** Require valid TxID, Evidence ready, gateway verification PASS, operation COMPLETE, completion UI, and Stage 1/2 sanitization PASS.
9. **Customer Center V1.** Exactly one real map, V1, Current, real creation time, Version History exactly one, no mock/legacy record.
10. **Logout → Login.** Same V1 persists; no duplicate or session-created version.
11. **Sensitive-data/self-custody verification.** Remote lifecycle data contains no prohibited secret; login alone cannot decrypt V1.
12. **Production Resume Banner gate.** Production customer banner count must be `0`.
13. **Relevant regression only.** Generation Red-Line, Stage 1/2 hardening, Resume Banner, lifecycle behavior, Module 5, Frozen Core untouched.
14. **Product PASS report.** Report evidence for every mandatory gate.
15. **STOP.** Wait for CEO authorization before commit, tag, or freeze.

## 10. Product PASS gates

All gates are mandatory:

1. **Environment:** secure token, correct project, remote status readable.
2. **Migration:** only the approved migration applied exactly once.
3. **RLS:** Customer A, Customer B cross-account isolation, and anonymous isolation pass with real authenticated identities.
4. **Real Mainnet V1:** one controlled standard publication reaches stable completion.
5. **Customer Center:** exactly one real V1 Current with real date and consistent Dashboard/My Map/History.
6. **Logout/Login persistence:** same single V1 remains after a new session.
7. **Sensitive data:** no backend decrypt authority or prohibited secret persistence.
8. **Production UI:** historical-operation/resume banner count is zero.
9. **Relevant regression:** established focused regression passes.
10. **Frozen Core:** untouched.

If any mandatory gate fails: **do not automatically fix**. Capture the failed gate, actual versus expected behavior, technical evidence, affected policy/schema/function, failure class, recurrence status, and recommended next action; then stop for approval.

## 11. Hard red lines

- Do not modify Recovery Map V2.
- Do not modify Snapshot, Archive, Crypto, Recovery Kit, Evidence format, Recovery Engine, Generation Preflight, or Mainnet transaction contract unless a diagnosed P0 receives explicit approval.
- Permanent invariant: `publishable=true → Generation Preflight PASS`; an internal structural failure after publishable is a red-line contract failure.
- Production historical-operation/resume banner count must be `0`.
- Customer Center login must never decrypt a Recovery Map.
- Backend must not custody Recovery Password, Recovery Kit, Resume key, DEK, KEK, wrapped DEK, plaintext Snapshot, plaintext Draft/store, plaintext attachments, or any decrypt-capable secret.
- Do not start V1 → V2 Update now.
- Do not mix Remote Arweave SDK/CSP hardening into Real V1.
- Do not mix Recovery Guide final implementation into Real V1.
- No automatic Mainnet signing, fee approval, or broadcast. CEO/test operator must explicitly confirm and manually sign.

## 12. Known future work — do not start

- V1 → V2 Update.
- Recovery Guide Final.
- Remote Arweave SDK / CSP Security Hardening.
- Update entitlement / Pricing.
- Stripe / payment.
- Service Agreement.
- FAQ / Help Center.
- Family / Multi-Map.
- V4 performance optimization.

These items are context only and are not authorized by this handover.

## 13. Final handover summary

1. Recovery Map V2, Mainnet/Recovery core, Unified Recovery, Recovery Workspace Phase 1/2, Batch A1, and Local Sensitive Hardening Stage 1/2 are approved/frozen.
2. Current recovery anchor is `1ecb9627...` / `cjas-v3-local-sensitive-hardening-approved-20260901`.
3. Real V1 Lifecycle implementation is complete, CEO accepted, tested locally, but remains uncommitted and unfrozen.
4. The dirty working tree contains only the approved Real V1 implementation and tests.
5. Never reset or overwrite it.
6. Supabase project ref is `kkpipnlvercivdykflet` and matches the application.
7. Secure token injection is active; never display the token.
8. Account-level project listing lacks privilege, but linked-project migration status is readable.
9. Remote status is 4 matched migrations plus one approved local-only Real V1 migration.
10. The open question is whether the unnecessary account-level API failure can be excluded from the migration gate.
11. New Codex's first action is read-only permission-boundary confirmation, not code modification.
12. Then apply only the approved migration, validate real RLS, and run one controlled small-file Mainnet V1.
13. Product PASS requires logout/login persistence, zero duplicate V1, no secret custody, production banner zero, and focused regression.
14. Do not start V1 → V2, Recovery Guide, CSP hardening, pricing, or unrelated work.
15. After Product PASS, stop and wait for explicit CEO commit/tag/freeze authorization.
