# 2FA、Passkey 与备用恢复方式之间有什么区别？

**Status：DRAFT — FOR REVIEW**

## 快速了解

2FA 是要求多个认证因素的账户保护机制；Passkey 是基于密码学的登录凭证，通常通过设备解锁验证用户；备用恢复方式用于正常认证器丢失或不可用时恢复账户。三者作用不同，不能把 Recovery Code、OTP 或 Passkey 的内部秘密当作普通恢复线索保存。

## 主要区别

| 类型 | 主要作用 | 常见依赖 | 恢复注意事项 |
|---|---|---|---|
| 2FA | 在密码或其他登录步骤之外增加验证 | 手机提示、Authenticator、SMS、安全密钥 | 丢失一个因素时需使用平台已配置的其他方式 |
| Passkey | 使用设备持有的密码学凭证登录 | 设备、凭证管理器、屏幕锁或生物识别 | 可能是设备绑定或跨设备同步，取决于平台与凭证管理器 |
| OTP | 一次性证明对认证器或渠道的控制 | Authenticator、短信或其他官方渠道 | 属于短时高敏感信息，不应记录或发送给客服 |
| Recovery / Backup Code | 在其他认证方式不可用时恢复或登录 | 预先生成并安全保存的代码 | 通常一次性或可被新代码替换，属于核心秘密 |
| Recovery Contact / Address | 通过预先登记的联系人或渠道协助恢复 | 受信任联系人、Email、手机号 | 不自动授予账户访问权，具体权限由平台决定 |

NIST 将 OTP、Recovery Code 和长期认证器秘密区分为不同类型；账户恢复用于丢失所需认证器后的恢复，而不是日常认证的替代名称。[NIST Authenticators](https://pages.nist.gov/800-63-4/sp800-63b/authenticators/)；[NIST Account Recovery](https://pages.nist.gov/800-63-4/sp800-63b.html)

## Passkey 的平台差异

- Google 说明，Passkey 可以通过指纹、面容或设备屏幕锁使用，并可能绕过传统第二步，因为它已经验证设备持有。添加 Passkey 不会自动移除现有认证或恢复因素。[Google Passkey](https://support.google.com/accounts/answer/13548313?hl=en-EN)
- Apple 说明，Passkey 可通过 iCloud Keychain 同步，其恢复依赖 Apple Account、受信任号码、设备密码及相关安全机制；具体条件不能泛化到其他凭证管理器。[Apple Passkey Security](https://support.apple.com/en-ie/102195)
- 同步 Passkey 的恢复安全也依赖同步服务本身。NIST 将同步服务账户恢复列为需要控制的潜在薄弱点。[NIST Syncable Authenticators](https://pages.nist.gov/800-63-4/sp800-63b/syncable/)

## 客户应该怎么做

1. 对每个重要账户记录启用的认证方式类型，而非秘密内容。
2. 记录认证器所在设备、凭证管理器或安全密钥的安全位置。
3. 确认是否存在独立备用方式，避免手机、Email 和 Passkey 全部依赖同一个根账户。
4. Recovery Code 只记录安全保管位置和更新状态，不写入 Recovery Map 正文。
5. 换设备、换号码或更换凭证管理器前，先核验各平台官方迁移和恢复规则。
6. 定期检查失效设备、旧号码和不再使用的认证方式。

## 安全边界

- 不收集或展示密码、OTP、Recovery Code、Passkey Secret、Authenticator Setup Key 或安全密钥秘密。
- 不提供复制、提取或破解 Passkey 私钥的方法。
- 不把生物识别数据描述为发送给平台的 Passkey Secret。
- 不声称所有 Passkey 都会自动跨设备恢复。
- 不建议关闭安全机制来简化恢复。

## 相关知识

- Email 账户无法访问时，应先检查哪些恢复条件？
- 手机号更换或停用后，会影响哪些数字账户恢复？
- Apple ID / Google Account 恢复前，应准备哪些身份与设备信息？
- 如何检查数字账户恢复体系中的单点故障？

## 相关 Recovery Map 模块

> **Internal Knowledge / AI Retrieval Metadata — 客户页面隐藏**

- 恢复所需条件与资料
- 位置与查找
- 恢复与转移步骤
- 给未来恢复人的嘱托

## 官方来源与核验

| Official Source | Official URL | Source / Updated Date | Last Verified | Applicable Region / Platform | Risk Notes |
|---|---|---|---|---|---|
| NIST — Authenticators | [Official URL](https://pages.nist.gov/800-63-4/sp800-63b/authenticators/) | SP 800-63-4 | 2026-08-21 | 通用数字身份框架 | 定义不替代平台规则 |
| NIST — Account Recovery | [Official URL](https://pages.nist.gov/800-63-4/sp800-63b.html) | SP 800-63-4 | 2026-08-21 | 通用数字身份框架 | 高保障级别要求不同 |
| NIST — Syncable Authenticators | [Official URL](https://pages.nist.gov/800-63-4/sp800-63b/syncable/) | SP 800-63-4 | 2026-08-21 | 同步认证器 | 同步服务恢复构成依赖 |
| Google — 2-Step Verification | [Official URL](https://support.google.com/accounts/answer/10956730?hl=en-EN) | 页面未标示 | 2026-08-21 | Google Account | 可用备用方式取决于账户配置 |
| Google — Backup codes | [Official URL](https://support.google.com/accounts/answer/1187538?co=GENIE.Platform%3DDesktop&hl=en-u) | 页面未标示 | 2026-08-21 | Google Account | Backup Code 属高敏感且使用后失效 |
| Google — Passkey | [Official URL](https://support.google.com/accounts/answer/13548313?hl=en-EN) | 页面未标示 | 2026-08-21 | Google Account | 设备和账户设置影响可用性 |
| Apple — Passkey security | [Official URL](https://support.apple.com/en-ie/102195) | 页面未标示 | 2026-08-21 | Apple / iCloud Keychain | 恢复条件属于 Apple 生态规则 |

## Needs Review

**NEEDS REVIEW / HUMAN ESCALATION：**认证器疑似被盗或复制；陌生 Passkey 或安全密钥出现；所有备用方式同时不可用；组织账户策略；平台冻结；身份争议；死亡、失能、继承或法律授权。

**与现有 APPROVED Knowledge 冲突：未发现。**

