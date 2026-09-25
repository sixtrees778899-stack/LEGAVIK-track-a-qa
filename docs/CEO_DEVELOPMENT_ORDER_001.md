CJAS Vault Phase 1 — Week 1 正式开发指令

项目正式进入 Implementation Phase。

当前唯一正式开发分支：
feature/independent-recovery-v1.1

受保护基线：
main = de12de6d2982396f47348d81f7c20d8a708140c7

当前 P1 产品与设计基线提交：
2c90cc909ac73f0c2d2c194f00ba2e272d37b915

本轮目标：
建立 Vault MVP 的可运行工程基础、稳定核心模型和自动化测试框架，为下一阶段可体验原型开发做准备。

一、必须先读取并遵循

完整读取以下文件：

- CJAS_Product_Blueprint_v1.0.md
- CEO_DECISION_MEMO_001.md
- VAULT_PRD.md
- RECOVERY_SPEC.md
- RECOVERY_KNOWLEDGE_MODEL.md
- THREAT_MODEL.md
- UX_FLOW.md
- VAULT_ARCHITECTURE.md
- DEVELOPMENT_PLAN.md
- AGENTS.md
- SECURITY.md
- TESTING.md
- DECISIONS.md

不得重新定义产品。

CJAS 的核心使命是：

不是保存资产，而是保存用户未来恢复资产与重要数字权益的能力。

当前唯一主线是 Vault。
不得开发 Guardian、Legacy、自动继承、律师工作流或恢复材料自动释放。

二、本轮新增正式架构要求

1. Recovery Wizard 必须配置驱动、模块化、低耦合。

不得把以下内容写死在页面组件或核心业务代码中：

- 问题；
- 步骤顺序；
- 提示文案；
- 帮助说明；
- 选项；
- 必填规则；
- 条件分支；
- 风险提示；
- 模板启用状态。

至少分离为：

- Wizard Flow Engine；
- Content Configuration；
- Template Modules；
- Stable Core。

结构化模板和引导内容未来会高频修改，必须做到可增、可减、可替换、可排序、可停用。

但不得过度设计成复杂低代码平台。

2. Web 是第一阶段唯一正式前端。

暂不开发 iOS 或 Android App。

但架构必须保证未来：

- Web；
- iOS App；
- Android App；
- 律师 Portal；
- 家办 Portal；

能够复用同一套领域模型、加密格式、API边界和恢复规范。

不得让核心逻辑依赖具体 Web 页面实现。

3. 轻量账户只负责管理，不参与恢复。

账户可以管理：

- 订单和付款；
- Vault 代号；
- 创建与更新时间；
- Version 状态；
- 公开密文定位索引；
- 演练状态；
- 更新提醒；
- 客服。

账户不得保存：

- Vault 明文；
- Recovery Password；
- 完整 Data Key；
- Recovery Kit；
- 可单独完成解密的任何材料。

4. 每个 Vault Version 对应一个独立 Recovery Kit。

每版必须独立生成：

- snapshot_id；
- data_key；
- nonce；
- KDF salt；
- wrapped key；
- ciphertext；
- Recovery Kit。

旧 Kit 只恢复旧版本。
新 Kit 只恢复新版本。
版本间交叉使用必须 fail-closed。

5. Recovery Confidence 不使用百分制或虚假精确分数。

MVP 只输出：

- Critical Risk；
- Needs Attention；
- Ready for Rehearsal；
- Verified。

内部维度可以包括：

- Coverage；
- Findability；
- Sequencing；
- Safety；
- Evidence；
- Freshness；
- Recoverability。

6. 为未来 Recovery Advisor 预留接口。

本阶段不开发 AI Advisor。

只允许预留以下扩展边界：

- Knowledge Checker；
- Recovery Review Engine；
- Risk Discovery；
- Suggestion Engine。

第一版检查器应以确定性规则为主，不调用外部 AI，不上传用户明文。

三、Week 1 必须完成的开发任务

Task 1：建立正式工程骨架

在不修改 v1.0 基线文件的前提下，建立清晰工程结构。

建议结构可以调整，但必须保持低耦合：

src/
  domain/
  knowledge/
  snapshot/
  crypto/
  recovery-kit/
  recovery/
  wizard/
  confidence/
  storage/
  account/
  ui/
  shared/

config/
  wizard/
  templates/
  content/

tests/
  unit/
  integration/
  fixtures/
  compatibility/
  security/

tools/
docs/

不要为了目录形式而机械创建空文件。
每个模块必须有明确职责和最小可运行实现。

Task 2：实现 Recovery Knowledge Schema v1

基于 RECOVERY_KNOWLEDGE_MODEL.md，建立正式可验证的数据模型。

必须支持：

- Asset；
- Location；
- Contact；
- Device；
- Order；
- Hint；
- Warning；
- Attachment；
- 自定义分类；
- 自定义字段。

必须明确：

- ID；
- schema_version；
- 必填/可选字段；
- 引用关系；
- 引用完整性；
- Order 前置条件；
- 预期结果；
- 失败动作；
- Warning 绑定；
- Attachment 元数据与完整性；
- 未知字段处理策略；
- 向后兼容原则。

交付：

- schema 定义；
- runtime validator；
- 合法 fixture；
- 非法 fixture；
- 单元测试。

Task 3：实现完整 Snapshot Schema v1

Snapshot 必须代表一个完整、独立可恢复的 Vault Version。

不得采用增量补丁。

至少包含：

- snapshot_id；
- vault_id；
- snapshot_schema_version；
- wizard_config_version；
- created_at；
- knowledge graph；
- attachment manifest；
-完整性信息；
- 不含用户明文秘密的必要元数据。

要求：

- 同一输入可确定性序列化；
- 字段顺序和编码规则明确；
- 中文和 Unicode 正常；
- 非法引用拒绝；
- 未知版本拒绝或明确兼容；
- 后续版本可迁移。

交付：

- SnapshotBuilder；
- validator；
- canonical serialization；
- test vectors；
- round-trip 测试。

Task 4：建立 Recovery Wizard Engine 骨架

本周只实现引擎和最小演示配置，不追求完整 UI。

必须支持：

- Next；
- Back；
- Skip；
- Required；
- 条件分支；
- 步骤进度；
- 模块启用/停用；
- 模块排序；
- 字段校验；
- 草稿状态；
- 自定义字段；
- 自定义附件；
- config_version。

至少提供 5 个可插拔模板模块：

- 钱包/链上资产；
- 交易所/托管平台；
- 设备与存放位置；
- 联系人与协助人；
- 恢复步骤与风险警告。

模板内容必须位于独立配置文件中。
修改问题或文案不得影响 Crypto、Snapshot、Recovery Kit 或 Storage 模块。

Task 5：实现 Recovery Confidence Checker v0

基于确定性规则检查 Recovery Map 的完整性和可执行性。

第一版至少识别：

- 资产存在但没有 Location；
- Location 存在但没有查找说明；
- 关键 Order 缺少前置条件；
- Order 没有预期结果或失败动作；
- 高风险步骤没有 Warning；
- 引用不存在；
- 关键联系人缺失；
- Attachment 丢失或哈希不匹配；
- 没有完成恢复演练；
- 版本资料过期提示。

输出只能是：

- Critical Risk；
- Needs Attention；
- Ready for Rehearsal；
- Verified。

同时输出可解释的问题列表，不输出虚假分数。

Task 6：建立 Crypto 和 Recovery Kit 接口骨架

本周先完成稳定接口与测试边界，不冻结最终 KDF。

必须定义：

CryptoEngine：
- generateDataKey；
- encryptSnapshot；
- decryptSnapshot；
- hash；
- wipeSensitiveReference（在 JS 能力范围内明确局限）。

KdfProvider：
- deriveKey；
- validateParameters；
- capability detection；
- 不允许静默降级。

RecoveryKitBuilder：
- createKit；
- parseKit；
- validateKit；
- wrapDataKey；
- unwrapDataKey。

要求：

- UI 不直接调用底层密码学细节；
- 完整密钥不打印、不显示、不进入日志；
- Recovery Kit 不写入 localStorage、sessionStorage、IndexedDB；
- Kit 格式保留版本字段；
- 错误 Kit、错误密码、跨版本 Kit 必须 fail-closed。

Task 7：完成 KDF Compatibility Study

比较：

- Argon2id；
- PBKDF2-HMAC-SHA-256。

覆盖环境：

- macOS Chrome；
- macOS Safari；
- macOS Edge；
- Windows Chrome；
- Windows Edge。

如当前机器无法真实覆盖全部环境：

- 完成可自动运行的兼容测试工具；
- 明确哪些是实测；
- 哪些等待后续设备实测；
- 不得虚构结果。

评估维度：

- 浏览器支持；
- 离线打包；
- 是否依赖 WASM；
- 包体积；
- 启动时间；
- 派生耗时；
- 内存消耗；
- 参数可验证性；
- 长期兼容；
- 测试向量；
- 失败行为；
- 是否可能静默降级。

输出：

KDF_COMPATIBILITY_REPORT.md

必须给出工程推荐，但不得自行作最终产品决定。

Task 8：建立自动化测试框架

测试必须全部本地运行，禁止真实主网和真实钱包。

至少覆盖：

- Knowledge schema；
- Snapshot serialization；
- Snapshot validation；
- Wizard branching；
- Template configuration；
- Recovery Confidence；
- Crypto interface；
- Recovery Kit validation；
- 错误密码；
- 错误 Kit；
- 跨版本 Kit；
- 篡改；
- 缺失字段；
- 未知版本；
- Unicode；
- 恶意长度；
- 文件名净化；
- 浏览器持久存储扫描；
- 日志泄密扫描。

建立单一测试命令，并返回明确 PASS/FAIL。

Task 9：建立 Product Brain 目录和正式开发令

如尚未建立，则创建：

docs/
  CEO_DEVELOPMENT_ORDER_001.md
  SYSTEM_ROADMAP.md

knowledge/
  Blueprint/
  Decisions/
  Architecture/
  Vision/

把本开发令写入：

docs/CEO_DEVELOPMENT_ORDER_001.md

SYSTEM_ROADMAP.md 只需要说明：

- 当前：Web Vault MVP；
- 后续：Vault App；
- 再后：Guardian；
- 最后：Legacy 与专业机构 Portal。

不得因此扩大当前开发范围。

四、本轮禁止事项

禁止：

- 修改 main；
- 修改或覆盖 v1.0 基线文件；
- 主网交易；
- 连接真实钱包；
- AR 充值或支付；
- 部署生产环境；
- Guardian；
- Legacy；
- AI Advisor 实现；
- iOS/Android 开发；
- 复杂账户后台；
- 正式支付系统；
- UI 视觉精修；
- 将 Wizard 做成复杂低代码平台；
- 将 Recovery Kit、密码或密钥上传；
- 引入未经审查的外部加密依赖；
- 虚构兼容性或测试结果。

五、授权边界

可自主执行：

- 在当前 feature 分支创建和修改开发文件；
- 安装必要且来源明确的开发依赖；
- 建立本地测试环境；
- 运行本地服务器；
- 创建测试 fixture；
- Git 小步提交；
- 更新相关技术文档。

必须申请 CEO 授权：

- 主网交易；
- 钱包连接；
- 真实付费；
- GitHub 远程仓库；
- push；
- 部署；
- 生产密钥；
- 删除或重置基线；
- 改变产品定位、安全模型或账户恢复边界。

六、执行方式

不要只创建空目录或占位文件。

按照以下顺序持续执行：

1. 建立工程与测试框架；
2. 实现 Knowledge Schema；
3. 实现 Snapshot Schema；
4. 实现 Wizard Engine 骨架；
5. 实现 Recovery Confidence Checker；
6. 建立 Crypto/Kit 接口；
7. 执行 KDF Study；
8. 完成全量测试；
9. 文档同步；
10. Git 提交。

遇到问题时：

- 主线硬阻塞：立即报告根因、证据、替代方案和推荐决策；
- 非关键问题：记录到 DEFERRED_ISSUES.md，不得长期阻塞主线；
- 不得用“尚未完美”作为不交付可运行版本的理由。

七、Week 1 完成标准

只有同时满足以下条件，Week 1 才能判定 PASS：

- 正式工程骨架可运行；
- 单一测试命令可执行；
- Recovery Knowledge Schema v1 已实现并测试；
- Snapshot Schema v1 已实现并测试；
- Wizard Engine 支持配置驱动和最小分支流程；
- 五类模板可插拔；
- Recovery Confidence Checker 可运行；
- Crypto 与 Recovery Kit 接口已建立；
- KDF Compatibility Study 已完成到当前可验证范围；
- 没有钱包、主网、部署或费用；
- 没有敏感信息进入代码、日志或 Git；
- main 和 v1.0 基线哈希保持不变；
- 工作树干净；
- 形成可继续进入 Week 2 的明确结论。

八、最终交付报告

完成后提交：

《CJAS Vault Week 1 Development Report》

必须包括：

1. 实际新增与修改文件；
2. 最终目录结构；
3. 实现的模块；
4. 测试命令；
5. 测试数量及 PASS/FAIL；
6. Knowledge Schema 状态；
7. Snapshot Schema 状态；
8. Wizard 配置化证明；
9. Recovery Confidence 规则；
10. Crypto/Kit 接口状态；
11. KDF 兼容性测试结果；
12. 实测与未实测环境区分；
13. 敏感信息扫描结果；
14. v1.0 基线哈希复核；
15. Git commit hash；
16. 是否产生费用；
17. 当前阻塞项；
18. 暂缓项；
19. 是否达到 Week 1 PASS；
20. Week 2 建议任务。

完成后停止，不自动进入 Week 2，等待评审。