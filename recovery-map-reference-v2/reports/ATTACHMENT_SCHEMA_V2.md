# Attachment Object Schema V2 — Draft

```text
Attachment
  attachment_id
  file_name
  mime_type
  byte_length
  sha256
  module_id
  platform_id
  account_id
  field_or_condition_id
  purpose
  covered_condition_ids[]
  created_at
  updated_at
  technical_status: VALID|INVALID
```

## Required invariants

- `byte_length > 0` and equals actual bytes.
- SHA-256 is a normalized 64-character lowercase hex digest of actual bytes.
- MIME and filename are present and sanitized at download.
- Account exists; platform matches that account.
- Module and field/condition ownership is allowed by the rulebook.
- Covered conditions are selected by the same account.
- Count, per-file and version capacity limits pass.
- No Store commit occurs before the full byte read and hash complete.

## Manager behavior

- Purpose is selected before upload.
- View/download use validated bytes and safe ObjectURL lifecycle.
- Replace is atomic and retains ownership unless explicitly changed.
- Delete removes all reverse references in one action.
- Reassignment revalidates platform, account, field and coverage together.
- Every successful mutation increments Draft revision and invalidates Review/Report receipts.

The existing byte-integrity and recovery mechanisms remain the implementation dependency; this Product schema does not modify their formats.
