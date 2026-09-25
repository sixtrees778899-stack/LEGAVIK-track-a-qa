# Trezor — Recovery Knowledge Pilot

## 1. Platform Summary

自托管硬件钱包。钱包备份依型号和创建时间可能是 BIP39 12/24词或 SLIP39 20词 single-/multi-share（A/B）。

## 2. Custody Model

非托管。Trezor 设备保护私钥；Trezor 不持有可替用户恢复的备份、PIN 或 Passphrase。

## 3. Recovery Objective

确定原钱包的备份标准与门限，使用正确备份（及启用时的 Passphrase）恢复相同地址，并在可信设备上验证备份和交易。

## 4. Normal Access Requirements

- 原 Trezor 设备、PIN、Trezor Suite/兼容接口（A）。
- PIN 解锁设备并有递增等待机制，不是钱包备份（A）。
- Passphrase 若启用，会与备份生成独立隐藏钱包，且不存于设备（A）。

## 5. Recovery Requirements

- BIP39：按配置使用12或24词；SLIP39：20词 single-share 或达到 multi-share 阈值的份额（A/B）。
- 原设备不是必要条件，只要备份格式和材料足够且兼容（A）。
- 精确 Passphrase 是隐藏钱包必要条件；遗忘后无可靠恢复方法（A）。
- Trezor Suite 的 Check backup 可在不保存输入备份的情况下核对是否匹配设备（A/B）。

## 6. Transaction / Withdrawal Control Requirements

恢复后需确认正确 Passphrase wallet、公开地址、链/账户与设备显示，再执行小额安全测试。备份“有效”不必然表示它对应目标 Passphrase wallet。

## 7. Failure Scenarios

| 场景 | 官方/安全路径 | 等级 |
|---|---|---|
| 设备丢失/损坏 | 用正确 BIP39/SLIP39 备份在兼容设备恢复 | A |
| PIN遗忘 | 用备份恢复/重建设备；PIN本身不恢复钱包 | A/B |
| 单份 SLIP39 丢失 | 若剩余份额达到设定阈值仍可恢复；否则不可恢复 | A |
| Passphrase遗忘/输入差异 | 对应隐藏钱包不可恢复/会显示不同钱包 | A |
| 备份缺失但设备可访问 | 先安全迁移；某些配置可创建新备份，取决于设备/格式 | B/C |
| 备份缺失且设备不可访问 | 无官方替代，可能永久失去控制 | A |

## 8. Official Recovery Paths

只使用官方 Trezor Suite/设备流程或经人工确认的兼容钱包。先识别备份格式、词数、份额门限和 Passphrase 状态；绝不把备份输入普通网页。

## 9. Death / Incapacity / Estate Process

没有托管账户式遗产处理（B）。法律代表仍需合法取得满足阈值的备份和可选 Passphrase。Trezor 不会凭死亡证明或 probate 替代这些条件。

## 10. Required Recovery Map Information

- 必须：型号/创建时间线索、备份标准、词数或份额数量与门限、备份存在性/分离位置、Passphrase是否启用、公开地址、最近检查日。
- 建议：Trezor Suite版本线索、备用设备、各份额独立保管角色、恢复顺序。
- 禁止：备份词、份额内容、Passphrase、PIN、私钥。

## 11. Suggested Location Records

原设备、每份 backup share、Passphrase、备用设备和法律文件分别记录受控位置与识别说明；多份 share 不得集中存放。

## 12. Suggested Attachments

设备型号图片、公开账户/链清单、份额位置索引（不含词）、backup check 日期、官方恢复说明副本。

## 13. Prohibited Information

完整或部分备份词、SLIP39 share 内容、Passphrase、PIN、私钥、将门限份额集中到一个附件的材料。

## 14. High-risk Actions and Stop Conditions

任何人索取 wallet backup、PIN、Passphrase、密码或代码均视为诈骗并停止。固件真实性检查失败、设备要求在电脑/网页输入秘密、地址/链/Passphrase wallet 不匹配时停止并走官方支持。

## 15. Official Sources

见 `../SOURCES/index.md`：TRZ-01 至 TRZ-05。确认日期 2026-08-02。

## 16. Unconfirmed or Time-sensitive Items

型号/生产时期默认格式、旧新版 SLIP39 升级、第三方兼容和遗产执行需人工复核。

## 17. CJAS Template Recommendations

字段候选：`device_model`、`created_period_hint`、`backup_standard`、`backup_word_count`、`share_count`、`share_threshold`、`share_locations[]`、`passphrase_enabled`、`public_accounts[]`、`suite_version_hint`、`backup_check_date`、`stop_conditions[]`。
