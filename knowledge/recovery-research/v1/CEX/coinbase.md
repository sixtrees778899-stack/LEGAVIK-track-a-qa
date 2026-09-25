# Coinbase — Recovery Knowledge Pilot

## 1. Platform Summary

中心化交易所/托管平台。恢复目标包括账户访问、身份验证、发送能力恢复，以及死亡账户的合法资产转移（A/B）。

## 2. Custody Model

托管。账户登录与查看、身份恢复及链上发送是不同门槛；登录成功不代表 sends 已解除限制。

## 3. Recovery Objective

本人场景：通过官方恢复验证身份并等待安全期结束。死亡场景：由遗产文件指定人员通过 Executor Services 提交材料，按 Coinbase case 处理。

## 4. Normal Access Requirements

- 账户邮箱和密码；无密码创建方式存在例外（B）。
- 配置的 2-step verification：SMS、Authenticator/TOTP、Security Key 等（B）。
- 邮箱用于新设备确认、安全提醒和支持通信（A/B）。
- 应记录已启用因素，不记录验证码或秘密。

## 5. Recovery Requirements

- 丢失邮箱或 2-step 方法：从官方 account recovery 页面开始，通常先输入邮箱和密码；遗失密码先重置（A/B）。
- 可选路径包括上传政府 ID；Trusted Contacts 仅在已启用时可批准登录，且不能借此更新邮箱或 2-step 方法（B）。
- 旧版官方 FAQ 说明可能需要身份验证，恢复约 48 小时且 sends 在完整安全期前禁用；时长须按当前地区/产品重核（B/C）。

## 6. Transaction / Withdrawal Control Requirements

- 2-step 可配置为发送时必需（B）。
- Allowlisting 启用时只能向已批准地址发送；不同 Coinbase 产品文档显示 24 或 48 小时激活/安全期，不能合并为一个固定规则（C）。
- Coinbase Vault 可能要求多邮箱批准并有 48 小时延迟；仅适用于配置该产品的账户（B）。

## 7. Failure Scenarios

| 场景 | 官方/安全路径 | 等级 |
|---|---|---|
| 邮箱不可访问 | 官方 account recovery；按页面选择 ID 等方式 | A/B |
| 手机/2-step 丢失 | 官方恢复；原设备仍可用时路径可能不同 | A/B |
| Security Key 丢失 | 官方恢复或其他已配置因素 | B |
| 密码遗失 | 先走官方 password reset | A/B |
| ID/自拍失败 | 按官方拍摄建议，等待后再试；持续失败联系支持 | B |
| 账户疑似被盗 | 不使用普通恢复绕过，立即锁定/联系官方支持 | A/B |
| Allowlist阻止发送 | 核验产品规则与地址，等待安全期；不得绕过 | B/C |

## 8. Official Recovery Paths

仅使用 `help.coinbase.com` 或从已收藏的 `coinbase.com` 进入。恢复后分别确认 sign-in、buy/sell 和 sends 状态；未过安全期不得标记取得控制权。

## 9. Death / Incapacity / Estate Process

Coinbase 公开 Executor Services（A）：申请人需 Coinbase 账户、死亡证明、遗嘱认证/Letters Testamentary/Letters of Administration/Affidavit 等遗产文件、文件所列人员的有效政府照片 ID，以及签署的资产转移指示（含目标账户关联邮箱）。个人账户当前不能指定 beneficiary；所有权转移依据遗产规划文件或无遗嘱继承法。失能、POA、trust 的具体司法辖区处理为 B/C，需人工法律复核。

## 10. Required Recovery Map Information

- 必须：Coinbase 产品/地区、脱敏邮箱、2-step 类型、身份材料存在性和位置、官方恢复 URL、最近复核日期。
- 死亡规划：遗嘱执行人/法定代表角色、死亡证明和 probate 材料位置、目标 Coinbase 账户准备说明。
- 建议：原设备存在性、allowlist/Vault 是否启用、trusted contact 是否配置。
- 禁止：密码、OTP、Security Key secret、完整 ID 副本、会话 cookie、完整恢复码。

## 11. Suggested Location Records

记录邮箱恢复入口、手机/Authenticator/Security Key 位置、政府 ID 与遗产文件的保管位置、原设备识别信息、备用联系人和复核日期。

## 12. Suggested Attachments

脱敏账户/资产清单、官方 account recovery 与 Executor Services 页面副本、遗产材料索引、设备图片。法律/身份文件本体默认不上传，仅记录受控位置。

## 13. Prohibited Information

密码、2-step code、OTP、Security Key secret、邮件访问权、远程会话、完整身份证件、可直接控制目标钱包的秘密。

## 14. High-risk Actions and Stop Conditions

Coinbase 员工不会索取密码、2-step code 或邮箱访问，也不会要求远程控制或为解决问题先付款/转账。出现这些要求立即停止并从官方入口重新联系。地址、链或法律权限不明确时不得发送。

## 15. Official Sources

见 `../SOURCES/index.md`：CB-01 至 CB-05。确认日期 2026-08-02。

## 16. Unconfirmed or Time-sensitive Items

普通/Advanced/International/历史 Pro 的 allowlist 时限分派、地区身份材料、失能/POA/信托处理及恢复安全期均需执行时重核。

## 17. CJAS Template Recommendations

字段候选：`coinbase_product`、`jurisdiction`、`email_hint`、`two_step_types[]`、`original_device_exists`、`id_material_location`、`allowlisting_enabled`、`vault_enabled`、`trusted_contact_enabled`、`executor_role`、`estate_documents_locations[]`、`recovery_status_checks[]`、`last_reviewed_at`。
