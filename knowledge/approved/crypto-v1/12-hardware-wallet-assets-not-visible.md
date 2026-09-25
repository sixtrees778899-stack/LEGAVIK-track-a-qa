# 硬件钱包恢复后看不到原有资产，应检查哪些信息？

**Status：PUBLISHED**

## 快速了解

先核对恢复后的公开地址是否与原地址一致，再检查额外 Passphrase、账户类型、网络和钱包应用显示。恢复材料有效只说明它可以生成一组钱包密钥，不代表当前应用会自动显示所有账户和资产。不要因为余额为空就反复尝试不同秘密或立即交易。

## 详细说明

硬件钱包恢复后“看不到资产”可能代表：

- 恢复出了不同的公开地址；
- 使用了正确 Recovery Phrase，但没有使用原来的额外 Passphrase；
- 使用了不同 Passphrase，生成了另一组有效钱包；
- 原账户尚未在钱包应用中重新发现或添加；
- 当前选择了错误网络或账户类型；
- 资产需要通过第三方钱包应用查看；
- 钱包界面没有正确加载余额，但链上记录仍然存在。

通用原则是区分“钱包控制恢复”和“应用显示恢复”。硬件钱包恢复的是控制相应地址的密钥关系；钱包应用中的账户名称、网络、代币和界面设置不一定全部随设备恢复。

具体厂商规则存在差异：

- Ledger 表示 Secret Recovery Phrase 可恢复由其生成的相关账户和地址；如果使用额外 Passphrase，则该 Passphrase 会产生另一组账户。[Ledger：Secret Recovery Phrase](https://www.ledger.com/academy/basic-basics/2-how-to-own-crypto/whats-a-secret-recovery-phrase)
- Trezor 表示 Wallet Backup 与 Passphrase 的组合决定具体钱包。不同或误输入的 Passphrase 会打开另一个钱包，通常表现为空余额，而不会提示“接近正确”。[Trezor：Passphrase issues](https://trezor.io/support/troubleshooting/trezor-suite-issues/passphrase-hidden-wallets-issues)
- Trezor Suite 是否直接显示某种资产，还取决于该资产是否受支持或是否需要第三方钱包应用。[Trezor：Supported assets](https://trezor.io/learn/supported-assets/supported-coins)

## 客户应该怎么做

### 1. 核对公开地址

从可信历史记录中找到原公开地址，例如：

- 交易所提现记录；
- 已确认的交易记录；
- 可信 Block Explorer；
- Recovery Map 中保存的公开地址线索。

将其与恢复后钱包显示的地址逐字核对。

### 2. 确认恢复材料归属

确认使用的 Recovery Phrase / Wallet Backup：

- 对应正确设备和钱包；
- 格式与设备支持范围一致；
- 不是另一台设备或另一组钱包的备份；
- 如果是 Multi-share Backup，使用的是正确且匹配的 shares。

### 3. 检查额外 Passphrase

如果原钱包使用了额外 Passphrase，需要正确的 Wallet Backup / Recovery Phrase 与完全匹配的 Passphrase。不要因出现空钱包就创建交易或向其中转入资产。

### 4. 检查账户与网络

确认：

- 原资产使用的账户；
- 原资产所在网络；
- 钱包应用是否已添加相应账户；
- 该资产是否需要第三方官方支持的钱包界面；
- 显示问题是否仅限于某个网络或代币。

### 5. 使用链上公开信息核对

通过目标网络可信 Block Explorer 查询原公开地址，确认：

- 地址是否仍持有资产；
- 最近交易是否符合预期；
- 资产位于哪条网络；
- 问题属于地址不一致还是界面未显示。

### 6. 出现未知转出时停止

如果公开地址正确但链上显示未知转出，不应继续普通显示排错：

`NEEDS REVIEW / HUMAN ESCALATION`

## 注意事项

- 不要向 Ledger、Trezor、SKREK 或任何客服披露 Recovery Phrase、Private Key、Passphrase 或 PIN。
- 不要通过搜索广告或陌生链接下载钱包应用。
- 不要把错误 Passphrase 生成的空钱包误认为资产已经消失。
- 不要为了测试而发送真实资产。
- 材料疑似泄露、设备被盗或出现未知转出：`NEEDS REVIEW / HUMAN ESCALATION`。

## 相关知识

- 硬件钱包损坏或遗失后的安全恢复准备
- PIN、Recovery Phrase 与额外 Passphrase 有什么区别？
- Recovery Phrase 可用，但额外 Passphrase 遗失时意味着什么？
- 软件钱包恢复后看不到原地址或资产

## 相关 Recovery Map 模块

> Internal Knowledge / AI Retrieval Metadata；客户页面隐藏。

- 资产与账户清单
- 恢复所需条件与资料
- 位置与查找
- 恢复与转移步骤

## 来源与核验

| Official Source | Official URL | Source / Updated Date | Last Verified | Applicable Region / Network | Risk Notes |
|---|---|---|---|---|---|
| Ledger Academy — What is a Seed Phrase? | [Official URL](https://www.ledger.com/academy/basic-basics/2-how-to-own-crypto/whats-a-secret-recovery-phrase) | Published 2022-11-03; Updated 2026-06-19 | 2026-08-21 | Ledger；多网络 | Recovery Phrase 属于最高敏感级别材料 |
| Ledger Academy — Lost and Stolen Ledger Devices | [Official URL](https://www.ledger.com/academy/what-happens-if-i-lose-my-ledger) | Published 2022-07-15; Updated 2025-11-24 | 2026-08-21 | Ledger | 恢复服务和产品支持范围可能因型号变化 |
| Trezor — Passphrase and hidden wallet issues | [Official URL](https://trezor.io/support/troubleshooting/trezor-suite-issues/passphrase-hidden-wallets-issues) | 页面未显示 | 2026-08-21 | Trezor；依钱包配置适用 | 不同 Passphrase 会产生不同钱包 |
| Trezor — Backup and recovery troubleshooting | [Official URL](https://trezor.io/support/troubleshooting/trezor-suite-issues/troubleshoot-wallet-backup-and-recovery-problems) | 页面未显示 | 2026-08-21 | Trezor；BIP39/SLIP39 | 备份格式和设备型号必须匹配 |
| Trezor — Supported assets | [Official URL](https://trezor.io/learn/supported-assets/supported-coins) | 页面内容提及 2025-02 支持变化；未显示页面更新时间 | 2026-08-21 | Trezor Suite / 第三方钱包 | 资产支持和显示方式可能变化 |

## Needs Review

- Ledger 各型号最新账户发现与应用重建流程需要逐型号核验。
- Trezor Suite 与第三方钱包的资产支持需按币种和网络核验。
- 未知转出、设备被盗或材料疑似泄露必须 Human Escalation。
- 本文不提供真实资产转移或秘密提取步骤。

**与现有 APPROVED Knowledge 冲突：未发现。**

---
