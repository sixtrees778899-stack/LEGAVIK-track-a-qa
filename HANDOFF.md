# CJAS 正式接管说明

## Vault MVP 当前验收状态

- Week 1：PASS。
- Week 2：PASS；CEO 已于 2026-08-01 完成真实浏览器验收。
- PR #1：MERGED；采用 merge commit，未 squash、rebase 或改写历史。
- `main` 已包含 CJAS Vault v0.1 Week 1/2 验收基线。
- GitHub 私有仓库首次同步与正式合并已完成。
- Revision 2 Phase A 已完成并通过正式验收：Code PASS、Test PASS、Security PASS、CEO Experience PASS，Final Status：PASS。
- CEO 已在 Chrome 完成恢复密码、确认声明、Kit/Archive 生成保存及独立恢复完整闭环，且界面无英文内部错误。
- Revision 2 Phase B：PASS；已完成 Knowledge Schema v2、v1/v2 分派、Draft Normalizer、Unified Rule Engine 与状态模型。
- Revision 2 Phase C 当前状态：Architecture PASS、Code PASS、Test PASS、Security PASS、Product Framework PASS、CEO Chrome Experience PENDING、CEO Safari Experience PENDING；Final Status：`PENDING CEO FINAL ACCEPTANCE`。
- Phase C 已完成 Recovery Dashboard、6 个标准模块、“其他重要信息”可选模块、Recovery Graph、Version Card、模块内上传、附件中心、多模块附件关联、Guidance 配置和 Mapper；沿用 Schema v2、Unified Rule Engine、v1/v2 兼容、密码策略与最终生成链路。
- 当前自动测试：177/177 PASS；安全扫描：0 findings。
- 推荐浏览器：Chrome；完整创建、保存、独立恢复和附件 round-trip 体验通过。
- 兼容浏览器：Safari；加密、下载、恢复和附件一致性通过，保存位置受浏览器能力限制，使用默认下载目录。
- Edge 与 Windows：保留后续实机验证，不描述为已验证。
- 已验证附件包括文档、图片、音频和短视频。该能力仅作为当前格式无关附件模型的验证结果，不扩展为录音或录像功能。
- 当前 Vault MVP 存储仍为 `LocalMockAdapter`，没有使用 Arweave 主网；本阶段费用为 `0 AR`。
- 当前验收固化 tag 为 `v0.1-week2-pass`，发布分支为 `release/v0.1-week2-pass`；两者继续指向验收 commit。

## 正式基线

- 主目录：`/Users/hanhuitao/Documents/CJAS-mainnet`
- Build ID：`CJAS-mainnet-1.0-20260729`
- 当前 Phase C 本地体验入口：`http://127.0.0.1:8080/`（如进程已随会话退出，在项目根目录运行 `npm start` 恢复）。
- 基线状态：PASS
- 主网交易 ID：`e5u4ROo6nWgEirK4_xWS6a3MS7mXNC-c-1SK0FZWiOE`

## 当前资产

- `index.html`：单页主网最小闭环原型。
- `test.pdf`：663 B 原始测试文件。
- `test_recovered.pdf`：663 B 恢复文件，与原始文件 SHA-256 相同。
- `ACCEPTANCE_REPORT_2026-07-29.md`：原始最终验收报告。
- `CJAS-Mainnet-Baseline-v1.0-PASS.md`：封存基线报告。
- `MANIFEST.md`：原始归档清单。

## 已有能力

现有代码能够在浏览器中读取测试 PDF，计算 SHA-256，使用随机 AES-GCM 密钥加密，通过 Wander 提供的 `window.arweaveWallet` 请求地址与签名权限，创建并广播 Arweave 交易，从多个网关下载密文，核对密文哈希，解密并导出恢复 PDF。

## 已验证主网闭环

原始报告记录：交易广播返回 HTTP 202，随后在区块 1968820 确认；上传前密文与网关下载密文 SHA-256 一致；恢复文件与原始文件 SHA-256 均为 `e8a8d6b25b35fea15befd1556c7988465ea1b1781949ea8ae6142d1d22effdde`。首次网关读取受索引延迟影响，稍后重试成功。

## 只读参考

- `CJAS-mainnet-v1.1`：恢复凭证、本地密文导出、新会话独立恢复和负向测试资料。
- `AR 测试cjas-v2`：模块化加密、Arweave 访问、UI、恢复卡、多网关、ArLocal/E2E 测试资料。

## 接管边界

Phase A—C 未改变 Crypto Engine、Recovery Kit、Snapshot 格式或 v1 稳定基线。当前分支为 `feature/week3-recovery-experience`，Phase C 业务代码 commit 为 `1a15fe3237fe83c4797f270fd8d9d7eaa069f61b`。

当前唯一下一步：CEO 使用 Chrome 和 Safari 完成 Phase C Dashboard、Recovery Graph、Version Card、附件中心及完整恢复闭环体验。

在 CEO 最终验收前：不进入 Phase D、不进入 Week 4、不 push、不 merge `main`、不部署、不连接钱包或主网。

## Recovery Knowledge Research — Pilot 5

- 已按正式研究令完成 Pilot 5：Binance、Coinbase、MetaMask、Ledger、Trezor。
- 研究目录：`knowledge/recovery-research/v1/`；包含统一 taxonomy、source policy、21 条官方来源记录、Recovery Requirement Matrix、五个平台文档、开放问题、进度和 Pilot 5 报告。
- 证据等级：A 8、A/B 6、B 4、B/C 2、C 1；D 级仅保留为未决问题，不进入产品模板。
- 扩大到 Batch 1 其余平台的准备状态：`CONDITIONAL YES`，等待 CEO 与 Product Architect 评审批准。
- 本研究未修改 UI、Schema v2、Crypto Engine、Recovery Kit、Snapshot 或任何业务代码；未进入 Phase D/Week 4。
