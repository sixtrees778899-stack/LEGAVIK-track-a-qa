# Changelog

## Unreleased — Milestone 2 / Week 3

### Revision 2 Phase C — PENDING CEO FINAL ACCEPTANCE

- Architecture、Code、Test、Security 与 Product Framework PASS；CEO Chrome/Safari Experience PENDING，尚不得宣布 Phase C PASS。
- 建立 Mapper 隔离的 Recovery Dashboard、6 个标准模块与“其他重要信息”可选模块。
- 增加 Recovery Graph 线框、Version Card、模块内上传、附件中心及附件多模块关联。
- Guidance 使用独立配置；Review、Dashboard 状态、生成门控和 Snapshot Validator 继续共用 Unified Rule Engine。
- v1/v2 明确分派与独立恢复兼容保持；Schema v2、Crypto Engine、Recovery Kit 和 Snapshot 格式未修改。
- 自动测试 177/177 PASS；安全扫描 0 findings。

### Revision 2 Phase B — PASS

- 完成冻结的 Knowledge Schema v2、v1/v2 分派、Draft Normalizer、Unified Rule Engine 与五态模块状态模型。
- 支持六个标准模块、可选自定义模块、恢复条件与备用路径、个人留言和附件多模块关联。

### Revision 2 Phase A — PASS

- Phase A Code、Test、Security 与 CEO Chrome Experience 全部 PASS。
- 修复Draft类型污染、Review规则降级、过期Review复用及Review通过后生成失败。
- 增加配置化恢复密码策略、明确确认声明与分阶段中文错误提示。
- CEO已验证Recovery Kit和加密档案成功生成、保存及独立恢复。

### Added

- 配置驱动的四类 Recovery Plan 与默认加密资产模板。
- 单任务 Recovery Wizard、版本化 Guidance Content 和轻量附件指导模板。
- 文档、图片、音频及短视频的用途、类型和容量展示。
- 配置化的 10 MiB 单附件、50 MiB 单版本和 20 个附件体验限制。
- 可定位返回修改的确定性 Recovery Review，以及内存内 Version 1/2 历史演示。

### Security and boundaries

- 高风险动作不接受 Enter 键触发；草稿与版本演示不写入浏览器持久存储。
- Snapshot、Crypto、Recovery Kit 和 Recovery 格式保持不变。
- 未引入外部依赖、钱包、主网、账户后台、遥测、部署或费用。

## v0.1-week2-pass — 2026-08-01

### Status

- Week 1：PASS。
- Week 2：PASS，经 CEO Chrome 与 Safari 真实体验验收。

### Added

- 配置驱动的 Recovery Wizard 与 Recovery Map 创建流程。
- 密码保护的 Recovery Kit 和本地加密档案。
- 不依赖账户或平台服务的独立恢复入口。
- 强制恢复演练状态机和多版本独立恢复测试。
- 文档、图片、音频和短视频等格式无关附件 round-trip 能力验证。

### Fixed

- 附件下载前统一校验引用、长度、SHA-256 和 MIME，异常 fail-closed。
- 使用真实恢复字节创建 Blob，并保留净化后的原始文件名。
- Chrome/Edge 优先使用系统保存窗口；Safari 自动回退浏览器下载。
- 用户取消保存不再被误标记为完成。

### Compatibility

- Chrome：推荐浏览器，完整体验 PASS。
- Safari：兼容 PASS；保存路径使用浏览器默认下载目录。
- Edge、Windows：后续实机验证。

### Boundaries

- 存储仍为 `LocalMockAdapter`。
- 未使用 Arweave 主网、钱包、部署或付费服务。
- 本阶段费用：`0 AR`。
- 未进入 Week 3。
