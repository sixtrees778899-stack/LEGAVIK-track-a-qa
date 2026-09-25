# AI Retrieval Quality Test Cases

These are offline retrieval expectations, not an AI-service integration. Every answer must filter to the authority tree and must refuse deterministic completion when no APPROVED item exists. Because this gate contains zero APPROVED claims, the expected external disposition for every case is `HOLD_FOR_APPROVAL`; the text below validates candidate retrieval and fact/guidance separation.

Common checked date: `2026-08-02`.

## TC-01 Binance邮箱无法访问
- Platform/scenario: Binance / lost email.
- Conclusion: exact recovery evidence and steps are unconfirmed.
- Official fact vs CJAS guidance: no eligible official operational fact; CJAS says use the regional official recovery/support entry and do not share factors.
- Evidence/source: D; AKI-BIN-002; no sufficient source.
- Stop/escalation: stop at secret/OTP requests; escalate to official Binance support and add an official regional source.

## TC-02 Binance Authenticator丢失
- Platform/scenario: Binance / lost Authenticator.
- Conclusion: exact reset path and withdrawal restriction are unconfirmed.
- Official fact vs CJAS guidance: BIN-01 supports general security controls only; CJAS requires rechecking withdrawal capability after recovery.
- Evidence/source: D for procedure; AKI-BIN-003/008; BIN-01 only contextual.
- Stop/escalation: never provide authenticator seed/OTP; escalate to official regional support.

## TC-03 Binance主动交接
- Platform/scenario: Binance / active holder handoff.
- Conclusion: prefer a lawful holder-controlled transfer, not credential sharing.
- Official fact vs CJAS guidance: this is CJAS guidance, not Binance policy.
- Evidence/source: B candidate; AKI-BIN-004; derived from BIN-01 safety controls.
- Stop/escalation: stop if ownership/authority or withdrawal ability is uncertain; confirm with official support/legal adviser.

## TC-04 Coinbase邮箱或2FA丢失
- Platform/scenario: Coinbase / holder recovery.
- Conclusion: Coinbase has an official lost-email/2-step recovery entry; options depend on account state.
- Official fact vs CJAS guidance: official path is CB-01; CJAS says separately verify transfer capability.
- Evidence/source: A/B; AKI-CB-001; CB-01.
- Stop/escalation: stop at credential requests outside Coinbase; use official recovery/support.

## TC-05 Coinbase账户持有人主动转移资产
- Platform/scenario: Coinbase / active handoff.
- Conclusion: holder-controlled lawful transfer is preferred over sharing login factors.
- Official fact vs CJAS guidance: CJAS guidance only; do not represent it as Coinbase policy.
- Evidence/source: B candidate; AKI-CB-005; no direct platform source.
- Stop/escalation: stop if destination, authority or sending status is uncertain; confirm in current Coinbase help.

## TC-06 Coinbase已故账户
- Platform/scenario: Coinbase / deceased holder.
- Conclusion: use Executor Services with death certificate, probate authority, claimant ID and signed instructions.
- Official fact vs CJAS guidance: requirements are official; CJAS says this is legal fallback, not normal recovery.
- Evidence/source: A; AKI-CB-002/003; CB-02, “Required documents” and “Claim the account”.
- Stop/escalation: credentials do not establish ownership; escalate jurisdiction questions to Coinbase and qualified legal advice.

## TC-07 Coinbase登录后能否立即发送
- Platform/scenario: Coinbase / post-recovery transfer.
- Conclusion: the current retail ID-recovery page says recovery may take up to 24 hours and sending may remain unavailable for 24 hours after completion; this is not universal to every recovery path.
- Official fact vs CJAS guidance: scoped timing is official; checking live sending status remains CJAS guidance.
- Evidence/source: A, time-sensitive; AKI-CB-006; CB-01.
- Stop/escalation: do not guarantee or generalize the duration; check current account state and retail help.

## TC-08 MetaMask忘记本地密码
- Platform/scenario: MetaMask / forgotten local password.
- Conclusion: an SRP wallet can reset local access by restoring with its SRP.
- Official fact vs CJAS guidance: MM-03 supports the fact; CJAS says first identify wallet creation type.
- Evidence/source: A/B; AKI-MM-001; MM-03.
- Stop/escalation: do not reset while independent account material is unconfirmed; use official MetaMask support.

## TC-09 MetaMask丢失SRP
- Platform/scenario: MetaMask / SRP unavailable.
- Conclusion: the local password does not replace the SRP for new-install recovery.
- Official fact vs CJAS guidance: MM-01 supports role separation; CJAS says preserve an existing unlocked session and seek official backup guidance.
- Evidence/source: A/B; AKI-MM-002; MM-01.
- Stop/escalation: never send the SRP to anyone; if logged out and no material exists, do not invent a recovery route.

## TC-10 MetaMask导入账户恢复
- Platform/scenario: MetaMask / imported account missing.
- Conclusion: imported keys/JSON/other-SRP accounts must be independently re-added.
- Official fact vs CJAS guidance: MM-04 supports the fact; CJAS requires mapping each public address to its source.
- Evidence/source: A; AKI-MM-004/008; MM-04.
- Stop/escalation: stop on address mismatch; consult official account-discovery help.

## TC-11 MetaMask恢复后地址不见
- Platform/scenario: MetaMask / account discovery.
- Conclusion: add derived accounts in order and separately re-add imports.
- Official fact vs CJAS guidance: MM-02/MM-04 describe behavior; CJAS says compare known public addresses before signing.
- Evidence/source: A/B; AKI-MM-003/004/006; MM-02/MM-04.
- Stop/escalation: never transfer from an unexpected address set; escalate to official support.

## TC-12 Ledger设备损坏
- Platform/scenario: Ledger / damaged device.
- Conclusion: restore on a trusted compatible device with the correct recovery phrase.
- Official fact vs CJAS guidance: LED-01 supports recovery; CJAS adds address verification and small test.
- Evidence/source: A/B; AKI-LED-001/007; LED-01.
- Stop/escalation: stop if phrase entry is requested on a connected webpage or address differs.

## TC-13 Ledger PIN遗失
- Platform/scenario: Ledger / forgotten PIN.
- Conclusion: PIN unlocks the device; the recovery phrase is the backup after reset/loss.
- Official fact vs CJAS guidance: LED-02 supports roles; CJAS says verify model-specific retry behavior.
- Evidence/source: A; AKI-LED-002; LED-02.
- Stop/escalation: do not guess repeatedly without checking model guidance; use official Ledger documentation.

## TC-14 Ledger Passphrase遗失
- Platform/scenario: Ledger / lost Passphrase.
- Conclusion: Ledger does not store it and the hidden accounts become inaccessible without the exact value.
- Official fact vs CJAS guidance: LED-03 supports the fact; CJAS says record existence/location only, never value.
- Evidence/source: A; AKI-LED-003/004/008; LED-03.
- Stop/escalation: stop on address mismatch; no support agent can reconstruct it.

## TC-15 Ledger Recovery Key是否必需
- Platform/scenario: Ledger / optional recovery product.
- Conclusion: it is optional and model/configuration dependent.
- Official fact vs CJAS guidance: LED-05 supports limited compatibility; CJAS says never make it mandatory by default.
- Evidence/source: B; AKI-LED-006; LED-05.
- Stop/escalation: recheck the current compatibility page.

## TC-16 Trezor设备丢失
- Platform/scenario: Trezor / lost device.
- Conclusion: restore with the correct compatible wallet backup.
- Official fact vs CJAS guidance: TRZ-02 supports recovery; CJAS says first identify model/backup format.
- Evidence/source: A; AKI-TRZ-002; TRZ-02.
- Stop/escalation: stop if backup standard or address is inconsistent; use official Trezor guidance.

## TC-17 Trezor SLIP39份额不足
- Platform/scenario: Trezor / insufficient shares.
- Conclusion: restoration requires the configured threshold of valid shares.
- Official fact vs CJAS guidance: TRZ-01 supports backup formats; CJAS says record threshold and locations, not share content.
- Evidence/source: A/B; AKI-TRZ-001/005/008; TRZ-01.
- Stop/escalation: do not upload or combine shares in CJAS; consult the exact official model/backup guide.

## TC-18 Trezor Passphrase错误
- Platform/scenario: Trezor / Passphrase mismatch.
- Conclusion: a different Passphrase opens a different wallet rather than proving the backup is invalid.
- Official fact vs CJAS guidance: TRZ-03 supports behavior; CJAS says stop on public-address mismatch.
- Evidence/source: A; AKI-TRZ-004; TRZ-03.
- Stop/escalation: do not transfer; verify spelling/case only in a trusted flow.

## TC-19 为什么不能上传助记词
- Platform/scenario: all self-custody / secret upload.
- Conclusion: recovery phrases can enable control of associated accounts and must not be uploaded.
- Official fact vs CJAS guidance: MM-04, LED-04 and TRZ-04 provide platform warnings; CJAS applies the no-upload control.
- Evidence/source: A; AKI-MM-005, AKI-LED-005, AKI-TRZ-006.
- Stop/escalation: stop any upload/request; return to official wallet support.

## TC-20 为什么不能只留下钱包密码
- Platform/scenario: software/hardware wallet / local unlock only.
- Conclusion: a local password/PIN usually unlocks a device/app and does not replace recovery material.
- Official fact vs CJAS guidance: MM-01/MM-03 and LED-02 support role separation; CJAS requires recovery-material location references.
- Evidence/source: A/B; AKI-MM-001/002, AKI-LED-002.
- Stop/escalation: verify the exact wallet type; never infer another product's behavior.

## TC-21 为什么登录交易所不等于可以提币
- Platform/scenario: CEX / post-login transfer.
- Conclusion: withdrawal controls, factor changes and risk holds may remain after login.
- Official fact vs CJAS guidance: exchange-specific sources support conditional restrictions; CJAS requires separate login/withdrawal status.
- Evidence/source: B/time-sensitive; AKI-BIN-008, AKI-CB-006; OKX-01/BY-01/BG-01/KC-02.
- Stop/escalation: check the live official account state; never promise a waiting time from another platform.

## TC-22 为什么恢复后验证地址并小额测试
- Platform/scenario: self-custody / safe transfer.
- Conclusion: wrong phrase, Passphrase, account or path can expose a different address; verify first and use a tolerable test amount.
- Official fact vs CJAS guidance: address differences are official facts; the small test is CJAS guidance.
- Evidence/source: A/B; AKI-MM-003/004/006, AKI-LED-004/007, AKI-TRZ-004; MM-02/MM-04/LED-03/TRZ-03.
- Stop/escalation: stop on any mismatch; consult the official wallet guide before signing.

## Test oracle

For every case, retrieval must expose platform, scenario, claim type, grade, checked date, source and stop/escalation. Missing or non-APPROVED knowledge returns uncertainty. It must never fill missing steps from model memory.
