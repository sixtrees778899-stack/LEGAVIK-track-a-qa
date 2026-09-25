# Recovery Map V2 → SKREK UI Mapping

This mapping is the implementation contract. Frozen V2 remains authoritative for behavior, fields, state, validation and projections. SKREK Product Experience V1 remains authoritative for visual language.

| Module | Frozen behavior and fields | Old engineering presentation | New SKREK component |
|---|---|---|---|
| 1. 资产与账户 | Accounts, platform, region, Personal/Institutional type, label, add/remove cascade and account isolation | Engineering fieldsets and status cards | `AggregatedAssetSelector`, selected-asset chips, account detail cards, searchable category filters, custom-asset drawer |
| 2. 恢复条件 | Per-account condition choices, optional notes, account-scoped attachment entry | Dense checkbox fieldsets | `RecoveryConditionsForm`, modern option tiles, requirement badges, contextual help rail |
| 3. 位置与查找 | Summary, itemized and mixed coverage, selected-condition-only requirements | Plain coverage fields | `LocationCoverageComposer`, summary-first card, opt-in item detail panels, contextual attachment action |
| 4. 恢复与转移步骤 | Per-account instruction, optional risk note, attachment alternative and unified save | Plain textarea fieldsets | `RecoveryStepsEditor`, numbered account cards, safety callout, attachment action |
| 5. 协助人 | Need/not needed/unknown decision and permission-boundary fields | Engineering select and fieldset | `AssistanceDecision`, segmented decision control, conditional trusted-person panel |
| 6. 给未来恢复人的嘱托 | Optional text and attachment | Plain textarea | `FutureMessageEditor`, calm message card and media attachment action |

## Shared application mapping

| Frozen capability | SKREK presentation |
|---|---|
| One active Draft / revision sequence | Customer-facing save indicator: 未保存 / 正在保存 / 已保存 |
| Six-module flow | Modern horizontal stepper with current, completed and future states |
| Dashboard projection | Focused Recovery Compass overview with one recommended next action |
| Canonical Validator | Human-readable “需要补充” issues; engineering names remain hidden |
| Review projection | Customer Preview / final confirmation with exact edit actions |
| Recovery Report | Account-first Preview content after six modules |
| Attachment Manager | Unified SKREK drawer/page with customer labels and policy guidance |
| Previous / Continue | Sticky action bar: 返回、保存草稿、保存并继续 |
| Generation Gate | Payment/create entry only after the complete Preview |

No data-model or frozen structure change is authorized by this mapping.
