# 软件钱包所在手机丢失或 App 被删除后，应从哪里开始？

**Status：PUBLISHED**

## 快速了解

先不要急于重新安装或输入恢复材料。确认目标钱包、官方应用入口、钱包创建方式，以及自己是否持有匹配的恢复材料。不同软件钱包的恢复结构不同；本 Draft 的具体事实主要依据 MetaMask 官方资料，不能直接套用于其他钱包。

## 详细说明

手机丢失或 App 被删除后，恢复能力取决于钱包采用的控制方式，而不是 App 图标是否还存在。

以 MetaMask 为例，当前至少需要区分：

- 使用 Secret Recovery Phrase 创建的钱包；
- 使用 Google、Apple 或 Telegram 登录方式创建的钱包；
- 从其他 Private Key 或 JSON 文件导入的账户；
- 连接的硬件钱包账户。

对于以 Secret Recovery Phrase 创建的 MetaMask 钱包，本地密码主要用于解锁当前设备上的钱包，不能代替 Secret Recovery Phrase 在新设备恢复。使用 Google、Apple 或 Telegram 创建的钱包则采用不同的访问组合，需要相应登录账户及 MetaMask 密码。[MetaMask：SRP、密码与私钥](https://support.metamask.io/start/user-guide-secret-recovery-phrase-password-and-private-keys)

通过 Secret Recovery Phrase 恢复后，原来手动导入的 Private Key、JSON Account 或硬件钱包账户可能不会自动出现，需要使用各自原有方式重新添加。[MetaMask：恢复后补回缺失账户](https://support.metamask.io/configure/accounts/how-to-add-missing-accounts-after-restoring-with-secret-recovery-phrase)

## 客户应该怎么做

### 1. 先保护原设备和关联账户

如果手机遗失或被盗：

- 保护设备锁屏账户、Email 和 SIM；
- 检查是否存在未经授权的活动；
- 不要通过陌生远程协助服务处理钱包；
- 如果怀疑核心恢复材料已经泄露，停止普通恢复并寻求安全升级。

### 2. 确认钱包创建方式

检查自己原来使用的是：

- Secret Recovery Phrase；
- Google、Apple 或 Telegram 登录；
- 导入的 Private Key 或 JSON；
- 连接的硬件钱包；
- 其他钱包特有的备份机制。

无法确认时，不要猜测或反复导入不同材料。

### 3. 找到官方应用入口

从钱包官方站点进入其正式 App Store、Google Play 或浏览器扩展页面。不要通过搜索广告、聊天链接或陌生安装包下载钱包。

### 4. 核对恢复材料

确认材料与目标钱包或账户匹配，但不要：

- 把 Secret Recovery Phrase 或 Private Key 发给客服；
- 上传到普通 Recovery Map 字段；
- 在非官方页面输入；
- 在屏幕共享或远程控制期间展示。

### 5. 按官方创建方式恢复

MetaMask 官方说明：

- SRP 钱包可在新的官方安装中选择现有钱包并使用匹配的 Secret Recovery Phrase；
- Google、Apple 或 Telegram 创建的钱包应使用对应账户和密码进入；
- 恢复完成后，可能需要重新添加网络、代币或账户；
- Imported Account 和硬件钱包账户需要按其原始方式重新添加。[MetaMask：恢复钱包](https://support.metamask.io/configure/wallet/how-to-restore-your-metamask-wallet-from-secret-recovery-phrase/)

### 6. 核对地址而不是只看余额

恢复后先确认预期公开地址是否出现。资产未显示可能是账户尚未重新添加、网络或代币显示配置缺失，也可能是使用了错误的恢复材料。不要仅因余额暂未显示就立即重复重置钱包。

### 7. 无恢复材料时停止推断

MetaMask 是自托管钱包，官方不能替客户恢复已经失去的 SRP。若仍有可解锁的旧设备或特定备份，官方提供的恢复可能性会因浏览器、操作系统和版本而不同，应严格使用对应官方说明。[MetaMask：没有 SRP 时的访问边界](https://support.metamask.io/configure/accounts/can-i-access-my-accounts-without-my-secret-recovery-phrase)

## 注意事项

- 任何获得 SRP 或 Private Key 的人都可能控制相应资产。
- 钱包密码、SRP、Private Key 和社交登录凭证不能视为可互换材料。
- 卸载或重置钱包应用可能影响当前设备上的本地钱包数据；具体恢复能力取决于钱包类型、创建方式、设备和版本；是否能从设备备份中恢复取决于平台和版本。
- 不要把 MetaMask 的流程推广为其他软件钱包的正式流程。
- Vault extraction 等高级恢复方式依赖设备、浏览器和版本，风险较高：`NEEDS REVIEW / HUMAN ESCALATION`。

## 相关知识

- Crypto Recovery Materials
- 软件钱包恢复后看不到原地址或资产，应该检查什么？
- Imported Account 为什么可能不会自动恢复？
- Crypto 恢复安全与诈骗

## 相关 Recovery Map 模块

- 资产与账户清单
- 恢复所需条件与资料
- 位置与查找
- 恢复与转移步骤

## 来源与核验

| Official Source | Source / Updated Date | Last Verified | Applicable Region | Risk Notes |
|---|---|---|---|---|
| [MetaMask — Restore your wallet](https://support.metamask.io/configure/wallet/how-to-restore-your-metamask-wallet-from-secret-recovery-phrase/) | 页面未显示 | 2026-08-20 | MetaMask；功能可能因平台和创建方式变化 | SRP、社交登录、Imported Account 的恢复表现不同 |
| [MetaMask — SRP, password and private keys](https://support.metamask.io/start/user-guide-secret-recovery-phrase-password-and-private-keys) | 页面未显示 | 2026-08-20 | MetaMask | 核心控制材料不得披露 |
| [MetaMask — Add missing accounts after restoring](https://support.metamask.io/configure/accounts/how-to-add-missing-accounts-after-restoring-with-secret-recovery-phrase) | 页面未显示 | 2026-08-20 | MetaMask | Imported Account、JSON 和硬件钱包可能需单独恢复 |
| [MetaMask — Access without an SRP](https://support.metamask.io/configure/accounts/can-i-access-my-accounts-without-my-secret-recovery-phrase) | 页面未显示 | 2026-08-20 | MetaMask；浏览器及系统相关 | 卸载后的本地数据恢复不确定性较高 |
| [MetaMask — Basic safety and security](https://support.metamask.io/stay-safe/safety-in-web3/basic-safety-and-security-tips-for-metamask) | 页面未显示 | 2026-08-20 | MetaMask | 官方不会索取客户 SRP 或 Private Key |

**Needs Review**

- 其他软件钱包必须分别核验其官方恢复机制。
- MetaMask 社交登录、移动端自动 Vault Recovery 和浏览器数据恢复能力变化较快，发布前必须重新核验。
- 本 Draft 不提供 Vault extraction 操作步骤。
