# 交易所 2FA 丢失后的官方恢复准备清单

**Status：PUBLISHED**

## 快速了解

交易所 2FA 丢失后，先确认丢失的是 Authenticator、SMS、Passkey、Security Key、Push Notification，还是承载这些方式的设备。检查是否仍有已登录设备或备用方法，再进入对应交易所的官方恢复入口。不要向任何人披露 OTP 或 Authenticator Setup Key。

## 详细说明

“2FA 丢失”可能代表不同问题：

- 手机遗失，但 Authenticator 有安全的迁移或备份方式；
- 原电话号码不可用；
- Authenticator 条目被删除；
- Security Key 遗失；
- Passkey 所在设备或同步账户不可用；
- 仍能登录，但无法完成敏感操作；
- 所有登录验证方式均不可用。

这些情况不能使用同一套恢复步骤。

Coinbase 建议先尝试其他已启用的验证方法；如果所有方法均不可用，应选择更新 2FA 并进入 Account Recovery。Coinbase 不能替客户恢复或补发遗失的 Security Key。[Coinbase：2FA 排错](https://help.coinbase.com/en/coinbase/managing-my-account/get-back-into-my-account/2-step-verification-troubleshooting)

Kraken 的 Sign-in 2FA 可以与 Trading、Funding 等其他 2FA 分开。丢失 Sign-in 2FA 后，客户可能使用预先配置的 Master Key、已保存的 2FA 备份，或提交官方支持请求，具体取决于原账户设置。[Kraken：手机丢失后的 Sign-in 2FA](https://support.kraken.com/articles/360026925951-how-to-transfer-authenticator-app-sign-in-2fa-to-a-new-phone-and-bypass-sign-in-2fa-for-a-lost-phone-?mode=consumerapp)

OKX 提供针对 Email、Phone 和 Authenticator 的自助重置路径；无法登录时应从登录验证页面选择无法验证或重置入口。修改认证方式后可能存在临时功能限制，且地区规则可能不同。[OKX：认证方式不可用](https://www.okx.com/en-us/help/what-if-mobile-email-google-verification-cannot-be-used)

## 客户应该怎么做

### 恢复前检查

- 确认目标交易所及正确官方域名；
- 确认丢失的具体 2FA 类型；
- 检查是否仍有可信的已登录设备；
- 检查是否存在已配置的备用验证方式；
- 确认绑定 Email 和 Phone 是否仍由本人控制；
- 准备平台正式页面要求的身份核验材料；
- 记录错误提示，但不要记录或截图有效验证码。

### 选择正确路径

1. **仍有其他有效验证方式**  
   使用平台页面提供的备用方法登录，再从 Security Settings 更新失效的 2FA。

2. **仍有旧设备**  
   先查看 Authenticator 是否提供官方迁移功能，并按交易所要求更新绑定。不要在新方式确认生效前删除旧方式。

3. **所有登录 2FA 均不可用**  
   使用交易所官方 Account Recovery 或 Sign-in Support，不要让第三方代为操作。

4. **设备可能被盗或账户可能被入侵**  
   立即保护关联 Email 和 Phone，并通过平台官方安全入口请求限制或保护账户。

5. **身份验证无法通过**  
   停止反复提交，记录错误并转入官方 Support：`HUMAN ESCALATION`。

## 注意事项

- Authenticator Setup Key 可用于生成验证码，应按高敏感秘密保护。
- 平台客服不应要求客户通过聊天发送 OTP、密码或 Setup Key。
- 恢复或更新 2FA 后，平台可能临时限制发送、提现或其他敏感操作。
- Kraken 的 Master Key 是平台特定机制，不能推广为所有交易所的通用能力。
- 死亡、失能、继承或法律授权场景：`NEEDS REVIEW / HUMAN ESCALATION`。

## 相关知识

- 中心化交易所无法登录时，应先检查哪些恢复条件？
- Crypto 身份与认证恢复
- Recovery Material 安全
- Crypto 恢复安全与诈骗

## 相关 Recovery Map 模块

- 恢复所需条件与资料
- 位置与查找
- 恢复与转移步骤
- 协助人

## 来源与核验

| Official Source | Source / Updated Date | Last Verified | Applicable Region | Risk Notes |
|---|---|---|---|---|
| [Coinbase — Troubleshoot your 2-step verification](https://help.coinbase.com/en/coinbase/managing-my-account/get-back-into-my-account/2-step-verification-troubleshooting) | 页面未显示 | 2026-08-20 | Coinbase 页面适用范围 | Security Key、Passkey、SMS、TOTP 和 Push 路径不同 |
| [Coinbase — Account recovery](https://help.coinbase.com/en/coinbase/managing-my-account/get-back-into-my-account/account-recovery-lost-email-2step-verification) | 页面未显示 | 2026-08-20 | Coinbase 页面适用范围 | 可能要求 ID/selfie，并产生临时发送限制 |
| [Kraken — Transfer or recover Sign-in 2FA](https://support.kraken.com/articles/360026925951-how-to-transfer-authenticator-app-sign-in-2fa-to-a-new-phone-and-bypass-sign-in-2fa-for-a-lost-phone-?mode=consumerapp) | Updated 2025-06-13 | 2026-08-20 | Kraken Consumer | Sign-in、Funding、Trading 2FA 不可混同 |
| [Kraken — Authenticator setup key](https://support.kraken.com/hc/articles/360001486466-how-to-find-the-setup-key-or-backup-code-for-authenticator-app-2fa) | 页面未显示 | 2026-08-20 | Kraken | Setup Key 属于高敏感认证材料 |
| [OKX — Authentication method unavailable](https://www.okx.com/en-us/help/what-if-mobile-email-google-verification-cannot-be-used) | Updated 2026-08-11 | 2026-08-20 | OKX United States | 重置入口及安全限制可能因地区变化 |

**Needs Review**

- Binance 官方 2FA 恢复资料尚未充分核验，不能纳入正式客户结论。
- Coinbase 页面未显示更新时间，发布前应再次核验页面版本。
- 各地区安全等待期不得在通用文章中写成统一规则。

---
