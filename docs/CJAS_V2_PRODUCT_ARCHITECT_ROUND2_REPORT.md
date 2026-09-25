# CJAS Recovery Map V2 — Product Architect Review Round 2 修正报告

日期：2026-08-05

分支：`feature/week3-recovery-experience`

基线 HEAD：`37de7b95a61ff9d515b2fd74af121e45f7330468`

状态：Product Architect APPROVED；CEO Chrome、Safari 本地真实体验 PASS；纳入 Final Local Freeze。

## 1. 本轮修正

- 模块 5、6 删除局部保存按钮；底部统一保存会同步协助人或留言。由 Review 进入时显示“保存并返回 Review”。
- Review 保存精确导航锚点、问题分组和滚动位置；修复后直接返回 Review，并使用最新 Draft revision 重新运行 Canonical Validator。
- 个人账户和机构账户现由 Module、Validator、Report 和 Generation 统一支持；未知账户类型仍 fail-closed。
- Dashboard、Report 全部附件和单附件均可进入统一附件中心；单附件入口会聚焦对应附件。
- Report 删除重复的“全部附件目录”，改为附件数、账户数、章节数统计。
- 上传格式、MIME、单文件 10 MiB、版本总容量 50 MiB、20 个附件限制统一读取 `config/attachments/v1.json`。文件选择器 `accept`、UI说明、Product Attachment Manager 和容量统计共用该配置。
- 附件中心按校验后的 MIME 分类文档、图片、音频、视频和其它；容量仅显示 KB/MB。
- 不支持格式、超容量和 0 Byte 文件在写入 Canonical Store 前拒绝；UI仅显示中文业务提示。

## 2. 验收结果

- 机构账户：个人与机构账户均通过 Validator；Report 显示“个人账户/机构账户”；Generation 不因机构账户阻断。
- Review闭环：从业务问题精确进入账户字段，底部显示“保存并返回 Review”，修复后直接回到 Review，账户问题消失，无需重走模块 1–6。
- 模块统一保存：模块 5 协助人、模块 6 留言均通过底部按钮保存，并在 Report 中显示。
- 合法附件：真实浏览器上传 PDF、PNG、MP3、MP4，MIME 分别为 `application/pdf`、`image/png`、`audio/mpeg`、`video/mp4`，统计各为 1。
- 非法附件：自动测试覆盖不支持格式、超过 10 MiB 和 0 Byte，均在 Store mutation 前拒绝。此三项未冒充真实浏览器人工实测。
- Report：附件按账户章节展示，具备查看/下载、管理此附件和管理全部附件；底部无重复文件目录。
- 浏览器 Console：本轮真实交互结束时 0 errors / 0 warnings。

## 3. 自动验证

- `npm test`：267 / 267 PASS。
- `npm run check:security`：PASS，64 files scanned，0 findings。
- `git diff --check`：PASS。

## 4. 浏览器证据

- `docs/evidence/v2-round2-attachment-overview.png`：四类附件及容量统计。
- `docs/evidence/v2-round2-report-management.png`：机构账户、协助人、留言、账户附件和管理入口。

## 5. 边界

未修改 Crypto Engine、Snapshot、Recovery Kit 或 Archive 格式；未访问 Arweave 主网；未 push、merge 或 deploy。当前改动与上一轮尚未提交的 V2 产品简化改动共同保留在工作树，等待审核。

## 6. 当前风险与延后项

- Safari 上传页面字体略小，属于 P3 UI 微调，不阻塞 Freeze，并延后至正式 UI 优化阶段。
- 本轮附件测试素材为最小本地分类样本，只验证浏览器选择、MIME归类、Store写入和投影，不代表媒体内容播放质量认证。
- 本报告及连续两轮已批准改动由 Final Local Freeze commit 统一固化。

## 7. 验证入口

`http://127.0.0.1:8080/web/v2/index.html`
