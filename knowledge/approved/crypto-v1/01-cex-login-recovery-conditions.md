# 中心化交易所无法登录时，应先检查哪些恢复条件？

**Status：PUBLISHED**

## 快速了解

无法登录交易所时，先判断问题属于密码、Email、Phone、2FA、新设备确认、账户锁定还是平台服务异常。不同交易所的恢复入口、验证材料和恢复限制可能不同，应从目标平台的官方登录页或 Help Center 开始，不要使用搜索广告或陌生人提供的链接。

## 详细说明

交易所无法登录不一定意味着账户或资产已经丢失。常见原因包括：

- 登录名、Email 或密码错误；
- 收不到 Email 或 SMS；
- Authenticator、Passkey 或 Security Key 不可用；
- 新设备尚未获得确认；
- 账户被锁定、限制或暂时停用；
- 平台服务正在异常；
- Email、Phone 或设备可能已经被盗用。

恢复前应先区分“普通访问问题”和“疑似账户被入侵”。如果发现陌生登录、未经授权的验证请求或绑定信息被更改，不应继续普通排错，应立即使用平台正式安全入口或 Support 升级处理。

平台流程不能强行统一。例如：

- Coinbase 将密码、Email、2FA 和设备确认问题分别导向对应恢复路径；丢失 Email 或全部 2FA 方法时，可能需要进入 Account Recovery 并完成身份验证。[Coinbase：无法登录](https://help.coinbase.com/en/coinbase/managing-my-account/get-back-into-my-account/account-access?contactusbanner=false)
- Kraken 建议先检查服务状态、登录信息、2FA、设备批准和邮件接收；丢失 Sign-in 2FA 且没有可用 Master Key 时，需要提交官方支持请求。[Kraken：无法登录](https://support.kraken.com/articles/201889308-i-can-t-sign-in-to-my-account-?mode=consumerapp)
- OKX 对仍能登录和无法登录的客户提供不同的认证方式重置路径；部分选项和限制会因地区而异。[OKX：认证方式不可用](https://www.okx.com/en-us/help/what-if-mobile-email-google-verification-cannot-be-used)

## 客户应该怎么做

1. 确认使用的是平台正式网站或官方 App。
2. 检查平台 Status 页面是否存在服务异常。
3. 确认登录标识是否正确，包括 Email、Phone、用户名及登录方式。
4. 判断密码是否遗忘，或只是输入错误。
5. 确认当前要求的是哪种验证：
   - Email；
   - SMS；
   - Authenticator；
   - Passkey；
   - Security Key；
   - Push Notification；
   - 新设备确认。
6. 检查是否还有已登录设备或已启用的备用验证方式。
7. 如果原 Email、Phone 或全部 2FA 均不可用，进入该平台官方 Account Recovery。
8. 按官方页面准备身份核验材料，不要通过邮件或聊天把证件、密码或验证码发送给陌生人。
9. 遇到账户锁定、身份验证持续失败或疑似入侵时，停止重复尝试并进入官方 Support。

## 注意事项

- 不要向任何客服提供密码、OTP、Authenticator Setup Key、Seed Phrase 或 Private Key。
- 不要根据其他交易所的流程推断当前平台的恢复要求。
- 不要连续反复请求验证码或重置；平台可能设置频率限制或安全等待期。
- 死亡、失能、继承、司法限制或第三方资产冻结不属于普通登录恢复：`NEEDS REVIEW / HUMAN ESCALATION`。
- Binance 的相应流程尚未完成充分官方核验，本 Draft 不对 Binance 作确定性说明。

## 相关知识

- 交易所 2FA 丢失后的官方恢复准备清单
- Crypto 账户 Email、Phone 与 2FA 的恢复依赖
- 如何识别假客服与假恢复网站
- Recovery Material 安全

## 相关 Recovery Map 模块

- 资产与账户清单
- 恢复所需条件与资料
- 位置与查找
- 恢复与转移步骤
- 协助人

## 来源与核验

| Official Source | Source / Updated Date | Last Verified | Applicable Region | Risk Notes |
|---|---|---|---|---|
| [Coinbase — Can’t sign in to your account](https://help.coinbase.com/en/coinbase/managing-my-account/get-back-into-my-account/account-access?contactusbanner=false) | 页面未显示 | 2026-08-20 | Coinbase 页面适用范围；具体产品及地区需复核 | Account Recovery 可能要求身份核验 |
| [Coinbase — Account recovery for lost email or 2-step verification access](https://help.coinbase.com/en/coinbase/managing-my-account/get-back-into-my-account/account-recovery-lost-email-2step-verification) | 页面未显示 | 2026-08-20 | Coinbase 页面适用范围 | 恢复后可能存在临时发送限制 |
| [Kraken — I can’t sign in to my account](https://support.kraken.com/articles/201889308-i-can-t-sign-in-to-my-account-?mode=consumerapp) | Updated 2026-04-13 | 2026-08-20 | Kraken Consumer | Master Key、2FA 和支持路径具有平台特异性 |
| [OKX — Authentication method unavailable](https://www.okx.com/en-us/help/what-if-mobile-email-google-verification-cannot-be-used) | Updated 2026-08-11 | 2026-08-20 | OKX United States；其他地区需重新核验 | 重置后的功能限制及入口可能因地区变化 |

**Needs Review**

- Binance、其他目标交易所及澳大利亚适用页面需要单独完成官方核验。
- 账户限制、身份验证失败和疑似入侵的 Human Escalation 路由需按平台拆分。

---
