# Verified Transfer Framework v1

Scope: self-custody wallet recovery. This is a CJAS safety framework, not a wallet-provider guarantee and not proof of legal authority.

## Claim-type separation

- **OFFICIAL FACT**: a platform source establishes what material restores/signs for that wallet, how accounts are derived, or what condition is unrecoverable.
- **CJAS GUIDANCE**: CJAS recommends address comparison, a tolerable small test, confirmation checks, staged transfer and evidence retention.
- **RISK WARNING**: wrong network/address/Memo/Tag, missing imported account or incorrect Passphrase can cause loss or expose the wrong wallet.
- **STOP CONDITION**: stop before signing when address, network, account set, balance, token display, Passphrase result or destination is inconsistent.

## Fourteen-step closure

| Step | Action | Type | Required evidence/result |
|---|---|---|---|
| VT-01 | Confirm platform, wallet type and network before recovery | CJAS_GUIDANCE | Product/model/network identified |
| VT-02 | Restore using the applicable backup path | OFFICIAL_FACT | An APPROVED platform Claim identifies the material/path |
| VT-03 | Read the restored public address | OFFICIAL_FACT | Wallet exposes the address without revealing a secret |
| VT-04 | Compare with a previously saved read-only public address | CJAS_GUIDANCE | Exact address match recorded |
| VT-05 | Check hidden/Passphrase wallets and imported accounts | RISK_WARNING | Every applicable conditional account is reconciled |
| VT-06 | Confirm expected assets and token display | CJAS_GUIDANCE | Known assets accounted for; display absence is investigated |
| VT-07 | Establish a receiving address controlled by the authorized recipient | CJAS_GUIDANCE | Destination ownership/control confirmed separately |
| VT-08 | Verify network, address and Memo/Tag requirement | RISK_WARNING | Independent second check completed |
| VT-09 | Send a tolerable small test amount | CJAS_GUIDANCE | Amount is intentionally limited and fees understood |
| VT-10 | Wait for the required chain confirmations | OFFICIAL_FACT/CJAS_GUIDANCE | Transaction status observed through a trusted explorer/wallet |
| VT-11 | Confirm receipt at the destination | CJAS_GUIDANCE | Destination balance/transaction matches |
| VT-12 | Transfer the remainder in controlled batches | CJAS_GUIDANCE | Each batch follows the same checks |
| VT-13 | Retain transaction hash and non-secret recovery record | CJAS_GUIDANCE | Hash, time, network and result recorded; no secret stored |
| VT-14 | Stop on mismatch, missing assets or Passphrase anomaly | STOP_CONDITION | No further signing or transfer until official/expert review |

## Gate

A platform may be `COMPLETE AND TRANSFER-VERIFIABLE` only when its APPROVED Claims cover recovery material, account/address identification, signing/transfer capability and unrecoverable conditions, and this framework can be applied without an unresolved platform-specific derivation, network or account-source gap.

`COMPLETE WITH CONDITIONS` applies when the path is complete only if additional Passphrase, imported key, threshold share, cloud credential or model-specific material is present. A real rehearsal is still required before a specific Vault Version becomes “Verified.”

## Safety and privacy

CJAS records only existence, controlled-location references, public addresses and non-secret transaction evidence. It must not collect SRP/seed, private key, Passphrase, PIN, password, OTP, recovery-code set or signing QR payload.
