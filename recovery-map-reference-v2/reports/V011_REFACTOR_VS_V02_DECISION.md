# V01.1 Refactor vs V02 Product Layer Decision Report

## Decision matrix

| Decision criterion | YES/NO | Evidence |
|---|---|---|
| Current Draft naturally supports the Blueprint | NO | Account aggregate is split across module arrays and root side-tables |
| Attachments can be unified without exceptions | NO | Product ownership fields are reduced at Schema mapping |
| Validator can be unified naturally | NO | Base Schema rules and Activation rules overlap |
| Review can be unified naturally | NO | Issues are translated and heuristically deduplicated after validation |
| Itemized/summary/mixed modes are naturally expressible | NO | Summary is an overlay on generated itemized rows |
| Old Draft can be migrated reliably | CONDITIONAL/NO | V01/V01.1 states have differing identities and implied defaults; migration can be best-effort only |
| Solution avoids many special cases | NO | Current path requires ignore lists, projection flags and DOM-specific targeting |

At least six criteria are NO. The decision rule therefore recommends V02.

## Option A — Continue V01.1 refactor

- Lower initial file churn.
- Higher hidden complexity because identity, validation and coverage semantics remain split.
- Continued regression risk in Review, navigation, attachments and generation.
- Migration appears easier but is deceptive because old Draft meaning is not fully explicit.
- Not recommended as the primary path.

## Option B — V02 Product Layer rewrite

- Rewrite only the Product Layer: canonical store, actions, validator, issue model, UI projections, report and Snapshot mapper.
- Preserve Crypto Engine, Snapshot container, Recovery Kit, Archive, Credential, independent recovery and Arweave capability.
- Keep current V01.1 code read-only during implementation and use it only as migration input and compatibility fixture.
- Higher explicit initial cost, lower long-term rule complexity and safer acceptance behavior.
- Recommended.

## Migration position

Old generated Snapshots require no rewrite. Old ungenerated Drafts should be handled by a versioned importer that:

1. never mutates the source;
2. converts only explicit, unambiguous facts;
3. produces migration warnings for inferred or dropped state;
4. requires user Review before generation;
5. fails closed when account/attachment ownership cannot be proven.

Migration should not be a prerequisite for proving V02 correctness.

## Reference Prototype result

The independent model passes four required stories plus five invariants. It demonstrates:

- one account aggregate;
- selected-only condition existence;
- first-class itemized, summary and mixed coverage;
- one attachment ownership model;
- save/re-enter without DOM reconstruction;
- one Canonical Validator;
- identical Dashboard, Review, Report and Gate issues;
- stable exact navigation anchors;
- isolation of duplicate-platform accounts.

## Recommendation

Start V02 only after CEO/Product Architect approve:

1. the canonical Product Model;
2. the Product Validator and Issue Model;
3. the migration boundary;
4. the Snapshot Mapper contract;
5. the missing Blueprint V2 reconciliation.

Do not continue incremental V01.1 business patches.
