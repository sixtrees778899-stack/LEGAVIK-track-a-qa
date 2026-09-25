# 手机号更换或停用后，会影响哪些数字账户恢复？

**Status：DRAFT — FOR REVIEW**

## 快速了解

手机号可能同时承担登录标识、SMS 验证码、2FA、安全通知和账户恢复功能。更换或停用号码前，应先找出哪些账户依赖它，并在仍可正常登录时通过各平台官方设置更新。号码停用后可能被运营商重新分配，因此不能假设原号码会永久保持不可用或仍由原用户控制。

## 通用原则

重点检查以下依赖：

- 以手机号作为用户名或主要登录标识的账户；
- 通过 SMS 或电话接收登录验证码的账户；
- 将手机号设为恢复渠道或受信任号码的账户；
- 银行、支付、交易所和金融服务；
- Email、Apple Account、Google Account、Microsoft Account；
- 密码管理器、云存储、社交平台和通信应用；
- 工作账户、域名、开发者平台和管理员账户；
- 通过手机号接收安全变更通知的服务。

手机号是恢复依赖，不等于账户本身。更新手机号也不会自动更新使用该号码的所有平台。

## 客户应该怎么做

1. 在停用旧号码前建立依赖清单，不在 Recovery Map 中记录 SMS 验证码。
2. 优先检查身份根账户，例如主要 Email、Apple Account、Google Account、Microsoft Account 和密码管理器。
3. 从每个平台的官方安全设置更新号码，并确认是否需要保留其他验证方式。
4. 检查是否存在只依赖旧号码的账户；如有，增加平台支持的独立恢复方式。
5. 保留旧号码变更的日期、运营商和受影响账户清单，但不保存 OTP、Recovery Code 或密码。
6. 更新后检查安全通知，确认没有陌生变更或未经授权的恢复请求。
7. 如果旧号码已经失去控制，从平台官方恢复入口处理，不向新号码持有人索取验证码。

## 具体平台规则

### Google Account

Google 的恢复手机号可用于账户进入、证明账户归属和异常活动通知。Google 说明，变更恢复手机号或 Email 后，旧信息可能在七天内仍被用于发送验证码，以协助防止未经授权的变更。[Google 官方说明](https://support.google.com/accounts/answer/183723)

### Apple Account

Apple 的受信任手机号用于双重认证。若唯一受信任设备和唯一受信任号码同时不可用，用户可能无法正常接收验证码，并可能需要账户恢复。Apple 建议考虑添加不依附于唯一 iPhone 的额外受信任号码。[Apple 官方说明](https://support.apple.com/en-la/122621)

### Microsoft Account

Microsoft 将替代 Email 和手机号作为 Security Info。若所有安全信息被同时移除并替换，账户可能进入 30 天受限状态；官方表示该等待不能被加速。[Microsoft 验证码问题](https://support.microsoft.com/en-US/accounts-billing/manage/troubleshoot-microsoft-verification-code-issues)；[Security Info Pending](https://support.microsoft.com/en-us/accounts-billing/manage/what-does-security-info-change-is-still-pending-mean)

## 安全边界

- 不要求客户提供 SMS OTP、Recovery Code 或账户密码。
- 不建议通过 SIM 补办、号码转移或客服社会工程绕过平台验证。
- 不把“仍能收到短信”自动当作合法账户所有权证明。
- 旧号码已被他人控制、发生 SIM Swap 或未经授权转移时立即升级。

## 相关知识

- Email 账户无法访问时，应先检查哪些恢复条件？
- Apple ID / Google Account 恢复前，应准备哪些身份与设备信息？
- 2FA、Passkey 与备用恢复方式之间有什么区别？
- 如何检查数字账户恢复体系中的单点故障？

## 相关 Recovery Map 模块

> **Internal Knowledge / AI Retrieval Metadata — 客户页面隐藏**

- 资产与账户清单
- 恢复所需条件与资料
- 位置与查找
- 恢复与转移步骤

## 官方来源与核验

| Official Source | Official URL | Source / Updated Date | Last Verified | Applicable Region / Platform | Risk Notes |
|---|---|---|---|---|---|
| Google — Recovery phone or email | [Official URL](https://support.google.com/accounts/answer/183723) | 页面未标示 | 2026-08-21 | Google Account | 组织账户可能由管理员控制 |
| Apple — Trusted phone numbers and devices | [Official URL](https://support.apple.com/en-la/122621) | 2026-04-10 | 2026-08-21 | Apple Account | 区域与账户状态可能影响界面 |
| Microsoft — Verification code issues | [Official URL](https://support.microsoft.com/en-US/accounts-billing/manage/troubleshoot-microsoft-verification-code-issues) | 页面未标示 | 2026-08-21 | Personal Microsoft Account | 替换全部 Security Info 可能触发限制 |
| Microsoft — Security info change pending | [Official URL](https://support.microsoft.com/en-us/accounts-billing/manage/what-does-security-info-change-is-still-pending-mean) | 页面未标示 | 2026-08-21 | Personal Microsoft Account | 30 天状态不能由客服加速 |

## Needs Review

**NEEDS REVIEW / HUMAN ESCALATION：**疑似 SIM Swap、号码被盗用或重新分配；账户出现未知登录；平台冻结；运营商身份争议；金融或 Crypto 账户受影响；死亡、失能、继承、司法或法律授权场景。

**与现有 APPROVED Knowledge 冲突：未发现。**

