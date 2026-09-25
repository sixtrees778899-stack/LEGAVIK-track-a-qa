# Stale Policy

## Automatic stale triggers

- `review_due_at` is earlier than the retrieval date.
- Official URL is unavailable, redirects to unrelated content or no longer contains the cited section.
- Platform, product, model, firmware, region or legal scope changed.
- A newer official source conflicts with the claim.
- The claim cannot be reproduced from its recorded supporting location.

## Response

1. Change lifecycle to STALE without deleting the item.
2. Set product eligibility to INELIGIBLE.
3. Remove it from deterministic AI and product/template exports.
4. Link a replacement using `supersedes`; keep both IDs for audit history.
5. If no replacement exists, create an Open Question and answer only with uncertainty plus official support escalation.

Source availability alone does not restore a claim. A human reviewer must reassess scope and evidence before REVIEWED; CEO and Product Architecture approval remains required for APPROVED.
