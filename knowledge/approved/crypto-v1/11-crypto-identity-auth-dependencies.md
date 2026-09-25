# Crypto 账户 Email、手机号与 2FA 的恢复依赖

**Status：PUBLISHED**

## 快速了解

Crypto 账户的 Email、手机号和 2FA 往往相互依赖：Email 可能用于接收安全通知或确认新设备，手机号可能用于 SMS 验证，2FA 则可能依赖 Authenticator、Passkey、Security Key 或已登录设备。恢复前应先画清依赖关系，避免同时失去多个入口。

## 详细说明

同一个 Crypto 账户可能依赖：

- 登录 Email 或用户名；
- 登录密码；
- 绑定手机号；
- Authenticator App；
- Passkey；
- Security Key；
- Push Notification；
- 新设备确认；
- 身份验证；
- 已登录设备；
- 平台官方 Support。

这些条件并不总是独立。例如：

- 新设备确认可能发送到绑定 Email；
- 密码重置可能依赖 Email；
- SMS 2FA 依赖手机号和运营商；
- Passkey 可能依赖设备或同步账户；
- Authenticator 可能与 Email 同处于丢失的手机上；
- Support Recovery 可能要求身份核验。

共性原则是先识别依赖关系，再判断还有哪些有效入口。具体平台规则不能统一：

- Coinbase 支持多种 2FA 方法，并建议配置备用方式；丢失全部方法时可能需要 Account Recovery。[Coinbase 2FA](https://help.coinbase.com/en/coinbase/getting-started/getting-started-with-coinbase/2-step-verification)
- Kraken 区分 Sign-in、Trading、Funding 等 2FA，并提供平台特定的 Master Key 机制。Master Key 不是其他平台的通用能力。[Kraken Sign-in 2FA](https://support.kraken.com/articles/360000911823-how-does-two-factor-authentication-2fa-for-sign-in-work-)
- OKX 对 Email、手机号和 Authenticator 提供相应重置路径；具体替代方式和恢复限制可能因地区变化。[OKX Authentication Recovery](https://www.okx.com/en-us/help/what-if-mobile-email-google-verification-cannot-be-used)

## 客户应该怎么做

### 1. 建立依赖清单

针对每个账户记录：

- 登录标识；
- 绑定 Email；
- 绑定手机号；
- 已启用的 2FA 类型；
- 已登录设备；
- 新设备确认方式；
- 官方恢复入口；
- 必要身份核验；
- 备用方式是否存在。

不要记录密码、OTP 或 Authenticator Setup Key 本身。

### 2. 检查共同设备风险

确认 Email、SMS、Authenticator 和 Passkey 是否全部集中在同一手机上。手机遗失时，这些入口可能同时受影响。

### 3. 检查 Email 风险

确认绑定 Email：

- 仍可访问；
- 自身具有独立安全保护；
- 不完全依赖同一失效手机号；
- 能接收平台安全通知；
- 不属于即将停用的学校、雇主或服务商域名。

### 4. 检查手机号风险

确认手机号：

- 仍由本人控制；
- 能正常接收验证信息；
- 更换号码后已更新相关账户；
- 不被误认为唯一恢复证明。

### 5. 检查 2FA 类型

区分：

- SMS；
- Authenticator；
- Passkey；
- Security Key；
- Push Notification；
- 平台特定备用方式。

确认每种方式的设备和恢复依赖，不要把它们统称为“验证码”。

### 6. 记录停止条件

出现以下情况时停止普通恢复：

- Email 或手机号疑似被接管；
- 收到未知登录或验证请求；
- 2FA 设置被陌生人修改；
- 官方身份验证持续失败；
- 账户被限制或冻结；
- 有人索取 OTP 或 Authenticator Setup Key。

## 注意事项

- Authenticator Setup Key 属于高敏感认证材料，不应作为普通恢复线索公开记录或发送给客服。
- OTP 和验证码具有时效性，也不应记录或转发。
- Email、手机号和 Authenticator 放在同一设备上可能形成共同失效风险。
- Kraken Master Key、Coinbase Trusted Contacts 等均属于平台特定能力，不得写成通用规则。
- 账户冻结、司法或监管限制：`NEEDS REVIEW / HUMAN ESCALATION`。
- 死亡、失能、继承和法律授权：`NEEDS REVIEW / HUMAN ESCALATION`。

## 相关知识

- 中心化交易所无法登录时，应先检查哪些恢复条件？
- 交易所绑定 Email 或手机号不可用时，应如何准备？
- 交易所 2FA 丢失后的官方恢复准备清单
- 如何检查 Crypto 恢复体系中的单点故障？

## 相关 Recovery Map 模块

- 资产与账户清单
- 恢复所需条件与资料
- 位置与查找
- 恢复与转移步骤
- 协助人

## 来源与核验

| Official Source | Official URL | Source / Updated Date | Last Verified | Applicable Region | Risk Notes |
|---|---|---|---|---|---|
| Coinbase Help — Set up 2-step verification | [Official URL](https://help.coinbase.com/en/coinbase/getting-started/getting-started-with-coinbase/2-step-verification) | 页面未显示 | 2026-08-20 | Coinbase 页面适用范围 | 2FA 方法和备用机制可能变化 |
| Coinbase Help — Troubleshoot 2-step verification | [Official URL](https://help.coinbase.com/en/coinbase/managing-my-account/get-back-into-my-account/2-step-verification-troubleshooting) | 页面未显示 | 2026-08-20 | Coinbase 页面适用范围 | Security Key、Passkey、SMS、TOTP 和 Push 路径不同 |
| Kraken Support — Sign-in 2FA | [Official URL](https://support.kraken.com/articles/360000911823-how-does-two-factor-authentication-2fa-for-sign-in-work-) | Updated 2025-08-08 | 2026-08-20 | Kraken | Sign-in、Trading、Funding 2FA 不可混同 |
| Kraken Support — Manage account information | [Official URL](https://support.kraken.com/articles/360000672283-updating-account-information) | Updated 2026-06-15 | 2026-08-20 | Kraken Account | Email、手机号和遗失设备使用不同支持路径 |
| OKX Help — Authentication method unavailable | [Official URL](https://www.okx.com/en-us/help/what-if-mobile-email-google-verification-cannot-be-used) | Published 2023-09-15; Updated 2026-08-11 | 2026-08-20 | OKX United States；其他地区需复核 | 替代验证方式及恢复限制可能因地区变化 |
| OKX Help — SMS code not received | [Official URL](https://www.okx.com/en-us/help/i-havent-received-the-sms-code) | Published 2023-08-16; Updated 2026-08-11 | 2026-08-20 | OKX United States | 错误尝试和重置可能触发账户保护措施 |

## Needs Review

- Binance 及其他交易所需完成各自官方来源核验。
- Coinbase 页面未显示更新时间，发布前需再次检查。
- Passkey 的同步和恢复能力取决于平台、设备与操作系统。
- 账户冻结、监管限制、继承和法律授权必须 Human Escalation。

**与现有 APPROVED Knowledge 冲突：未发现。**
