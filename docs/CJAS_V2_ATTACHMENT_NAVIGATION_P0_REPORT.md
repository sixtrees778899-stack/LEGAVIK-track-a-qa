# CJAS Recovery Map V2 — Attachment Navigation & Draft Consistency P0 Report

## Root Cause

附件上传本身没有创建新 Application Shell 或 Canonical Store。`addAttachment()` 克隆最新 Store、写入附件并将 `draft_revision` 增加 1；模块3随后可能用 `ProductActions.upsertCoverage()` 关联附件，再增加 revision。

真正缺陷是附件中心被错误复用了正式模块导航：

1. 模块底部“附件中心”原来直接执行 `navTo('attachments')`，离开前没有调用 `saveVisibleModule()`；未提交的文本仍只存在 DOM。
2. 附件中心复用 `back()` 和 `bindBack()`。
3. `attachments` 不在 `flow` 中，`flow.indexOf('attachments')` 为 `-1`。
4. 点击“保存并继续”后使用 `flow[-1 + 1]`，必然导航到 `flow[0]`，即模块1。
5. 模块3的未保存文本在渲染附件中心时丢失。模块4中曾点过旧“保存该账户”的账户已进入 Store，未点的账户仍只在 DOM，因此表现为一个保留、另一个为空。

旧 E2E验证了附件对象和 Store，但没有从真实模块进入附件中心、上传后再点击页面底部按钮，因此没有触发 `indexOf('attachments') === -1`。

## Corrected Transaction

`openAttachmentCenter()` 现在执行：同步当前表单 → 获取最新 Store/revision → 保存模块 → 记录附件上下文 → 打开附件中心。

附件增删改仅修改 Canonical Store，不修改 `active_module_id`。附件中心使用独立 `attachment_context.return_module`，上传后返回原模块；原模块底部再通过 `nextProductView()` 固定进入下一模块。未知 View 会 fail-closed，不能再默认落入模块1。

过期 revision 继续由 Product Action 抛出 `STALE_DRAFT_REVISION`，UI显示“资料已更新，请检查当前页面后再次保存；系统没有丢弃任何内容”，并停留当前页。

## P1 Corrections

- 模块3提供“全选本账户恢复条件”和“全部取消”。
- 模块4移除逐账户保存按钮，由页面底部统一保存两个账户。
- 模块2–6提供附件安全提示和带账户、模块、用途上下文的快捷入口。
- 附件中心显示允许格式、10 MiB单文件、50 MiB总量及20个附件限制。

## Evidence

- `docs/evidence/v2-story10-13-browser-evidence.json`
- `docs/evidence/v2-story10-13-unedited.mov`
- `docs/evidence/v2-story10-13-review.png`
- `docs/evidence/v2-story10-return-module3.png`
- `docs/evidence/v2-story11-return-module4.png`
- `docs/evidence/v2-story12-return-module5.png`
- `docs/evidence/v2-story12-return-module6.png`

真实浏览器结果：Story 10–13 PASS；最终 Review revision 38；2个账户、2条汇总位置、5个附件全部保留；console 0 errors / 0 warnings。

## Verification

- `npm test`：253/253 PASS
- `npm run check:security`：PASS，0 findings
- `git diff --check`：PASS
- 未修改 Crypto、Snapshot、Recovery Kit 或 Archive 格式
