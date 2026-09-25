# Recovery Report Projection V2 — Draft

## Projection contract

Input: canonical Store + ValidationResult for the same Draft revision.  
Output: immutable, account-first `RecoveryReportProjection`.

```text
RecoveryReportProjection
  report_id
  draft_id
  draft_revision
  version_number
  title
  created_at
  updated_at
  completion_status
  verification_status
  account_count
  attachment_count
  directory
  accounts[]
  assistance
  personal_message
  attachment_directory[]
  edit_targets?       // preview mode only
```

Each account section contains identity, selected conditions, resolved location coverage, recovery instruction, optional risk notes and scoped attachments.

## Modes

- `PREVIEW_EDITABLE`: includes exact edit targets; any edit invalidates this projection.
- `RECOVERY_READ_ONLY`: no edit controls or internal rule data; used after recovery.

The report never displays raw IDs, issue codes, rule IDs, Scope metadata, null/undefined values or product variable names.

`report_ready` requires a structurally complete projection for all accounts. It does not require optional assistance, personal message or risk notes.
