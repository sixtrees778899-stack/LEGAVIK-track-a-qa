# 硬件钱包损坏或遗失后的安全恢复准备

**Status：PUBLISHED**

## 快速了解

硬件钱包损坏或遗失后，先确认设备型号、钱包备份类型、是否使用额外 Passphrase，以及自己能否找到对应恢复材料。不要把恢复材料输入网站、普通 App 或交给客服。Ledger、Trezor 等厂商的设备与备份规则不同，实际恢复必须使用目标厂商的最新官方说明。

## 详细说明

硬件钱包通常用于保护控制链上资产的私钥；资产本身并不存放在设备外壳中。设备损坏或遗失后，能否恢复访问主要取决于客户是否持有与目标钱包匹配的有效备份，以及是否还使用了额外 Passphrase。

通用恢复原则包括：

- 确认丢失或损坏的是设备，而不是立即假定资产已经丢失；
- 找到与目标钱包匹配的 Recovery Phrase、Wallet Backup 或其他正式备份；
- 如果曾使用额外 Passphrase，确认其恢复依赖仍然可用；
- 从厂商官方网站取得替代设备、应用及恢复说明；
- 恢复后使用已知公开地址核对结果；
- 不向任何人披露高敏感恢复材料。

具体厂商规则不同：

- Ledger 说明，其 Secret Recovery Phrase 可用于在替代设备上恢复相关账户；PIN 用于访问当前设备，不能替代 Secret Recovery Phrase。[Ledger：Losing your Ledger](https://www.ledger.com/academy/enter-the-trust-zone/losing-your-ledger)
- Trezor 将用于恢复的钱组称为 Wallet Backup。不同设备可能使用 BIP39 或 SLIP39，字数和备份结构可能不同。[Trezor：Wallet Backups](https://trezor.io/learn/security-privacy/personal-security-standards/understanding-trezor-wallet-backups-12-20-or-24-words)
- 如果钱包使用额外 Passphrase，仅有 Recovery Phrase 或 Wallet Backup 可能会恢复出另一组有效但不同的账户。[Ledger：Passphrase](https://www.ledger.com/academy/passphrase-an-advanced-security-feature) [Trezor：Passphrase](https://trezor.io/guides/backups-recovery/advanced-wallets/what-is-a-passphrase)

## 客户应该怎么做

### 1. 判断事件类型

确认设备属于：

- 暂时无法连接；
- 物理损坏；
- 遗失；
- 被盗；
- 已重置或被清除；
- PIN 无法确认。

遗失、被盗和普通设备故障的风险不同，不应使用同一处理方式。

### 2. 识别钱包配置

记录或确认：

- 厂商和设备型号；
- 使用的钱包应用；
- Wallet Backup / Recovery Phrase 的类型；
- 是否使用额外 Passphrase；
- 是否存在多份备份或多个钱包；
- 预期公开地址。

这些内容应作为线索记录，不应把完整秘密写入 Recovery Map。

### 3. 确认恢复材料状态

在不公开材料内容的前提下，确认：

- 材料是否存在；
- 保管位置是否可用；
- 是否与目标钱包匹配；
- 是否有损坏、缺页或版本混淆；
- 是否疑似被他人看到或复制。

### 4. 取得可信恢复环境

应用应从厂商官方网站或官方明确提供的下载入口获取；替代硬件设备应从厂商官方或其认可的可信销售渠道取得。不要使用预先填写 PIN、预先提供恢复词或来源不明的设备。

### 5. 按厂商官方流程恢复

使用对应设备和官方说明完成恢复。高敏感材料只应在厂商明确指定的可信恢复环境中使用，不要输入普通网页、聊天窗口或远程控制会话。

### 6. 核对恢复结果

恢复后先核对：

- 公开地址是否与历史记录一致；
- 是否使用了正确 Passphrase；
- 相关账户或网络是否需要重新添加；
- 钱包显示与可信 Block Explorer 记录是否一致。

## 注意事项

- 不要向 Ledger、Trezor、SKREK 或其他客服披露 Recovery Phrase、Private Key、Passphrase 或 PIN。
- PIN 保护当前设备；Recovery Phrase / Wallet Backup 承担钱包恢复作用，二者不能互换。
- 每个不同 Passphrase 都可能产生不同钱包；拼写差异不能被系统识别为“接近正确”。
- 如果设备被盗且 PIN 可能泄露，或恢复材料疑似被复制：`NEEDS REVIEW / HUMAN ESCALATION`。
- 死亡、失能、继承或法律授权场景：`NEEDS REVIEW / HUMAN ESCALATION`。

## 相关知识

- PIN、Recovery Phrase 与额外 Passphrase 有什么区别？
- Crypto Recovery Materials
- 如何检查 Crypto 恢复体系中的单点故障？
- Crypto 恢复安全与诈骗

## 相关 Recovery Map 模块

- 资产与账户清单
- 恢复所需条件与资料
- 位置与查找
- 恢复与转移步骤

## 来源与核验

| Official Source | Official URL | Source / Updated Date | Last Verified | Applicable Region | Risk Notes |
|---|---|---|---|---|---|
| Ledger Academy — Losing your Ledger | [Official URL](https://www.ledger.com/academy/enter-the-trust-zone/losing-your-ledger) | Published 2021-11-10; Updated 2022-12-16 | 2026-08-20 | Ledger | 页面较旧，正式恢复界面需重新核验 |
| Ledger Academy — Recovery Sheet | [Official URL](https://www.ledger.com/academy/glossary/recovery-sheet) | Published/Updated 2025-07-24 | 2026-08-20 | Ledger | Recovery Phrase 具有完整控制风险 |
| Trezor — Understanding wallet backups | [Official URL](https://trezor.io/learn/security-privacy/personal-security-standards/understanding-trezor-wallet-backups-12-20-or-24-words) | 页面未显示 | 2026-08-20 | Trezor；依型号和创建日期适用 | BIP39、SLIP39、Single-share 和 Multi-share 不可混写 |
| Trezor — Backup and recovery troubleshooting | [Official URL](https://trezor.io/support/troubleshooting/trezor-suite-issues/troubleshoot-wallet-backup-and-recovery-problems) | 页面未显示 | 2026-08-20 | Trezor | 无备份且设备不可访问时，厂商不能代为恢复 |
| Trezor — Hardware wallet overview | [Official URL](https://trezor.io/learn/basics/what-is-a-hardware-wallet) | 页面未显示 | 2026-08-20 | Trezor | 设备遗失与备份泄露是不同风险 |

## Needs Review

- Ledger Support 的最新型号专用恢复页面仍需逐型号核验。
- Trezor 的备份格式取决于型号、创建时间和配置。
- 设备被盗、PIN 可能泄露或材料疑似泄露时必须 Human Escalation。
- 本文不提供真实资产转移、设备破解或秘密提取步骤。

**与现有 APPROVED Knowledge 冲突：未发现。**

---
