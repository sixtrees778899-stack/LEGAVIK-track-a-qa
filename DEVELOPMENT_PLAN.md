# CJAS Vault MVP 4—6 周开发计划

## 当前执行状态（2026-08-01）

- Week 1：PASS。
- Week 2：PASS；CEO 已完成 Chrome 完整体验和 Safari 兼容验收。
- Chrome 为推荐浏览器；Safari 兼容通过，但保存路径使用默认下载目录。
- Edge 与 Windows 留待后续实机验证。
- 文档、图片、音频和短视频附件 round-trip 已验证；不因此增加录音或录像功能。
- 当前存储仍为 `LocalMockAdapter`，未使用 Arweave 主网，本阶段费用为 `0 AR`。
- Revision 2 Phase A：Code PASS、Test PASS、Security PASS、CEO Experience PASS，Final Status：PASS。
- Revision 2 Phase B：PASS；Knowledge Schema v2、v1/v2 分派、Draft Normalizer、Unified Rule Engine 与状态模型已完成。
- Revision 2 Phase C：Architecture、Code、Test、Security、Product Framework PASS；CEO Chrome/Safari Experience PENDING；Final Status：`PENDING CEO FINAL ACCEPTANCE`。
- Phase C 已完成 Recovery Dashboard、6 个标准模块、“其他重要信息”可选模块、Recovery Graph、Version Card、模块内上传、附件中心、多模块附件关联、Guidance 与 Mapper。
- 当前测试 177/177 PASS，安全扫描 0 findings；在 CEO 最终验收前不得进入 Phase D 或 Week 4。
- Week 3 未接入钱包、Arweave 主网、账户后台、部署或任何付费服务；未进入 Week 4。

## Milestone 2 / Week 3 验收范围

- 配置驱动的四类 Recovery Plan，默认推荐加密资产恢复计划。
- 单任务 Wizard、独立 Guidance Content、轻量附件指导及确定性 Recovery Review。
- 文档、图片、音频和短视频的上传呈现；不包含浏览器录音或录像。
- 体验版容量限制：单附件 10 MiB、单完整版本 50 MiB、每版本 20 个附件。
- 本地内存 Version History 演示；不构成账户后台或独立恢复依赖。
- Phase A Chrome完整闭环已由CEO通过；Safari、Edge与Windows的Revision 2实机兼容仍按范围后续复验。

## Revision 2 Phase B 与 Phase C 状态

- 建立六个标准模块、可选自定义模块、恢复条件、备用路径、个人留言及附件多模块关联的数据模型。
- v1与v2必须明确分派；旧Snapshot不自动改写，v1独立恢复不得退化。
- Review、状态、生成门控和Snapshot Validator共用同一规则来源。
- Phase C 表现层通过 Mapper 使用 Schema v2，UI 不直接构造 Knowledge Map。
- Recovery Dashboard、模块页面、模块内上传、附件中心、Recovery Graph 与 Version Card 已完成；正式视觉美化、移动端专项、钱包、主网、账户、AI及 Week 4 不在当前范围。
- 当前唯一下一步是 CEO 在 `http://127.0.0.1:8080/` 使用 Chrome 与 Safari 验证 Dashboard、Recovery Graph、Version Card、附件中心及完整恢复闭环。
- 验收前不进入 Phase D、不 push、不 merge `main`、不部署、不连接钱包或主网。

## 1. 计划目标

在 feature 分支交付一个 CEO 可完整体验的 Recovery Map Builder：创建结构化恢复知识地图、生成密码保护 Kit、封装保存、强制独立恢复演练、创建第二完整版本、历史版本恢复以及模拟账户和平台不可用恢复。

本计划不是付费客户生产上线计划。默认周期为 6 周；第 5 周达到核心体验候选，第 6 周用于安全修复、兼容性和缓冲。

## 2. 全程约束

- 不修改或覆盖 v1.0 已封存业务基线。
- 不实现 Guardian、Legacy、多人协作或自动释放。
- 默认使用本地模拟存储，不产生费用。
- 未经单独授权，不访问钱包、不广播主网、不部署生产。
- 每周交付可复核 commit、测试结果和风险清单。
- 任何伪恢复、密钥泄露或平台可独立解密均直接 FAIL。
- 任何功能进入前必须说明提高了哪个 Recovery Confidence 维度。
- 核心加密模块仅使用公开标准算法，独立于 UI 和平台服务，具备审计和未来开源边界。

## 3. 第 1 周：格式、原型骨架和安全测试基础

### 目标

冻结 Recovery Knowledge schema、Kit 格式草案、KDF Compatibility Study 方法和模块边界。

### 任务

- 建立 Vault MVP 独立目录和测试框架。
- 实现 Asset、Location、Contact、Device、Order、Hint、Warning、Attachment 的 Snapshot schema 校验器。
- 实现附件索引、路径安全规则和快照打包原型。
- 建立 AES-GCM、SHA-256、随机源和 base64url 纯函数。
- 正式执行 Argon2id 与 PBKDF2 Compatibility Study，覆盖 Chrome、Safari、Edge、Windows 和 macOS。
- 比较安全性、执行时间、峰值内存、离线依赖打包、恢复兼容和测试向量。
- 定义 `.cjas` 魔数、版本、字段、AAD 和参数上限。
- 建立固定测试向量和 LocalMockAdapter。
- 完成 0 B—50 MiB 初始性能测试，决定整包或分块路径。

### 交付物

- Snapshot schema v1 草案。
- Recovery Kit 二进制格式草案。
- 密码学测试向量。
- KDF Compatibility Study 和明确工程推荐，提交 CEO 最终决策。
- 大小和内存基准报告。
- 可运行但不含完整 UX 的核心测试套件。

### PASS

- 相同测试输入可重复解析并正确恢复。
- 错误 key、nonce、tag、长度和版本全部失败。
- KDF 参数有资源上限。
- 未发现敏感值进入日志、DOM 或浏览器持久存储。

### FAIL

- 格式无法稳定解析或跨浏览器结果不一致。
- 任一候选 KDF 必须远程动态加载，或无法形成可审计离线包。
- 在 Compatibility Study 完成前擅自锁定默认 KDF。
- 目标大小导致不可控崩溃且没有替代路径。

### CEO 节点

第 1 周末演示 Recovery Knowledge Model、Recovery Confidence 和 Kit 用户概念，并提交 KDF 推荐供 CEO 决策。

## 4. 第 2 周：结构化 Vault 创建体验

### 目标

完成 Recovery Map Builder、附件、Recovery Confidence 检查和快照预览。

### 任务

- 欢迎与非托管边界页面。
- Recovery Map 概览、五类 Asset 模板和自定义分类。
- Location、Device、Contact、Order、Hint、Warning 及关系编辑。
- 全局说明、自定义字段和附件。
- 必填检查、敏感内容警告和安全文本渲染。
- 完整 Recovery Knowledge 快照生成及 manifest/附件哈希校验。
- 轻量账户模型：仅运营、版本和演练状态，不含恢复材料。
- 无持久化明文草稿策略和离开提示。

### 交付物

- 可完成结构化 Vault 的前端体验。
- Snapshot Builder。
- schema 和 DOM 安全测试。

### PASS

- 三类 Asset 与 Location、Device、Contact、Order、Hint、Warning、自定义字段和两个 Attachment 形成完整 Recovery Map 快照。
- 中文、特殊字符和恶意文件名安全处理。
- 平台或测试日志中没有 Vault 明文。
- 页面不出现底层存储和密码学术语。
- 账户数据不足以单独恢复任何 Vault。

### FAIL

- 产品退化为单文件上传。
- 明文写入 localStorage、日志或网络请求。
- 不完整条目仍被标记为可完成。

### CEO 节点

第 2 周末体验 Recovery Map 填写、Recovery Confidence 检查和只读快照预览。

## 5. 第 3 周：密码保护 Kit 与本地恢复

### 目标

实现 Recovery Kit、密码生命周期和隔离恢复。

### 任务

- 随机 DEK 加密完整快照。
- KDF 派生 KEK并包装 DEK。
- 生成和解析 `.cjas` Kit。
- 密码设置、确认和不可找回提示。
- Kit 下载、保存指导和下载确认。
- 独立恢复工具最小版本。
- 错误密码、Kit 篡改、密文篡改、版本错误和参数 DoS 测试。

### 交付物

- 密码保护 Kit。
- 本地密文＋Kit 独立恢复。
- 自包含恢复工具初版。
- 负向测试报告。

### PASS

- 新会话只凭 Kit、密码和本地密文恢复完整快照。
- 错误与篡改路径不产生任何恢复文件。
- 密钥、密码和 Kit 内部内容不出现在日志、DOM、URL、Git 或浏览器存储。
- 独立工具不含钱包、上传和遥测代码。

### FAIL

- 平台或员工拥有完整解密条件。
- 明文 JSON 密钥凭证成为正式交付物。
- 恢复依赖原浏览器状态。

### CEO 节点

第 3 周末完成第一次“生成 Kit→关闭会话→本地独立恢复”体验。

## 6. 第 4 周：存储封装、强制演练和版本

### 目标

完成用户不见底层技术的保存、恢复演练和完整版本更新。

### 任务

- Storage Adapter 和故障注入。
- LocalMockAdapter 完整保存/读取。
- Kit 内版本化 locatorSet。
- 创建完成状态机和不可跳过演练。
- 历史版本列表。
- 从 v1 创建 v2 完整新快照、新 DEK、新 Kit。
- 分别恢复两个版本，交叉使用 Kit 必须失败。
- 模拟停止续费和平台 API 不可用。

### 交付物

- 端到端 Vault MVP alpha。
- 两版本演示数据。
- 演练与历史版本测试报告。

### PASS

- 未演练版本不能成为完成状态。
- 两版本均独立恢复，互不依赖。
- 两版本使用不同 DEK、salt、nonce、wrapped DEK 和 Kit，交叉恢复失败。
- 禁用 CJAS API 后独立工具仍恢复。
- 用户全程不接触钱包、交易标识或网关。

### FAIL

- 新版本依赖旧 Kit 或旧密文。
- 停止订阅/模拟平台离线阻止恢复。
- 网络错误被误报为密码错误。

### CEO 节点

第 4 周末完成首次创建、强制演练、更新和历史版本恢复全链路体验。

## 7. 第 5 周：只读永久存储、代付模拟和安全加固

### 目标

验证存储适配边界和进入 CEO 候选版前的安全门槛。

### 任务

- ArweaveReadAdapter，只读读取历史和测试密文。
- SponsoredArweaveAdapter 接口及完全模拟的代付服务。
- 费用上限、大小限制、速率限制、幂等和重复提交测试。
- 多端点延迟、错误响应、数据损坏和重试。
- CSP、固定依赖、依赖清单和构建校验。
- Kit/容器 fuzz、边界、资源耗尽和 DOM 注入测试。
- 恢复工具离线发行包和校验说明。

### 交付物

- CEO 体验候选版 RC1。
- 安全门槛报告。
- 依赖清单和构建记录。
- 独立恢复发行包。

### PASS

- `THREAT_MODEL.md` 中 CEO 体验版门槛全部满足。
- 模拟代付无法接触明文或密钥。
- 所有故障均 fail-closed 或给出明确 PENDING。
- 关键依赖不从 CDN 动态加载。

### FAIL

- 出现伪恢复、秘密泄露或单员工可恢复路径。
- 重复请求可能产生无法控制的重复费用。
- 独立工具仍依赖 CJAS 在线服务。

### CEO 节点

第 5 周末进行完整 RC1 体验和 GO/REVISE 评审。

## 8. 第 6 周：缓冲、兼容性和最终验收

### 目标

修复 RC1 问题，完成跨浏览器、可审计证据和最终 CEO 验收。

### 任务

- 修复 P0/P1 缺陷。
- Chrome、Edge、Safari 桌面兼容测试。
- 新设备和平台不可用演练。
- 性能和内存复测。
- 最终安全回归和业务文件哈希审计。
- 更新架构、测试、安全和决策文档。
- 准备可选的一次性主网测试方案，但不执行。

### 交付物

- CEO Vault MVP 候选版。
- 完整验收报告和已知风险。
- 独立工具、Kit 示例和两个版本测试包。
- 可选主网测试清单、费用上限和回滚/停止条件。

### PASS

- CEO 验收标准全部通过。
- 无未关闭 P0/P1 安全问题。
- 主要浏览器流程一致。
- `main` 基线未被覆盖，所有 feature 变更可审计。

### FAIL

- 任一安全不可接受风险存在。
- 强制演练、平台外恢复或完整版本恢复不稳定。
- 需要主网交易才能证明本地核心正确性。

### CEO 节点

第 6 周进行最终 PASS/PARTIAL/FAIL 评审，并决定是否进入受控主网验收或继续修订。

## 9. 主网测试策略

CEO 体验 MVP 不依赖新的主网写入。只有以下条件全部满足，才提出一次单独授权请求：

- 本地和模拟存储测试全部 PASS。
- CEO 完整体验 PASS。
- 安全门槛全部满足。
- 使用非敏感测试数据和无真实资产的专用钱包。
- 明确单笔、单次费用上限和禁止重试策略。
- CEO 明确批准时间、数据、钱包和预计费用。

未获授权时只允许既有公开交易的只读查询。

## 10. 风险与缓冲

| 风险 | 应对 |
|---|---|
| KDF 跨平台兼容 | 第 1 周完成 Argon2id/PBKDF2 Study 并由 CEO 决策；不得静默回退 |
| 大附件内存压力 | 第 1 周基准；必要时切换分块方案 |
| 两阶段 Kit 保存 UX 复杂 | 第 2—3 周原型测试，不以降低安全门槛换简化 |
| Safari 文件与 WASM 差异 | 第 3 周开始兼容测试，不留到最后 |
| 永久存储传播延迟 | Mock 故障注入、多端点和 PENDING 状态 |
| 4 周内无法完成全部 | 优先结构化 Vault、Kit、强制演练和平台外恢复；主网写入、正式代付和视觉精修后移 |

第 6 周作为安全修复和兼容缓冲，不用于新增 Guardian、Legacy 或范围外功能。

## 11. 总体验收闸门

开始开发：更新后的 P1 文档、Memo 001 与 Recovery Knowledge Model 获批。
进入 CEO RC：第 1—5 周 PASS 且无不可接受风险。
进入主网验收：CEO 另行书面授权。
合并 `main`：CEO 体验 PASS、测试证据完整、变更审查通过，并保留 v1.0 标签和历史恢复能力。
