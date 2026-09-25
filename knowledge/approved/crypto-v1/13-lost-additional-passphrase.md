# Recovery Phrase 可用，但额外 Passphrase 遗失时意味着什么？

**Status：PUBLISHED**

## 快速了解

Recovery Phrase 可用，不代表能够恢复使用额外 Passphrase 创建的钱包。Recovery Phrase 与完全匹配的 Passphrase 共同决定该钱包的地址；Passphrase 不同会生成另一组有效钱包。如果额外 Passphrase 已永久遗失，厂商通常无法替客户重置或找回，应标记 `NEEDS REVIEW / HUMAN ESCALATION`。

## 详细说明

额外 Passphrase 不是设备 PIN，也不是能够通过 Email 或客服重置的普通密码。

在支持该功能的硬件钱包中：

- Recovery Phrase / Wallet Backup 提供基础恢复材料；
- Passphrase 与该基础材料组合；
- 每个不同 Passphrase 都会生成不同的钱包、账户和公开地址；
- 拼写、大小写、空格或字符差异都可能形成另一组有效钱包；
- 系统通常无法判断输入的是“错误 Passphrase”，因为该输入本身也能形成钱包。

Trezor 明确说明，Passphrase 不存储在设备中，无法由 Trezor Support 恢复。使用错误 Passphrase 时可能打开一个新的空钱包。[Trezor：What is a passphrase?](https://trezor.io/guides/backups-recovery/advanced-wallets/what-is-a-passphrase)

Ledger 说明，额外 Passphrase 会创建不能仅靠标准 24-word Secret Recovery Phrase 访问的另一组账户。[Ledger：Passphrase](https://www.ledger.com/academy/passphrase-an-advanced-security-feature)

这些属于厂商特定实现，不能直接推广到所有硬件钱包。

## 客户应该怎么做

### 1. 确认原钱包是否确实使用 Passphrase

通过非秘密线索检查：

- 原公开地址；
- 设备或钱包说明；
- 是否存在 Standard Wallet 与 Passphrase Wallet；
- 是否曾配置与 Passphrase 关联的设备访问方式；
- Recovery Map 是否记录了 Passphrase 存在性和保管位置。

### 2. 区分 PIN 与 Passphrase

确认遗失的是：

- 当前设备 PIN；
- Recovery Phrase / Wallet Backup；
- 额外 Passphrase；
- 还是本地钱包应用密码。

不要使用一种材料替代另一种材料。

### 3. 核对公开地址

如果输入某个 Passphrase 后出现钱包，应将其公开地址与历史地址比较。不要仅凭余额或账户名称判断是否正确。

### 4. 检查安全保管线索

只检查 Passphrase 的既定保管位置和恢复线索。不要：

- 向客服发送 Recovery Phrase；
- 使用网络“找回工具”；
- 上传备份进行 Passphrase 猜测；
- 让陌生人远程控制设备；
- 进行大规模暴力尝试。

### 5. 无法确认时停止

如果没有可靠线索，或 Passphrase 被确认永久遗失，应停止形成确定性恢复结论：

`NEEDS REVIEW / HUMAN ESCALATION`

## 注意事项

- 正确 Recovery Phrase 加错误 Passphrase，可能生成一个有效但不同的钱包。
- 空余额不等于系统确认 Passphrase 错误。
- 硬件钱包厂商无法通过公开地址为客户恢复或重置额外 Passphrase。
- 不应在 Recovery Map 中记录或上传完整 Passphrase。
- Passphrase 疑似泄露与 Passphrase 永久遗失是不同风险，两者均需 Human Escalation。
- 不提供 Passphrase 破解、猜测或秘密提取方法。

## 相关知识

- PIN、Recovery Phrase 与额外 Passphrase 有什么区别？
- 硬件钱包恢复后看不到原有资产
- Crypto Recovery Materials
- 如何检查 Crypto 恢复体系中的单点故障？

## 相关 Recovery Map 模块

> Internal Knowledge / AI Retrieval Metadata；客户页面隐藏。

- 恢复所需条件与资料
- 位置与查找
- 恢复与转移步骤

## 来源与核验

| Official Source | Official URL | Source / Updated Date | Last Verified | Applicable Region / Network | Risk Notes |
|---|---|---|---|---|---|
| Trezor — What is a passphrase? | [Official URL](https://trezor.io/guides/backups-recovery/advanced-wallets/what-is-a-passphrase) | 页面未显示 | 2026-08-21 | Trezor；所有支持 Passphrase 的型号 | Passphrase 无法由厂商恢复或重置 |
| Trezor — Passphrase and hidden wallet issues | [Official URL](https://trezor.io/support/troubleshooting/trezor-suite-issues/passphrase-hidden-wallets-issues) | 页面未显示 | 2026-08-21 | Trezor | 每个不同 Passphrase 产生不同钱包 |
| Trezor — Use a passphrase wallet | [Official URL](https://trezor.io/guides/trezor-suite/using-a-passphrase-wallet-in-trezor-suite) | 页面未显示 | 2026-08-21 | Trezor Suite | 官方支持不能找回 Passphrase |
| Ledger Academy — Passphrase | [Official URL](https://www.ledger.com/academy/passphrase-an-advanced-security-feature) | 页面未显示 | 2026-08-21 | Ledger | Passphrase 账户不能仅靠标准 Recovery Phrase 访问 |
| Ledger Academy — What is a Seed Phrase? | [Official URL](https://www.ledger.com/academy/basic-basics/2-how-to-own-crypto/whats-a-secret-recovery-phrase) | Published 2022-11-03; Updated 2026-06-19 | 2026-08-21 | Ledger；多网络 | Recovery Phrase 与额外 Passphrase 作用不同 |

## Needs Review

- “永久遗失”只能在客户确认没有任何合法保管线索后谨慎描述。
- 不评估或推荐任何 Passphrase recovery / cracking service。
- Passphrase 疑似泄露或永久遗失：`HUMAN ESCALATION`。
- 死亡、失能或继承场景：`NEEDS REVIEW / HUMAN ESCALATION`。

**与现有 APPROVED Knowledge 冲突：未发现。**

---
