# CJAS MP4 Mainnet Pilot Closeout Report

日期：2026-08-06

最终结论：**PASS WITH NON-BLOCKING ISSUE**

## 1. Mainnet 上链证据

- TxID：`wELztFMbhqW-dRU58cfdl_R_lQpVCkK8VLfOQBmGrvw`
- 网络：Arweave Mainnet
- 钱包公开地址：`DmZsrrWZuSMpjjm-kT2wnxca8kXdMybn514NC8jjPcc`
- Archive：9,795,318 bytes
- Archive SHA-256：`61d395192fb52de0575d121a72667126863ec5f8731cecee6f6386307950c836`
- 报价：0.101195418739 AR
- 实际费用：0.101195418739 AR
- 报价与实际费用：完全一致
- 广播前余额：0.940064565505 AR
- 最终结算余额：0.838869146766 AR
- 余额减少：0.101195418739 AR，与实际费用一致
- 网关：`https://arweave.net`
- 首次可下载：HTTP 200，广播后 1,228.9 ms（2026-08-06T01:46:21.474Z）
- Closeout 复核：跟随网关重定向后 HTTP 200，下载 9,795,318 bytes
- 本轮新增广播：1
- Mainnet Evidence：`cjas-mp4-mainnet-evidence-1785980781701.json`

## 2. 文件完整性

| 项目 | 原 MP4 | 恢复 MP4 | 结论 |
|---|---:|---:|---|
| 文件名 | `城市景观08 20186333-hd_1920_1080_60fps.mp4` | 相同 | PASS |
| 大小 | 9,795,154 bytes | 9,795,154 bytes | 完全一致 |
| SHA-256 | `f015b9236c21175a089478b6f39c590766ba4eb45f9e44c089a3c29fc7b6c0c9` | 相同 | 完全一致 |
| 时长 | 13.076667 秒 | 13.076667 秒 | 完全一致 |
| 视频 | H.264，1920×1080 | H.264，1920×1080 | 一致 |
| 音频 | AAC | AAC | 一致 |

本次下载的 Evidence JSON 没有独立的 `original_mp4_sha256` 字段；原始哈希存于二进制 Archive Header，且 Header 受 Evidence 中 Archive SHA-256 的完整性保护。独立恢复先验证整个 Archive 哈希，再读取 Header 原始哈希并与恢复文件比较，结果完全一致。该 Evidence 可读性缺口不影响本次密码学闭环，已补入后续 Evidence 生成代码，记录为非阻断问题。

## 3. CEO 客户播放验收

CEO 已确认恢复 MP4：可以正常打开、画面正常、音频正常、视频完整、无明显缺失、无断档、无异常卡点并可正常下载。

## 4. 性能

| 阶段 | 耗时 |
|---|---:|
| 本地文件读取 | 20.5 ms |
| 原文件 SHA-256 | 30.0 ms |
| AES-256-GCM 加密 | 22.9 ms |
| Archive 生成 | 6.2 ms |
| Archive SHA-256 | 28.2 ms |
| Recovery Kit 生成 | 111.6 ms |
| 钱包签名等待 | 8,292.6 ms |
| 广播并获得 TxID | 46,573.1 ms |
| 总上传流程 | 55,684.5 ms |
| Mainnet 首次可下载 | 1,228.9 ms |
| Mainnet Archive 下载 | 2,917.2 ms |
| Archive Hash 校验 | 28.3 ms |
| Recovery Kit 解锁 | 113.0 ms |
| MP4 解密 | 19.3 ms |
| 恢复文件生成 | 5.1 ms |
| 点击恢复至文件可下载 | 3,123.7 ms |

## 5. 独立恢复证明

本轮恢复不依赖原始 MP4、不依赖本地 Archive 副本、不依赖上传页面运行状态。恢复仅依赖 Mainnet Evidence、Recovery Kit、Password、Arweave Mainnet 与独立恢复工具。独立页面按 TxID 下载 9,795,318 bytes，验证 Archive SHA-256，解锁 Kit，本地 AES-256-GCM 解密并生成 MP4。

## 6. 已知 P1

本轮临时广播门要求客户从下载目录再次选择刚生成的 Archive。正式客户上传流程应改为：选择原文件 → 本地加密 → 查看报价 → 钱包签名 → 直接上传同一页面内存中的 Archive → 自动生成 Mainnet Evidence。本轮不扩大修复。

## 7. 安全与冻结边界

- 密码未进入 Git、Console、URL或浏览器持久存储。
- Recovery Kit、Archive、Evidence、原始或恢复 MP4均未进入 Git。
- 钱包私钥、助记词、JWK及钱包敏感材料未进入 Git。
- PDF Story A commit/tag未修改。
- Recovery Map V2 freeze commit/tag未修改。
- 独立恢复新增广播0，新增费用0 AR。

## 8. 工程状态

- 自动测试：287 / 287 PASS。
- Security Scan：PASS，0 findings。
- `git diff --check`：PASS。
- Chrome Console：本地加密页、广播页、独立恢复页均为0 errors / 0 warnings。
- 提交前HEAD：`b916e05721839a1bbd79d6784a4ed1bffd74f159`。
- PDF Story A tag `ar-pdf-story-a-pass`仍指向上述commit。
- Recovery Map V2 freeze tag `v2.0.0-local-freeze`仍指向`6ddffbba49596743f4a6842adbce694eb146388e`。
- Closeout仅提交独立MP4 Pilot、自动测试与本报告；提交后工作树应保持干净。
