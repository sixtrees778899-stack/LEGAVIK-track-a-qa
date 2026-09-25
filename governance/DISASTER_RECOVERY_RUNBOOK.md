# LEGAVIK Minimal Disaster Recovery Runbook

Use these records as the only recovery authority:

- `governance/release-manifest.json`
- `governance/APPROVED_BASELINES.md`
- `governance/COMPATIBILITY_MATRIX.md`
- `governance/artifact-provenance.json`
- `governance/external-config-snapshot.json`

Never place credentials, customer data, Recovery Materials or Recovery Passwords in recovery evidence.

## 1. Select the recovery baseline

1. Select a milestone from the Approved Baseline Index.
2. Copy its exact Freeze/Backup Tag, commit SHA, release ID and branch from the Release Manifest.
3. Confirm the migration head and external-config snapshot are known.
4. Confirm the required compatibility rows are `PASS` for that commit.
5. Record the current production release before proceeding.

**Gate:** Tag, commit, release, migration and compatibility identities are all known and mutually consistent. Otherwise STOP.

## 2. Clean checkout

Use a new isolated directory; do not reset or overwrite an existing working tree.

```sh
git clone https://github.com/sixtrees778899-stack/CJAS.git <isolated-directory>
cd <isolated-directory>
git fetch --tags --prune
git checkout --detach refs/tags/<target-freeze-or-backup-tag>
git status --porcelain
git rev-parse HEAD
```

Require an empty status and an exact match with `<expected-commit-sha>`. Never force-push, move a Tag, rebase or rewrite history.

## 3. Verify identities

Confirm before building:

- checked-out commit = Manifest commit;
- Tag resolves to the same commit;
- target release ID matches the selected Manifest entry;
- target branch is recorded but is not rewritten or force-updated;
- migration and external-config records exist for the target.

**Gate:** Any identity mismatch means STOP.

## 4. Build

1. Restore the dependency versions locked by the selected commit.
2. Run the build procedure recorded by that release.
3. Do not substitute newer dependencies, assets or configuration.
4. Calculate built artifact SHA-256 values using the method in `artifact-provenance.json`.

**Gate:** Build completes and expected artifact identities are reproducible. A missing build procedure or unexplained SHA difference means STOP.

## 5. Necessary tests

Run only the test/evidence sources named for the selected baseline in the Compatibility Matrix:

- target V1/V2/current recovery rows;
- Kit/Evidence compatibility;
- Attachment Contract and Version RPC where applicable;
- Create, Update and Recovery regression rows;
- repository secret scan.

Do not perform a Mainnet broadcast. Record command, commit and result. Any required `FAIL` or new security finding means STOP.

## 6. Isolated/staging deployment

1. Deploy the checked-out build to a new isolated/staging destination.
2. Do not overwrite production.
3. Record staging URL, deployed commit, release ID and deployment time.
4. Verify Homepage, Auth, Customer Center, Create, Update and Recovery.
5. Verify visible release identity and compare Built SHA with Deployed and Downloaded SHA.

**Gate:** Required routes render, console has no blocking error, and required artifact SHA values match.

## 7. Compatibility Gate

All compatibility rows required by the selected baseline must remain `PASS` in staging. In particular, the rollback application must still recover every historical V1/V2/current format claimed by that baseline. Do not weaken tests or compatibility rules.

## 8. Supabase migration and external configuration

Code rollback does **not** roll back the database.

1. Compare the target migration head with the current remote head.
2. Default policy: never automatically downgrade, delete or reverse a migration.
3. If heads differ, determine compatibility without changing remote state.
4. Compare Auth Email, From Name, redirects, canonical origin and service status with `external-config-snapshot.json`.
5. Store only non-sensitive status; obtain credentials through the approved secret system at execution time.

**Gate:** If migration compatibility is unclear or external configuration conflicts with the target, STOP for explicit human approval.

## 9. Mainnet and Recovery Materials boundary

- Broadcast Mainnet data is immutable and cannot be rolled back.
- Never modify or replace historical Kit, Evidence, Snapshot or Archive formats.
- Never combine Recovery Materials or credentials with repository/deployment evidence.
- A rollback is valid only if historical recovery compatibility remains PASS.
- If recovery would require altering or reversing Mainnet data, STOP.

## 10. Production rollback conditions

Production may switch only after every staging Gate passes and explicit production authorization is recorded. Record:

- previous production release;
- rollback target Tag, commit and release;
- deployed commit and artifact SHA results;
- compatibility and route verification results;
- production switch and completion time;
- approver and any open issues.

After switching, repeat the release-identity, route, console and artifact checks. Preserve the previous deployment as a recovery option; do not rewrite Git history.

## 11. STOP conditions

Stop immediately if any condition is true:

- migration state is unknown or incompatible;
- historical recovery compatibility is not PASS;
- external configuration conflicts with the target;
- a credential, secret or customer-sensitive value is exposed;
- Tag, commit or release identity differs from governance records;
- a required artifact SHA does not match;
- the recovery requires changing Frozen Core or Frozen identifiers;
- the recovery requires reverting or rewriting Mainnet data;
- required staging tests, routes or console checks fail;
- production authorization is absent.

## 12. Phase 2E Drill Checklist

- [ ] Select one protected Freeze/Backup Tag and record expected commit/release.
- [ ] Create a clean isolated checkout at that Tag.
- [ ] Verify Tag → commit → release identity.
- [ ] Restore locked dependencies and build.
- [ ] Run the selected necessary tests and secret scan.
- [ ] Deploy only to isolated/staging.
- [ ] Verify routes, console, compatibility and artifact SHA.
- [ ] Compare migration head and external-config snapshot without changing them.
- [ ] Demonstrate rollback from staging to its pre-drill deployment.
- [ ] Record results; do not perform a production rollback during the drill.
