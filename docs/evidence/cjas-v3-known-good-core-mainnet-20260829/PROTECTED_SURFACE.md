# CJAS V3 Known-Good Core — Protected Surface

Changes to the following surfaces require STOP → Diagnose → Report → Product Architect / CEO approval before implementation:

- Create orchestration and state machine: `web/v2/v2-app.js`
- Durable operation checkpoints, resume, reconciliation, and idempotency: `src/ui/mainnet-stability.js`
- Wallet/provider, quote, signature, broadcast, upload, TxID, and Evidence lifecycle: `src/ui/mainnet-connector.js`
- Mainnet pilot transaction/upload implementation: `tools/ar-unified-multi-file-mainnet-pilot/pilot-core.js`
- Canonical product validation and projection: `src/product-v2/validator.js`, `src/product-v2/projections.js`, `src/product-v2/snapshot-mapper.js`
- Frozen Snapshot construction and validation: `src/snapshot/snapshot-builder.js` and governed Snapshot schema/contracts
- Archive and Recovery Kit construction: `src/ui/vault-pipeline.js`, `src/recovery-kit/recovery-kit-builder.js`
- Encryption/KDF: `src/crypto/crypto-engine.js`, `src/crypto/kdf-provider.js`
- Recovery, attachment extraction, independent recovery, and verification: `src/recovery/recovery-service.js`, `src/recovery/attachment-recovery.js`, `web/recover.html`, `web/map-view.js`
- Gateway verification and Evidence finalization: `tools/ar-generic-file-mainnet-pilot/gateway-verifier.js` and related Mainnet Evidence paths
- Attachment ownership/scope metadata and payload contract consumed by Snapshot/Archive

Ordinary UI, Help, Pricing, Customer Center, and unrelated bug work must not modify these surfaces without the approval gate above.
