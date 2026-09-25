# Apple ID / Google Account 恢复前，应准备哪些身份与设备信息？

**Status：DRAFT — FOR REVIEW**

## 快速了解

Apple ID 现称 Apple Account。恢复 Apple Account 或 Google Account 前，应准备账户标识、仍可使用的受信任设备、恢复手机号或 Email、近期账户变更和官方提示信息。不要为了“证明身份”向任何客服披露密码、OTP、Recovery Code、设备解锁码或 Passkey Secret。

## 通用准备清单

- 正确的 Apple Account 或 Google Account 登录标识；
- 账户类型：个人、儿童/家庭、工作、学校或组织管理；
- 仍处于登录状态的可信设备、浏览器或官方应用；
- 当前可访问的恢复 Email 和手机号；
- 受信任设备、受信任号码或 Google 提示可用性；
- 是否配置 Passkey、安全密钥、Recovery Contact、Recovery Key 或备用代码；
- 最近一次成功登录的大致时间和常用位置；
- 最近更换过的密码、设备、号码或恢复信息；
- 官方页面显示的错误、等待状态或工单编号。

Recovery Map 应记录这些条件和位置，不记录其秘密内容。

## Apple Account 平台规则

Apple 的双重认证依赖受信任设备或受信任手机号。可信设备可以显示验证码并用于关键账户变更；若这些条件都永久不可用，可以尝试 Account Recovery。Apple 说明恢复可能持续数天或更久，Support 不能加速。[Apple 官方说明](https://support.apple.com/en-la/122621)

如果预先配置了 Account Recovery Contact，该联系人可以在用户启动恢复后提供恢复代码，但不能直接访问用户账户。是否存在该联系人必须以账户当前设置为准，不能事后假设。[Apple Recovery Contact](https://support.apple.com/en-gb/102641)

## Google Account 平台规则

Google 建议从官方恢复页面开始，尽可能准确回答问题。使用过去登录过的设备可能有助于核验；恢复手机号和恢复 Email 可用于证明账户归属、接收安全提醒或进入账户。工作、学校或其他组织账户可能需要管理员协助。[Google 账户恢复](https://support.google.com/accounts/answer/7682439?hl=en-EN)；[Google 恢复信息](https://support.google.com/accounts/answer/183723)

Google Passkey 不会自动删除账户原有的认证或恢复因素。具体可用的登录方式由账户设置、设备和平台判断。[Google Passkey](https://support.google.com/accounts/answer/13548313?hl=en-EN)

## 客户应该怎么做

1. 只从 `account.apple.com`、Apple 设备设置、Google Account 或官方恢复页面开始。
2. 先检查可信且已登录设备，避免退出、抹除或重置仍可能提供恢复条件的设备。
3. 确认恢复手机号、Email 和其他认证器是否仍受本人控制。
4. 分别记录 Apple 与 Google 的恢复条件，不把两个平台的规则合并。
5. 如果平台要求等待，保留官方提示和通知，不重复提交相互冲突的请求。
6. 恢复成功后再按官方安全设置复核设备、号码、Email 和认证方式。

## 安全边界

- 不披露账户密码、设备解锁码、OTP、Recovery Code、Recovery Key 或 Passkey Secret。
- 不提供绕过 Activation Lock、设备锁、2FA 或账户恢复等待的方法。
- 不声称 Apple 或 Google 客服能够手工跳过身份验证。
- Apple Recovery Contact 不等于账户共同所有者或法律代理人。

## 相关知识

- Email 账户无法访问时，应先检查哪些恢复条件？
- 手机号更换或停用后，会影响哪些数字账户恢复？
- 2FA、Passkey 与备用恢复方式之间有什么区别？
- 如何检查数字账户恢复体系中的单点故障？

## 相关 Recovery Map 模块

> **Internal Knowledge / AI Retrieval Metadata — 客户页面隐藏**

- 资产与账户清单
- 恢复所需条件与资料
- 位置与查找
- 恢复与转移步骤
- 协助人

## 官方来源与核验

| Official Source | Official URL | Source / Updated Date | Last Verified | Applicable Region / Platform | Risk Notes |
|---|---|---|---|---|---|
| Apple — Trusted phone numbers and devices | [Official URL](https://support.apple.com/en-la/122621) | 2026-04-10 | 2026-08-21 | Apple Account | Account Recovery 时间由平台决定 |
| Apple — Set up a recovery contact | [Official URL](https://support.apple.com/en-gb/102641) | 2026-06-08 | 2026-08-21 | Apple Account；地区年龄要求可能不同 | Contact 只能提供代码，不能访问账户 |
| Google — Recover your Account or Gmail | [Official URL](https://support.google.com/accounts/answer/7682439?hl=en-EN) | 页面未标示 | 2026-08-21 | Google Account / Gmail | 组织账户需联系管理员 |
| Google — Recovery phone or email | [Official URL](https://support.google.com/accounts/answer/183723) | 页面未标示 | 2026-08-21 | Google Account | 恢复选项由账户状态动态决定 |
| Google — Sign in with a passkey | [Official URL](https://support.google.com/accounts/answer/13548313?hl=en-EN) | 页面未标示 | 2026-08-21 | Google Account；设备支持不同 | Passkey 不等于删除其他恢复因素 |

## Needs Review

**NEEDS REVIEW / HUMAN ESCALATION：**账户被盗或安全资料被改；设备所有权或身份存在争议；Activation Lock；组织管理账户；儿童或家庭账户争议；死亡、失能、继承或法律授权；平台锁定、冻结或拒绝恢复。

**与现有 APPROVED Knowledge 冲突：未发现。**

