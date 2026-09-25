# CJAS Recovery Map Codex Understanding & Architecture Gap Analysis

## Source boundary

No repository or attachment file named `CJAS Recovery Map Product & Functional Blueprint V2` was available on 2026-08-04. This analysis uses the approved V01 CEO Product Revision order, `RECOVERY_MAP_KNOWLEDGE_ACTIVATION_PRODUCT_SPEC.md`, Living Rulebook 1.1.0, and the current Decision Gate. It must be reconciled against the missing Blueprint V2 before formal implementation.

## Product invariant

Recovery Map is not a questionnaire and not a Schema editor. The filler describes a recoverable first-layer path; the future recoverer receives an account-scoped, executable map. A single canonical domain model must own account identity, selected conditions, coverage, steps, attachments and save state. One canonical validator must feed Dashboard, Review, Report and Generation Gate.

## Module 1 — Assets and accounts

1. Business purpose: create the identity and ownership boundary for every recoverable account.
2. Filler goal: add each account once and distinguish duplicates without recording secrets.
3. Recoverer goal: know which platform/account each later condition, location, step and attachment belongs to.
4. Input: platform, applicable region/account type, optional nickname; nickname becomes conditional for duplicates.
5. Output: stable `account_id` used by all downstream objects.
6. Display: one account card, no recovery-factor questions.
7. Rules: platform required; region/type conditional; nickname optional unless duplicate platform.
8. Text/attachment: attachments supplement account identification, never replace platform identity.
9. Save/edit: immediate canonical update; removing an account must fail closed or cascade only after explicit confirmation.
10. Completion: identity fields valid and duplicate accounts distinguishable.
11. Linkage: creates scopes for Modules 2–4 and Attachment Manager.
12. Dashboard: count account-specific business issues, not raw field errors.
13. Review: one issue per missing business fact with exact account target.
14. Report: account directory and all related children.
15. V01.1: UI rows live in `draft.modules`; Mapper later constructs Schema assets.
16. Gap: account identity is reconstructed across Draft, Mapper and Schema references.
17. Root cause: Schema-shaped module arrays were used as the UI domain model.
18. Recommendation: V02 canonical `Account` aggregate with stable ID and owned children.

## Module 2 — Recovery conditions

1. Purpose: declare which factors are actually required for each account.
2. Filler goal: choose applicable conditions once per account.
3. Recoverer goal: see the exact materials/factors to locate.
4. Input: configured multi-select plus optional non-secret note.
5. Output: selected condition IDs owned by an account.
6. Display: one summary card per account.
7. Rules: at least one selected; unselected conditions do not exist as instances.
8. Text/attachment: optional support only; neither replaces selection.
9. Save/edit: selection persists; deselection explicitly retires coverage references.
10. Completion: at least one valid selected condition and no required temporary state.
11. Linkage: selected IDs are the only input to Module 3.
12. Dashboard/Review/Report: all show account-scoped selected conditions.
13. V01.1: account summaries are projected into individual Schema conditions immediately before mapping.
14. Gap: UI identity (`condition-summary-*`) and Schema identity (`condition-account-factor`) differ.
15. Root cause: aggregation was added as a Draft overlay after Schema v2 froze.
16. Recommendation: keep canonical selected-condition IDs in Product Layer and map once at Snapshot boundary.

## Module 3 — Locations and finding

1. Purpose: prove every selected condition can be found.
2. Filler goal: cover conditions by itemized, summary or mixed mode without duplicate work.
3. Recoverer goal: obtain a clear, scoped lookup instruction or attachment.
4. Input: item location, summary text/attachment, explicit covered condition IDs.
5. Output: one coverage decision per selected condition.
6. Display: only selected conditions; summary-covered rows collapse visually but remain traceable.
7. Rules: each selected condition must have exactly one effective coverage result; unselected conditions ignored.
8. Equivalence: valid scoped text or attachment; itemized type/name still required in item mode.
9. Save/edit: coverage and attachment ownership update atomically; deselection cleans references.
10. Completion: coverage function returns true for every selected condition.
11. Linkage: depends only on Module 2; feeds Report and steps.
12. Dashboard/Review: aggregate missing conditions by account while retaining exact navigation anchor.
13. Report: explicitly state ITEMIZED or SUMMARY source.
14. V01.1: summary state is a root Draft side-table; individual rows also carry `covered_by_summary`.
15. Gap: the same relationship is duplicated in summary coverage arrays, location flags and attachment coverage arrays.
16. Root cause: Schema locations cannot natively express account-summary coverage.
17. Recommendation: V02 Product Layer owns one `Coverage` union; Mapper flattens it for frozen Schema only at generation.

## Module 4 — Recovery and transfer steps

1. Purpose: tell the recoverer what to do after materials are found.
2. Filler goal: provide an account-specific executable sequence.
3. Recoverer goal: follow text or an attached procedure without guessing account scope.
4. Input: step text or scoped attachment; optional risk note.
5. Output: one step plan per account.
6. Display: account cards with saved/current state.
7. Rules: text or valid attachment required; risk note optional; account save required only as a real dirty-state acknowledgement.
8. Equivalence: text and step attachment are equivalent for completion.
9. Save/edit: dirty state belongs to the account aggregate, not a free boolean copied during rerender.
10. Completion: executable content exists and current revision is saved.
11. Linkage: owned by account; references only its conditions and locations.
12. Dashboard/Review/Report: same canonical result.
13. V01.1: generated step rows, separate attachment array and mutable `saved` flag.
14. Gap: attachment equivalence and save state are recomputed outside a single aggregate.
15. Root cause: state is distributed between DOM, Draft rows and attachment collection.
16. Recommendation: V02 `Account.step` and dirty revision in the canonical store.

## Cross-surface requirements matrix

| Product requirement | Codex understanding | Current implementation | Gap | Root cause | Recommended handling |
|---|---|---|---|---|---|
| One domain model | Account aggregate owns conditions, coverage, steps and files | Module arrays + root summary table + separate attachments | Material | UI Draft mirrors Schema collections | V02 Product Layer |
| One validator | One validation result feeds every surface | Schema rules and Activation rules are merged | Material | Two rule eras coexist | Canonical Product Validator |
| Conditions only when selected | Selection defines existence | Selection is expanded during projection | Partial | Product identity changes at Mapper | Preserve selected IDs until boundary |
| Three location modes | One coverage union | Side-table + row flags + file arrays | High | Schema lacks summary coverage | Canonical Coverage union |
| Unified attachments | One manager and one owner model | UI arrays mapped to reduced Schema fields | High | Schema drops platform/account/field/coverage metadata | Product attachment DTO; Snapshot projection |
| Save/re-enter | Store canonical state, render projections | DOM collection writes module arrays | High | DOM remains a state source | Unidirectional store/actions |
| Dashboard consistency | Uses canonical issues | Uses mapped Schema plus merged Review | High | Different abstraction layer | Project canonical issues |
| Review aggregation | Business issue with exact anchor | Base and activation issues deduped heuristically | High | Error translation after validation | Native Issue Model |
| Report accuracy | Pure projection of current canonical map | Built from Draft plus separate Review/attachments | Medium | Multiple inputs can differ by revision | Report from validated snapshot of store |
| Generation gate | Same validator result and revision | Mapper strict + Review revision + Report timestamp | High | Three independent gates | One immutable validation receipt |

## Dashboard, Review and Report alignment

- Dashboard is a summary of canonical issues by module/account.
- Review is the same issue collection with explanations and exact anchors.
- Report is a content projection plus the same validation receipt.
- Generation Gate accepts only the same map revision and validation receipt.
- None of these surfaces may re-run a different rule set or infer completion from rendered HTML.

## Overall finding

Codex understands the intended business model, but V01.1 does not embody it naturally. The dominant architecture gap is not wording or styling; it is the absence of a canonical Product Layer aggregate and validator.
