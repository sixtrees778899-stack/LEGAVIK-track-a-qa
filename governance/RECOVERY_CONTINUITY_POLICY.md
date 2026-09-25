# Recovery Continuity P0

Invariant: no future release may reduce the recoverability of any previously completed Recovery Map.

The customer uses one Online Recovery Center or one Independent Recovery Tool, supplies any valid matching Recovery Kit, Mainnet Recovery Evidence and Recovery Password, and never selects a technical recovery version. Format routing is derived from authenticated material identifiers and fails closed when unsupported or mismatched.

## Release-blocking gate

Changes that can affect the Recovery Core, either recovery UI wrapper, dependency packaging, browser compatibility, build pipeline, version routing, recovery bundle or runtime loading must run:

```text
node --test tests/compatibility/recovery-continuity-p0.test.js tests/compatibility/recovery-entry-equivalence.test.js
```

Any failure is `P0 — RELEASE BLOCKED`. Warning-only and deploy-first modes are prohibited.

## Immutability and preservation

- Never modify a completed technical Recovery Format in place or silently migrate completed customer Recovery Maps.
- Add new formats through a new registry entry and keep every historical entry recoverable.
- Preserve the source, built runtime, standalone tool, manifest, SHA-256, build inputs, Golden Recovery Vectors and format documentation.
- Golden vectors contain only synthetic non-customer material.
- Preserve a known-good commit and standalone runtime hash for rollback. Rehearse rollback only with Golden vectors; no emergency history rewrite is permitted.
- Local Encrypted Backup generation and Mainnet upload remain unchanged. Local backup is not made a mandatory Essential/Standard deliverable by this policy.

Registry: `governance/recovery-format-registry.json`  
Golden vectors: `tests/fixtures/recovery-golden/`  
Shared-core mapping: `governance/RECOVERY_LOGIC_UNIFICATION.md`
