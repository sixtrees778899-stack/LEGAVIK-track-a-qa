# Recovery Map Reference V2

This is an isolated product-model reference, not production code. It does not import or mutate the V01.1 UI, Draft, Mapper, Schema, Crypto, Snapshot, Kit or Archive layers.

Run the four acceptance stories and invariant tests:

```bash
node --test recovery-map-reference-v2/stories.test.js
```

The model deliberately has one canonical Draft and one validator. Dashboard, Review, Report and Generation Gate are projections of the same validator result.
