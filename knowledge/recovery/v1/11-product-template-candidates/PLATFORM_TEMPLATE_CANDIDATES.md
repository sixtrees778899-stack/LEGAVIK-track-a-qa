# Batch 1 Platform Template Candidates

Status: `CANDIDATE_ONLY`. These 17 templates are not wired to UI and cannot become customer-facing until their required Atomic Items are `APPROVED`.

Key: **M** mandatory, **C** conditionally mandatory, **R** recommended, **O** optional.

## Binance
- Asset information — **M** regional entity, redacted account ID and asset categories.
- Recovery conditions — **M** login identity; **C** enabled email/phone/Authenticator/security key; **R** KYC and whitelist status.
- Location/identifier — **M** controlled location reference for each factor, never its value.
- Failed-condition path — **M** official-support link; lost email/Authenticator details remain unconfirmed.
- Recovery steps — **M** identify region → recover holder access → recheck identity and withdrawal state.
- Stop conditions — **M** secret/OTP request, remote control or unfamiliar transfer.
- Attachments — **R** redacted account/asset list and official-page copy.
- Forbidden — passwords, OTP, authenticator seed, API secret, full ID.
- Custom — **O** product/subaccount notes and region-specific requirements.

## OKX
- Asset information — **M** distinguish CEX from OKX Wallet; record region and redacted ID.
- Recovery conditions — **M** login identity; **C** email/phone/Authenticator and identity evidence.
- Location/identifier — **M** controlled references for enabled factors.
- Failed-condition path — **M** official reset route for unavailable factors.
- Recovery steps — **M** reset factor → complete review → observe current transfer restriction.
- Stop conditions — **M** secret request or transfer before restriction/state is confirmed.
- Attachments — **R** redacted security-state and asset list.
- Forbidden — passwords, OTP, authenticator seed, full ID.
- Custom — **O** product/region notes.

## Coinbase
- Asset information — **M** product/region, redacted account ID and asset categories.
- Recovery conditions — **M** holder identity; **C** email/2-step factor; **R** transfer-control state.
- Location/identifier — **M** official recovery/Executor Services link as applicable.
- Failed-condition path — **M** holder recovery; **C** legal representative path only for death/incapacity.
- Recovery steps — **M** choose holder, active handoff or legal fallback; never mix them.
- Stop conditions — **M** credential sharing, unverified support or assumed universal waiting time.
- Attachments — **R** redacted account list; **C** legal-document location reference, not unnecessary copies.
- Forbidden — password, OTP, full identity file unless the official process requires direct submission to Coinbase.
- Custom — **O** trusted-contact existence and jurisdiction notes.

## Kraken
- Asset information — **M** redacted account ID and asset categories.
- Recovery conditions — **M** login; **C** funding 2FA and Global Settings Lock.
- Location/identifier — **M** controlled factor/device references.
- Failed-condition path — **M** official support; **C** deceased claimant document route.
- Recovery steps — **M** restore access → check funding 2FA/GSL → verify withdrawal ability.
- Stop conditions — **M** bypass request or unverified claimant authority.
- Attachments — **R** redacted control list; **C** estate authority location reference.
- Forbidden — credentials, OTP, authenticator seed, full identity documents in CJAS.
- Custom — **O** funding-control notes.

## Bybit
- Asset information — **M** region/product and redacted account ID.
- Recovery conditions — **M** login; **C** configured withdrawal-security controls.
- Location/identifier — **M** enabled factor and whitelist references.
- Failed-condition path — **M** official support; detailed recovery evidence remains unconfirmed.
- Recovery steps — **M** recover access → inspect security-change state → revalidate withdrawal restriction.
- Stop conditions — **M** transfer during uncertainty or unknown support request.
- Attachments — **R** redacted whitelist/security-state list.
- Forbidden — credentials, OTP, API secrets and full IDs.
- Custom — **O** new-address lock notes.

## Bitget
- Asset information — **M** redacted ID, region and asset categories.
- Recovery conditions — **M** identity; **C** email/phone/Google Authenticator.
- Location/identifier — **M** controlled references for all enabled factors.
- Failed-condition path — **M** official self-recovery; **C** video/identity route when multiple factors fail.
- Recovery steps — **M** recover factor → complete review → observe current withdrawal lock.
- Stop conditions — **M** unofficial video request or sending secrets outside official flow.
- Attachments — **R** redacted factor list; avoid retaining verification media.
- Forbidden — password, OTP, authenticator seed, raw verification video.
- Custom — **O** current review status.

## KuCoin
- Asset information — **M** redacted account ID and asset categories.
- Recovery conditions — **M** account access; **C** phone/trading password or email/Google 2FA/trading password configuration.
- Location/identifier — **M** controlled references without factor values.
- Failed-condition path — **M** Reset Authentication official path.
- Recovery steps — **M** reset → await official review → recheck withdrawal restriction.
- Stop conditions — **M** exposing trading password/OTP or assuming review timing.
- Attachments — **R** redacted security-configuration list.
- Forbidden — trading/login password, OTP, authenticator seed, full ID.
- Custom — **O** product and region notes.

## MetaMask
- Asset information — **M** public addresses, chains and wallet creation type.
- Recovery conditions — **M** SRP existence reference; **C** separate imported keys, hardware connections or social-login conditions.
- Location/identifier — **M** controlled offline location references, never secret content.
- Failed-condition path — **M** device-loss route; **C** separately imported-account route.
- Recovery steps — **M** restore by type → re-add missing accounts → verify addresses → small test.
- Stop conditions — **M** SRP/private-key request or address mismatch.
- Attachments — **R** redacted address/network/account-source table.
- Forbidden — SRP, private keys, password, JSON keyfile.
- Custom — **O** derivation/account-discovery notes.

## Rabby
- Asset information — **M** public EVM addresses and original account source.
- Recovery conditions — **M** underlying SRP/private key/hardware source reference; Rabby-specific recovery is unconfirmed.
- Location/identifier — **M** device/connection references.
- Failed-condition path — **M** return to the underlying wallet's official recovery process.
- Recovery steps — **M** identify source → restore source → reconnect → verify address.
- Stop conditions — **M** non-rabby.io recovery page or secret request.
- Attachments — **R** redacted address/source relationship map.
- Forbidden — SRP, private keys, passwords, signing QR.
- Custom — **O** connected dApp/account notes.

## Trust Wallet
- Asset information — **M** public addresses, chains and backup type.
- Recovery conditions — **M** mnemonic/underlying key existence; **C** cloud-backup account and protection conditions.
- Location/identifier — **M** offline/controlled backup location reference.
- Failed-condition path — **M** device-loss path; cloud details require version check.
- Recovery steps — **M** restore by type → verify addresses → small test.
- Stop conditions — **M** support request for mnemonic/private key.
- Attachments — **R** redacted address/chain list and rehearsal record.
- Forbidden — mnemonic, private key, app/cloud password.
- Custom — **O** app-version and cloud-provider notes.

## Phantom
- Asset information — **M** public addresses, chains and SRP/imported/seedless type.
- Recovery conditions — **M** type-specific recovery material; **C** Apple/Google account plus PIN for seedless.
- Location/identifier — **M** controlled references for each independent account source.
- Failed-condition path — **M** still-logged-in backup check; explicitly record unrecoverable SRP loss after logout.
- Recovery steps — **M** recover by type → re-add imported accounts → verify each chain address.
- Stop conditions — **M** secret request or wrong-chain/address result.
- Attachments — **R** redacted address/type/chain table.
- Forbidden — SRP, private keys, PIN and cloud credentials.
- Custom — **O** seedless platform/version notes.

## OKX Wallet
- Asset information — **M** distinguish wallet from CEX; record addresses, chains and wallet type.
- Recovery conditions — **M** SRP/private key; **C** cloud account plus backup password.
- Location/identifier — **M** controlled location and derivation-path exceptions.
- Failed-condition path — **M** local-password loss route; **C** cloud-backup failure route.
- Recovery steps — **M** restore → resolve path/address differences → verify → small test.
- Stop conditions — **M** secret upload, CEX credential substitution or address mismatch.
- Attachments — **R** redacted address/chain/path table.
- Forbidden — SRP, private key, local or backup password.
- Custom — **O** cloud provider and app-version notes.

## Ledger
- Asset information — **M** public addresses, networks, model and companion app.
- Recovery conditions — **M** recovery-phrase location reference; **C** Passphrase and optional compatible recovery product.
- Location/identifier — **M** separated device/backup/Passphrase location references.
- Failed-condition path — **M** lost device/PIN route; **C** Passphrase loss is unrecoverable.
- Recovery steps — **M** restore on trusted compatible device → verify address → small test.
- Stop conditions — **M** phrase request, address mismatch or unsupported model assumption.
- Attachments — **R** redacted device/address/backup-format table and rehearsal result.
- Forbidden — phrase, Passphrase, PIN and recovery-card image.
- Custom — **O** firmware/model and Recovery Key notes.

## Trezor
- Asset information — **M** public addresses, model and creation period.
- Recovery conditions — **M** backup format; **C** threshold shares and Passphrase existence.
- Location/identifier — **M** separated device/share/Passphrase location references.
- Failed-condition path — **M** device-loss route; **C** insufficient-share or Passphrase-loss consequence.
- Recovery steps — **M** select compatible format → restore → verify address → small test.
- Stop conditions — **M** secret request, insufficient threshold or model mismatch.
- Attachments — **R** redacted format/threshold/address table and backup-check result.
- Forbidden — backup words/shares, Passphrase, PIN.
- Custom — **O** model-specific backup-check notes.

## OneKey
- Asset information — **M** distinguish hardware and App accounts; record public addresses and model.
- Recovery conditions — **M** recovery phrase; **C** Passphrase and software-account keys.
- Location/identifier — **M** separated material references.
- Failed-condition path — **M** PIN reset/recovery; record model-specific attempt limit.
- Recovery steps — **M** restore correct account type → verify address → small test.
- Stop conditions — **M** secret request, account-type or address mismatch.
- Attachments — **R** redacted device/account/address table.
- Forbidden — phrase, key, Passphrase, PIN.
- Custom — **O** model and attempt-limit notes.

## Keystone
- Asset information — **M** public addresses, model, firmware context and companion watch-only wallet.
- Recovery conditions — **M** recovery phrase; **C** Passphrase and source-wallet derivation compatibility.
- Location/identifier — **M** device/backup/application references.
- Failed-condition path — **M** damaged-device route; exact password reset behavior remains conditional.
- Recovery steps — **M** verify compatibility → restore → verify address/QR transaction → small test.
- Stop conditions — **M** path mismatch, secret request or unverified QR transaction.
- Attachments — **R** redacted device/watch-wallet/address relationship.
- Forbidden — phrase, Passphrase, device password and signing QR.
- Custom — **O** source wallet and derivation notes.

## SafePal
- Asset information — **M** hardware/App account type, public addresses and chains.
- Recovery conditions — **M** mnemonic/private-key source; **C** exact Passphrase.
- Location/identifier — **M** separated device/backup/Passphrase references.
- Failed-condition path — **M** local Security Password reset by reinstall/recovery; record unrecoverable missing-material combinations.
- Recovery steps — **M** restore by source → verify chain/address → small test.
- Stop conditions — **M** secret request, Passphrase mismatch or wrong address.
- Attachments — **R** redacted address/chain/device relationship.
- Forbidden — mnemonic, private key, Passphrase and Security Password.
- Custom — **O** App/device version notes.
