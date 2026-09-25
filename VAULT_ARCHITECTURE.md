# CJAS Vault MVP 技术架构

状态：P1 推荐架构；现有 v1.0/v1.1 原型不等于本文能力已实现。

## 1. 架构目标

- 支持结构化藏宝图、自定义字段和附件的完整快照。
- 以 Recovery Map 和 Recovery Confidence 为产品与数据模型中心，Asset 只是实体之一。
- 明文、恢复密码和完整解密条件只在用户设备处理。
- 每次更新是完整、独立、可恢复的新版本。
- 用户只接触 Vault、Recovery Kit 和恢复密码。
- 平台封装存储和代付，但不能解密。
- 独立恢复不依赖 CJAS 平台、账户或订阅。
- 保留 v1.0 主网闭环作为内部技术基线，采用最小风险迁移。
- 核心加密模块与 UI、账户、代付和存储解耦，可独立审计并保留未来开源能力。

## 2. 逻辑模块

### 2.1 Vault Composer

负责 Recovery Map Builder、附件、完整性检查、Recovery Confidence 和只读预览。模型以 `RECOVERY_KNOWLEDGE_MODEL.md` 的 Asset、Location、Contact、Device、Order、Hint、Warning 和 Attachment 为准。数据只存在于页面内存；MVP 不把明文草稿写入浏览器持久存储。

### 2.2 Snapshot Builder

把当前 Vault 编译为规范化完整快照：

- `manifest`：格式版本、snapshot ID、创建时间、Vault 数据、附件索引。
- `attachments`：按随机内部 ID 保存原始字节。
- `integrity`：每个附件 SHA-256、数量和总大小。

建议容器为确定性 ZIP：根目录包含规范化 UTF-8 `manifest.json` 和 `attachments/<id>`。ZIP 只用于组织，安全性来自外层 AES-GCM。实现必须固定文件顺序、时间戳策略、路径规则和 JSON 规范化，确保测试可重复。

如果浏览器 ZIP 实现不能满足流式处理和可审计要求，可使用自定义长度前缀二进制容器；选择必须在第一周通过测试向量冻结。

### 2.3 Crypto Engine

- 仅使用公开标准密码学算法，不自行设计密码算法。
- 使用安全随机源生成 32 B DEK、12 B nonce 和 KDF salt。
- AES-256-GCM 加密完整快照。
- SHA-256 计算密文及条目完整性。
- 通过版本化 KDF 接口派生 KEK，并用 AES-256-GCM 包装 DEK；Argon2id/PBKDF2 默认选择等待 Compatibility Study 和 CEO 决策。
- 所有格式解析严格限制长度和资源。
- 不输出密码或密钥到 UI、日志、URL、存储或遥测。
- 模块必须可以脱离主应用进行测试、审计和未来开源。

### 2.4 Recovery Kit Builder

按 `RECOVERY_SPEC.md` 生成 `.cjas`，包含密码保护的 DEK、密文哈希、版本和不透明存储定位符，不包含 Vault 明文。

Kit 只有用户主动下载；平台不接收 Kit。

### 2.5 Storage Adapter

统一接口：

```text
putCiphertext(bytes, metadata) -> locatorSet
getCiphertext(locatorSet, options) -> bytes
probe(locatorSet) -> availability
```

MVP 实现：

- `LocalMockAdapter`：开发和 CEO 体验默认，无费用、可注入延迟/损坏/失败。
- `ArweaveReadAdapter`：只读兼容既有密文和多端点读取。
- `SponsoredArweaveAdapter`：平台代付写入，仅在独立授权后启用。

业务 UI 不得直接引用 Adapter 的交易或网关术语。

### 2.6 Sponsored Storage Service

接收加密字节和最少元数据，执行：

- 请求认证、大小限制和速率限制。
- 费用估算与硬上限。
- 内容哈希幂等，防止重复付费提交。
- 提交状态和不透明 locator 返回。
- 不记录用户明文、密码、Kit 或 DEK。

CEO 体验版可先使用模拟服务。真实代付不是本地 MVP 流程的前置条件。

### 2.7 Version Index

产品界面的版本索引可保存：

- 用户账户标识。
- 随机 snapshot ID。
- 用户可见版本名称和状态。
- 创建时间、演练通过时间。
- 密文存储状态和不透明 locator 引用。

不得保存 Vault 内容摘要、密码、DEK 或 Kit。平台版本索引丢失不应阻止 Kit 独立恢复。

### 2.8 Lightweight Account Service

负责登录、订单、支付、Vault 名称、创建/更新时间、Version 状态、演练状态、提醒、客服和必要公开定位信息。

账户服务不能接收 Vault 明文、Recovery Password、完整 Data Key、完整 Recovery Kit 或任何可单独恢复 Vault 的组合。Recovery Engine 不调用账户服务；账户、公司或网站消失不影响 Kit＋Password 恢复。

### 2.9 Recovery Engine

- 读取并严格验证 Kit。
- 获取密码并派生 KEK。
- 解包 DEK。
- 从 Storage Adapter 下载或导入本地密文。
- 先校验密文 SHA-256，再执行 AES-GCM 解密。
- 解析快照并验证全部附件。
- 全部通过后才展示和导出。

### 2.10 Independent Recovery Tool

与主应用共享经过测试的只读格式和密码模块，但构建为自包含静态发行包：

- 无登录和订阅依赖。
- 无钱包、上传、代付和遥测代码。
- 不从 CDN 获取关键依赖。
- 支持多读取端点和本地密文导入。
- 提供版本、SHA-256、依赖清单和构建记录。

## 3. Vault 快照 schema 建议

```json
{
  "format": "cjas-vault-snapshot",
  "format_version": 1,
  "snapshot_id": "random-id",
  "created_at": "ISO-8601",
    "recovery_map": {
    "title": "...",
    "version_note": "...",
    "reviewed_at": "...",
    "next_review_at": "...",
    "global_instructions": {},
    "assets": [],
    "locations": [],
    "contacts": [],
    "devices": [],
    "orders": [],
    "hints": [],
    "warnings": [],
    "custom_fields": []
  },
  "attachments": [
    {
      "id": "random-id",
      "display_name": "...",
      "media_type": "...",
      "size": 0,
      "sha256": "...",
      "owner_ref": "asset-or-vault-id"
    }
  ]
}
```

要求：

- schema 版本显式存在。
- ID 随机且不包含用户或资产信息。
- 字符串统一 UTF-8，定义 Unicode 正规化策略。
- 数值、日期、字段长度和数组数量有上限。
- 不允许可执行 HTML；展示层一律按文本处理。
- 附件路径由内部 ID 决定，不使用用户文件名。

## 4. 数据可见性

| 数据 | 用户设备 | CJAS 前端运行时 | 代付服务 | 存储层 | Kit | 独立工具 |
|---|---|---|---|---|---|---|
| Vault 明文/附件 | 是 | 仅本机内存 | 否 | 否 | 否 | 恢复时本机 |
| 恢复密码 | 是 | 仅本机内存 | 否 | 否 | 否 | 仅本机内存 |
| DEK/KEK | 是 | 仅本机内存 | 否 | 否 | 仅 wrapped DEK | 恢复时本机 |
| Vault 密文 | 是 | 是 | 是 | 是 | 否 | 是 |
| 密文哈希 | 是 | 是 | 是 | 可选 | 是 | 是 |
| 存储 locator | 内部显示隐藏 | 是 | 是 | 公开可见 | 是 | 是 |
| 用户身份/订阅 | 可见 | 是 | 最少必要 | 否 | 否 | 否 |

轻量账户只保存运营与状态数据。表中任何“可见”均不授权账户系统组合出完整恢复能力。

## 5. 创建数据流

1. Composer 在本机内存收集结构化内容和附件。
2. Snapshot Builder 生成完整快照。
3. Crypto Engine 生成 DEK 并加密快照。
4. Storage Adapter 保存密文并返回 locatorSet。
5. 用户设置恢复密码；KDF 派生 KEK并包装 DEK。
6. Kit Builder 把 locatorSet、密文哈希和 wrapped DEK 写入 `.cjas`。
7. 用户保存 Kit。
8. 清除创建会话状态。
9. Recovery Engine 在隔离会话完成演练。
10. Version Index 只记录演练通过状态和非敏感版本元数据。

每个新版本必须重新生成 snapshot ID、DEK、Vault nonce、KDF salt、wrapped DEK、密文和 Kit。版本之间不得共享恢复能力。

为减少“密文已永久保存但 Kit 未保存”的孤儿版本，CEO 体验版应先生成并下载一个不含最终 locator 的受保护 Kit 草稿，再完成保存，随后生成最终 Kit；产品只有最终 Kit 演练通过才标记完成。实现阶段需通过 UX 测试选择最少困惑的两阶段方案。

## 6. 恢复数据流

1. Kit 容器和资源参数预校验。
2. 密码派生 KEK并认证解包 DEK。
3. 读取 locatorSet，自动通过存储适配层下载密文。
4. 密文哈希匹配后才能解密。
5. AES-GCM 认证通过后解析完整快照。
6. 核对 manifest、附件数量、大小和哈希。
7. 全部通过才显示 PASS 和导出能力。

## 7. 平台不可用设计

- Kit 不引用必须登录的 CJAS API。
- locatorSet 使用公开且可由适配器解释的版本化描述。
- 独立工具内置只读适配器和多个读取端点。
- 支持用户导入本地 Vault 密文副本。
- 版本状态、账户或订阅服务不可成为恢复前置条件。
- 忘记账户、网站关闭或公司停止运营时，Kit＋Password 仍是完整恢复入口。

## 8. 测试与可审计设计

- 格式模块采用纯函数和固定测试向量。
- KDF Compatibility Study 覆盖 Chrome、Safari、Edge、Windows 和 macOS，比较 Argon2id 与 PBKDF2 后提交 CEO 决策。
- 创建、上传、读取、恢复模块通过接口隔离，可用 mock 注入故障。
- 每个阶段产生不含秘密的结构化事件代码，用于本地测试报告。
- 测试记录包括代码 commit、工具版本、输入测试夹具哈希、步骤和结果。
- 敏感值在日志层统一拒绝或脱敏，测试扫描日志、DOM、URL 和浏览器存储。
- 密码学格式变更必须新增版本，不能静默改变既有字节语义。
- 主网适配器默认禁写；测试必须显式注入授权配置才能调用写入。

## 9. 大小和性能

现有 663 B 原型不能证明实际 Vault 容量。第一周应测试 0 B、1 B、1 MiB、10 MiB、50 MiB 和目标上限，记录峰值内存、加密时间、Kit 时间和恢复时间。

推荐 CEO 体验版优先采用整包内存处理以降低复杂度，但只有在目标设备 50 MiB 测试满足门槛时才采用；否则在第二周切换为分块容器和分块加密设计。不得在无数据时虚构正式大小承诺。

## 10. 从 v1.0/v1.1 迁移的最小风险路径

1. 保留 `index.html` 和 v1.0 标签不变，作为内部主网闭环证据。
2. 从 v1.0/v1.1 提取格式测试向量，不直接复制不安全 UI 代码。
3. 新建独立 Vault MVP 模块和页面，不在第一阶段重构 v1.0 上传状态机。
4. 复用 AES-GCM、随机源、SHA-256和多网关经验；重写凭证、DOM、校验边界和失败门控。
5. v1.1 明文 JSON 凭证只用于回归测试，不成为正式 Kit。
6. 增加 v1.0 密文只读解析适配器；因历史 DEK 未保存，只验证读取和格式，不宣称独立恢复。
7. LocalMockAdapter 全部 PASS 后再接入只读永久存储。
8. 真实代付写入必须单独授权、单次费用封顶并使用非敏感测试数据。

## 11. 推荐目录形态

```text
vault/
  app/
  core/
    snapshot/
    crypto/
    recovery-kit/
    recovery/
  storage/
    local-mock/
    arweave-read/
    sponsored-arweave/
  recovery-tool/
  account/
  tests/
    fixtures/
    vectors/
    unit/
    integration/
    browser/
```

具体构建工具在实施前根据现有环境选择；不得为了框架迁移改写或覆盖 v1.0 基线。
