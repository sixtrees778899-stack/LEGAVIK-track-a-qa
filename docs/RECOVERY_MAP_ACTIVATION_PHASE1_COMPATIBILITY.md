# Recovery Map Knowledge Activation Phase 1 — Compatibility Contract

Status: approved implementation design boundary

## V01.1 aggregation and Report projection

Rulebook 1.1.0 keeps account-level condition selections and location-summary coverage in Draft/UI. Mapper expands those selections into existing Schema v2 recovery conditions and Location references. Attachment coverage uses existing owner references plus Draft-only coverage metadata. Recovery Map Report is a presentation model and is not added to Snapshot. Generated Versions remain immutable; edits create a new Draft and Version.

## Frozen boundaries

- Knowledge Schema v2 remains byte-identical.
- Snapshot, Crypto Engine and Recovery Kit formats remain unchanged.
- v1 dispatch and independent recovery remain unchanged.

## Draft-only additions

The in-memory v2 Draft may contain two optional presentation properties:

- `activation_context`: platform, registration geography, personal/institutional account answer, App/Web mode, enabled security factors and selected recovery path.
- `recovery_drill`: user-recorded checklist states only. It never performs a login, API request or transaction.

They are not persisted in browser storage. Older Drafts without these properties continue through the existing generic Mapper path.

V01 adds only optional Draft presentation fields: account platform/region/type/nickname, condition readiness state, generated condition-to-location references, per-account step cards, object-save markers and attachment ownership metadata. A migration normalizer accepts the earlier Phase 1 fields (`label`, `exists`, `client_mode`, `enabled_factors`, `selected_path`, `availability`, and fallback text) but no longer renders or requires them.

## Mapper projection

- Platform and scope context is projected into the existing asset `platform_hint` and limited `custom_fields` records.
- Each recovery condition uses the existing `asset_refs` relationship and is never attached to every account by default.
- A location is linked from its exact recovery condition through the existing `recovery_conditions.location_refs` relationship. No Schema field is added to `locations`.
- Per-account recovery steps use the existing `recovery_steps.asset_refs`; attachment-only instructions receive a deterministic, non-secret system description required by the frozen Schema.
- Attachment Draft metadata (`platform_id`, `account_id`, `field_id`, `purpose_id`) is projected to existing `module_refs`, `owner_entity_refs` and `purpose` fields. The extra Draft metadata is not added to Schema v2.
- Drill states are projected into existing `custom_fields` under `recovery-order-exceptions`.
- Internal Claim/Rule/Source identifiers are used only while selecting configuration. They are not written into customer-facing Snapshot fields.

## Fail-closed contract

The Mapper rejects unsupported platforms, institutional products, stale/non-Approved deterministic knowledge, cross-region policy reuse, missing account relationships and direct-account-takeover paths before Snapshot construction. Existing Schema v2 validation then runs unchanged.
