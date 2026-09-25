# Imported Account 为什么可能不会随主钱包一起恢复？

**Status：PUBLISHED**

## 快速了解

Imported Account 可能由独立 Private Key、JSON 文件、另一组 Secret Recovery Phrase 或硬件钱包控制，并不一定由当前主钱包的 SRP 派生。因此，恢复主钱包后，它可能不会自动出现。应先确认账户原始加入方式和公开地址，再按该钱包的官方说明重新添加；不要把不同恢复材料混为一套。

## 详细说明

软件钱包界面可以同时显示多个账户，但这些账户不一定共享同一恢复来源。

以 MetaMask 为例，需要区分：

- 从当前 SRP 派生的账户；
- 使用另一组 SRP 加入的账户；
- 使用独立 Private Key 导入的账户；
- 使用 JSON 文件导入的账户；
- 连接的 Hardware Wallet Account；
- 通过 Google、Apple 或 Telegram 创建的钱包实例。

在 MetaMask 的 SRP 恢复逻辑下，当前 SRP 只能恢复由该 SRP 派生的账户。Private Key、JSON 或硬件钱包账户可能需要按原始方式重新添加。即使这些账户过去显示在同一个钱包界面中，也不代表它们受同一 SRP 控制。[MetaMask Missing Accounts](https://support.metamask.io/configure/accounts/how-to-add-missing-accounts-after-restoring-with-secret-recovery-phrase)

Google、Apple 或 Telegram 创建方式属于不同恢复逻辑。MetaMask 当前官方资料说明，通过这种方式创建的钱包实例可能恢复其关联账户，但硬件钱包仍需单独处理。该规则不能用于推断其他钱包，也不能与传统 SRP 恢复流程混写。

## 客户应该怎么做

### 1. 确认缺失账户的公开地址

从可信的历史记录中确认目标公开地址。不要仅凭以前使用的账户名称判断，因为本地名称可能不会随恢复保留。

### 2. 确认原始加入方式

检查该账户最初是：

- 从当前 SRP 创建；
- 从另一组 SRP 创建；
- 使用 Private Key 导入；
- 使用 JSON 文件导入；
- 通过 Hardware Wallet 连接；
- 由 Google、Apple 或 Telegram 钱包实例管理。

### 3. 检查当前恢复方式

如果当前使用 SRP 恢复：

- 同一 SRP 下的附加账户可能需要按原创建顺序重新添加；
- Imported Private Key 或 JSON Account 可能需要相应独立材料；
- Hardware Wallet Account 需要重新连接对应设备；
- 另一组 SRP 控制的账户不会由当前 SRP 自动恢复。

如果钱包原来通过 Google、Apple 或 Telegram 创建，应使用该创建方式对应的官方恢复逻辑，不要直接假设传统 SRP 行为完全相同。

### 4. 核对恢复结果

重新添加后：

- 比较公开地址是否与历史地址完全一致；
- 确认使用的是正确网络；
- 使用可信 Block Explorer 核对链上记录；
- 不要仅因账户名称或代币显示不同就判断恢复失败。

### 5. 缺少独立材料时停止

如果 Imported Account 的独立 Private Key、JSON 文件、硬件设备或另一组 SRP 均无法取得，主钱包的 SRP 通常不能替代这些材料。不要尝试破解、猜测或向第三方披露其他秘密。

## 注意事项

- “显示在同一个钱包里”不等于“由同一个 SRP 控制”。
- Private Key 通常控制一个特定账户，而 Secret Recovery Phrase 可以派生多个账户；两者承担的恢复作用不同，不能相互替代。
- JSON 文件可能需要其对应密码，但具体格式和恢复方式取决于钱包。
- Hardware Wallet 的私钥不应从设备中导出后作为普通 Imported Account 使用。
- 不要向客服发送 Seed Phrase、Private Key、JSON 文件、密码、OTP 或 Authenticator Setup Key。
- 如果材料疑似泄露或账户出现未知转出：`NEEDS REVIEW / HUMAN ESCALATION`。

## 相关知识

- 软件钱包所在手机丢失或 App 被删除后，应从哪里开始？
- 软件钱包恢复后看不到原地址或资产，应该检查什么？
- Crypto Recovery Materials
- Recovery Material 安全

## 相关 Recovery Map 模块

- 资产与账户清单
- 恢复所需条件与资料
- 位置与查找
- 恢复与转移步骤

## 来源与核验

| Official Source | Official URL | Source / Updated Date | Last Verified | Applicable Region | Risk Notes |
|---|---|---|---|---|---|
| MetaMask Help — Add missing accounts after restoring | [Official URL](https://support.metamask.io/configure/accounts/how-to-add-missing-accounts-after-restoring-with-secret-recovery-phrase) | 页面未显示 | 2026-08-20 | MetaMask；依创建方式和账户类型适用 | SRP、Private Key、JSON、Hardware Wallet 和社交登录恢复不同 |
| MetaMask Help — Restore your wallet | [Official URL](https://support.metamask.io/configure/wallet/using-the-same-metamask-wallet-on-multiple-devices) | 页面未显示 | 2026-08-20 | MetaMask | 新安装恢复后可能需重新添加网络、代币或外部账户 |
| MetaMask Help — Wrong account restored | [Official URL](https://support.metamask.io/configure/accounts/my-secret-recovery-phrase-private-key-restored-the-wrong-accounts) | 页面未显示 | 2026-08-20 | MetaMask | 错误 SRP、附加账户和 Imported Account 需分别检查 |
| MetaMask Help — Backup and sync | [Official URL](https://support.metamask.io/configure/wallet/account-backup-and-sync/) | 页面未显示 | 2026-08-20 | MetaMask Extension / Mobile；功能可能变化 | Private Key、JSON 和 Hardware Wallet 账户的同步能力有限 |

## Needs Review

- MetaMask 页面未显示更新时间，正式发布前需要再次核验。
- Google、Apple、Telegram 创建方式及 Backup and Sync 功能变化较快。
- JSON 文件格式、密码要求和导入支持需按具体钱包核验。
- 其他软件钱包不得直接套用 MetaMask 的 Imported Account 规则。

**与现有 APPROVED Knowledge 冲突：未发现。**
