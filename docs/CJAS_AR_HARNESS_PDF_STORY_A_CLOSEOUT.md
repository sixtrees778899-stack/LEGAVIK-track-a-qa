# CJAS AR Harness PDF Story A Closeout Report

日期：2026-08-05

验收结论：**PASS WITH NON-BLOCKING ISSUE**

## 1. Story A最终结果

在全新浏览器会话中，仅使用 Mainnet Evidence JSON、Recovery Kit 和 CEO 输入的恢复密码完成恢复。原始 PDF 未选择，本地 Archive 无输入入口，钱包未连接，也没有新上传或广播。

流程结果：Evidence读取 PASS → Arweave Mainnet下载 PASS → Archive SHA-256 PASS → Recovery Kit内容校验 PASS → 浏览器本地解密 PASS → 附件长度/MIME/SHA-256 PASS → 恢复文件下载 PASS → 本地打开 PASS。

## 2. Mainnet与文件证据

- TxID：`GOdh5ZF7Ky0queKC5XbsQpNJHSGsmexPzBVtEx8f9eI`
- Evidence JSON：`cjas-pdf-pilot-evidence-1785923661841.json`
- 下载网关：`https://arweave.net`
- 网关结果：HTTP 200
- Archive大小：335,882 bytes
- Archive SHA-256：`01d08d133eb3d75ff8c4a269c6b515ed87ae1ec9550425f1823aa7f4f7e50fde`
- 原始PDF大小：186,750 bytes（182.37 KB）
- 原始PDF SHA-256：`79216e810e168f39618b8748ff48837bb02bbfb4361900b5752e7c47bd04bc26`
- 恢复PDF SHA-256：`79216e810e168f39618b8748ff48837bb02bbfb4361900b5752e7c47bd04bc26`
- 恢复MIME：`application/pdf`
- 实际保存路径：`/Users/hanhuitao/Downloads/2023年ET》LINK的发展规划PDF。.pdf`

校验关系：Mainnet下载Archive哈希与Evidence中的Archive哈希一致；解密后附件哈希与Snapshot附件manifest及Evidence中的原始PDF哈希一致；磁盘实际下载文件再次通过`shasum -a 256`得到相同哈希。因此Mainnet密文、恢复字节和实际交付文件形成闭环。

## 3. 性能证据

- Mainnet下载：1,458.4 ms
- 浏览器解密、Snapshot/附件验证和恢复文件准备合计：435.4 ms
- 文件系统保存时间：2026-08-05T22:44:50+10:00

当前Evidence没有把Archive哈希计算与Blob生成拆成独立计时字段，因此不虚构单独耗时；两者包含于页面记录的恢复阶段与上述合计耗时中。

## 4. Root Cause与下载链路

原实现已经调用`recoverAttachmentForDownload()`并获得真实恢复字节、净化文件名、正确MIME和SHA-256，但结果只存在`recover()`局部变量。代码没有构造Blob、没有创建Object URL、没有触发浏览器下载，也没有手动下载入口。因此技术Evidence显示PASS，但用户没有文件可取得。

修正后的Harness交付层使用恢复出的不可变字节创建`application/pdf` Blob；每次点击分别创建Object URL、设置原始净化文件名、触发下载，并在使用后释放URL。主按钮“下载恢复文件”和辅助按钮“再次下载”均使用同一恢复字节。失败仅显示中文业务提示，不记录密码、Data Key或文件内容。

## 5. File Role Matrix

| 文件名 | 扩展名 | 实际角色 | 内部类型 | 包含Data Key包装信息 | 加密Archive | 用于恢复 | 上传Mainnet |
|---|---|---|---|---|---|---|---|
| `CJAS-PDF-Pilot.cjas` | `.cjas` | Recovery Kit | `CJASKIT` magic + kit version + wrapped DEK | 是（仅包装后） | 否 | 是 | 否 |
| `CJAS-PDF-Pilot.cjasvault` | `.cjasvault` | Encrypted Archive | `archive_format_version: 1` + `AES-256-GCM` envelope | 否 | 是 | 是 | 是 |

“保存Recovery Kit”实际下载`.cjas`，恢复时先由`RecoveryKitBuilder.parseKit()`检查magic、版本、长度、字段和算法，不能仅凭扩展名进入解密。“保存本地Archive副本”下载`.cjasvault`，它是可选本地备份；Story A未使用该文件，Archive只按Evidence TxID从Mainnet下载。

## 6. 浏览器证据

- 成功截图：`/Users/hanhuitao/.codex/visualizations/2026/08/01/019fbad6-acb9-7dd2-98ca-90ff4f147480/cjas-pdf-story-a-recovery-success.png`
- 成功卡片显示文件名、PDF、182.37 KB、Arweave Mainnet、完整性已验证，以及“下载恢复文件”“再次下载”。
- Chrome Console：0 errors / 0 warnings。
- CEO确认下载PDF可正常打开且内容正确。

## 7. 非阻断问题

文件名`2023年ET》LINK的发展规划PDF。.pdf`中的`。`是原始文件名在`.pdf`前已有的中文句号，不是恢复流程重复添加扩展名。恢复层按manifest保留并安全净化原名，所以显示与磁盘文件一致。它不影响MIME、字节、SHA-256、下载或打开，记录为非阻断命名/展示问题。

成功后点击下载按钮会使页面底部通用状态短暂保留“处理中……”，但成功卡片、下载动作和Evidence均正确，不影响文件交付，亦记录为非阻断状态文案问题。

## 8. 工程与边界

- 自动测试：277 / 277 PASS。
- 安全扫描：PASS，0 findings。
- `git diff --check`：PASS。
- 当前Harness基线commit：`cdb889970367c97f1234ece3a07772e1f23dc789`。
- Recovery Map V2 Freeze：`6ddffbba49596743f4a6842adbce694eb146388e`，未修改。
- 本轮新增广播：0。
- 本轮新增费用：0 AR。
- 当前Harness交付修正仍未提交，工作树包含Harness、Harness测试及本报告修改。
