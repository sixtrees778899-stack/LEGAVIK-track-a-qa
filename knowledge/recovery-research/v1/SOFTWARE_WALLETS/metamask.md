# MetaMask — Recovery Knowledge Pilot

## 1. Platform Summary

自托管软件钱包。传统 SRP 创建方式与 Google/Apple/Telegram 关联方式具有不同恢复条件，必须先识别创建方式（A/B）。

## 2. Custody Model

非托管。MetaMask 不持有可替用户恢复传统钱包的密码或 SRP。SRP 控制派生账户；单个导入账户可能由另一 SRP、私钥或外部 JSON 控制。

## 3. Recovery Objective

在可信新安装中恢复正确钱包，重新发现派生账户，并重新添加导入账户、硬件账户、自定义网络和代币；最后用公开地址和小额安全验证确认控制。

## 4. Normal Access Requirements

- 传统 SRP 钱包：本地密码解锁当前设备；可选移动端生物识别或扩展 passkey 解锁（A/B）。
- 社交登录型：关联 Google/Apple/Telegram 账户与 MetaMask 密码共同参与访问/恢复（B，版本和地区敏感）。
- 钱包密码不等于链上资产控制权；传统模式下它不恢复钱包（A）。

## 5. Recovery Requirements

- 传统方式：正确 SRP 可在新设备恢复派生账户，并设置新本地密码（A）。
- MetaMask 依次发现派生账户，可能在遇到 Ethereum Mainnet 零余额账户时停止；需继续重新添加账户（A/B）。
- 从其他 SRP、私钥、外部 JSON 或硬件钱包导入的账户不会由当前 SRP 自动恢复，需各自材料（A）。
- 社交登录型使用关联账号＋密码；若已另行揭示并备份 SRP，也可按 SRP 路径恢复（B）。

## 6. Transaction / Withdrawal Control Requirements

恢复应用界面不等于看到所有资产。须确认正确公开地址、网络、代币显示和足够 gas；签名前在钱包中核对链、目标地址、金额与合约权限。MetaMask 无中心化“提币审核”。

## 7. Failure Scenarios

| 场景 | 官方/安全路径 | 等级 |
|---|---|---|
| 忘记传统本地密码 | 用 SRP 在新实例恢复并设置新密码 | A |
| 原设备丢失 | 用正确 SRP；社交登录型用关联账号＋密码 | A/B |
| SRP恢复出“错误账户” | 核对 SRP、派生账户、导入账户、硬件账户与自定义网络 | A |
| 导入账户缺失 | 重新导入其私钥/外部 JSON/其他 SRP；当前 SRP 不覆盖 | A |
| SRP缺失但旧设备可解锁 | 在官方界面安全揭示并离线备份；不在远程支持中操作 | B |
| SRP与可用设备/社交恢复条件均缺失 | MetaMask 无法恢复；可能永久失去控制 | A |

## 8. Official Recovery Paths

仅从官方 MetaMask 安装与 Help Center 进入。传统路径选择已有钱包并输入 SRP；社交登录按原关联账号恢复。恢复完成后先比对公开地址，不立即转账。

## 9. Death / Incapacity / Estate Process

MetaMask 未提供托管账户式遗产转移（B）。依法获授权者仍必须取得该钱包实际采用的恢复条件。法律授权本身不能让 MetaMask 重置 SRP、私钥或传统密码。具体继承安排 `REQUIRES HUMAN/LEGAL REVIEW`。

## 10. Required Recovery Map Information

- 必须：钱包创建方式、公开地址、使用设备、SRP存在性及受控位置、导入/硬件账户存在性、最近复核日。
- 建议：派生账户数量线索、自定义网络和代币清单、社交账号类型存在性、gas准备说明。
- 可选：脱敏界面/设备识别图片。
- 禁止：SRP、私钥、JSON keystore内容/密码、MetaMask密码、云账号密码。

## 11. Suggested Location Records

分别记录 SRP、每个导入账户材料、硬件钱包、旧设备和社交账号恢复渠道的位置；这些位置之间不应形成单点泄露。

## 12. Suggested Attachments

公开地址与网络清单、脱敏资产类别、设备图片、自定义代币/网络说明、恢复后地址核对步骤。不得附秘密导出。

## 13. Prohibited Information

完整 SRP、私钥、keystore、备份密码、MetaMask密码、云账号密码、屏幕截图中的秘密或扫码材料。

## 14. High-risk Actions and Stop Conditions

MetaMask Support 不会索取 SRP/私钥。任何网页、弹窗、客服或“同步/验证”要求输入秘密、安装远程控制、签署不明消息/授权或转到陌生地址时立即停止。

## 15. Official Sources

见 `../SOURCES/index.md`：MM-01 至 MM-04。确认日期 2026-08-02。

## 16. Unconfirmed or Time-sensitive Items

社交登录和 Backup & Sync 的地区/版本覆盖、硬件账户自动恢复边界、移动端本地 vault 恢复能力均时间敏感。

## 17. CJAS Template Recommendations

字段候选：`wallet_creation_method`、`public_addresses[]`、`srp_exists`、`srp_location`、`imported_account_types[]`、`hardware_accounts[]`、`expected_derived_accounts`、`custom_networks[]`、`token_display_notes`、`original_device`、`social_login_type`、`last_reviewed_at`。
