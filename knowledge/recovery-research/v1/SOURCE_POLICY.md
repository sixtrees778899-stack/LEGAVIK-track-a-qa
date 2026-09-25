# Official Source and Evidence Policy

## 可接受来源

- 平台官方帮助中心、官方安全/恢复文档、官方产品文档。
- 官方 Academy 只用于安全模型或功能说明；若不能证明具体账户流程，不得外推。
- 搜索摘要只用于发现页面，结论必须指向官方页面 URL。

## 证据等级

- **A**：官方明确说明，页面当前可访问，适用对象清楚。
- **B**：官方说明，但受地区、账户配置、型号、产品或场景限制。
- **C**：官方页面存在歧义、时间差异或产品范围不清；需人工评审。
- **D**：官方资料未确认；只能进入 `OPEN_QUESTIONS.md`。

## 来源字段

每条来源记录 `source_url`、`source_title`、`source_type`、`checked_at`、`policy_version/page_updated`（若页面公开）和 `evidence_grade`。

## 更新纪律

- 页面无更新时间时写 `NOT PUBLISHED`。
- 不将一个地区或旧产品（例如 Coinbase Pro/International）的等待期泛化到其他产品。
- 政策、身份材料、等待期与客服路径在执行前必须重新核对。
- 官方未确认的死亡/失能处理、兼容设备或恢复条件不得猜测。

## 秘密处理

不得把完整私钥、助记词、密码、PIN、OTP、Authenticator seed、恢复码全集、Passphrase 或全部控制条件写入 CJAS、附件、日志或 Git。研究文档只描述秘密的作用与安全保管原则。
