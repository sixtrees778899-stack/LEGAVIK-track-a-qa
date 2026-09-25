# Knowledge 共享存储规则

## 唯一共享根目录

所有 Knowledge 内容统一保存在：

`/Users/hanhuitao/Documents/CJAS-mainnet/knowledge/`

Knowledge 正文不得只保存在对话中。

## 内容流程

`RESEARCH / DRAFT → GPT / CEO 审核 → APPROVED → 最终批准正文立即落盘 → Codex 发布`

## 目录职责

- `knowledge/drafts/<domain>/`：Codex 01 研究和工作 Draft。
- `knowledge/approved/<domain>/`：已审核、可供发布的唯一 Source of Truth。

Codex 01 负责研究、写作，以及审核通过后维护落盘文件。Codex 只能读取 `knowledge/approved/` 中的最终版本，用于发布、搜索索引和前台展示；不得依据聊天记录重新生成 Knowledge 正文。

## Approved domain 要求

每个 `knowledge/approved/<domain>/` 必须包含 `manifest.json`。每篇已落盘文章至少登记：

- `article_id`
- `title`
- `category`
- `status`
- `source_file`
- `last_verified`
- `approved_at`
- `published`

只有正文文件已经存在、内容可逐字确认且已完成审核时，才可写入 manifest。缺失正文不得根据标题、摘要、修订意见或模型记忆重建，也不得登记为可发布文章。

