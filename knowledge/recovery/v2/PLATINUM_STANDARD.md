# CJAS Recovery Platinum Standard v1

Authority root: `knowledge/recovery/v2/`

## Three-layer contract

1. **Knowledge** — official sources, atomic claims, rules, guidance, templates and FAQ projections.
2. **Engine** — future consumers may evaluate only versioned, eligible knowledge records.
3. **Product** — future Recovery Map and customer surfaces may render mapped outputs but may not invent claims or fields.

No Engine or Product integration is part of this phase.

## Mandatory lineage

`Official source → Atomic Claim → Rule/Guidance → Template/AI/Drill → future Recovery Map`

- Every downstream record carries `claim_refs`.
- Only `APPROVED` and non-stale claims may drive deterministic output.
- `REVIEWED` identifies a useful but non-deterministic conclusion.
- `DRAFT` is research-only.
- High-risk facts require an official source, exact source section, scope, checked date, review date and evidence grade.
- CJAS guidance is labelled `CJAS_GUIDANCE`; it is never presented as a platform promise.
- Missing knowledge produces a gap or escalation, never model completion.

## Mandatory four-label governance

Every Claim, Source, Rule, Guidance, Template field, AI FAQ, Drill, Passport and future Lab record must carry:

1. `scope`: geography, legal entity, platform variant, product scope, account type and version scope.
2. `source`: controlled source type, ID/record, URL or Lab record, title, section and checked date; primary and auxiliary sources remain distinct.
3. `confidence`: `HIGH`, `MEDIUM` or `LOW`. This is evidence/replication strength, not recovery probability or platform score.
4. `last_verified`: verification date, verifier role, verification method, review due date and stale trigger.

Allowed source types are `OFFICIAL`, `CJAS_LAB`, `VERIFIED_TESTER`, `OFFICIAL_SUPPORT_CASE`, `REGULATORY_SOURCE`, `CJAS_GUIDANCE` and `USER_REPORTED_UNVERIFIED`.

Downstream scope cannot be wider than upstream scope; downstream confidence cannot exceed the lowest core Claim confidence. A stale core Claim removes deterministic downstream eligibility. Region conflicts require separate Claims rather than averaged wording. `OFFICIAL_RECHECK` is never described as Lab verification.

Future Recovery Lab records additionally require test case ID, platform, legal entity, region, account configuration, app/web version, test date, anonymized tester ID, result, observed cooldown, verified-transfer status, public test transaction hash where applicable and evidence-review status. One tester run cannot produce `CJAS_LAB / HIGH`.

## Platinum maturity gate

A platform is Platinum only when:

- all 16 fixed directories exist;
- at least 50 independently supportable Approved claims exist (a maturity target, never a quota override);
- account access, recovery, operational control, withdrawal control, owner-verified exit, emergency/legal boundary and stop conditions are covered;
- rules, guidance, templates, drill and at least 100 FAQ retrieval cases resolve only to Approved claims;
- official source, version/scope and review metadata pass validation;
- critical gaps are disclosed in Open Questions and the CEO index.

## Fixed platform directories

`01-account-access`, `02-security-factors`, `03-recovery`, `04-operational-control`, `05-withdrawal-control`, `06-owner-transfer`, `07-emergency`, `08-legal`, `09-risk`, `10-drill`, `11-guidance`, `12-ai`, `13-template`, `14-claims`, `15-open-questions`, `16-version-history`.

## Safety boundary

The knowledge base records existence, role, location hints and official paths. It must not contain passwords, OTPs, authenticator setup secrets, API secrets, private keys, seed phrases, full identity documents or real customer/Vault material.
