# Knowledge Governance

## Lifecycle

`DRAFT → REVIEWED → APPROVED → STALE → RETIRED`

- DRAFT: captured, incomplete or awaiting evidence review.
- REVIEWED: source and scope checked internally; not a deterministic customer answer.
- APPROVED: explicitly approved at claim level by both Product Architecture and the CEO (or formally delegated knowledge owner).
- STALE: review deadline passed, source disappeared or applicability is uncertain.
- RETIRED: preserved for history but excluded from retrieval.

Only APPROVED items can feed Recovery Map templates, formal Guidance, deterministic AI answers or Rule Engine candidate rules. This repository currently contains no product runtime reader.

## Roles and change control

- Researcher may create DRAFT and propose REVIEWED.
- Product Architect validates structure, claim/source fit and product interpretation.
- CEO approves external product use and material risk language.
- Upgrade to APPROVED requires both approvals recorded in a review log or signed change order.
- A claim is never auto-promoted because its source grade is high.

## Source binding

Every platform fact binds to official URL, title, supporting section, checked date, region and claim-level grade. Search snippets, aggregators and unofficial tutorials cannot support APPROVED facts. A page URL is not evidence for claims outside its actual content.

## Conflict and region handling

More specific product/region guidance overrides general education only within that scope. Conflicting official pages create separate region/version claims and an Open Question; neither is silently merged. Legal and estate claims require jurisdiction metadata and legal review before product eligibility.

## Retrieval contract

Retrieval filters in this order: authority root → lifecycle APPROVED → not overdue → applicable platform/product/region → claim type. If no item survives, return uncertainty and the official support escalation path; never synthesize a missing answer.
