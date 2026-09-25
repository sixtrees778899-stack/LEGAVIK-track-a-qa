# Current V01.1 Data Flow Audit

## Audited path for one Draft

Example: Binance personal account, four selected conditions, two summary-covered conditions, two itemized locations, one recovery step and one attachment.

| Stage | V01.1 representation | Transformation/risk |
|---|---|---|
| DOM/UI | Generic fieldsets, summary controls outside normal entry rows, separate file inputs | DOM is temporarily authoritative; generic collector does not own summary controls or files |
| Draft | Six module arrays plus root `location_summaries`, `rulebook_version`, `version_state`; attachments remain a separate variable | One business aggregate is split across several roots |
| Synchronizer | Rebuilds condition summaries, generated locations and steps from accounts | Rebuild can discard state not explicitly copied and changes IDs/shapes |
| Projection Mapper | Expands account summary into four individual condition rows; converts summary coverage into synthetic location text | UI semantics are rewritten before Schema validation |
| Schema Validator | Validates flattened Knowledge Schema v2 structure and generic references | Cannot understand native summary/mixed Product semantics |
| Base Rule Engine | Checks generic asset-condition-location-step rules | Reports Schema-level missing facts |
| Activation Rule Engine | Re-evaluates account selections, locations, attachments, save state and region guidance | Reports Product-level versions of similar facts |
| Module Status | Calculates content from mapped Schema collections, using merged Review override | Status content source and issue source are different layers |
| Dashboard | Groups merged issues by module | Counts remain sensitive to translation/dedupe keys |
| Review | Displays merged base + activation issues | Navigation target may refer to projected entity, summary entity or account entity |
| Report | Reads Draft, separate attachments and Mapper Review | Can show Draft content that does not equal projected Knowledge semantics |
| Generation Gate | Requires Report timestamp, Review revision, strict Mapper, Schema/rules and attachment capacity | More gates than the visible completion model |

## Why the UI can look complete while Review fails

The UI considers visible summary coverage or saved controls. Generation validates a synchronized and projected copy. Hidden legacy fields, synthetic condition/location rows and generic Schema rules can reject that copy even when the visible form appears complete. Dashboard status is calculated after mapping, not from the exact UI action state.

## Why unselected conditions produced required errors

Earlier synchronizers instantiated every platform-template condition. Module 3 and base rules therefore saw real condition objects even when the user had not selected them. V01.1 reduced this but retained the projection pattern, so the architecture still permits this class of regression.

## Why attachment owner references are lost or weakened

UI attachments carry `platform_id`, `account_id`, `field_id`, `purpose_id` and `coverage_condition_ids`. Schema v2 attachment mapping keeps only `module_refs`, `owner_entity_refs`, display/technical fields and a free-text purpose. Account/field/coverage semantics therefore exist only before the Snapshot boundary and must be reconstructed or inferred later.

## Why exact navigation fails

Issues may target:

- account IDs;
- summary row IDs;
- projected condition IDs;
- generated location IDs;
- generic Schema field names.

`renderModule` can focus only a DOM entry whose `data-entity-id` equals the issue target and a rendered control whose `data-field` equals its field. Summary controls live outside those normal entry fieldsets, and aggregate issues may target a different identity. The target is syntactically present but not always resolvable in the rendered page.

## Why errors repeat

The base Rule Engine and Activation Rule Engine validate overlapping facts. A heuristic ignore list removes selected codes and a string key deduplicates the rest. Any new code, different entity ID, different field ID or translated condition label bypasses deduplication, causing the same business gap to reappear.

## Why optional fields enter blocking

Requirement classes are presentation metadata, but generic Schema rules use Schema semantics such as risk level, fallback path and structural requirements. The Product Layer later reclassified some fields as optional without removing all legacy semantic paths. Optionality is therefore not owned by one validator.

## Why summary mode still renders itemized templates

The synchronizer always generates one location row per selected condition. Summary coverage only marks generated rows `covered_by_summary` and the UI hides them conditionally. The rows still exist because the frozen Schema expects individual location references. Summary mode is a visual overlay, not a first-class domain variant.

## Architectural conclusion

V01.1 is a chain of adapters around a Schema-shaped Draft. The correct flow is:

```text
UI actions
→ Canonical Product Store
→ Canonical Validator + Issue Model
→ Dashboard / Review / Report / Gate projections
→ Snapshot Mapper
→ frozen Schema Validator
→ Crypto / Kit / Archive
```

Schema validation remains a final structural safety boundary, but it must not be the product completion engine.
