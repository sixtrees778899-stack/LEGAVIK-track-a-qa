# 软件钱包恢复后看不到原地址或资产，应该检查什么？

**Status：PUBLISHED**

## 快速了解

先核对公开地址，而不是仅看钱包页面显示的余额。恢复后看不到原地址，可能与使用了不同恢复材料、附加账户尚未重新建立、Imported Account 未重新导入或硬件钱包未重新连接有关；地址正确但资产未显示，则应检查网络、代币显示和链上记录。不要为了排错向任何人披露 Seed Phrase 或 Private Key。

## 详细说明

“看不到原地址”和“看不到资产”是两类不同问题：

### 原地址没有出现

可能需要检查：

- 是否使用了与目标地址匹配的 Secret Recovery Phrase；
- 该地址是否属于同一 SRP 下的附加账户；
- 是否使用了另一组 SRP；
- 是否属于 Imported Account；
- 是否来自外部 JSON 文件；
- 是否属于连接的硬件钱包；
- 钱包是否使用 Google、Apple 或 Telegram 创建方式。

MetaMask 官方说明，在 SRP 恢复逻辑下，只有从相同 SRP 创建的账户会按相应恢复逻辑重新出现。通过 Private Key、JSON 或硬件钱包加入的账户，可能需要按原方式重新添加。Google、Apple 或 Telegram 创建方式使用不同的恢复逻辑，不能与 SRP 流程合并。[MetaMask Missing Accounts](https://support.metamask.io/configure/accounts/how-to-add-missing-accounts-after-restoring-with-secret-recovery-phrase)

### 地址正确，但资产没有显示

可能需要检查：

- 当前是否选择了正确网络；
- 交易是否已经在链上确认；
- 代币是否需要重新显示或添加；
- 钱包页面是否存在同步或显示问题；
- 资产是否位于另一个公开地址、网络或合约。

MetaMask 建议使用目标网络对应的 Block Explorer 查询公开地址。如果链上记录显示资产仍在该地址，但钱包没有显示，问题可能属于网络选择、代币检测或显示配置，而不是资产已经消失。[MetaMask Missing Token Balance](https://support.metamask.io/manage-crypto/tokens/what-to-do-when-your-balance-of-tokens-is-incorrect)

这些是 MetaMask 的具体规则。其他软件钱包可能使用不同的账户派生、备份、同步或资产显示机制，必须核验各自官方资料。

## 客户应该怎么做

### 1. 确认目标公开地址

从可靠的旧记录中找到预期公开地址，例如：

- 已确认的交易记录；
- 平台提现记录；
- 可信的 Block Explorer 记录；
- 自己保存的脱敏账户说明。

公开地址可以用于核对，不需要提供 Seed Phrase 或 Private Key。

### 2. 比较恢复后的地址

- 如果地址一致，继续检查网络和代币显示。
- 如果地址不同，先停止转账或签名，检查恢复材料和账户类型。
- 不要通过反复输入不同 SRP 猜测目标钱包。

### 3. 检查账户来源

确认缺失地址原本属于：

- 当前 SRP 创建的主账户或附加账户；
- 另一组 SRP；
- Private Key Imported Account；
- JSON Account；
- 连接的 Hardware Wallet；
- Google、Apple 或 Telegram 创建的钱包实例。

### 4. 检查正确网络

确认资产实际位于哪条网络。同一个公开地址可能在多个兼容网络上存在对应记录，但不同网络上的资产状态彼此独立。

### 5. 使用对应 Block Explorer 核对

通过可信的目标网络 Block Explorer 查询公开地址：

- 确认交易是否完成；
- 确认资产是否仍在该地址；
- 确认资产所在网络及合约。

不要点击 Explorer 中由陌生代币、错误信息或评论提供的外部链接。

### 6. 检查代币显示

如果 Explorer 显示资产存在，但钱包没有显示：

- 检查当前网络；
- 检查钱包的代币检测或显示功能；
- 仅从可信来源核对代币合约地址；
- 按目标钱包官方说明添加或显示代币。

## 注意事项

- 钱包页面未显示资产，不等于链上资产已经丢失。
- 看到陌生代币不代表应与其交互。
- 不要让“恢复客服”索取 SRP、Private Key、OTP 或远程控制设备。
- 不要在未确认地址和网络前发起测试转账或签名。
- 怀疑资产已被转走、地址遭入侵或出现未知授权时：`NEEDS REVIEW / HUMAN ESCALATION`。

## 相关知识

- 软件钱包所在手机丢失或 App 被删除后，应从哪里开始？
- Imported Account 为什么可能不会随主钱包一起恢复？
- DeFi 与链上资产恢复
- Crypto 恢复安全与诈骗

## 相关 Recovery Map 模块

- 资产与账户清单
- 恢复所需条件与资料
- 位置与查找
- 恢复与转移步骤

## 来源与核验

| Official Source | Official URL | Source / Updated Date | Last Verified | Applicable Region | Risk Notes |
|---|---|---|---|---|---|
| MetaMask Help — Add missing accounts after restoring | [Official URL](https://support.metamask.io/configure/accounts/how-to-add-missing-accounts-after-restoring-with-secret-recovery-phrase) | 页面未显示 | 2026-08-20 | MetaMask；恢复表现取决于创建方式和账户类型 | SRP、Imported Account、JSON、硬件钱包及社交登录逻辑不同 |
| MetaMask Help — SRP or private key restored the wrong account | [Official URL](https://support.metamask.io/configure/accounts/my-secret-recovery-phrase-private-key-restored-the-wrong-accounts) | 页面未显示 | 2026-08-20 | MetaMask | 错误 SRP、附加账户、Imported Account 和代币显示需分别判断 |
| MetaMask Help — Incorrect balance or missing token | [Official URL](https://support.metamask.io/manage-crypto/tokens/what-to-do-when-your-balance-of-tokens-is-incorrect) | 页面未显示 | 2026-08-20 | MetaMask；网络相关 | 钱包显示与链上余额可能暂时不一致 |
| MetaMask Help — Check wallet activity on a blockchain explorer | [Official URL](https://support.metamask.io/more-web3/learn/how-to-check-my-wallet-activity-on-the-blockchain-explorer) | 页面未显示 | 2026-08-20 | MetaMask；需使用目标网络对应 Explorer | 假 Explorer、恶意代币和钓鱼链接风险 |
| MetaMask Help — Display tokens | [Official URL](https://support.metamask.io/manage-crypto/tokens/how-to-display-tokens-in-metamask) | 页面未显示 | 2026-08-20 | MetaMask；功能因网络而异 | 添加错误或恶意合约可能造成交互风险 |

## Needs Review

- MetaMask 页面未显示更新时间，发布前必须重新核验。
- 其他软件钱包的账户派生、同步和资产显示机制需单独研究。
- 涉及未知转出、恶意授权或资产被盗时，应 Human Escalation。
- 本文不解决跨链 Bridge、DeFi 仓位或协议前端停运问题。

**与现有 APPROVED Knowledge 冲突：未发现。**

---
