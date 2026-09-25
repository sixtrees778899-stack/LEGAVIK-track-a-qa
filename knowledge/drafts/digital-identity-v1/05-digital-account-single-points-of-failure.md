# 如何检查数字账户恢复体系中的单点故障？

**Status：DRAFT — FOR REVIEW**

## 快速了解

单点故障是指一个设备、号码、Email、密码管理器、Passkey 同步账户或人员失效后，多项账户同时无法恢复。检查重点不是收集更多秘密，而是画出账户之间的恢复依赖，确认关键账户是否至少有一种真正独立、平台支持且仍可用的替代路径。

## 常见单点故障

- 所有账户都依赖同一个 Email，而该 Email 没有独立恢复方式；
- Email 和其他账户都只向同一个手机号发送验证码；
- 唯一手机同时是受信任设备、SMS 接收设备和 Passkey 存储设备；
- 所有 Passkey 只依赖同一个同步账户，而同步账户又依赖这些 Passkey；
- 2FA Authenticator 和备用代码只保存在同一台设备；
- 密码管理器、主 Email 和云备份形成循环依赖；
- 唯一安全密钥遗失后没有已登记的替代认证器；
- 工作账户只依赖一名管理员；
- Recovery Contact、管理员或家庭协助人信息已失效；
- 旧手机号停用，但仍是多个账户的唯一恢复渠道。

## 检查方法

### 1. 列出身份根账户

优先列出主要 Email、Apple Account、Google Account、Microsoft Account、密码管理器、主要手机号及设备生态账户。这些账户通常影响多个下游服务。

### 2. 画出恢复依赖

对每个重要账户记录：

- 登录标识；
- 2FA 或 Passkey 类型；
- 恢复 Email 和手机号；
- 可信设备或安全密钥位置；
- 官方备用恢复方式；
- 管理员或正式支持路径。

只记录类型、状态和位置，不记录密码、OTP、Recovery Code 或 Passkey Secret。

### 3. 检查循环依赖

例如：Email A 的恢复码发送到手机号 B，而手机号运营商账户又只能通过 Email A 恢复。此类结构看似有两个渠道，实际仍可能同时失效。

### 4. 检查独立性

备用方式应尽可能不与主要方式共享同一设备、号码、Email、同步账户或单一人员。是否允许某种备用方式，必须以各平台当前官方规则为准。

### 5. 检查状态和变更风险

确认旧设备、旧号码、离职管理员、过期安全密钥和失效联系人是否仍被账户引用。平台变更恢复信息后可能存在等待或旧信息短期继续生效的规则。

### 6. 进行无秘密演练

演练只验证能否找到官方入口、设备和材料位置，不输入真实 Recovery Code，不退出唯一已登录设备，也不触发不必要的账户重置。

## 平台差异示例

- Apple 提醒：唯一受信任设备与唯一受信任号码同时不可用时，用户可能无法接收验证码并需要 Account Recovery。[Apple 官方说明](https://support.apple.com/en-la/122621)
- Google 建议配置恢复手机号或不同于登录地址的恢复 Email，并说明组织账户可能需要管理员协助。[Google 官方说明](https://support.google.com/accounts/answer/183723)
- Microsoft 提醒不要同时更换所有 Security Info，否则可能进入 30 天受限状态。[Microsoft 官方说明](https://support.microsoft.com/en-US/accounts-billing/manage/troubleshoot-microsoft-verification-code-issues)
- NIST 的账户恢复模型包括保存的恢复代码、发送到已登记渠道的恢复代码、恢复联系人和重新身份核验，说明恢复路径可以有不同类别，但具体服务不一定全部提供。[NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html)

## 安全边界

- 不为消除单点故障而把所有秘密复制到同一位置。
- 不要求客户展示密码、OTP、Recovery Code 或 Passkey Secret。
- 不关闭 2FA 或降低安全设置来制造“备用路径”。
- 不在无授权情况下测试他人账户、设备或恢复联系人。
- 不把第三方“恢复服务”视为正式冗余方案。

## 相关知识

- Email 账户无法访问时，应先检查哪些恢复条件？
- 手机号更换或停用后，会影响哪些数字账户恢复？
- Apple ID / Google Account 恢复前，应准备哪些身份与设备信息？
- 2FA、Passkey 与备用恢复方式之间有什么区别？
- 如何检查 Crypto 恢复体系中的单点故障？

## 相关 Recovery Map 模块

> **Internal Knowledge / AI Retrieval Metadata — 客户页面隐藏**

- 资产与账户清单
- 恢复所需条件与资料
- 位置与查找
- 恢复与转移步骤
- 协助人
- 给未来恢复人的嘱托

## 官方来源与核验

| Official Source | Official URL | Source / Updated Date | Last Verified | Applicable Region / Platform | Risk Notes |
|---|---|---|---|---|---|
| Apple — Trusted phone numbers and devices | [Official URL](https://support.apple.com/en-la/122621) | 2026-04-10 | 2026-08-21 | Apple Account | 唯一设备与唯一号码可形成共同故障点 |
| Google — Recovery phone or email | [Official URL](https://support.google.com/accounts/answer/183723) | 页面未标示 | 2026-08-21 | Google Account | 组织账户规则不同 |
| Microsoft — Verification code issues | [Official URL](https://support.microsoft.com/en-US/accounts-billing/manage/troubleshoot-microsoft-verification-code-issues) | 页面未标示 | 2026-08-21 | Personal Microsoft Account | 同时替换全部安全信息可能触发限制 |
| NIST — Account Recovery | [Official URL](https://pages.nist.gov/800-63-4/sp800-63b.html) | SP 800-63-4 | 2026-08-21 | 通用数字身份框架 | 平台不一定支持全部恢复方法 |
| NIST — Syncable Authenticators | [Official URL](https://pages.nist.gov/800-63-4/sp800-63b/syncable/) | SP 800-63-4 | 2026-08-21 | 同步 Passkey / 认证器 | 同步账户恢复本身可能成为依赖 |

## Needs Review

**NEEDS REVIEW / HUMAN ESCALATION：**已发生账户接管；关键根账户全部不可用；组织管理员或恢复联系人争议；平台冻结；身份无法确认；死亡、失能、继承、司法或法律授权；单点故障涉及金融、Crypto、企业生产系统或大量下游账户。

**与现有 APPROVED Knowledge 冲突：未发现。**

