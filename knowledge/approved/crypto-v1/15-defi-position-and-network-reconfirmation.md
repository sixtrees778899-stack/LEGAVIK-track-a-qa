# 钱包恢复后，如何重新确认 DeFi 资产、协议仓位与网络位置？

**Status：PUBLISHED**

## 快速了解

先确认恢复后的公开地址，再按网络、协议和仓位逐层核对。钱包余额页未显示某项 DeFi 资产，不代表仓位不存在；应使用公开地址、可信 Block Explorer、协议官方页面和历史交易线索确认。确认阶段不需要披露 Seed Phrase、Private Key 或签署交易。


本文重点是恢复钱包控制后，对已有 DeFi 仓位进行重新定位和核对，而不是执行赎回、退出或资产转移。

## 详细说明

DeFi 资产可能不以普通代币余额形式直接显示。它们可能表现为：

- Lending 或 Borrowing 仓位；
- Staking 或 Restaking；
- Liquidity Pool / LP；
- Vault；
- Farming；
- Bridge 中的跨链资产；
- 锁定或待领取资产；
- NFT 或代表仓位的 Token；
- 协议内部记录；
- 多条网络上的相同公开地址。

钱包恢复只恢复相应地址的控制能力，不一定恢复：

- 原钱包应用中的自定义网络；
- 自定义代币显示；
- 已收藏的协议入口；
- 协议仓位标签；
- 历史界面设置；
- 第三方 Portfolio 数据。

MetaMask Portfolio 提供 DeFi Dashboard，用于显示其当前支持的协议和仓位；但未显示某个协议不等于仓位不存在，协议可能尚未被支持或网络处于 Inactive 状态。[MetaMask：DeFi Dashboard](https://support.metamask.io/manage-crypto/portfolio/how-to-use-the-defi-dashboard-in-metamask-portfolio)

## 客户应该怎么做

### 1. 确认公开地址

将恢复后的地址与以下记录比较：

- 历史交易；
- 交易所提现记录；
- 协议存款或借款记录；
- Recovery Map 中的公开地址；
- 可信 Block Explorer。

地址不一致时，先回到钱包恢复问题，不要继续协议操作。

### 2. 建立网络清单

记录该地址可能使用过的网络：

- 网络正式名称；
- Chain ID；
- 可信 Block Explorer；
- 原生 Gas 资产；
- 是否存在 Bridge 记录。

同一个公开地址可能在多个兼容网络上存在对应记录，但不同网络上的资产状态彼此独立。

### 3. 检查链上活动

使用各网络的可信 Block Explorer 查看：

- 历史交易；
- Token Transfers；
- 合约交互；
- LP、Vault 或 Staking 相关 Token；
- Bridge 交易；
- 当前余额。

只使用公开地址查询，不需要连接钱包。

### 4. 建立协议清单

从历史交易和已有记录确认：

- 协议名称；
- 官方域名；
- 网络；
- 合约或仓位类型；
- 最近交互日期；
- 是否发生协议迁移或升级。

不要从搜索广告直接进入协议页面。

### 5. 使用官方或可信只读入口核对

优先使用：

- 协议官方页面；
- 官方 Documentation；
- 官方公告；
- 可信 Block Explorer；
- 钱包官方 Portfolio 工具。

如果需要连接钱包，应先确认域名和网络；仅为查询时，不应签署交易或授权。

### 6. 对照借贷与风险状态

如果涉及借款、抵押、清算、到期或协议暂停，不要仅依据聚合页面判断。应核对目标协议官方资料和链上状态：

`NEEDS REVIEW / HUMAN ESCALATION`

## 注意事项

- Portfolio 或钱包界面不一定覆盖所有协议和网络。
- “连接钱包”与“签署交易或授权”不是同一行为，但恢复核对阶段应尽量先使用只读信息。
- 不要签署看不懂的消息、交易或 Token Approval。
- 不要与陌生空投、错误信息或未知合约交互。
- 协议被攻击、暂停、清算或前端停运：`NEEDS REVIEW / HUMAN ESCALATION`。
- 资产疑似被盗或授权异常：`NEEDS REVIEW / HUMAN ESCALATION`。

## 相关知识

- 软件钱包恢复后看不到原地址或资产
- Imported Account 为什么可能不会随主钱包恢复？
- DeFi 与链上资产恢复
- Crypto 恢复安全与诈骗

## 相关 Recovery Map 模块

> Internal Knowledge / AI Retrieval Metadata；客户页面隐藏。

- 资产与账户清单
- 恢复所需条件与资料
- 位置与查找
- 恢复与转移步骤

## 来源与核验

| Official Source | Official URL | Source / Updated Date | Last Verified | Applicable Region / Network | Risk Notes |
|---|---|---|---|---|---|
| MetaMask Help — DeFi Dashboard | [Official URL](https://support.metamask.io/manage-crypto/portfolio/how-to-use-the-defi-dashboard-in-metamask-portfolio) | 页面未显示 | 2026-08-21 | MetaMask Portfolio 支持的网络和协议 | Dashboard 覆盖范围不是完整链上事实 |
| MetaMask Help — Check activity on a Block Explorer | [Official URL](https://support.metamask.io/more-web3/learn/how-to-check-my-wallet-activity-on-the-blockchain-explorer) | 页面未显示 | 2026-08-21 | Ethereum 及文中列出的兼容网络 | 必须使用目标网络对应 Explorer |
| MetaMask Help — Incorrect balance or missing token | [Official URL](https://support.metamask.io/manage-crypto/tokens/what-to-do-when-your-balance-of-tokens-is-incorrect) | 页面未显示 | 2026-08-21 | MetaMask；多网络 | 钱包显示和链上状态可能不同 |
| MetaMask Help — Display tokens | [Official URL](https://support.metamask.io/manage-crypto/tokens/how-to-display-tokens-in-metamask) | 页面未显示 | 2026-08-21 | MetaMask；网络支持范围可能变化 | 恶意或错误 Token Contract 风险 |
| Ledger Academy — Ice Phishing | [Official URL](https://www.ledger.com/academy/glossary/ice-phishing) | Published/Updated 2026-06-02 | 2026-08-21 | EVM 等使用 Token Approval 的网络 | 恶意授权可能在恢复核对期间发生 |

## Needs Review

- 每个 DeFi 协议的仓位、退出、迁移和清算规则必须使用其官方资料单独核验。
- MetaMask Portfolio 未显示的协议不能据此判定没有仓位。
- 协议攻击、暂停、清算、跨链异常或资产疑似被盗必须 Human Escalation。
- 本文不提供真实赎回、撤资、Bridge 或授权撤销步骤。

**与现有 APPROVED Knowledge 冲突：未发现。**

---
