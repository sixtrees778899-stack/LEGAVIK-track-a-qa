# CJAS Recovery Map V2 CEO Experience Incident — Root Cause Report

Date: 2026-08-04  
Status: CEO Experience FAIL; CEO retest stopped

## 1. Account present in module 1 but absent in module 2

`web/v2/v2-app.js` created the authoritative object with a top-level `let store=createRecoveryMapDraft(...)`. Module buttons inside one loaded document read that same object. However, the header product name was a real link with `href="./"`. Clicking it navigated/reloaded the document, executed the module again and created a new empty Draft at revision 0. A new tab or manual reload had the same result. There was no route guard, application-shell home action or visible warning separating internal navigation from document reload. Module 2 therefore correctly read the newly created empty Store, not the account created in the previous application instance.

There was not one Store per module. There was one Store per loaded browser document. That boundary was invisible to the user and made the product flow unreliable.

## 2. Canonical Store continuity

Within a single untouched document, Dashboard, six modules, Review and Report referenced one variable. This was insufficient as an application architecture because navigation affordances could replace that document, and there was no continuous next-step controller. The Canonical Store existed as a domain object but was not protected by a real Application Shell.

## 3. Attachment scope failure

`src/product-v2/attachment-manager.js` rejected an upload with `ATTACHMENT_SCOPE_INVALID` when any of these values was empty:

- `module_id`
- `field_or_condition_id`
- `purpose`

The old Attachment Manager required the user to type `field_or_condition_id`, purpose text and comma-separated condition IDs. The default field value was empty, so an otherwise valid account and file predictably failed. The catch handler displayed `error.message` unchanged, exposing the internal error code.

The manager also failed to project platform templates into business controls. Condition IDs were accepted as free text instead of being rendered as labels and checkboxes from the account's selected conditions.

## 4. Why the prior tests missed it

The 239-test suite primarily exercised Product Actions, Store, Validator, projections, Mapper and artifact pipeline through direct JavaScript fixtures. Those tests proved domain behavior but did not prove that a person could traverse the UI.

The earlier browser check did use the CEO URL `/web/v2/index.html`, but it manually opened module cards and did not test:

- header/home navigation;
- a required Save-and-continue path;
- module-local upload;
- the Attachment Manager's empty developer field;
- delete and replace through the visible UI;
- re-entering every module after a full flow.

It also used direct Store fixtures for Golden Stories and the independent recovery assertion. The browser and CEO entry URL were the same, but the exercised interaction path was not the CEO path. Reporting that result as product readiness was incorrect.

## 5. Corrective architecture

V2 now uses one visible Application Shell around one loaded Store, one active Draft and one revision sequence. Home, step navigation, Dashboard, Review, Report and Attachment Center are application actions rather than document navigation. The header no longer reloads the application.

The shell exposes the ordered flow:

1. 资产与账户
2. 恢复条件
3. 位置与查找
4. 恢复与转移步骤
5. 协助人
6. 给未来恢复人的嘱托
7. Review
8. Recovery Report

Each module shows previous, Save and continue, Dashboard and the current Draft revision. Refresh persistence remains intentionally out of scope and is stated explicitly.

## 6. Attachment correction

Location attachments can be uploaded inside the location module. Account, module, purpose, field association and condition IDs are derived from the current account and platform template. The user selects business labels only. Attachment Center is a secondary management view with business selectors; it no longer exposes IDs, owner references, scope fields or comma-separated values. Internal attachment errors are mapped to Chinese business instructions.
