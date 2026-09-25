# Binance — Recovery Knowledge Pilot

## 1. Platform Summary

全球中心化交易所/托管平台。账户显示的余额由 Binance 托管系统控制，链上转移需通过平台授权流程。证据：B（功能与地区可能变化）。

## 2. Custody Model

托管。用户不凭 Binance 登录密码直接持有平台托管地址的私钥；平台账户访问、身份审核和提币风控共同决定实际控制。

## 3. Recovery Objective

依法恢复账户访问，完成所需身份/安全验证，并确认提币权限、白名单和风控状态后，把资产转移到已核验的合法目标地址。

## 4. Normal Access Requirements

- 账户标识与密码：存在性应记录；具体登录标识形式需在账户中确认（B）。
- 2FA 可包括 SMS、Authenticator、硬件 Security Key/Passkey；启用组合取决于账户配置（A/B）。
- 新设备可能需要邮箱确认；授权设备和活动记录可在 Security 中管理（A/B）。
- Anti-phishing code 用于辨别官方邮件，不是登录或提币秘密（A）。

## 5. Recovery Requirements

- 丢失 Authenticator 设备时，可用保存的 Authenticator backup key 迁移；无 backup key 时使用官方账户恢复（B）。
- 具体身份材料、恢复步骤、地区可用性和审核时长：`POLICY MAY VARY / REQUIRES HUMAN REVIEW`。
- 不得把 Authenticator seed、完整恢复码或 OTP 写入 CJAS。

## 6. Transaction / Withdrawal Control Requirements

- 能登录不等于能提币。提币可能受 2FA、邮件确认、地址白名单、新地址等待及实时风控影响（B/C）。
- 官方 Academy 确认地址白名单和新地址确认；精确等待期在当前来源间不足以稳定适用于全球站，标 C。
- “提币密码”为 D，未确认是全球站通用条件。

## 7. Failure Scenarios

| 场景 | 官方/安全路径 | 等级 |
|---|---|---|
| 邮箱不可访问 | 官方账户恢复；具体材料未确认 | B/D |
| 手机/号码失效 | 使用其他已配置因素或官方恢复 | B |
| Authenticator 丢失 | backup key 迁移；否则官方恢复 | A/B |
| Security Key/Passkey 丢失 | 使用其他已配置因素或官方恢复；精确步骤需实时核对 | B |
| 密码遗失 | 官方密码/账户恢复入口；细节需实时核对 | B |
| KYC失败 | 停止重复尝试，联系官方支持；材料与 SLA 未确认 | D |
| 新设备/白名单限制 | 等待平台安全期并核验邮件和地址，不绕过风控 | B/C |

## 8. Official Recovery Paths

只从 `binance.com` 已保存书签进入 Account/Security/Support。先识别缺失因素，再使用页面提供的恢复流程；若要求超出公开文档，转官方支持并记录 case id，而非秘密内容。

## 9. Death / Incapacity / Estate Process

`NOT CONFIRMED — D`。当前找到的 Binance Academy 文章是一般继承教育，不是 Binance 全球账户的正式遗产申请操作页。不得据此承诺继承材料或转移结果。

## 10. Required Recovery Map Information

- 必须：平台与地区实体、脱敏账户标识、资产类别、已启用 2FA 类型、KYC 状态存在性、官方入口、最近复核日。
- 建议：授权设备存在性、白名单存在性、备用因素/客服 case 路径、合法代表联系人。
- 可选：脱敏余额分类、Anti-phishing code“已设置”状态（不记录原文）。
- 禁止：密码、OTP、Authenticator seed、backup key、完整证件号码、API secret、完整白名单控制材料。

## 11. Suggested Location Records

记录邮箱/手机号的可恢复渠道、Authenticator 设备名称和物理位置、Security Key 位置、身份文件保管位置、备用设备与最近复核日期；均不记录秘密本身。

## 12. Suggested Attachments

脱敏资产类别清单、脱敏设备清单、官方恢复页面离线副本、合法身份/遗产材料的位置说明。证件本体是否上传须另行安全与法律评审。

## 13. Prohibited Information

完整密码、OTP、2FA seed、恢复码全集、Security Key secret、API secret、完整身份材料、可直接完成全部控制的组合。

## 14. High-risk Actions and Stop Conditions

任何人索取 OTP/密码、要求远程控制、要求关闭安全设置、从非官方域名联系、要求先向陌生地址转账，或网络/链/地址不确定时立即停止。连续验证失败时停止重试，避免账户锁定或风险升级。

## 15. Official Sources

见 `../SOURCES/index.md`：BIN-01、BIN-02。确认日期 2026-08-02。

## 16. Unconfirmed or Time-sensitive Items

死亡/失能流程、恢复材料清单、精确等待期、全球站提币密码、地区/KYC差异均需人工复核。

## 17. CJAS Template Recommendations

采用声明式字段：`platform_entity`、`account_identifier_hint`、`enabled_2fa_types[]`、`kyc_exists`、`authorized_device_exists`、`withdrawal_allowlist_enabled`、`official_recovery_url`、`condition_locations[]`、`fallback_path`、`last_reviewed_at`。仅 A/B 级进入模板；精确等待期暂不固化。
