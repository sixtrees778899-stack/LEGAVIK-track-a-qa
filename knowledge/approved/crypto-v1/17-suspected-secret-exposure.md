# Seed Phrase、Private Key 或 Passphrase 疑似泄露后，应该先做什么？

**Status：PUBLISHED**

## 快速了解

如果 Seed Phrase / Secret Recovery Phrase、Private Key 或额外 Passphrase 疑似被他人看到、复制、上传、截屏、输入到可疑网站，或曾存放在可能被入侵的设备中，应将其视为安全事件。

不同材料的影响范围不同：

- Seed Phrase / Secret Recovery Phrase 疑似泄露，可能影响由它派生的多个账户。
- Private Key 疑似泄露，通常影响该密钥控制的特定账户。
- 额外 Passphrase 的风险取决于它是否与对应的 Recovery Phrase / Wallet Backup 一同泄露，以及钱包厂商的具体实现。
- 恶意授权、可疑签名或未知转出不一定代表 Recovery Phrase 已泄露，但仍可能直接威胁资产。

本文只说明如何停止继续暴露、确认影响范围并准备升级处理，不提供未经确认的资产转移、破解或秘密提取步骤。

## 详细说明

### 一、什么情况应视为“疑似泄露”？

包括但不限于：

- 将核心秘密输入非官方网页、表单、聊天窗口或远程协助工具；
- 向所谓客服、恢复人员或第三方发送照片、截图或文字；
- 将核心秘密保存在疑似感染恶意软件的设备、云盘、邮箱或普通笔记中；
- 纸质或实体备份曾丢失、被打开、被拍摄或由未经授权的人接触；
- 安装过假钱包、假扩展或来源不明的钱包应用；
- 出现无法解释的签名、授权或链上交易；
- 公开地址持续出现未知转出，或怀疑存在自动转出程序。

MetaMask 明确指出，未经授权的交易可能源于 Recovery Phrase / Private Key 暴露、恶意软件、钓鱼网站、假扩展或危险的智能合约授权；其自托管模式也意味着平台无法替客户控制账户或撤销链上交易。[MetaMask 官方说明](https://support.metamask.io/stay-safe/protect-yourself/ive-been-hacked-scammed-unauthorized-transactions-on-my-account)

### 二、不同材料的影响范围

#### Seed Phrase / Secret Recovery Phrase

它通常用于派生和恢复多个账户。任何取得该材料的人，都可能获得相应钱包体系的控制能力。

不要：

- 再次将它输入可疑设备或网站；
- 通过邮件、聊天、工单或屏幕共享发送；
- 为“验证是否有效”而反复尝试；
- 将它记录在 Recovery Map 正文或普通附件中。

Ledger 明确说明，Secret Recovery Phrase 可以恢复其关联账户，任何取得它的人都可能控制相应钱包；官方也明确反对在电脑、手机或网站中输入或分享该材料。[Ledger 官方说明](https://www.ledger.com/academy/basic-basics/2-how-to-own-crypto/whats-a-secret-recovery-phrase)

#### Private Key

Private Key 通常控制一个特定账户。需要先确认该账户对应的公开地址、网络和资产范围，但不得把 Private Key 提交给客服或第三方进行“核验”。

#### 额外 Passphrase

额外 Passphrase 可能与 Recovery Phrase / Wallet Backup 共同决定实际恢复出的钱包。仅知道 Passphrase 是否足以造成风险，取决于对应的钱包设计和攻击者是否同时掌握其他必要材料。

不要将“只泄露了其中一项”直接理解为绝对安全。

Trezor 说明，每个不同的 Passphrase 都可能产生不同钱包，而且厂商无法恢复遗失的 Passphrase。[Trezor 官方说明](https://trezor.io/guides/backups-recovery/advanced-wallets/what-is-a-passphrase)

### 三、首先应做什么？

#### 1. 停止继续暴露

- 停止在可疑网站、应用、设备或聊天中输入任何核心秘密；
- 停止与主动联系你的所谓客服或恢复人员沟通；
- 不再扫描可疑二维码、安装未知软件或签署新请求；
- 不把核心秘密复制到新的普通数字记录中。

#### 2. 记录不含秘密的事件线索

可以记录：

- 哪一种材料可能泄露；
- 发生时间和发现时间；
- 涉及的设备、应用、网站或沟通渠道；
- 钱包或账户的公开地址；
- 涉及的网络；
- 可疑交易哈希、合约地址和时间；
- 是否存在未知授权、未知签名或未知转出；
- 是否仍能正常访问钱包界面；
- 是否存在多个派生账户、Imported Account、硬件钱包或额外 Passphrase。

不要记录或上传：

- Seed Phrase / Secret Recovery Phrase；
- Private Key；
- 额外 Passphrase；
- 钱包备份原文；
- PIN、OTP 或 Authenticator Setup Key。

#### 3. 从只读信息确认影响范围

在不签名、不连接可疑网站、不输入秘密的前提下，可使用可信区块浏览器查看公开地址的公开记录，并核对：

- 哪些地址出现异常；
- 异常发生在哪条网络；
- 是否为实际转出、合约交互或 Token Approval；
- 是否存在多个账户同时出现异常；
- 首次异常发生的时间。

“连接钱包”和“Token Approval”不是同一概念；仅断开 dapp 连接不会自动撤销已有的链上授权。[MetaMask 官方说明](https://support.metamask.io/more-web3/dapps/disconnect-wallet-from-a-dapp/)

#### 4. 将高风险情况升级处理

以下情况进入 **NEEDS REVIEW / HUMAN ESCALATION**：

- 已发生资产损失或未知转出；
- 发现恶意授权、可疑签名或 Sweeper 行为；
- 不清楚泄露的是单个 Private Key 还是完整 Recovery Phrase；
- Recovery Phrase 与额外 Passphrase 可能同时泄露；
- 同一材料关联多个钱包、网络、DeFi 仓位或 Multisig signer；
- 涉及大额资产、组织资产、托管账户、受监管账户或法律争议；
- 当前设备可能仍受恶意软件控制；
- 任何处置都可能要求签名、支付 Gas、撤销授权或移动资产。

后续是否需要建立新的未受影响钱包、处理授权或采取其他链上措施，应根据钱包类型、网络状态和官方指引单独判断。本文不提供通用资产转移步骤。

## 安全边界

- 正规钱包、交易所或硬件钱包客服不应要求客户提供 Seed Phrase、Private Key、额外 Passphrase 或 Authenticator Setup Key。
- 不向任何人提供核心秘密，即使对方声称可以追回资产。
- 不进行暴力尝试、秘密提取、设备破解或权限绕过。
- 不保证已转出的链上资产能够撤销或追回。
- 不依据社交媒体私信、群聊或未经核验的社区步骤处理资产。
- 材料疑似泄露时，不应继续把原材料当作普通恢复线索使用。

## 相关知识

- Crypto Recovery Materials：Recovery Map 应记录什么、不应记录什么？
- 如何识别虚假的 Crypto 恢复服务、客服和“资产找回”骗局？
- 软件钱包恢复后看不到原地址或资产，应该检查什么？
- Recovery Phrase 可用，但额外 Passphrase 遗失时意味着什么？
- 如何检查 Crypto 恢复体系中的单点故障？

## 相关 Recovery Map 模块

> **Internal Knowledge / AI Retrieval Metadata — 客户页面隐藏**

- 资产与账户清单
- 访问与认证路径
- 恢复材料与位置
- 风险与异常记录
- 支持与升级路径

## 官方来源与核验

| Official Source | Official URL | Source / Updated Date | Last Verified | Applicable Region / Network | Risk Notes |
|---|---|---|---|---|---|
| MetaMask — I’ve been hacked or scammed | [Official URL](https://support.metamask.io/stay-safe/protect-yourself/ive-been-hacked-scammed-unauthorized-transactions-on-my-account) | 页面未标示 | 2026-08-21 | MetaMask；多网络 | 官方页面包含资产处置步骤；本 Draft 未转述，实际事件进入人工升级 |
| MetaMask — How to verify the real MetaMask wallet | [Official URL](https://support.metamask.io/stay-safe/safety-in-web3/how-do-i-recognize-the-real-metamask-/) | 页面未标示 | 2026-08-21 | MetaMask | 用于核验假网站、假支持及 SRP 暴露边界 |
| MetaMask — Revoke token approvals | [Official URL](https://support.metamask.io/more-web3/learn/how-to-revoke-smart-contract-allowances-token-approvals) | 页面未标示 | 2026-08-21 | 支持范围依页面及网络而异 | 撤销属于链上交易；本文不提供执行步骤 |
| Ledger — What is a Seed Phrase? | [Official URL](https://www.ledger.com/academy/basic-basics/2-how-to-own-crypto/whats-a-secret-recovery-phrase) | Updated 2026-06-19 | 2026-08-21 | Ledger；兼容网络 | 用于核验 SRP 的控制范围和保密要求 |
| Ledger — What To Do If Your Crypto Project Gets Hacked | [Official URL](https://www.ledger.com/academy/basic-basics/launch-a-crypto-project-securely/what-to-do-if-your-crypto-project-gets-hacked) | Updated 2026-01-12 | 2026-08-21 | 通用 Crypto 安全事件 | 原文包含具体处置方法；本文仅采用风险分类 |
| Trezor — Funds sent without your authorization | [Official URL](https://trezor.io/support/troubleshooting/trezor-suite-issues/funds-sent-without-your-authorization) | 页面未标示 | 2026-08-21 | Trezor；兼容网络 | 未知转出属于高风险事件 |
| Trezor — What is a passphrase? | [Official URL](https://trezor.io/guides/backups-recovery/advanced-wallets/what-is-a-passphrase) | 页面未标示 | 2026-08-21 | Trezor | 具体 Passphrase 逻辑不可泛化至所有钱包 |

## Needs Review

**NEEDS REVIEW / HUMAN ESCALATION：**

- 已发生资产损失或未知转出；
- 恶意授权、可疑签名或 Sweeper 行为；
- 材料实际泄露范围无法确认；
- Recovery Phrase 与额外 Passphrase 可能同时泄露；
- 任何拟议措施涉及签名、Gas、授权变更或资产移动；
- 涉及 Multisig、DeFi、托管、组织或受监管资产；
- 涉及报案、司法、监管、冻结或第三方追偿。

**与现有 APPROVED Knowledge 冲突：未发现。**

---
