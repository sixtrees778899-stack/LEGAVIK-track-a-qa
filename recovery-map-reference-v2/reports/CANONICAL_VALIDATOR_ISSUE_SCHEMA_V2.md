# Canonical Validator and Issue Schema V2 — Draft

## Input and output

```text
validate(store, rulebook, platform_templates, attachment_policy)
→ ValidationResult
```

```text
ValidationResult
  draft_id
  draft_revision
  rulebook_version
  account_statuses{}
  module_statuses{}
  validation_issues[]
  knowledge_notices[]
  generation_allowed
  report_ready
  validated_at
```

Knowledge notices are a separate non-completion channel and never increment incomplete counts.

## ValidationIssue

```text
issue_id
issue_code
severity: WARNING|BLOCKING|DATA_ERROR|SECURITY
module_id
account_id?
condition_id?
field_id
business_message
why_required
completion_method
missing_parts[]
navigation_anchor
blocking
```

`issue_id` is stable for the same business fact. One location issue may aggregate missing type, name and text/file evidence in `missing_parts`; the UI must not split those into three business issues.

## Status derivation

- Field: `EMPTY`, `UNKNOWN`, `LATER`, `VALID`, `INVALID`.
- Module: `NOT_STARTED`, `IN_PROGRESS`, `SUGGESTED`, `COMPLETE`, `VERIFIED`.
- Optional empty fields are excluded from status derivation.
- `VERIFIED` requires separate drill evidence; it is never inferred from form completion.

## Required rule groups

1. Account identity and duplicate-account distinction.
2. At least one selected condition per account.
3. Exactly one effective coverage per selected condition.
4. Text or valid scoped instruction attachment per account.
5. Attachment technical and ownership integrity.
6. Required temporary states blocked at Gate.
7. Assistance conditional details when decision is NEED.
8. Referential integrity and generated-version immutability.

Dashboard, Review, Report and Gate may filter or group issues but may not create, upgrade or downgrade them.
