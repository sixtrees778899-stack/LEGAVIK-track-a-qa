# Snapshot Mapper Boundary V2 — Draft

## Boundary

The Snapshot Mapper is the only adapter allowed to translate a validated Canonical Product Store into frozen Knowledge Schema v2 input.

```text
Canonical Store
+ matching Validation Receipt
→ Product-to-Schema Mapper
→ Knowledge Schema v2 Validator
→ existing Snapshot Builder
→ existing Crypto / Kit / Archive pipeline
```

## Preconditions

- Receipt draft ID/revision/rulebook version exactly match the Store.
- `generation_allowed` and `report_ready` are true.
- Attachments have validated bytes and ownership.
- Store is not a generated immutable version.

## Mapping rules

- Account becomes one Schema asset.
- Selected conditions become Schema recovery conditions only at this boundary.
- Summary/mixed coverages flatten into Schema-compatible location records and references without changing Product identities.
- Account/field/coverage attachment metadata remains in the Product report and is mapped to the narrow existing Schema fields required for recovery.
- Instructions become account-scoped recovery steps.
- Assistance/message map to existing contacts/personal-message fields.

## Fail-closed behavior

Any lost ownership, ambiguous coverage, dangling reference, duplicate ID or Schema rejection aborts before cryptographic generation. Mapper failure is a data/compatibility error, not a second product Review.

## Frozen-component conclusion

No Blueprint requirement currently requires changes to Knowledge Schema v2, Snapshot format, Crypto Engine, Recovery Kit or Archive. If future recovery output must preserve Product-only attachment metadata inside the encrypted Snapshot, that requires a separate compatibility proposal; it is not authorized by this contract.
