# 交易所绑定 Email 或 手机号 不可用时，应如何准备？

**Status：PUBLISHED**

## 快速了解

先确认 Email 或 手机号 是暂时收不到验证码、已经失去控制，还是可能被盗用。检查是否仍有可信的已登录设备和其他有效验证方式，再从目标交易所的官方登录页或 Help Center 进入对应恢复路径。不同交易所的恢复入口、验证材料和恢复限制可能不同。

## 详细说明

Email 和 手机号 往往同时承担登录标识、验证码接收、安全通知及账户恢复功能。无法使用时，应先区分：

- 仍控制该 Email 或 手机号，但暂时收不到验证码；
- 已更换号码或停止使用原 Email；
- 手机或 SIM 遗失；
- Email、手机号 或设备可能被他人控制；
- 已登录账户，但无法修改绑定信息；
- 无法登录，需要平台执行身份核验。

共性原则是先确认失效范围、保护仍可控制的入口，并使用目标平台的官方恢复流程。不要根据另一家交易所的页面推断当前平台规则。

具体平台规则存在明显差异：

- Coinbase 将“无法访问 Email”和“丢失 2FA”纳入 Account Recovery。无法登录时可能需要通过正式页面上传身份证明；完成恢复后，还可能存在临时发送限制。[Coinbase Account Recovery](https://help.coinbase.com/en/coinbase/managing-my-account/get-back-into-my-account/account-recovery-lost-email-2step-verification)
- Kraken 修改 Email 时通常要求同时使用旧、新 Email 完成确认；如果已失去旧 Email，应提交 Sign-in Troubleshooting & Account Security 请求。手机号 变更使用独立的账户资料修改流程。[Kraken Account Information](https://support.kraken.com/articles/360000672283-updating-account-information)
- OKX 区分仍能登录与无法登录的情况，并提供 Email、手机号 或 Authenticator 的重置入口；部分选项及恢复限制可能因地区不同。[OKX Authentication Method Recovery](https://www.okx.com/en-us/help/what-if-mobile-email-google-verification-cannot-be-used)

## 客户应该怎么做

### 1. 判断问题类型

确认当前属于：

- 收不到 Email 或 SMS；
- 已失去原 Email 或 手机号；
- 原设备遗失；
- 绑定信息可能被恶意修改；
- 账户同时存在密码或 2FA 问题。

### 2. 保护仍可控制的入口

如果仍能控制 Email、手机号 或已登录设备：

- 检查安全通知和近期登录活动；
- 更新已经失效的联系方式；
- 确认备用验证方式是否仍然有效；
- 不要在新方式生效前移除全部现有验证方式。

### 3. 排查暂时性接收问题

在尚未确认入口已经失效前，可以检查：

- Email 的 Spam、Junk、过滤及容量；
- 手机号 的信号、运营商拦截和号码状态；
- 平台是否提供其他已启用的验证方式；
- 平台 Status 页面是否存在异常。

不要连续反复请求验证码，以免触发频率限制或账户保护措施。

### 4. 使用目标平台的官方恢复入口

无法继续登录时，从平台官方登录页选择 Account Recovery、Unable to verify、Lost access 或对应支持入口。只在正式安全页面提交平台明确要求的身份材料。

### 5. 疑似被盗用时升级处理

如果发现陌生登录、绑定信息被修改或未知验证码请求：

- 不要继续普通资料变更；
- 保护关联 Email、手机号 和设备；
- 通过平台官方安全渠道报告异常；
- 按平台说明请求账户保护或限制。

## 注意事项

- 不要向客服提供密码、OTP、Authenticator Setup Key、Seed Phrase 或 Private Key。
- Authenticator Setup Key 属于高敏感认证材料，不应作为普通恢复线索公开记录或发送给客服。
- 不要把身份证件通过普通 Email 或社交聊天发送给陌生联系人。
- Coinbase、Kraken 和 OKX 的资料修改、身份核验及恢复限制不能互换。
- 死亡、失能、继承、司法、监管、第三方冻结或法律授权：`NEEDS REVIEW / HUMAN ESCALATION`。

## 相关知识

- 中心化交易所无法登录时，应先检查哪些恢复条件？
- 交易所 2FA 丢失后的官方恢复准备清单
- Crypto 身份与认证恢复
- Crypto 恢复安全与诈骗

## 相关 Recovery Map 模块

- 资产与账户清单
- 恢复所需条件与资料
- 位置与查找
- 恢复与转移步骤
- 协助人

## 来源与核验

| Official Source | Official URL | Source / Updated Date | Last Verified | Applicable Region | Risk Notes |
|---|---|---|---|---|---|
| Coinbase Help — Account recovery for lost email or 2-step verification access | [Official URL](https://help.coinbase.com/en/coinbase/managing-my-account/get-back-into-my-account/account-recovery-lost-email-2step-verification) | 页面未显示 | 2026-08-20 | Coinbase 页面适用范围；地区差异需复核 | 可能要求身份验证并产生临时发送限制 |
| Coinbase Help — Can’t sign in to your account | [Official URL](https://help.coinbase.com/en/coinbase/managing-my-account/get-back-into-my-account/account-access?contactusbanner=false) | 页面未显示 | 2026-08-20 | Coinbase 页面适用范围 | Email、2FA、密码和账户限制使用不同入口 |
| Kraken Support — Manage your account information | [Official URL](https://support.kraken.com/articles/360000672283-updating-account-information) | Updated 2026-06-15 | 2026-08-20 | Kraken Account；Krak 等其他产品不适用 | Email、Phone、遗失设备和异常活动路径不同 |
| OKX Help — Authentication method unavailable | [Official URL](https://www.okx.com/en-us/help/what-if-mobile-email-google-verification-cannot-be-used) | Published 2023-09-15; Updated 2026-08-11 | 2026-08-20 | OKX United States；其他地区需复核 | 重置方式及功能限制可能因地区变化 |
| OKX Help — Phone isn’t working | [Official URL](https://www.okx.com/en-us/help/my-phone-is-not-working-what-should-i-do) | Published 2024-08-01; Updated 2026-08-05 | 2026-08-20 | OKX United States | 替代验证选项并非所有地区均可用 |

## Needs Review

- Coinbase 页面未显示更新时间，发布前需重新核验。
- OKX 其他地区的恢复入口和限制需要使用对应地区页面复核。
- Binance 尚未取得充分官方依据，不纳入本 Draft 的确定性结论。
- 所有继承、法律授权和第三方冻结场景必须 Human Escalation。

**与现有 APPROVED Knowledge 冲突：未发现。**

---
