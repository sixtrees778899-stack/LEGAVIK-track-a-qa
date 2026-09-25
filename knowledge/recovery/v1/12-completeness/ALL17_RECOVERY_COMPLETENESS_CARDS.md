# All 17 Platforms — Recovery Completeness Cards

Checked at: 2026-08-02. `COMPLETE` means the current official evidence supports that layer within the stated product scope; it does not guarantee a real account outcome. No card equates credentials with legal authority.

## Summary

| Platform | Discovery | Access | Authentication | Recovery | Operational Control | Verified Transfer | Evidence | Third-party Control | Template | AI | Final conclusion |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Binance | PARTIAL | PARTIAL | PARTIAL | MISSING | MISSING | MISSING | WEAK | NO | NOT READY | NOT READY | INCOMPLETE / UNCONFIRMED |
| OKX | PARTIAL | PARTIAL | COMPLETE | COMPLETE | PARTIAL | MISSING | STRONG-US | NO | LIMITED | PARTIAL | ACCOUNT HOLDER RECOVERY; transfer incomplete |
| Coinbase | PARTIAL | COMPLETE | COMPLETE | COMPLETE | PARTIAL | MISSING | STRONG | NO | LIMITED | PARTIAL | ACCOUNT HOLDER RECOVERY COMPLETE |
| Kraken | PARTIAL | PARTIAL | PARTIAL | MISSING | PARTIAL | MISSING | MEDIUM | NO | NOT READY | PARTIAL | INCOMPLETE; succession documented |
| Bybit | PARTIAL | PARTIAL | PARTIAL | MISSING | PARTIAL | MISSING | MEDIUM | NO | NOT READY | PARTIAL | INCOMPLETE / UNCONFIRMED |
| Bitget | PARTIAL | COMPLETE | COMPLETE | COMPLETE | COMPLETE | PARTIAL | STRONG | NO | LIMITED | PARTIAL | ACCOUNT HOLDER RECOVERY COMPLETE; 24h lock |
| KuCoin | PARTIAL | COMPLETE | COMPLETE | COMPLETE | COMPLETE | PARTIAL | STRONG | NO | LIMITED | PARTIAL | ACCOUNT HOLDER RECOVERY COMPLETE; restrictions apply |
| MetaMask | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | PARTIAL | STRONG | CONDITIONAL | LIMITED | READY-core | COMPLETE WITH CONDITIONAL MATERIALS |
| Rabby | PARTIAL | MISSING | MISSING | MISSING | MISSING | MISSING | WEAK | CONDITIONAL | NOT READY | NOT READY | UNCONFIRMED |
| Trust Wallet | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | MISSING | WEAK | CONDITIONAL | NOT READY | NOT READY | PARTIALLY RECOVERABLE / UNCONFIRMED |
| Phantom | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | PARTIAL | STRONG | CONDITIONAL | LIMITED | PARTIAL | COMPLETE WITH CONDITIONAL MATERIALS |
| OKX Wallet | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | PARTIAL | STRONG-US | CONDITIONAL | LIMITED | PARTIAL | COMPLETE WITH CONDITIONAL MATERIALS |
| Ledger | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | PARTIAL | STRONG | CONDITIONAL | LIMITED | READY-core | COMPLETE WITH CONDITIONAL MATERIALS |
| Trezor | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | PARTIAL | STRONG | CONDITIONAL | LIMITED | READY-core | COMPLETE WITH CONDITIONAL MATERIALS |
| OneKey | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | PARTIAL | MEDIUM | CONDITIONAL | LIMITED | PARTIAL | COMPLETE WITH CONDITIONAL MATERIALS |
| Keystone | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | MISSING | WEAK | CONDITIONAL | NOT READY | NOT READY | UNCONFIRMED |
| SafePal | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | PARTIAL | MEDIUM | CONDITIONAL | LIMITED | PARTIAL | COMPLETE WITH CONDITIONAL MATERIALS |

No platform is marked `TECHNICAL CONTROL PATH COMPLETE`: the evidence set does not yet provide an approved, platform-specific A–F path including verified small transfer.

## Binance
- Product scope/control: custodial CEX; region-specific entity unresolved.
- Needed: redacted account identity, password/factors, holder identity/KYC readiness; exact official recovery evidence missing.
- Restrictions/fallback: general controls exist, but lost-email/Authenticator, withdrawal restriction, handoff and succession are unconfirmed.
- Third party: factors may permit some access, but control and lawful withdrawal are not assured; holder or official/legal process required.
- Conclusion: `INCOMPLETE / UNCONFIRMED`; no product/AI certainty.

## OKX
- Scope: OKX CEX US page, not OKX Wallet or every region.
- Recovery: unavailable phone/email/Authenticator can use documented reset; self-frozen and face-failure cases need separate paths.
- Operational control: phone/email update disables withdrawals/transfers/gifts/P2P for 24 hours; live state must be checked.
- Third party: no official transfer-of-account authority; holder identity or official/legal process required.
- Conclusion: holder recovery documented, but verified owner transfer and third-party control remain incomplete.

## Coinbase
- Scope: Coinbase retail; account state and jurisdiction matter.
- Recovery: official lost email/2-step and ID recovery exist; ID path may take up to 24 hours and sending may remain unavailable for 24 hours.
- Succession: Executor Services and specified legal documents are official but internal/manual only.
- Third party: credentials are not legal authority; holder-directed transfer differs from succession.
- Conclusion: `ACCOUNT HOLDER RECOVERY COMPLETE`; verified small-transfer evidence is still missing.

## Kraken
- Scope: custodial account with sign-in, funding 2FA and optional GSL controls.
- Operational control: withdrawal 2FA and address control are distinct; GSL is relevant to address changes.
- Recovery: complete lost-factor holder recovery source is absent.
- Succession: deceased-client document and claim path is documented; third-party factor access is not a substitute.
- Conclusion: incomplete holder path; `OFFICIAL SUCCESSION PATH REQUIRED` for deceased holder.

## Bybit
- Scope: custodial CEX; account-configured withdrawal protections.
- Operational control: new-address lock, configured delay and app-only withdrawal can independently restrict transfers.
- Recovery: accessible sources do not establish full lost-factor recovery.
- Third party: neither lawful takeover nor succession is evidenced.
- Conclusion: `INCOMPLETE / UNCONFIRMED`.

## Bitget
- Scope: custodial CEX; current support and mobile withdrawal guides.
- Recovery: email/phone/GA self-service; multiple lost factors can require live video, ID and selfie review.
- Operational control: KYC for most users, GA and email/phone verification; 24-hour sensitive-function lock after recovery.
- Third party: identity review prevents assuming factors alone create control; succession unconfirmed.
- Conclusion: `ACCOUNT HOLDER RECOVERY COMPLETE`, but verified handoff/small test remains partial.

## KuCoin
- Scope: custodial CEX; current email-reset and withdrawal guides.
- Recovery/authentication: Reset Authentication with security evidence; withdrawal needs documented factor combinations including Trading Password.
- Operational control: email changes/reset impose 24-hour withdrawal suspension; larger withdrawals may be manually processed.
- Third party: no documented takeover/succession authority.
- Conclusion: `ACCOUNT HOLDER RECOVERY COMPLETE`; transfer timing and verified handoff remain conditional.

## MetaMask
- Core material: SRP for derived accounts; independent private key/JSON/other SRP for imported accounts; local password only unlocks/resets local access.
- Original device: not required when all correct independent materials exist.
- Operational control: recovered correct account can sign; missing imports yield partial recovery.
- Third party: technically conditional on all materials, but legal authority is separate.
- Conclusion: `COMPLETE WITH CONDITIONAL MATERIALS`; approved small-transfer procedure still missing.

## Rabby
- Scope: EVM wallet confirmed only at product level.
- Missing: official password, seed/key/keystore/hardware matrix, imported-account behavior, derivation and transaction verification.
- Third party: conditional in theory on underlying key source, but not supported as a Rabby-specific conclusion.
- Conclusion: `UNCONFIRMED`; original underlying wallet's official process is required.

## Trust Wallet
- Core material: recovery-phrase model is indicated, but dedicated stable source and cloud/version scope remain weak.
- Missing: imported-account behavior, cloud conditions, address discovery and verified transfer.
- Third party: conditional only if all actual control materials exist; not enough evidence to assure every account.
- Conclusion: `PARTIALLY RECOVERABLE / UNCONFIRMED`.

## Phantom
- Core material: SRP for standard wallet; Apple/Google account plus PIN for documented email-wallet route; imported private keys remain independent.
- Original device: not required with correct path/materials; remaining logged-in device permits backup action.
- Unrecoverable: logged out everywhere without SRP for a non-email wallet; lost seedless PIN/account combination as documented.
- Third party: technical control conditional on exact materials; legal authority separate.
- Conclusion: `COMPLETE WITH CONDITIONAL MATERIALS`; cross-chain verified-transfer evidence missing.

## OKX Wallet
- Core material: seed phrase/private key; password is local and cannot replace them. Cloud backup is provider/version dependent.
- Original device: not required with correct core material; derivation/address compatibility must be checked.
- Unrecoverable: password forgotten with no seed/private-key backup.
- Third party: possession can provide technical signing control, not legal ownership.
- Conclusion: `COMPLETE WITH CONDITIONAL MATERIALS`; no approved cross-chain small-test path.

## Ledger
- Core material: recovery phrase and exact Passphrase when enabled; PIN unlocks the device.
- Original device: not required with correct compatible backup and device.
- Unrecoverable: missing required Passphrase, or device access and backup both unavailable.
- Third party: technical control conditional on all materials; legal authority separate.
- Conclusion: `COMPLETE WITH CONDITIONAL MATERIALS`; platform-specific verified-transfer step remains partial.

## Trezor
- Core material: model/period-dependent backup, configured share threshold, exact Passphrase when enabled.
- Original device: not required with compatible backup; Model One check cannot be generalized.
- Unrecoverable: missing threshold, missing exact Passphrase, or no device access and no backup.
- Third party: technical control conditional on complete materials; legal authority separate.
- Conclusion: `COMPLETE WITH CONDITIONAL MATERIALS`; verified small transfer not yet approved.

## OneKey
- Core material: hardware recovery phrase and exact Passphrase; PIN is device-local. Hardware and App accounts differ.
- Original device: not required with backup; if device remains unlocked but backup is lost, official guidance recommends moving assets.
- Unrecoverable: missing device access and phrase, or missing exact Passphrase.
- Third party: conditional on correct account type and materials.
- Conclusion: `COMPLETE WITH CONDITIONAL MATERIALS`; model/address/transfer verification gaps remain.

## Keystone
- Core material: recovery phrase and compatible standard/path; device password is local.
- Missing: retrievable Passphrase evidence, model/firmware reset matrix, expected-address derivation and verified transfer.
- Third party: conditional only if all source-wallet materials and paths are correct; not assured.
- Conclusion: `UNCONFIRMED`; not product-ready.

## SafePal
- Core material: compatible mnemonic/private key and exact case-sensitive Passphrase when enabled; Security Password is local.
- Original device: not required for App restoration with correct material.
- Unrecoverable: missing mnemonic/private key for base wallet or missing exact Passphrase for hidden wallet.
- Third party: conditional on complete technical materials; legal authority separate.
- Conclusion: `COMPLETE WITH CONDITIONAL MATERIALS`; derivation and verified-transfer gaps remain.
