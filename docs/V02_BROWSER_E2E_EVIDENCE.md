# Recovery Map V02 Browser E2E Evidence

Date: 2026-08-04  
Target: `http://127.0.0.1:8080/web/v2/index.html`  
Browser surface: Codex in-app Chromium browser

## CEO incident reconstruction result

- CEO entry and automated-test entry were both `http://127.0.0.1:8080/web/v2/index.html`.
- Dashboard opened with one canonical Draft revision and one eight-step Application Shell.
- Added a Binance Australia personal account with a Chinese/emoji display label.
- Used only visible UI controls; no Store or fixture was injected into the page.
- Clicked Save and continue from module 1 and confirmed module 2 displayed `Binance · 主账户`.
- Saved and re-entered modules 1–4 through the shell without reconstructing UI state.
- Selected recovery conditions and confirmed unselected conditions created no location rows.
- Exercised SUMMARY and ITEMIZED coverage together; three summary-covered rows disappeared and only Authenticator stayed itemized.
- Uploaded, replaced, deleted and re-uploaded a location attachment inside module 3.
- Review returned to the exact account/module/field target.
- Saved recovery instructions and confirmed the Report displayed the same text.
- Dashboard, Review, Report and Generation Gate converged on the same complete validation receipt.
- A valid recovery password and acknowledgement generated Recovery Kit and Archive artifacts locally.
- The generated Version was shown as immutable with a separate new-Draft action.
- Deliberately removed the Authenticator location. Dashboard and Review exposed one business Issue; precise navigation focused the correct fieldset; restoring it cleared the Issue.
- Browser error/warning log after the complete verified flow: 0 entries.

## Regressions found and closed during E2E

1. Header navigation reloaded the document and created a new Draft. It is now an Application Shell action.
2. Attachment upload exposed empty internal scope fields. Scope is now derived from business choices.
3. Browser file replacement retained old bytes while validating the new length. Replacement now discards old bytes before hashing the new file.
4. Module 6 omitted the shared flow binding. It now participates in the same Save-and-continue controller.
5. Condition/location changes cleared an unrelated saved instruction flag. Cross-module invalidation was removed; Draft revision still invalidates old Review receipts.

## Complementary automated evidence

The Node test suite covers Golden Stories 1–6, fixed canonical fixtures, attachment add/replace/delete, Snapshot mapping, Kit and Archive creation, independent recovery, historical v1/v2 recovery, persistent-storage prohibition and security boundaries. Safari remains a CEO/manual compatibility gate; no Safari execution is claimed by this document.

## Evidence files

- `CEO_FLOW_UNCUT.mp4`: 88.54-second uninterrupted capture, spatially cropped to the browser panel to exclude unrelated desktop content; the timeline was not cut.
- `00-dashboard-start.png` through `17-review-fixed-zero.png`: step screenshots.
- `CEO_FLOW_EVIDENCE.json`: revision and Store projection summary.
- `console-log.json`: final warning/error log.
- `tests/product-v2/CEO_FLOW_E2E_SCRIPT.md`: exact visible-control replay script.
