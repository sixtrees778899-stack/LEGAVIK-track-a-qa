# CJAS Recovery Map V2 — Multi-Account Integrity & Recovery Report Correction

## Root Cause

“添加账户”调用 `ProductActions.addAccount`；“保存并继续”原先只更新 `Canonical Store.accounts` 中已经存在的账户。新增表单的四个值只在 DOM 中，未点击“添加账户”时没有 Product Action、没有 revision 变化，也没有账户写入。模块2、3、4、Review 与 Report 均正确读取同一个 Store，但 Store 中从未存在第二账户。旧 E2E 总是先点击“添加账户”，因此没有覆盖这一操作路径。

## 修复后的提交顺序

1. 检查新增表单是否存在任何输入；
2. 校验平台、注册国家或地区、账户类型；
3. 调用 `ProductActions.addAccount`；
4. 确认新增账户存在且 revision 恰好增加 1；
5. 保存页面上已存在账户的修改；
6. 重新计算统一 Validator；
7. 进入模块2。

不完整表单会留在模块1，并逐项指出缺失字段。

## Story 7–9 Evidence

- Story 7：OKX 添加后 revision 为 1；填写 Binance 但不点击“添加账户”，直接“保存并继续”后 revision 为 3，模块2同时显示两个账户。
- Story 8：生成前 Report 显示 2 个账户、2 个平台、8 个恢复条件、2 个附件；附件分别投影到对应账户的“位置与查找说明”。
- Story 9：新独立恢复会话使用 Kit 与 Archive 成功恢复；账户数 2、附件数 2，平台、地区、账户类型、附件章节及覆盖条件保持一致；附件仍通过既有字节完整性下载链路。
- 浏览器入口与 CEO 入口一致：`http://127.0.0.1:8080/web/v2/index.html`。
- 浏览器 console：0 error / 0 warning。

证据文件：

- `docs/evidence/v2-story7-9-browser-evidence.json`
- `docs/evidence/v2-story8-pre-generation-report.png`
- `docs/evidence/v2-story9-recovered-report.png`

## Compatibility Boundary

未修改 Crypto Engine、AES-256-GCM、Snapshot 容器、Recovery Kit 或 Archive 格式。地区和账户类型使用 Knowledge Schema v2 已存在的 `custom_fields` 表达，不新增或修改 Schema 字段；v1 与历史 v2 恢复分派保持不变。

## Verification

- `npm test`：248/248 PASS
- `npm run check:security`：PASS，0 findings
- `git diff --check`：PASS
