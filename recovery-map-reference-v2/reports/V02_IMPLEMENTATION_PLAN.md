# V02 Directory, Files and Implementation Plan — Draft

## Proposed production layout

```text
src/product-v2/
  domain/
    recovery-map-draft.js
    account.js
    condition-selection.js
    location-coverage.js
    recovery-instruction.js
    attachment.js
    recovery-version.js
  actions/
    account-actions.js
    condition-actions.js
    coverage-actions.js
    instruction-actions.js
    attachment-actions.js
    version-actions.js
  validation/
    canonical-validator.js
    issue-model.js
    status-model.js
  projections/
    dashboard-projection.js
    review-projection.js
    recovery-report-projection.js
  mapping/
    snapshot-mapper.js
    legacy-draft-importer.js
  store/
    memory-product-store.js
config/recovery-map/v2/
  product-model-v2.json
  platform-templates-v2.json
  living-rules-v2.json
web/v2/
  index.html
  app.js
tests/product-v2/
  golden-stories.test.js
  action-invariants.test.js
  validator-contract.test.js
  attachment-manager.test.js
  snapshot-compatibility.test.js
```

This is planning only; none of these production files are created in the Blueprint phase.

## Phases

1. **Contract freeze**: approve Blueprint, Alignment Contract, domain and Issue schemas.
2. **Domain core**: Store, Product Actions, invariants and Canonical Validator; no UI.
3. **Attachment and coverage**: first-class manager, capacity and three modes.
4. **Projections**: Dashboard, Review, Report and Gate from one ValidationResult.
5. **Product UI**: modules 1–6 over Product Actions only.
6. **Snapshot boundary**: mapper into frozen Schema v2 and stable artifact pipeline.
7. **Legacy importer**: best-effort, versioned and fail-closed.
8. **Acceptance**: Stories 1–6, full historical recovery suite, security scan and CEO Chrome/Safari experience.

## Stop gates

- Any proposed frozen Schema/format change requires a separate compatibility decision.
- Product UI cannot begin before domain/action/validator tests pass.
- Artifact integration cannot begin before all six Golden Stories pass at Product Layer.
- No platform expansion, Arweave activity, AI, deployment, push or merge is included.

## Current compatibility finding

There is no identified requirement that forces a frozen Schema v2 change. The Product Layer can retain richer semantics and flatten them at the Snapshot Mapper boundary. This remains subject to implementation proof and compatibility tests.
