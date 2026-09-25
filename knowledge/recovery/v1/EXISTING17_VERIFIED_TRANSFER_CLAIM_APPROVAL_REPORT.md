# CJAS Existing 17 Platforms Verified Transfer & Claim Approval Report

Date: 2026-08-02
Scope: the 72 claims in `09-atomic-knowledge/ALL17_COMPLETION_CLAIMS.jsonl`; no Batch 2 platforms and no product-code integration.

## 1. 72条Claim审批统计

| Decision | Count |
|---|---:|
| APPROVED | 29 |
| REVIEWED | 12 |
| DRAFT | 31 |
| REJECTED | 0 |
| STALE | 0 |
| Total | 72 |

All 72 decisions are recorded individually in `09-atomic-knowledge/ALL17_CLAIM_APPROVAL_DECISIONS.jsonl`, with reviewer rationale, source scope and permitted product uses. No `REVIEWED` item was bulk-promoted. Combined with the earlier Pilot 5 gate, the authority contains 112 claims: 52 Approved, 25 Reviewed and 35 Draft.

Approved-use counts across all 112 claims are: Guidance 48, Template 44, AI Support 48, Rule Engine candidate 33 and Approved/Internal-only 4. Eligibility is use-specific; approval does not itself deploy a claim.

## 2. Verified Transfer框架

`03-rules/VERIFIED_TRANSFER_FRAMEWORK.md` defines a 14-step self-custody closure:

1. identify platform/wallet/network; 2. restore from the correct backup; 3. derive public addresses; 4. compare with a pre-recorded read-only address; 5. inspect hidden wallets, Passphrase and imported accounts; 6. confirm assets/tokens; 7. establish a destination; 8. verify network/address/Memo or Tag; 9. send a small test; 10. wait for confirmation; 11. verify receipt; 12. transfer in batches; 13. retain transaction hashes; 14. stop on address, asset or Passphrase anomalies.

The framework labels `OFFICIAL_FACT`, `CJAS_GUIDANCE`, `RISK_WARNING` and `STOP_CONDITION` separately. CJAS operational guidance is never represented as a provider guarantee. A platform can be `COMPLETE WITH CONDITIONS` only when platform-specific Approved facts support core recovery; a real Vault becomes Verified only after an actual controlled rehearsal.

## 3. CEX控制权边界

`03-rules/CEX_CONTROL_BOUNDARY.md` fixes these boundaries:

- Login, identity recovery and withdrawal authority are distinct capabilities.
- Account-holder recovery does not authorize third-party takeover.
- Factor resets may trigger KYC, manual review, allowlist controls or cooling periods.
- Possession of credentials is neither ownership nor legal authority.
- Owner-directed transfer is the preferred handoff path.
- Death, incapacity or unavailable authorization requires the provider's official process and, where applicable, legal/professional escalation.

No CEX claim promises immediate withdrawal, globally uniform KYC/estate handling or third-party control.

## 4. 17个平台新状态

| Platform | New status | Complete conditions | Remaining gap | Template | AI |
|---|---|---|---|---|---|
| Binance | UNCONFIRMED | basic account concepts only | operational recovery, withdrawal and stop evidence | NO | NO |
| OKX | ACCOUNT HOLDER RECOVERY ONLY | holder factor recovery in cited US scope | transfer verification, non-US and third-party/legal scope | scoped candidate | limited |
| Coinbase | ACCOUNT HOLDER RECOVERY ONLY | holder recovery; documented estate escalation | active handoff and verified transfer | limited | limited; estate human-only |
| Kraken | OFFICIAL OR LEGAL PROCESS REQUIRED | funding controls and deceased process | complete holder recovery and transfer path | NO | limited/escalate |
| Bybit | PARTIALLY RECOVERABLE | withdrawal-security controls | lost-factor recovery and legal fallback | NO | controls only |
| Bitget | ACCOUNT HOLDER RECOVERY ONLY | holder recovery and withdrawal restriction facts | handoff, succession and verified transfer | scoped candidate | limited |
| KuCoin | ACCOUNT HOLDER RECOVERY ONLY | holder recovery and withdrawal conditions | handoff, succession and verified transfer | scoped candidate | limited |
| MetaMask | COMPLETE WITH CONDITIONS | SRP/local-password/imported-account boundaries | real rehearsal and account-source completeness | conditional | core |
| Rabby | UNCONFIRMED | wallet category only | official recovery and signing evidence | NO | NO |
| Trust Wallet | PARTIALLY RECOVERABLE | limited backup concepts | cloud/import/address/transfer evidence | NO | NO |
| Phantom | COMPLETE WITH CONDITIONS | recovery, PIN and key-export boundaries | multi-network rehearsal | conditional | core |
| OKX Wallet | COMPLETE WITH CONDITIONS | password/recovery-material distinctions | cloud/derivation detail and rehearsal | conditional | core |
| Ledger | COMPLETE WITH CONDITIONS | backup, PIN and Passphrase boundaries | model-specific rehearsal | conditional | core |
| Trezor | COMPLETE WITH CONDITIONS | backup formats, PIN, Passphrase and threshold facts | model-specific rehearsal | conditional | core |
| OneKey | COMPLETE WITH CONDITIONS | backup and device-recovery core | model/derivation detail and rehearsal | conditional | core |
| Keystone | PARTIALLY RECOVERABLE | limited backup/device facts | Passphrase, firmware, derivation and transfer evidence | NO | NO |
| SafePal | COMPLETE WITH CONDITIONS | recovery material and device core | derivation detail and rehearsal | conditional | core |

## 5. 完整平台

`COMPLETE AND TRANSFER-VERIFIABLE`: **0 / 17**. No platform has both an unconditional Approved A–F knowledge path and a recorded real transfer rehearsal. This prevents a documentation-only assessment from being mistaken for operational proof.

## 6. 条件完整平台

`COMPLETE WITH CONDITIONS`: **7 / 17** — MetaMask, Phantom, OKX Wallet, Ledger, Trezor, OneKey and SafePal. Conditions include possession of the correct backup, exact Passphrase where enabled, independent material for imported accounts, correct backup format/model and successful address comparison/test transfer.

## 7. 仅限本人恢复平台

`ACCOUNT HOLDER RECOVERY ONLY`: **4 / 17** — OKX, Coinbase, Bitget and KuCoin. Their Approved knowledge supports scoped holder actions; it does not authorize a third person or establish immediate withdrawal rights.

## 8. 官方或法律升级平台

Kraken is classified `OFFICIAL OR LEGAL PROCESS REQUIRED` overall because the confirmed high-value path is the deceased-client process while holder recovery remains incomplete. Coinbase also requires official/legal escalation in a deceased-account scenario. For every CEX, death, incapacity, disputed authority or third-party access must be escalated rather than treated as ordinary credential recovery.

## 9. 不完整原因

- Evidence gaps: Binance, Rabby, Trust Wallet and Keystone lack direct operational sources for critical steps.
- Scope gaps: region, product version, model, recovery type and account state are not uniformly documented.
- Control gaps: several CEX sources cover access or factor reset but not withdrawal after recovery.
- Authorization gaps: third-party technical access cannot establish lawful authority.
- Verification gaps: the seven conditional self-custody platforms still require a real address-and-test-transfer rehearsal for a specific Vault.
- High-risk claims remain Draft where exact waiting periods, global estate processes, universal compatibility or guaranteed recovery are unsupported.

## 10. 可进入Recovery Map的知识

The 44 `ELIGIBLE_FOR_TEMPLATE` Approved claims may enter a future scoped mapping design, together with the Verified Transfer framework as clearly labelled CJAS guidance. Each mapping must preserve platform, region/model/version, condition and source. No claim has been connected to Recovery Map in this gate, and template candidates are not product-ready as a universal set.

## 11. 可进入Guidance的知识

The 48 `ELIGIBLE_FOR_GUIDANCE` Approved claims may support scoped explanations of control material, password/PIN roles, recovery prerequisites, factor-loss routes and stop conditions. Address comparison, small tests and staged transfer remain labelled CJAS guidance unless a platform-specific official source directly states them.

## 12. 可进入AI客服的知识

The 48 `ELIGIBLE_FOR_AI_SUPPORT` Approved claims may support deterministic offline answers only while current and within recorded scope. Missing coverage must answer “当前知识库无法确认”. Legal/estate facts marked `INTERNAL_ONLY` require human escalation. Reviewed/Draft claims, expired claims and cross-platform inference remain excluded. No AI service was connected.

## 13. 是否SAFE TO START Recovery Map Refactor

**NO — NOT AUTHORIZED.** The knowledge layer now supports scoped design work, but no platform has an unconditional and rehearsed A–F transfer path, and four platforms retain critical evidence gaps. The next gate must explicitly approve how conditional/incomplete platform knowledge is represented without creating false completion signals.

## 14. 是否SAFE TO START Batch 2

**NO — NOT AUTHORIZED.** Existing-platform gaps should be prioritized before adding coverage. The highest-value next evidence work is Binance operational recovery/withdrawal, Rabby official recovery documentation, Trust Wallet cloud/import scope and Keystone Passphrase/model/derivation details.

## Verification and boundaries

- Changes are knowledge documentation and machine-readable governance records only.
- No UI, business code, Schema v2, Crypto Engine, Recovery Kit, Snapshot or Recovery Map implementation changed.
- No new platform, AI integration, network upload, wallet, mainnet, deployment, push or merge was performed.
