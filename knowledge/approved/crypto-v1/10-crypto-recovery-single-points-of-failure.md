# 如何检查 Crypto 恢复体系中的单点故障？

**Status：PUBLISHED**

## 快速了解

单点故障是指一个设备、一份材料、一个位置、一个账户或一个人失效后，整条恢复路径就无法继续。检查重点不是复制更多秘密，而是确认关键恢复条件是否存在安全、相互独立且可辨认的替代路径。

## 详细说明

Crypto 恢复体系常见的单点故障包括：

- 只有一台设备可以访问钱包或账户；
- 只有一份 Recovery Phrase 或 Wallet Backup；
- 设备和备份保存在同一位置；
- Recovery Phrase 与额外 Passphrase 同时依赖一个位置；
- 所有交易所都依赖同一个 Email、手机号或 Authenticator；
- 只有一个人知道材料位置；
- Imported Account 没有独立材料说明；
- Multisig 的有效 signer 或配置资料过度集中；
- 只有钱包前端名称，没有公开地址、网络或恢复路径；
- 备份存在，但没有检查其归属、完整性或版本。

Ledger 将单一 Recovery Phrase 描述为自托管体系中的重要恢复依赖，也指出备份本身可能丢失或损坏。[Ledger：Backup Device](https://www.ledger.com/academy/hardwarewallet/increase-your-security-with-a-backup-device)

Trezor 支持不同类型的 Wallet Backup，包括 Single-share 和 Multi-share，但具体选择、阈值和保管方式会引入不同风险。额外 Passphrase 本身也可能成为新的单点故障。[Trezor：Wallet Backups](https://trezor.io/learn/security-privacy/personal-security-standards/understanding-trezor-wallet-backups-12-20-or-24-words)

减少单点故障不等于把秘密复制给更多人。未经设计的复制可能把“无法恢复”风险变成“被盗”风险。

## 客户应该怎么做

### 1. 按恢复路径逐项检查

针对每项重要资产询问：

- 需要什么材料？
- 材料在哪里？
- 谁知道如何找到？
- 对应哪个钱包、账户、网络或版本？
- 某个条件失效后，是否还有正式替代路径？

### 2. 检查设备单点

确认手机、电脑、硬件钱包或 Security Key 损坏后，是否仍有可验证的恢复路径。

### 3. 检查材料单点

确认核心材料是否：

- 只有一份；
- 只有一个保管位置；
- 容易同时受到火灾、水损、盗窃或设备故障影响；
- 与解锁材料集中存放；
- 无法识别对应钱包或版本。

### 4. 检查身份认证单点

确认 Email、手机号、2FA、Passkey 和 Security Key 是否过度依赖同一设备、同一云账户或同一个人。

### 5. 检查人员单点

确认是否只有一个人知道全部背景，或只有一个协助人能够解释恢复安排。协助人存在不代表应让其掌握全部秘密。

### 6. 检查账户结构

确认：

- Imported Account 是否有独立恢复说明；
- 额外 Passphrase Wallet 是否被正确标识；
- 多地址是否能与公开地址对应；
- Multisig 是否记录阈值、角色和配置线索；
- DeFi 资产是否仅依赖某个前端页面。

### 7. 记录缺口

在 Recovery Map 中记录缺口、影响范围和待处理事项，不要为消除缺口而直接复制或上传核心秘密。

## 注意事项

- 增加备份数量可能同时增加暴露面。
- 多地点保管不代表多个人都应获得完整控制能力。
- Passphrase 可以降低单一备份泄露的风险，也可能因遗忘形成新的单点故障。
- Multi-share、Multisig 和普通备份是不同机制，不应混为一谈。
- 发现材料疑似泄露：`NEEDS REVIEW / HUMAN ESCALATION`。
- 涉及死亡、失能、继承或法律授权：`NEEDS REVIEW / HUMAN ESCALATION`。

## 相关知识

- Crypto Recovery Materials
- Recovery Readiness
- Recovery Drill
- Multisig / Collaborative Wallet Recovery

## 相关 Recovery Map 模块

适用于 Recovery Map 全部六个模块：

1. 资产与账户清单
2. 恢复所需条件与资料
3. 位置与查找
4. 恢复与转移步骤
5. 协助人
6. 给未来恢复人的嘱托

## 来源与核验

| Official Source | Official URL | Source / Updated Date | Last Verified | Applicable Region | Risk Notes |
|---|---|---|---|---|---|
| Ledger Academy — Recovery Key | [Official URL](https://www.ledger.com/academy/topics/ledgersolutions/what-is-ledger-recovery-key) | Published/Updated 2025-07-24 | 2026-08-20 | 相应 Ledger 产品 | Ledger 将 Recovery Phrase 风险描述为自托管单点故障之一 |
| Ledger Academy — Backup Device | [Official URL](https://www.ledger.com/academy/hardwarewallet/increase-your-security-with-a-backup-device) | 页面未显示 | 2026-08-20 | Ledger | 页面较旧；备份设备并非所有客户的统一要求 |
| Trezor — Wallet backups | [Official URL](https://trezor.io/learn/security-privacy/personal-security-standards/understanding-trezor-wallet-backups-12-20-or-24-words) | 页面未显示 | 2026-08-20 | Trezor；依备份格式适用 | Multi-share 的阈值和位置设计需个案评估 |
| Trezor — Passphrase | [Official URL](https://trezor.io/guides/backups-recovery/advanced-wallets/what-is-a-passphrase) | 页面未显示 | 2026-08-20 | Trezor | Passphrase 遗忘会形成不可恢复风险 |
| MetaMask — Backup and sync | [Official URL](https://support.metamask.io/configure/wallet/account-backup-and-sync/) | 页面未显示 | 2026-08-20 | MetaMask Extension / Mobile | Private Key、JSON 和 Hardware Wallet 账户可能不自动同步 |
| Coinbase — Set up 2-step verification | [Official URL](https://help.coinbase.com/en/coinbase/getting-started/getting-started-with-coinbase/2-step-verification) | 页面未显示 | 2026-08-20 | Coinbase 页面适用范围 | 备用认证方式及支持范围可能变化 |

## Needs Review

- “单点故障”属于风险评估框架，不代表要求所有客户采用同一种备份方案。
- Multi-share、Multisig、家庭及机构方案需要专门风险设计。
- 不应在未评估暴露风险前建议复制更多核心秘密。
- 法律、继承和专业保管安排必须 Human Escalation。

**与现有 APPROVED Knowledge 冲突：未发现。**

---
