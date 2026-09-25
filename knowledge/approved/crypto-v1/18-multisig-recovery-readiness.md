# Multisig / Collaborative Wallet 恢复前，应检查哪些角色、阈值和配置资料？

**Status：PUBLISHED**

## 快速了解

Multisig / Collaborative Wallet 的恢复能力取决于实际配置，而不仅是“还有几个设备”。

恢复前应先确认：

- 钱包公开地址和所在网络；
- 当前 owner / signer 列表；
- 执行交易所需的 threshold；
- 哪些 signer 当前仍可用；
- signer 分别由什么钱包、设备、人员或机构控制；
- 是否预先配置 Recovery Module、Recoverer、Guard 或其他执行规则；
- 当前可用 signer 是否仍能满足有效执行条件。

Safe 将 owner 和 signer 用于指代控制 Safe Account 的账户；threshold 是执行交易所需的最低确认数。其他 Multisig 或 Collaborative Wallet 产品可能使用不同名称和规则，不能直接套用 Safe 的逻辑。[Safe 官方概念说明](https://docs.safe.global/advanced/smart-account-concepts)

如果可用 signer 不足、threshold 无法满足，且没有事先配置并可验证的恢复机制，应进入 **NEEDS REVIEW / HUMAN ESCALATION**。本文不提供绕过 threshold 或替代 signer 权限的方法。

## 详细说明

### 一、先确认钱包身份

记录以下非秘密信息：

- Multisig / Collaborative Wallet 产品名称；
- 钱包公开地址；
- 网络名称和 Chain ID；
- 钱包或合约版本；
- 创建或部署时间；
- 官方界面或官方文档入口；
- 是否在多个网络使用相同或相似地址；
- 组织内部对该钱包的名称和用途。

不要仅凭界面中显示的名称判断钱包身份。相同地址可能出现在多个网络，而各网络的部署状态、owner、threshold 和模块配置可能不同。

Safe 官方说明，多链账户在不同网络上的配置可能发生变化，不能假设同一地址在所有网络始终具有相同的 owner、threshold 或 modules。[Safe 多链说明](https://help.safe.global/articles/9317165368-deploying-a-multi-chain-safe)

### 二、确认角色与控制关系

应建立不含秘密的角色清单：

- 每个 owner / signer 的公开地址；
- 对应的人员、团队、机构或系统角色；
- signer 类型：
  - 软件钱包；
  - 硬件钱包；
  - 智能账户；
  - 托管或 MPC 服务；
  - Passkey 或其他厂商支持类型；
- 当前状态：
  - 可访问；
  - 暂时不可访问；
  - 已遗失；
  - 控制权不明确；
  - 疑似泄露；
- 负责确认、审批和执行的人员是否为同一角色；
- 是否存在离职人员、失联人员或已停用的第三方服务。

Recovery Map 只记录角色、公开地址、控制关系和恢复路径，不记录 signer 的 Seed Phrase、Private Key、PIN 或额外 Passphrase。

### 三、确认 threshold 是否仍可满足

至少记录：

- owner / signer 总数；
- 当前 threshold；
- 当前可用 signer 数量；
- 可用 signer 是否确实属于当前链上 owner 列表；
- 可用 signer 是否能在正确网络和正确钱包实例中进行授权；
- 是否存在 signer 疑似泄露或不应继续使用；
- 是否存在基于旧配置或旧 nonce 的待处理交易。

在 Safe 中，threshold 是一笔 Safe Transaction 可执行前所需的 owner 确认数量。若确认数不足，交易不能通过正常签名验证执行。[Safe 官方概念说明](https://docs.safe.global/advanced/smart-account-concepts)

应区分：

- **数量上达到 threshold**：看似拥有足够 signer；
- **实际可执行**：signer 身份、网络、钱包连接、配置限制和其他组件均有效。

不能仅凭“还有两个人”判断一个 2-of-3 钱包一定可以恢复。

### 四、确认是否存在额外配置

Multisig 的执行规则可能不仅由 owner 和 threshold 决定，还可能包括：

- Recovery Module 或 Recoverer；
- Delay Module 或时间延迟；
- Allowance Module；
- Guard；
- Module Guard；
- Fallback Handler；
- Session Key、Passkey 或 Account Abstraction 配置；
- 托管商、MPC 提供商或组织审批系统；
- 协议治理、时间锁或合约层权限。

Safe Modules 可以提供不同于基础多签的执行或恢复能力；Safe Guards 则可以在交易执行前后增加检查，并可能阻止交易。恶意或故障模块、Guard 也可能造成严重安全或可用性风险。[Safe Modules](https://docs.safe.global/advanced/smart-account-modules)；[Safe Guards](https://docs.safe.global/advanced/smart-account-guards)

恢复前只识别和核对这些配置，不应自行启用、停用、更换或绕过。

### 五、确认是否已经配置正式恢复路径

检查：

- 是否预先设置 Recoverer；
- 是否存在 Recovery Module；
- 恢复是否有等待期；
- 哪些角色能够发起恢复；
- 哪些角色能够否决或取消；
- 恢复可以变更哪些 owner 或 threshold；
- 该机制是否已经部署在当前网络和当前钱包；
- 是否有内部审批或法律授权要求；
- 是否有正式测试或演练记录。

Safe RecoveryHub 使用预先配置的 Recoverer 和延迟机制处理特定 signer 恢复场景。该机制可能具有越过常规 threshold 的特殊权限，因此必须确认其确实在事件发生前已配置，并按照适用版本的官方流程审查。[Safe RecoveryHub 官方说明](https://help.safe.global/articles/9622260218-account-recovery-with-saferecoveryhub)

不得在没有链上或官方界面证据时，假设某个钱包已经具备 Recovery Module。

### 六、恢复前应准备哪些资料？

可以准备：

- 钱包公开地址；
- 网络和 Chain ID；
- owner / signer 公开地址清单；
- threshold；
- signer 可用性状态；
- signer 类型及对应设备或服务；
- 钱包或合约版本；
- 已启用的 Module、Guard、Recoverer 和等待期；
- 待处理交易的公开标识、nonce 和状态；
- 相关链上交易哈希；
- 创建、变更 owner、变更 threshold 或配置模块的历史记录；
- 组织内授权人与升级联系人；
- 厂商或平台官方支持入口。

不得集中记录：

- Seed Phrase / Wallet Backup；
- Private Key；
- 额外 Passphrase；
- 硬件钱包 PIN；
- OTP 或 Authenticator Setup Key；
- MPC 密钥份额；
- 可直接代替 signer 授权的材料。

### 七、哪些情况不能继续自行处理？

以下情况停止普通恢复操作并升级：

- 可用 signer 数量低于 threshold；
- 无法确认当前 owner 列表或 threshold；
- signer 地址与预期记录不一致；
- signer 已遗失、疑似泄露或控制权存在争议；
- Recovery Module、Recoverer、Guard 或其他模块状态不明；
- Guard 或 Module 可能阻止或改变执行；
- 存在未知待处理交易、异常签名或未经授权的配置变化；
- 钱包同时控制协议治理、组织金库或高价值资产；
- 需要更换 owner、改变 threshold 或启动特殊恢复机制；
- 涉及死亡、失能、离职、继承、司法、监管或法律授权；
- 托管商或 MPC 服务无法提供必需 signer；
- threshold 已无法满足，且没有经过验证的预配置恢复路径。

Safe 的 owner 更换属于 Safe Transaction；正常情况下仍需满足有效执行权限。无法达到 threshold 时，不存在可在本文中提供的通用绕过方案。[Safe `swapOwner` 官方参考](https://docs.safe.global/reference-smart-account/owners/swapOwner)

## 安全边界

- 不要求任何 signer 披露 Seed Phrase、Private Key、Passphrase 或 PIN。
- 不通过屏幕共享查看 signer 的核心秘密。
- 不尝试破解遗失设备或暴力测试凭证。
- 不伪造、代替或绕过 signer 授权。
- 不在配置未核实前提出 owner 更换、threshold 变更或资产转移。
- 不将 Safe 的规则自动套用于其他 Multisig、MPC 或 Collaborative Wallet 产品。
- 无法达到 threshold 时，不声称一定可以恢复。
- 已配置的 Recovery Module 可能具有特殊权限，必须使用对应版本的官方资料单独核验。

## 相关知识

- 如何检查 Crypto 恢复体系中的单点故障？
- 硬件钱包损坏或遗失后的安全恢复准备
- Crypto Recovery Materials：Recovery Map 应记录什么、不应记录什么？
- Seed Phrase、Private Key 或 Passphrase 疑似泄露后，应该先做什么？
- Crypto 账户 Email、手机号与 2FA 的恢复依赖

## 相关 Recovery Map 模块

> **Internal Knowledge / AI Retrieval Metadata — 客户页面隐藏**

- 资产与账户清单
- 访问与认证路径
- 恢复材料与位置
- 关键人员与角色
- 风险与异常记录
- 支持与升级路径

## 官方来源与核验

| Official Source | Official URL | Source / Updated Date | Last Verified | Applicable Region / Network | Risk Notes |
|---|---|---|---|---|---|
| Safe — Smart Account Concepts | [Official URL](https://docs.safe.global/advanced/smart-account-concepts) | 页面未标示 | 2026-08-21 | Safe 支持的 EVM 网络 | 用于核验 owner、signer、threshold 和签名验证概念 |
| Safe — Smart Account Overview | [Official URL](https://docs.safe.global/advanced/smart-account-overview) | 页面未标示 | 2026-08-21 | Safe 支持的 EVM 网络 | Modules、Guards 和账户结构可能影响恢复 |
| Safe — Smart Account Reference | [Official URL](https://docs.safe.global/reference-smart-account/overview) | Updated 2026-08-10 | 2026-08-21 | Safe Smart Account v1.4.1 参考 | 版本适用范围必须单独核验 |
| Safe — `swapOwner` | [Official URL](https://docs.safe.global/reference-smart-account/owners/swapOwner) | Updated 2026-08-10 | 2026-08-21 | Safe Smart Account | 更换 owner 属于 Safe Transaction；本文不提供执行步骤 |
| Safe — Modules | [Official URL](https://docs.safe.global/advanced/smart-account-modules) | Updated 2026-08-10 | 2026-08-21 | Safe Smart Account | Module 可能具有扩展执行权限，恶意 Module 风险高 |
| Safe — Guards | [Official URL](https://docs.safe.global/advanced/smart-account-guards) | Updated 2026-08-10 | 2026-08-21 | Safe contracts 1.3.0+ | 故障或恶意 Guard 可能阻止交易 |
| Safe — RecoveryHub | [Official URL](https://help.safe.global/articles/9622260218-account-recovery-with-saferecoveryhub) | Updated 2026-04-23 | 2026-08-21 | 依 RecoveryHub 支持范围而定 | Recoverer 可能具有特殊恢复权限；必须核验预配置和延迟规则 |
| Safe — Recovery-Ready Treasury | [Official URL](https://safe.global/blog/how-to-design-a-recovery-ready-safe-treasury) | 2026 | 2026-08-21 | Safe；组织金库场景 | threshold 无法满足且无预配置路径时属于高风险 |
| Safe — Multi-Chain Safe | [Official URL](https://help.safe.global/articles/9317165368-deploying-a-multi-chain-safe) | 2026 | 2026-08-21 | 支持的多链 Safe | 不同网络的后续配置可能不同 |

## Needs Review

**NEEDS REVIEW / HUMAN ESCALATION：**

- signer 不足或 threshold 无法满足；
- signer 控制权不明确、存在争议或疑似泄露；
- owner、threshold、Module、Guard 或 Recoverer 配置无法核实；
- 需要执行 owner 替换、threshold 变更或特殊恢复流程；
- 已发生未知交易、恶意签名或未经授权的配置变化；
- 涉及组织金库、协议治理、托管商或 MPC 服务；
- 涉及死亡、失能、继承、离职、司法、监管或法律授权；
- 不同平台规则与 Safe 的 owner / threshold 模型不一致；
- RecoveryHub 或其他恢复模块的版本、网络或等待期不明确。

**与现有 APPROVED Knowledge 冲突：未发现。**
