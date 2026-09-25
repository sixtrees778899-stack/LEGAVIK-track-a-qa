# Ledger — Recovery Knowledge Pilot

## 1. Platform Summary

自托管硬件钱包。设备保存签名私钥；资产在区块链上。标准核心备份为 24 词 Secret Recovery Phrase（A）。

## 2. Custody Model

非托管。Ledger 不持有私钥或 24 词副本；官方客服无法重置自托管秘密。

## 3. Recovery Objective

用仍可访问的原设备＋PIN，或用正确 24 词（以及启用时的精确 Passphrase）在可信兼容设备/钱包恢复相同地址，然后安全验证并取得签名能力。

## 4. Normal Access Requirements

- 原 Ledger 设备、设备 PIN、Ledger Wallet（旧称 Ledger Live）/兼容应用（A）。
- PIN 只解锁该设备，不是钱包备份；三次错误尝试会重置设备（A/B，型号应重核）。
- 发送交易需设备上确认；应以可信显示屏核对地址/金额（B）。

## 5. Recovery Requirements

- 设备遗失、损坏或忘记 PIN：24 词可恢复到新 Ledger 或兼容钱包（A）。
- 启用 Passphrase 的隐藏钱包必须同时有正确 24 词和逐字符一致的 Passphrase；24词单独只恢复另一组地址（A）。
- Ledger Recovery Key 是部分型号的可选物理备份，不能假设用户拥有；传统 recovery sheet 仍是最终备用（B）。

## 6. Transaction / Withdrawal Control Requirements

正确恢复后仍需安装相应应用、添加正确链账户并在设备上核对/确认交易。恢复出界面但地址不匹配，不得转账。网络、代币和 derivation path 兼容性需逐项确认。

## 7. Failure Scenarios

| 场景 | 官方/安全路径 | 等级 |
|---|---|---|
| 设备丢失/损坏 | 24词恢复到新 Ledger/兼容钱包 | A |
| PIN遗忘 | 设备重置后用24词恢复 | A |
| 24词丢失但设备＋PIN可用 | 仍可转移资产至新安全钱包；先规划并小额验证 | A/B |
| 设备与24词均不可用 | 无官方重置，资产可能永久不可访问 | A |
| Passphrase遗忘 | 隐藏钱包不可恢复，即使24词正确 | A |
| 24词泄露 | 视为控制权泄露；从可信设备转移至新 seed 控制地址 | A/B |

## 8. Official Recovery Paths

只使用从 `ledger.com` 获取的官方应用/设备。恢复前核验设备真实性；秘密只在受信设备允许的位置输入。Ledger Live 或任何客服索取24词均为诈骗信号。

## 9. Death / Incapacity / Estate Process

没有托管式账户继承流程（B）。合法代表必须按遗产安排取得设备/备份及可选 Passphrase；Ledger 无法以法律文件替代秘密恢复。法律授权与秘密保管需分开设计并人工复核。

## 10. Required Recovery Map Information

- 必须：型号、公开地址/账户类别、设备存在性/位置、24词存在性/分离位置、Passphrase是否启用、最近备份核验日。
- 建议：配套应用、链/账户/derivation识别、备用兼容设备存在性、Recovery Key是否配置。
- 禁止：24词、Passphrase、PIN、Recovery Key PIN、私钥。

## 11. Suggested Location Records

设备、recovery sheet/金属备份、Passphrase、备用设备和遗产授权文件分别记录受控位置；避免设备与所有恢复材料同处。

## 12. Suggested Attachments

设备型号照片、公开账户/链清单、脱敏 Ledger Wallet 界面、备份核验日期记录、官方恢复步骤副本。

## 13. Prohibited Information

24词、Passphrase、PIN、Recovery Key PIN、私钥、可扫码恢复秘密、同时暴露全部控制位置的图片。

## 14. High-risk Actions and Stop Conditions

任何电脑/手机网页、Ledger Wallet 弹窗或客服要求输入24词时停止；Ledger 官方说明真实应用不会索取恢复词。地址与设备屏幕不一致、固件/设备真实性警告、未知合约或网络不确定时停止。

## 15. Official Sources

见 `../SOURCES/index.md`：LED-01 至 LED-05。确认日期 2026-08-02。

## 16. Unconfirmed or Time-sensitive Items

Recovery Key/Recover 的型号地区覆盖、固件兼容、第三方钱包 derivation path 和遗产执行均需实时人工复核。

## 17. CJAS Template Recommendations

字段候选：`device_model`、`device_location`、`public_accounts[]`、`recovery_phrase_exists`、`recovery_phrase_location`、`passphrase_enabled`、`passphrase_separate_location`、`recovery_key_configured`、`companion_app`、`backup_check_date`、`address_verification_steps`。
