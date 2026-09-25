# PIN、Recovery Phrase 与额外 Passphrase 有什么区别？

**Status：PUBLISHED**

## 快速了解

PIN 通常用于解锁当前硬件设备；Recovery Phrase 或 Wallet Backup 用于恢复钱包；额外 Passphrase 会与基础备份共同生成另一组钱包。三者承担的作用不同，不能相互替代。忘记额外 Passphrase 时，即使 Recovery Phrase 正确，也可能无法进入预期钱包。

## 详细说明

### PIN

PIN 是当前设备的访问保护。它通常用于解锁硬件钱包并降低设备遗失后被直接使用的风险。

PIN 一般不是钱包的跨设备恢复材料。设备损坏、重置或更换后，原 PIN 通常不能单独重建钱包。

### Recovery Phrase / Wallet Backup

Recovery Phrase、Seed Phrase、Secret Recovery Phrase 或 Wallet Backup 是不同厂商可能使用的相关术语。它们通常用于在设备遗失、损坏或重置后恢复钱包控制能力。

厂商使用的格式可能不同：

- Ledger 官方资料主要使用 24-word Secret Recovery Phrase；
- Trezor 当前使用 Wallet Backup，并可能采用不同字数的 BIP39 或 SLIP39 格式。

不能仅根据字数猜测备份所属钱包、厂商或版本。

### 额外 Passphrase

额外 Passphrase 是部分硬件钱包提供的高级功能。它不是设备 PIN，也不是对原 Recovery Phrase 的简单登录密码。

Ledger 和 Trezor 均说明，Passphrase 与基础恢复备份组合后会产生另一组钱包。不同的 Passphrase，包括拼写、大小写或空格差异，都可能得到不同的钱包，而不是显示“密码错误”。[Ledger：Passphrase](https://www.ledger.com/academy/passphrase-an-advanced-security-feature) [Trezor：Passphrase](https://trezor.io/guides/backups-recovery/advanced-wallets/what-is-a-passphrase)

## 客户应该怎么做

1. 确认设备 PIN 是否只是当前设备的解锁方式。
2. 确认 Recovery Phrase / Wallet Backup 的厂商、格式和对应钱包。
3. 确认自己是否启用了额外 Passphrase。
4. 使用公开地址记录不同钱包之间的对应关系。
5. 在 Recovery Map 中记录：
   - 材料类型；
   - 保管位置线索；
   - 对应设备或钱包；
   - 是否存在额外 Passphrase；
   - 必要的恢复顺序。
6. 不记录或上传完整 PIN、Recovery Phrase 或 Passphrase。
7. 恢复后如果出现不同地址，先核对备份和 Passphrase 关系，不要立即进行交易。

## 注意事项

- PIN、Recovery Phrase / Wallet Backup 和 Passphrase 都属于需要妥善保护的安全信息，但其作用和敏感等级不同。
- 额外 Passphrase 属于高敏感材料，不应作为普通 Recovery Map 内容记录或上传。
- 正确 Recovery Phrase 加上不同 Passphrase，可能形成另一个有效钱包。
- 不要把厂商的品牌术语强行视为完全相同的数据格式。
- 不要尝试通过大量猜测 Passphrase 寻找钱包。
- 材料疑似泄露：`NEEDS REVIEW / HUMAN ESCALATION`。

## 相关知识

- 硬件钱包损坏或遗失后的安全恢复准备
- Crypto Recovery Materials
- 软件钱包恢复后看不到原地址或资产
- Recovery Material 安全

## 相关 Recovery Map 模块

- 恢复所需条件与资料
- 位置与查找
- 恢复与转移步骤

## 来源与核验

| Official Source | Official URL | Source / Updated Date | Last Verified | Applicable Region | Risk Notes |
|---|---|---|---|---|---|
| Ledger Academy — Recovery Sheet | [Official URL](https://www.ledger.com/academy/glossary/recovery-sheet) | Published/Updated 2025-07-24 | 2026-08-20 | Ledger | Secret Recovery Phrase 可重建钱包控制能力 |
| Ledger Academy — Passphrase | [Official URL](https://www.ledger.com/academy/passphrase-an-advanced-security-feature) | 页面未显示 | 2026-08-20 | Ledger | Passphrase 会形成不同账户集合 |
| Ledger Academy — Keep My Crypto Safe | [Official URL](https://www.ledger.com/academy/how-to-make-sure-that-my-crypto-stays-safe-with-ledger) | 页面未显示 | 2026-08-20 | Ledger | PIN 与 Recovery Phrase 作用不同；页面较旧 |
| Trezor — Wallet backups | [Official URL](https://trezor.io/learn/security-privacy/personal-security-standards/understanding-trezor-wallet-backups-12-20-or-24-words) | 页面未显示 | 2026-08-20 | Trezor；依型号及备份格式适用 | BIP39 与 SLIP39 结构不同 |
| Trezor — What is a passphrase? | [Official URL](https://trezor.io/guides/backups-recovery/advanced-wallets/what-is-a-passphrase) | 页面未显示 | 2026-08-20 | Trezor | Passphrase 无法由厂商重置或恢复 |
| Trezor Glossary — PIN and Passphrase | [Official URL](https://trezor.io/learn/basics/glossary) | 页面未显示 | 2026-08-20 | Trezor | PIN、Passphrase 与 Wallet Backup 不可互换 |

## Needs Review

- 术语和备份格式必须按具体厂商、设备型号及创建时间核验。
- Ledger 和 Trezor 的 PIN 错误处理机制不得概括为统一次数或结果。
- Passphrase 遗忘、材料损坏或疑似泄露需要 Human Escalation。
- 本文不提供 Passphrase 猜测、设备破解或秘密提取方法。

**与现有 APPROVED Knowledge 冲突：未发现。**

---
