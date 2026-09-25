# Product Actions V2 — Draft

Every action accepts `expected_revision`, validates preconditions, returns a new Store revision and invalidates any prior Validation Receipt.

## Draft/version

- `CreateRecoveryMapDraft`
- `RenameRecoveryMap`
- `CreateDraftFromVersion`
- `MarkReviewReady`
- `MarkGenerated`
- `ArchiveVersion`

## Accounts

- `AddAccount`
- `UpdateAccountIdentity`
- `RemoveAccount` — requires explicit cascade confirmation
- `SetAccountTemporaryState`

## Conditions

- `SetSelectedConditions`
- `AddCustomCondition`
- `RenameCustomCondition`
- `RemoveCustomCondition`
- `UpdateConditionNotes`

Condition removal atomically removes or flags related coverage and attachment coverage references; it never leaves dangling references.

## Locations

- `AddItemizedCoverage`
- `AddSummaryCoverage`
- `UpdateCoverage`
- `ChangeCoverageMode`
- `RemoveCoverage`
- `AssignCoveredConditions`

Overlapping effective coverage is rejected before commit.

## Instructions, assistance and message

- `UpdateRecoveryInstruction`
- `SetInstructionAttachments`
- `UpdateOptionalRiskNotes`
- `ConfirmInstructionSaved`
- `SetAssistantDecision`
- `AddAssistant`
- `UpdateAssistant`
- `RemoveAssistant`
- `UpdatePersonalMessage`

## Attachments

- `PrepareAttachmentUpload`
- `CommitValidatedAttachment`
- `ReplaceAttachment`
- `RemoveAttachment`
- `ChangeAttachmentPurpose`
- `ReassignAttachmentAccount`
- `ReassignAttachmentFieldOrCondition`
- `SetAttachmentCoverage`

Files enter the Store only after technical validation succeeds. Replacement is atomic: failure preserves the old attachment.

## Validation/report

- `ValidateDraft` — pure query, no mutation
- `BuildDashboardProjection`
- `BuildReviewProjection`
- `BuildRecoveryReportProjection`
- `RequestGenerationReceipt`

The last four consume the same `ValidationResult` for the same revision.
