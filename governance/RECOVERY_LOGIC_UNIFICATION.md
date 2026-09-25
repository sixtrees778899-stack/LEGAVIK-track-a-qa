# Recovery Logic Unification and Related Impact Gate

Status: defined for the online Recovery Center and Independent Recovery Tool.

## One protocol, two delivery surfaces

Both customer entry points must use the same recovery protocol modules. The online entry is `web/recover.js`; the offline entry is `src/independent-recovery-tool/v1-app.js`. UI, authentication availability, canonical navigation and deployment packaging may differ. Parsing, pairing, download verification, cryptography, Snapshot validation, attachment validation and Recovery Map rendering must not fork.

| Recovery concern | Canonical implementation | Classification | Change required |
| --- | --- | --- | --- |
| Evidence validation | `validateMainnetEvidence` in `src/ui/mainnet-connector.js` | SAME CORE LOGIC | No |
| Kit parsing and format validation | `RecoveryKitBuilder.parseKit` in `src/recovery-kit/recovery-kit-builder.js` | SAME CORE LOGIC | No |
| Kit/Evidence pairing | `assertKitEvidencePair` in `src/ui/mainnet-connector.js` | SAME CORE LOGIC | No |
| Gateway selection and Archive size/SHA verification | `verifyMainnetArchive` and `verifyGatewaysParallel` | SHARED DEPENDENCY | No |
| KDF, KEK unwrap, DEK lifecycle and AES-GCM decrypt | `RecoveryService`, `RecoveryKitBuilder`, `cryptoEngine`, `kdfProvider` | SAME CORE LOGIC | No |
| Archive decoding | `decodeEncryptedArchive` in `src/ui/artifact-codec.js` | SAME CORE LOGIC | No |
| Snapshot/schema/integrity validation | `parseSnapshot`, `validateSnapshot`, `validateKnowledgeMapByVersion` | SAME CORE LOGIC | No |
| Attachment integrity and download reconstruction | Snapshot validation and `src/recovery/attachment-recovery.js` | SHARED DEPENDENCY | No |
| Recovery Map rendering | `renderRecoveryMap` in `web/map-view.js` | SAME CORE LOGIC | No |
| Online update continuation and account context | `web/recover.js` | UI-ONLY WRAPPER | No |
| Offline isolation, embedded packaging and guide-link removal | Independent Tool source/build | UI-ONLY WRAPPER | No |

## Format routing

Recovery is selected by the supplied matching Kit and Evidence, then validated by technical identifiers inside those materials. Customers do not select a technical version and recovery does not force the latest business version. Current accepted technical identities are Recovery Kit `1`, Archive `1`, Snapshot `1`, and Knowledge Map schema `1` or `2`. Business Recovery Map labels V1–V5 are lifecycle versions, not five different cryptographic formats.

## Mandatory related-impact discovery

Any future change touching either recovery entry or any canonical module named above must, before implementation:

1. inventory both entry paths and every downstream dependency;
2. classify each location as SAME CORE LOGIC, SHARED DEPENDENCY, DUPLICATED IMPLEMENTATION, UI-ONLY WRAPPER or UNRELATED;
3. run `tests/compatibility/recovery-entry-equivalence.test.js` plus the existing recovery, KDF and attachment compatibility tests;
4. verify all supported business versions and technical format identifiers without customer technical-version selection;
5. stop if the change requires modifying a frozen Kit, Evidence, KDF, KEK, DEK, AES, Archive, Snapshot or Recovery Engine contract.

No release may pass if the online and independent outputs differ for the same non-customer Golden fixture.
