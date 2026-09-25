# SKREK Mainnet Signer Architecture Note

## Current verified harness

- Current Mainnet pilots are signed by the CEO-selected Wander/ArConnect browser wallet.
- The wallet extension connects in the browser and exposes only the approved public address and transaction-signing request.
- JWK, seed phrase and private key are not present in the repository, application code, logs or Recovery Map draft.
- AR is paid by the dedicated test wallet after the CEO confirms each wallet prompt.
- The browser currently prepares encrypted Archive bytes, requests the wallet signature, broadcasts, receives the TxID and produces Mainnet Recovery Evidence.

## Recommended production boundary

Customers should purchase the SKREK service and should not connect an AR wallet, hold AR, approve per-file transactions, inspect TxIDs or understand gateways. The recommended production design is a dedicated server-side Mainnet upload service with a narrowly scoped signer, while encryption and plaintext handling remain in the customer browser.

1. Browser creates the encrypted Archive and sends ciphertext only.
2. An authenticated upload receipt binds customer order, Archive size, SHA-256 and idempotency key.
3. A queue-controlled upload worker validates limits and asks the isolated signer to sign only an approved CJAS Archive transaction.
4. The service returns the TxID and existing Mainnet Recovery Evidence structure.
5. Independent Recovery continues to verify Archive size and SHA-256 before local decryption.

## Signer controls

- Keep the signer in an isolated secret manager/HSM-backed service account, never in frontend code or Git.
- Permit only Arweave data-upload transactions produced by the upload worker; reject arbitrary recipients, transfers and non-CJAS payload tags.
- Enforce per-transaction, per-customer, hourly and daily AR limits before signing.
- Require Archive size/SHA, order ID, idempotency key and approved content-type tags.
- Write append-only audit events for request ID, Archive hash/size, quote, fee, wallet public address, TxID, timestamps and outcome; never log plaintext or keys.
- Fail closed on signer unavailability, insufficient balance, quote limit breach, duplicate idempotency key, hash mismatch or incomplete authorization.
- Monitor wallet balance and funding separately from the signer execution path.

## Options considered

- Customer wallet: validated for engineering pilots, rejected for the intended customer experience.
- Custodial/server signer: recommended with strict queue, policy and audit controls.
- Delegated signing: possible later if Arweave tooling provides a sufficiently narrow, revocable capability; not assumed today.
- General-purpose hot wallet in the web server: rejected because its privilege and blast radius are too broad.

## CEO one-time and operational actions

Future implementation will require explicit CEO approval for the production wallet, funding ceiling, signer provider, secret-management boundary, transaction policy, emergency pause procedure and authorized operators. This note does not create a signer, move secrets, connect a production wallet or broadcast Mainnet.

