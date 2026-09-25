# Legacy Draft Importer Strategy V2 — Draft

## Scope

Generated v1/v2 Snapshots are never imported or rewritten. This strategy applies only to ungenerated V01/V01.1 in-memory/exported Drafts if a supported source becomes available.

## Import pipeline

```text
detect source version
→ parse without mutation
→ validate legacy shape
→ map explicit facts
→ resolve references
→ emit MigrationResult
→ require user Review
```

```text
MigrationResult
  source_version
  canonical_draft?
  migrated_facts[]
  warnings[]
  rejected_facts[]
  blocking_ambiguities[]
  requires_user_review: true
```

## Rules

- Never infer a selected condition solely because a template row existed.
- Never infer summary coverage from a hidden UI row without explicit coverage IDs.
- Never move an attachment when account ownership cannot be proven.
- Preserve stable IDs only when valid and unambiguous; otherwise create new Product IDs and record correspondence.
- Optional blanks are dropped, not converted into temporary states.
- Legacy `saved` flags do not prove Product completeness.
- Any ambiguous account, condition, location or attachment remains a blocking migration warning.

## Acceptance

- Source Draft remains byte-identical.
- Repeated import is deterministic.
- Import never broadens ownership.
- Imported Draft cannot generate until Canonical Validator passes and the user completes Review.
