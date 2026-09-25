# CJAS Recovery Map Product Rulebook V1

## Authority

- `rulebook_version`: 1.1.0
- `effective_date`: 2026-08-04
- `status`: ACTIVE
- `supersedes`: Recovery Map V01 rules at commit `b7f9fb547c4db5c9530ab0bbd297cc1b98931ae4`
- `approved_by`: CEO; Product Architect
- `affected_modules`: six Recovery Map modules, Dashboard, Review, Attachment Center and Recovery Map Report

This file and `config/recovery-map/v2/product-rules-v1.json` are the current product-rule authority. A rule change requires approval, a version increment, change history, synchronized configuration/Mapper/Rule/UI/tests, and an explicit compatibility statement. Generated Versions retain the rules in force when they were created.

## Compatibility

Knowledge Schema v2, Snapshot, Crypto Engine and Recovery Kit formats remain unchanged. Account-level condition selections and location coverage exist in Draft/UI and are projected by Mapper into existing condition, location and attachment references. Old Draft fields are migration input; old Snapshots are never rewritten.

## Six modules

1. Assets and accounts identifies each account.
2. Recovery conditions uses one aggregate card per account and requires at least one configured condition.
3. Locations shows selected conditions only and supports itemized, summary and mixed coverage.
4. Recovery and transfer steps requires text or a correctly scoped attachment; risk notes are optional.
5. Assistance is optional overall; details become conditionally required only after “Yes”.
6. Message to the future recoverer is optional and never blocks generation.

Attachment Center and Recovery Map Report are independent surfaces.

## Requirement matrix

| Module | Field | Classification | Completion |
|---|---|---|---|
| Assets | platform | REQUIRED | concrete configured value |
| Assets | registration geography, account class | CONDITIONALLY_REQUIRED | required for activated custodial platforms |
| Assets | nickname | OPTIONAL; CONDITIONALLY_REQUIRED for duplicate platform accounts | non-empty when triggered |
| Conditions | selected conditions | REQUIRED | at least one configured condition |
| Conditions | notes, attachments | OPTIONAL | never block |
| Locations | condition coverage | REQUIRED | every selected condition covered |
| Locations | type and name | REQUIRED in itemized mode | concrete values |
| Locations | finding instructions | CONDITIONALLY_REQUIRED | text or valid scoped attachment |
| Locations | summary coverage | CONDITIONALLY_REQUIRED in summary/mixed mode | one or more conditions plus text/attachment |
| Steps | recovery and transfer steps | REQUIRED | text or valid scoped attachment |
| Steps | risk notes and risk attachments | OPTIONAL | never block |
| Assistance | assistance choice | OPTIONAL | may be empty/No/Unknown |
| Assistance | role, timing, scope and boundary | CONDITIONALLY_REQUIRED | required only for Yes |
| Message | text and media | OPTIONAL | never block |

`UNKNOWN` and `LATER` may be saved and navigated away from, but any triggered required field in either state blocks final generation.

## Attachments, status and Review

An attachment must be readable, non-empty, within count/size/capacity limits, have MIME, byte length and SHA-256, and have unambiguous module/account/field/purpose ownership. Location summaries also record covered condition IDs. Ordinary missing information is “未完成”, not risk. Knowledge-scope fallback is informational and non-blocking. Review issues carry platform, account, module, field/condition, state, reason, fix and exact target; identical missing facts are deduplicated.

## Report and Versions

Recovery Map Report is generated from the current Draft and Mapper output before final Review. Report items link to exact editors. After artifact generation, edits start a new Draft and complete new Version; existing Versions remain immutable.
