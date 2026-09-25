# CJAS Recovery Map V2 — Product Simplification & Attachment Context Correction

Date: 2026-08-05

Branch: `feature/week3-recovery-experience`

Baseline HEAD: `37de7b95a61ff9d515b2fd74af121e45f7330468`

## Existing behavior and root causes

- Canonical account deletion already cascaded through conditions, location coverage, instructions, and account-owned attachments, but the UI used a generic confirmation that did not disclose the affected counts.
- The pending account form was rendered like a permanent account card and offered only `Personal`; blank and partially entered pending forms had no separate cancel lifecycle.
- generated Draft mutations surfaced the internal `GENERATED_VERSION_IMMUTABLE` exception because the UI lacked a product-level translation and derivation action at the account screen.
- contextual attachment entry only preselected account/module/purpose. The selectors remained editable, so a user could reassign an upload away from the module/account that opened the center.
- module 3 still rendered every uncovered itemized condition and retained local save buttons. Attachment coverage was requested a second time inside the attachment area.
- attachment capacity and cards exposed raw byte counts and gave the upload form and history items equal visual weight.

## Corrections

- Draft accounts now show an explicit cascade summary before deletion; cancellation leaves the Canonical Store unchanged.
- Pending-account creation has a separate `新增账户` / `取消新增` lifecycle. Blank cancellation and blank Save & Continue do not mutate or block the Draft. Partial cancellation requires confirmation. Both Personal and Institutional options use the same form.
- generated Versions show the Chinese immutable-Version explanation and `创建新草稿并修改`; the old Version is retained.
- contextual attachment entry locks account, module, and purpose. Location coverage is inherited from module 3 and displayed read-only. Dashboard attachment entry remains freely selectable.
- module 3 defaults to summary coverage, expands itemized fields only for explicitly selected conditions, removes local save buttons, and commits through the page-level Save & Continue path.
- customer-facing capacity uses KB/MB; upload and history now have distinct visual hierarchy.
- condition labels are `登录密码` and `身份验证材料`, with the existing no-secret guidance retained.

## Acceptance stories

| Story | Result | Evidence |
|---|---|---|
| 14 account cascade deletion | PASS (automated domain test) | Binance-owned conditions, coverage, instruction, and attachment removed; OKX retained |
| 14A blank pending cancellation | PASS (real browser + automated) | revision stayed `0`; pending card closed |
| 14B partial pending cancellation | PASS (source/automated confirmation contract) | cancel preserves input; accept clears UI-only form without Store mutation |
| 14C blank pending does not block | PASS (automated) | `commitPendingAccount` returns unchanged Draft |
| 15 generated Version modification | PASS (automated domain/UI contract) | immutable old Version; derived editable Draft; no internal code in product copy |
| 16 account types | PASS (real browser + automated) | second Binance account created as Institutional while first OKX remained Personal |
| 17 attachment context lock | PASS (real browser + automated) | OKX/module 2/purpose disabled; uploaded attachment projected only to OKX module 2 |
| 18 summary-first locations | PASS (real browser + automated) | four conditions default selected; bottom Save & Continue entered module 4 |
| 19 opt-in itemized location | PASS (real browser + automated) | only Authenticator itemized template rendered; summary retained the other three |

## Browser evidence

- `docs/evidence/v2-story17-attachment-lock.png`
- `docs/evidence/v2-story18-19-locations.png`
- Console: 0 errors, 0 warnings.
- CEO verification entry: `http://127.0.0.1:8080/web/v2/index.html`

## Automated verification

- `npm test`: 260 / 260 PASS.
- `npm run check:security`: PASS, 0 findings, 64 files scanned.
- `git diff --check`: PASS.
- No Crypto Engine, Snapshot, Recovery Kit, Archive, Schema, wallet, Arweave, remote, deployment, push, or merge change.

## SHA-256 evidence

| File | Baseline | Current |
|---|---|---|
| `web/v2/v2-app.js` | `f586c7447d294d0eebca527d9b60df5a5235f1c104499ef3a0d2270e6c637d80` | `618a488baaa6fe4489cc5b8edc241aec3489706962af8cfa69fa823a99c786d9` |
| `web/v2/v2.css` | `428188c6041c0c50a49b4ec3c505c800a0243b5c2a3f05dc972c42628deb48aa` | `c7cfc4c427df74dc594aa88c56fea6582fd62904afbabc2bfc7872c803bd0ed0` |
| `web/v2/index.html` | `caa0e79bdbf292de65c9b1e9ed1eb56699c1534519fbd87c26aa53a1aa14631b` | `cd3a7f779899f6ff5c4db3d6c7adc0c43c401f17ebd3677853e95108aea163e1` |
| `src/product-v2/application-state.js` | `5d14d65ecff256dfbafba4ba34b1218c53b72c10b57c0a9027cc7fc9dabc8cf9` | `e6800bdb9f7e1b0913837872827c7c4abf383a21300bd92a8ac664072a07beef` |
| `config/recovery-map/v2/platform-templates-v2.json` | `30037f72dcc88fd06aa2d4e61f0cf9ad353aa23f7e18af5101354ba9d16ee72d` | `90a06d2d09b6b158e3c937d2eb303780cc7bdfe67c0dd860fd3b132e2eeff81c` |
