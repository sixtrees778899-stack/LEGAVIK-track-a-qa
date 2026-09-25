# CJAS V3 Unified Multi-File Pilot Stage Closure & Productization Baseline

日期：2026-08-09
状态：**PASS**

## Archive composition

真实9文件样本：原始附件 `18,268,901 bytes`（17.42 MiB），Snapshot `24,365,451 bytes`，统一Archive `32,487,426 bytes`（30.98 MiB），Archive/Original=`1.778291`。

| 构成 | Bytes | Archive占比 | 说明 |
|---|---:|---:|---|
| 原始附件字节 | 18,268,901 | 56.2338% | 每个payload仅有一份 |
| Snapshot附件Base64URL放大 | 约6,089,634 | 18.7446% | 第一层4/3编码；按9个文件边界存在不超过12 bytes的分配误差 |
| Snapshot manifest、文件索引、文件名、MIME、路径、完整性及JSON语法 | 约6,916 | 0.0213% | 与上一项合计精确为6,096,550 bytes |
| AES-256-GCM tag | 16 | <0.0001% | 加密本身的固定开销 |
| Archive ciphertext Base64URL放大 | 8,121,823 | 24.9999% | 第二层4/3编码 |
| Archive JSON wrapper、nonce、AAD及字段语法 | 136 | 0.0004% | nonce原始12 bytes；AAD原始22 bytes |
| **合计** | **32,487,426** | **100%** | 增长14,218,525 bytes（77.8291%） |

确认原因：冻结Snapshot把附件字节编码为Base64URL，随后冻结Archive又把包含全部Snapshot的AES-GCM ciphertext编码为Base64URL。理论倍率趋近 `(4/3) × (4/3) = 1.7778`，与实测一致。未发现重复附件、同一payload多份保存、重复加密密文或异常metadata。明显空间成本来自两层既定编码，不是Crypto膨胀；本阶段不修改冻结结构。

## Capacity baseline

方法：确定性、非敏感内存TXT附件；单文件≤8 MiB；复用冻结Unified Snapshot/Archive/Kit管线；无钱包、无广播。报价为2026-08-09对 `arweave.net/price/{archiveBytes}` 的只读即时结果，不代表永久价格。RSS仅是Node进程采样增量，不是浏览器严格峰值。

| Original | Files | Snapshot | Archive | Ratio | Local create | Observed RSS delta | Quote |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 1.000 MiB | 1 | 1,401,090 B | 1.782 MiB | 1.7817× | 0.321 s | 48 MiB | 0.021270 AR |
| 10.000 MiB | 2 | 13,984,471 B | 17.782 MiB | 1.7782× | 1.856 s | 303 MiB | 0.191168 AR |
| 20.000 MiB | 3 | 27,965,951 B | 35.561 MiB | 1.7780× | 3.671 s | 378 MiB | 0.379648 AR |
| 30.000 MiB | 4 | 41,947,430 B | 53.339 MiB | 1.7780× | 5.835 s | 507 MiB | 0.568128 AR |
| 49.000 MiB | 7 | 68,512,755 B | 87.119 MiB | 1.7779× | 8.859 s | 386 MiB | 0.926506 AR |

50 MiB原始容量在当前冻结编码下预计形成约88.9 MiB Archive。主要产品风险是浏览器瞬时内存和按Archive而非原始文件计价；接近容量上限时应在正式UI中显示本地处理提示、保持进度，并进行设备能力/fail-closed检查。当前没有正式收费结论。

## Cost baseline

| Sample | Original | Archive | Actual AR | Upload/TxID | Established recovery |
|---|---:|---:|---:|---:|---:|
| PDF Story A | 186,750 B | 335,882 B | 0.005374266228 | 历史Evidence未保留可比较拆分 | 1.894 s（下载+解密准备） |
| MP4 Pilot | 9,795,154 B | 9,795,318 B | 0.101195418739 | 46.573 s | 3.124 s |
| Unified 9-file | 18,268,901 B | 32,487,426 B | 0.329209492952 | 136.185 s | CEO实测约30 s |

观察：费用随实际上链Archive体积和实时网络价格变化；Generic单文件二进制Archive开销很小，而冻结Unified结构约1.778×。当前49 MiB本地容量点的即时Archive报价约0.927 AR，50 MiB风险估计约0.95 AR量级，但不得据此制定固定价格。

## Technical baseline

- PASS — 多次追加文件且不覆盖已有文件
- PASS — 混合白名单格式与统一校验
- PASS — 原始文件累计容量≤50 MiB
- PASS — 一个冻结Snapshot、一个加密Archive、一个Recovery Kit
- PASS — 一个Mainnet TxID、一份Mainnet Recovery Evidence、一个密码
- PASS — Arweave分块上传与可视进度
- PASS — 多网关并行、size+SHA fail-closed恢复
- PASS — 一次恢复全部文件并提供整体/单文件保存
- PASS — 每文件SHA-256与byte-for-byte验证
- PASS — 单交易防重复门控

以上作为Productization Technical Baseline；除P0安全或完整性缺陷外停止主动修改底层。

## Performance

真实Unified样本：本地创建3.864 s；钱包签名17.895 s；分块广播至TxID/Evidence Ready 136.185 s；客户主动等待154.079 s，评级FAIL。125次上传调用平均1.089 s、中位0.820 s、P95 2.047 s、最大3.042 s；Mainnet随后3.119 s可完整读取。已确认瓶颈是浏览器到provider的分块上传往返，不是Evidence生成或Mainnet传播。Established Recovery约30 s，处于EXCELLENT/PASS边界。

## Productization interface

Create客户态：`EMPTY → FILES_READY → PASSWORD_READY → LOCAL_PROCESSING → MATERIALS_READY → PERMANENT_STORAGE_IN_PROGRESS → EVIDENCE_READY → COMPLETE/FAILED`。

Create默认只显示：已添加文件数、已用容量/50 MiB、恢复密码、创建安全恢复版本、永久存储进度、保存恢复材料、完成。钱包、AR余额/报价、TxID、Gateway、SHA、Signature、Broadcast进入折叠技术详情或受控后台。

Recovery客户态：`MATERIALS_READING → ARCHIVE_FETCHING → INTEGRITY_VERIFYING → DECRYPTING → FILES_RESTORING → COMPLETE/FAILED`，对应文案：读取恢复材料、获取加密资料、验证完整性、解密、恢复文件、完成。保留全部保存与单文件fallback。正式恢复进度条列为Productization TODO。

Recovery Map attachment integration只依赖明确接口：`append/remove/list/capacity → createUnifiedVaultArtifacts → save Kit → broadcast Archive → save Evidence → recoverUnifiedFiles → save all`。本轮不接入Recovery Map、不开发正式视觉UI。

## Freeze and verification

- Frozen structure change：**NONE**
- Mainnet新增广播：**0**
- 新增AR费用：**0**
- Recovery Map V2、Crypto、Snapshot、Archive、Recovery Kit、Evidence schema：零修改
- 容量测量工具：`tools/ar-unified-multi-file-mainnet-pilot/capacity-baseline.mjs`
