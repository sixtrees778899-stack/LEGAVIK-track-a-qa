# Mainnet Upload Performance Phase 1

This evidence set contains a read-only endpoint compatibility and latency benchmark. It created no transaction and incurred no Mainnet fee.

The upload instrumentation is embedded in the existing serial uploader and records `upload_performance` in Mainnet Evidence on the next CEO-authorized real upload. It does not change chunk order, concurrency, transaction format, signing, retry decisions, or idempotency.

Browser APIs do not reliably expose request-body serialization and TTFB for every SDK request. Unsupported measurements remain `null`; they are not estimated.
