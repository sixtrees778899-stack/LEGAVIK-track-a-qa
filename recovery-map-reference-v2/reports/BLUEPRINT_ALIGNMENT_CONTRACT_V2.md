# CJAS Recovery Map V2 Blueprint Alignment Contract

Status: Proposed for CEO and Product Architect approval  
Blueprint source: `CJAS Recovery Map — Product & Functional Blueprint V2 Work Order`  
Decision Gate baseline: `4b1b7c89012b37adf63d86859cc156bcf35a66d4`  
Contract date: 2026-08-04

## Contract rule

This contract translates Blueprint V2 into an implementation boundary. It does not authorize implementation. Status values are limited to `ALIGNED`, `REQUIRES_REVISION`, `DEFERRED`, and `REJECTED`.

`ALIGNED` means the Blueprint requirement, Codex understanding, proposed V02 structure, compatibility boundary and acceptance criterion are unambiguous. It does not mean the production feature has been implemented.

## P0 alignment matrix

| ID | Blueprint requirement | Reference Prototype | Codex understanding | Proposed V02 structure | Gap / adjustment | Acceptance case | Compatibility impact | Status |
|---|---|---|---|---|---|---|---|---|
| P-01 | One module answers one question | Modules 1–4 separated | Module boundaries are product invariants | Six projections over one canonical store | Add modules 5–6 projections | Module fixtures contain only owned fields | None | ALIGNED |
| P-02 | One authoritative source per fact | One account aggregate | Canonical Store owns facts; UI is projection | Normalized entity maps keyed by stable IDs | Extend prototype to assistants/message/version | Mutation tests prove no duplicate authority | None | ALIGNED |
| P-03 | Dashboard, Review, Report and Gate share validator | Proven by invariant test | No surface may create rules | One immutable `ValidationResult` per revision | Add report-ready and statuses | Story 5 issue IDs identical everywhere | None | ALIGNED |
| P-04 | Unselected conditions create no location requirements | Proven | Selection defines condition existence | `ConditionSelection.selected_condition_ids` | None | Deselect removes coverage requirements | None | ALIGNED |
| P-05/06 | Flexible Draft; UNKNOWN/LATER block generation | Partial | Temporary state persists but is not valid completion | Typed `FieldState` owned by Product Store | Add field-state handling | Save UNKNOWN, navigate; Gate blocks once | None | ALIGNED |
| P-07/08 | Required classes explicit; optional blank never incomplete | Prototype models P0 only | Requirement classification belongs to Rulebook/Validator | Versioned field-rule registry | Add optional module rules | Empty risk/message generates no issue | None | ALIGNED |
| P-09 | Text and attachment equivalence | Proven for location/steps | Completion predicate checks either valid text or scoped file | Shared `ContentEvidence` predicate | Extend to allowed fields only | Text-only and file-only cases both pass | None | ALIGNED |
| P-10/11 | Attachment is first-class and fully scoped | Owner fail-closed proven | Attachment lifecycle is independent of controls | Canonical Attachment entity + Manager actions | Prototype lacks full capacity/lifecycle | Story 6 plus ownership mutation tests | Snapshot projection required | ALIGNED |
| P-12/13 | Explainable precise issues; no internal values in UI | Exact anchor proven | Issue carries internal navigation but projection localizes it | Unified Issue Model + UI presenter | Add user-safe serialization test | Story 5 exact focus; forbidden-token scan | None | ALIGNED |
| P-14 | No loss on rerender/upload/navigation | Memory repository proven | Store changes only through actions | Reducer-like Product Actions and immutable revisions | Add action-sequence tests | Fill→upload→switch→return equality | None | ALIGNED |
| P-15 | Duplicate-platform accounts isolated | Story 4 proven | Account ID is the ownership boundary | All child objects require account ID | None | Story 4 | None | ALIGNED |
| P-16 | Knowledge gaps are informational | Not modeled | Knowledge notice cannot become completeness issue | Separate `KnowledgeNotice[]` projection | Add notice channel | Notice leaves issue count/Gate unchanged | None | ALIGNED |
| P-17 | Recovery Report is primary recoverer output | Basic report proven | Report is account-first, read-only in recovery mode | Versioned `RecoveryReportProjection` | Extend assistants/message/files | Report snapshot tests | No Snapshot format change | ALIGNED |
| P-18 | Generated Version immutable | Not modeled | New edits fork a Draft from a generated version | RecoveryVersion state machine | Add version tests | GENERATED cannot mutate; new DRAFT references source | None | ALIGNED |
| P-19 | Living Rules versioned | Existing Rulebook | Validation result records rulebook version | Rule registry + compatibility metadata | Align version naming | Old generated version retains version | None | ALIGNED |
| P-20 | Platforms extend by config/template | Prototype uses simple names | Product actions are platform-neutral | Template registry resolves condition IDs | Add custom placeholder contract | Add platform fixture without engine edits | None | ALIGNED |
| M1 | Account module exact fields and rules | Core identity/duplicates proven | Account is the scope root | `Account` entity | Add region/type field states/timestamps | Dynamic required and duplicate cases | Snapshot custom-field projection | ALIGNED |
| M2 | One account card; multiselect; no secrets | Proven | Selection is one account-owned value | `ConditionSelection` entity | Add custom conditions and related files | Story 1 plus secret-field absence | Mapper expands at boundary | ALIGNED |
| M3 | Itemized, summary and mixed; exactly one effective coverage | Stories 1–3 proven | Coverage is a first-class union | `LocationCoverage` with mode and covered IDs | Enforce non-overlap/canonical precedence | Stories 1–3 and duplicate-coverage rejection | Flatten in Snapshot Mapper | ALIGNED |
| M4 | Text/file step; optional risk | Proven for text/file core | One instruction per account; risk never blocks | `RecoveryInstruction` | Add risk attachments and `saved_at` | Empty risk passes; scoped step required | Existing recovery step projection | ALIGNED |
| M5 | Optional assistance with conditional details | Not implemented | Choice triggers assistant requirements only for NEED | `AssistantDecision` + `Assistant[]` | Production implementation required | NO/UNKNOWN nonblocking; NEED details enforced | Existing contacts projection | ALIGNED |
| M6 | Fully optional personal message/media | Not implemented | Never part of core Gate | `PersonalMessage?` | Production implementation required | Empty module passes | Existing personal message projection | ALIGNED |
| ATT | Full Attachment Manager and technical validity | Partial add/remove/replace model | All file changes are canonical actions | Manager + capacity policy + byte verifier | Add capacity, grouping, download/view adapters | Story 6 and corrupt/zero/limit tests | Reuse byte integrity mechanism | ALIGNED |
| VAL | One Canonical Validator output contract | Proven core | Validator is pure and revision-bound | `ValidationResult` schema | Add account/module/report status | Contract tests | Schema validator remains structural backstop | ALIGNED |
| STATUS | Field/module/version states | Partial module states | State is derived except version lifecycle | Typed enums and deterministic transitions | Implement full enumerations | Transition tables | None | ALIGNED |
| DASH | Six modules and concrete reasons | Basic projection proven | Dashboard only groups canonical issues | `DashboardProjection` | Build full projection | Story 5 | None | ALIGNED |
| REVIEW | Group module→account→business issue | Core issue proven | Aggregation occurs inside validator, not UI | `ReviewProjection` from issues | Add grouped presentation | Story 5 | None | ALIGNED |
| REPORT | Account-first manual and edit/read-only modes | Basic account report | Report is revision-bound projection | Editable preview + immutable recovery view | Add complete directory/content | Snapshot/golden report tests | None | ALIGNED |
| SAVE | Actions write Store; no plaintext persistence | Memory save proven | UI never reconstructs canonical data from DOM | In-memory session store for V02 MVP | Encrypted persistence deferred | Action-sequence tests | No browser persistence | ALIGNED |
| GATE | Exact listed hard gates | Core gate proven | Gate consumes ValidationResult only | `generation_allowed && report_ready` receipt | Add report receipt revision check | Stories 1–6 | Existing artifact pipeline invoked after mapper | ALIGNED |
| TEMPLATE | Binance/OKX/Coinbase/custom configuration | Prototype supports stories | Platform affects templates, not engine branching | Versioned template registry | Build formal config schema | Template contract tests | None | ALIGNED |
| GOLDEN | Stories 1–6 | Stories 1–4; invariants approximate 5 | All are release gates | Automated product acceptance suite | Add explicit Stories 5–6 | Six named tests | Existing regression suite retained | ALIGNED |

## Deferred Blueprint items

| Item | Reason | Re-entry gate | Status |
|---|---|---|---|
| Encrypted persistent Draft | V02 MVP may remain memory-only | Separate threat model and key lifecycle approval | DEFERRED |
| Formal brand UI, mobile specialization, dark mode | Outside product correctness gate | Product Layer acceptance | DEFERRED |
| Arweave upload/mainnet | Explicitly prohibited in this phase | Separate CEO authorization | DEFERRED |
| AI support and Recovery Lab | Separate systems | Knowledge and product acceptance | DEFERRED |
| Level 2/3 recovery resilience | V02 scope is Level 1 | New Blueprint/Rulebook | DEFERRED |
| Institutional/legal flows and new platforms | Explicitly excluded | Platform expansion authorization | DEFERRED |

## Conflict and rejection register

- `REJECTED`: none.
- `REQUIRES_REVISION`: none at contract level.
- The Reference Prototype is intentionally incomplete for modules 5–6, capacity management and the full version state machine. These are implementation gaps already captured by ALIGNED contracts and acceptance cases; the prototype must not be promoted to production.

## P0 gate result

All P0 contract items: `ALIGNED`.

This document requests architecture-contract approval only. It does not request or imply V02 implementation authorization.
