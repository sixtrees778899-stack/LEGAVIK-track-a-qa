# Canonical Product Domain Model V2 — Draft

## Aggregate root

```text
RecoveryMapDraft
  draft_id
  draft_revision
  rulebook_version
  source_version_id?
  title
  accounts: Map<AccountId, Account>
  condition_selections: Map<AccountId, ConditionSelection>
  location_coverages: Map<CoverageId, LocationCoverage>
  recovery_instructions: Map<AccountId, RecoveryInstruction>
  assistant_decision
  assistants: Map<AssistantId, Assistant>
  personal_message?
  attachments: Map<AttachmentId, Attachment>
  created_at
  updated_at
```

All IDs are stable opaque Product IDs. Collections are normalized in the Store; selectors may expose arrays. UI never creates Schema v2 or Snapshot entities.

## Account

```text
account_id
platform_id
platform_name
region: FieldValue
account_type: FieldValue
display_label
created_at
updated_at
```

`FieldValue = { state: EMPTY|UNKNOWN|LATER|VALID|INVALID, value? }` is used only where temporary states are allowed. Platform ID itself cannot be UNKNOWN at generation.

## ConditionSelection

```text
account_id
selected_condition_ids[]
custom_conditions[{ condition_id, label }]
optional_notes
related_attachment_ids[]
updated_at
```

Unselected template options are not domain objects and cannot create downstream requirements.

## LocationCoverage

```text
coverage_id
account_id
mode: ITEMIZED|SUMMARY
covered_condition_ids[]
location_type?
location_name?
description?
attachment_ids[]
created_at
updated_at
```

Mixed mode is represented as multiple non-overlapping ITEMIZED and SUMMARY coverage entities. For each selected condition, the validator requires exactly one effective coverage entity. Duplicate coverage is invalid, not silently prioritized.

## RecoveryInstruction

```text
account_id
instruction_text?
instruction_attachment_ids[]
optional_risk_notes?
optional_risk_attachment_ids[]
saved_at?
updated_at
```

## Assistant and message

```text
AssistantDecision = NOT_SET|NEED|NOT_NEEDED|UNKNOWN
Assistant { assistant_id, role, contact_timing, allowed_help, permission_boundary }
PersonalMessage { text?, attachment_ids[], updated_at }
```

## RecoveryVersion

```text
version_id
version_number
status: DRAFT|REVIEW_READY|GENERATED|SUPERSEDED|ARCHIVED
source_version_id?
draft_revision
rulebook_version
created_at
generated_at?
```

Generated content is immutable. Editing creates a new Draft with a source version reference.

## Invariants

1. Every child account reference resolves exactly once.
2. Every selected condition has a stable ID unique within its account.
3. Coverage IDs are unique and cover selected conditions only.
4. A selected condition has exactly one effective coverage.
5. Every attachment has one explicit account and module owner.
6. Attachment coverage references belong to the same account.
7. Every account has exactly one instruction aggregate.
8. No Product Action can mutate a generated version.
