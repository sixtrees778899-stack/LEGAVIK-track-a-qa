# CJAS GitHub Governance

状态：Week 2 PASS 后生效。GitHub 仓库必须保持 Private，正式开源决定前不得公开。

## 1. 分支与开发

1. 所有开发在 `feature/*` 或 `hotfix/*` 分支进行。
2. `main` 不直接开发，不接受未经审核的直接提交。
3. 禁止 rebase、reset、squash 或其他方式改写已验收历史，除非 CEO 明确书面授权。

## 2. 提交前门槛

每次提交前必须运行：

- `npm test`；
- `npm run check:security`；
- 基线哈希和敏感信息检查。

每个 Week 必须依次获得：

- Code PASS；
- Test PASS；
- Security PASS；
- CEO Experience PASS；
- Product Architecture PASS。

## 3. Week PASS 固化流程

1. 更新 `CHANGELOG.md` 和对应 Release Notes。
2. 创建 `release/*` 分支。
3. 创建 annotated tag。
4. 经 CEO 授权后同步 GitHub。
5. 通过 Pull Request 合并 `main`，不得自动 merge。

## 4. 禁止提交内容

- 密码、私钥、助记词和完整密钥；
- Recovery Kit、用户明文或客户 Vault；
- 钱包文件、钱包导出或真实资产凭证；
- `.env` 及生产配置；
- 下载的真实测试材料、CEO 测试文件或客户附件；
- 构建缓存、系统临时文件和本机敏感日志。

GitHub 仅保存代码、配置和文档，不保存任何客户 Vault 或恢复材料。

## 5. GitHub Actions 计划

后续建立只读验证工作流：

- `npm test`；
- security scan；
- v1.0 基线哈希检查；
- 敏感信息和禁止文件检查。

CI 不得接收真实恢复材料、钱包凭证或生产秘密。

## 6. 仓库与权限

- 仓库必须为 Private。
- 创建仓库、添加 remote、push、创建 Pull Request 或修改 GitHub 设置均需 CEO 明确授权。
- 首次同步顺序：`main` → `feature/independent-recovery-v1.1` → `release/v0.1-week2-pass` → `v0.1-week2-pass` tag。
- push 后必须核对本地与远程 branch、commit 和 tag 一致。
- Pull Request 方向为 `feature/independent-recovery-v1.1` → `main`，等待 CEO 和 Product Architect 审核，不自动合并。

## 7. 可追溯性

每个正式验收版本必须保持本地 Git、GitHub 和 annotated tag 三重可追溯；发布记录应包含测试结果、安全结果、基线哈希、CEO 验收状态和已知兼容性限制。
