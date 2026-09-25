CJAS Vault Phase 1 — Week 2 正式开发指令

Week 1 已通过验收，状态 PASS。

当前开发分支：
feature/independent-recovery-v1.1

当前 HEAD：
01f552d23cbd8f57d4d9c7a24e3b6a60dc69e692

main 继续保持：
de12de6d2982396f47348d81f7c20d8a708140c7

Week 2 目标：

交付第一版可以由 CEO 在浏览器中亲自体验的 Vault 本地闭环：

Recovery Wizard
→ Recovery Map
→ 完整 Snapshot
→ 设置恢复密码
→ 生成并下载 Recovery Kit
→ 新会话导入 Kit 和密文
→ 独立恢复
→ 完成强制恢复演练

本周不追求正式视觉设计，不接主网，不接真实钱包，不开发 Guardian、Legacy 或 App。

一、核心开发原则

1. 不得修改或复用旧 v1.0 index.html 作为正式 Vault UI。
2. 新 Vault Web UI 必须基于 Week 1 新架构独立建立。
3. 用户不得看到或操作：
   - Wallet
   - AR
   - Transaction ID
   - Gateway
   - JSON
   - Data Key
   - Hash
   - KDF 技术参数
4. 所有明文、Recovery Password 和完整密钥只在用户设备内存中处理。
5. 不使用 localStorage、sessionStorage、IndexedDB 或服务器保存 Vault 明文、密码、完整密钥或 Recovery Kit。
6. Wizard 内容继续配置驱动，不能写死在 UI。
7. 本周使用 LocalMockAdapter 和本地密文文件完成体验闭环。
8. PBKDF2-HMAC-SHA-256 只作为 CEO 体验版暂行 KDF：
   - Kit 必须记录明确的 kdf_id、参数和格式版本；
   - 禁止静默降级；
   - 不得将其写成永久最终方案；
   - 后续 Argon2id 兼容与审计仍保留。
9. 优先可运行、可体验、可恢复，不进行视觉过度设计。

二、Task 1：建立 Vault Web UI 壳层

建立独立 Web 应用入口，至少包含以下流程：

1. 欢迎与产品说明
2. 开始创建恢复计划
3. Recovery Wizard
4. Recovery Review
5. 设置恢复密码
6. 生成 Vault Snapshot
7. 下载 Recovery Kit
8. 下载或保存本地加密档案
9. 强制恢复演练
10. 创建完成结果页
11. 独立恢复入口

用户语言应以普通产品语言表达，不出现底层密码学和区块链术语。

页面必须能够在本地静态服务器运行。

三、Task 2：接入配置化 Recovery Wizard

将 Week 1 Wizard Engine 接入真实表单。

首版至少支持五类模板：

1. 钱包和链上资产
2. 交易所和托管平台
3. 设备与存放地点
4. 联系人和协助人
5. 恢复步骤与风险警告

必须支持：

- Next
- Back
- Skip
- 条件分支
- 必填校验
- 动态增加条目
- 删除条目
- 自定义分类
- 自定义字段
- 附件添加
- 模块启用与停用
- 内存草稿
- 离开页面前风险提醒

不得要求用户填写完整私钥、完整助记词或核心密码。

在相关步骤显著提示：

“请不要将完整私钥、完整助记词或可直接控制资产的全部认证信息集中保存在此处。”

四、Task 3：实现 Recovery Review

Wizard 完成后，不能直接生成 Vault。

必须先进入 Recovery Review。

基于 Recovery Confidence Checker 展示：

- Critical Risk
- Needs Attention
- Ready for Rehearsal

并显示可解释的问题，例如：

- 资产没有明确存放位置
- 存放位置没有查找说明
- 缺少可信联系人
- 恢复步骤顺序不完整
- 高风险步骤缺少警告
- 附件缺失或不一致
- 关键资料可能过期

本阶段采用确定性规则，不调用外部 AI。

允许用户：

- 返回修改
- 对非关键提醒确认继续
- Critical Risk 原则上不得直接完成创建

所有规则和提示应配置化。

五、Task 4：生成完整 Snapshot

从 Wizard 数据生成完整独立 Snapshot。

必须包括：

- Recovery Knowledge Graph
- 自定义字段
- 附件内容及 manifest
- schema version
- wizard config version
- snapshot ID
- vault ID
- created time
- 完整性信息

要求：

- Snapshot 为完整版本，不依赖历史版本
- Unicode 和中文正常
- 相同结构可稳定序列化
- 任何引用错误必须阻止生成
- 不在 UI 展示内部 JSON

六、Task 5：恢复密码与 Recovery Kit

实现恢复密码设置流程。

体验版要求：

1. 两次输入一致
2. 提供最低安全要求
3. 提供显示/隐藏密码
4. 提醒用户平台无法找回密码
5. 要求用户明确确认已理解
6. 不将密码写入任何存储、日志或 URL
7. 页面刷新或关闭后密码和密钥必须丢失

暂行 KDF：

PBKDF2-HMAC-SHA-256

参数须依据 Week 1 实测结果选择一个体验可接受值，并写入 Kit。

不得把参数暴露给普通用户。

生成：

- 每版本独立 Data Key
- 每版本独立 nonce
- 每版本独立 salt
- wrapped Data Key
- encrypted Snapshot
- versioned .cjas Recovery Kit

用户界面只显示：

- “下载 Recovery Kit”
- “保存加密档案”

不得显示完整密钥、哈希或内部结构。

七、Task 6：独立恢复工具

建立与创建页面逻辑隔离的独立恢复入口。

必须支持：

1. 不登录进入
2. 导入 .cjas Recovery Kit
3. 输入 Recovery Password
4. 选择本地加密档案
5. 严格校验 Kit、密文和版本绑定
6. 解密 Snapshot
7. 重新展示 Recovery Map
8. 恢复并下载附件
9. 明确显示成功或失败
10. 失败时不生成任何伪恢复内容

独立恢复工具不得包含：

- 账户 API 依赖
- 钱包调用
- 主网调用
- CJAS 在线服务依赖
- CDN 密码学依赖
- 分析或遥测代码

本周至少证明：

关闭创建页面后，在新的浏览器会话中仍能恢复。

八、Task 7：强制恢复演练状态机

Vault 不能在下载 Kit 后直接标记完成。

状态建议：

- Draft
- Snapshot Created
- Kit Downloaded
- Rehearsal Required
- Rehearsal Passed
- Verified

演练流程：

1. 创建流程生成 Kit 和密文
2. 用户确认已保存
3. 系统要求打开独立恢复入口
4. 导入刚生成的 Kit 和密文
5. 输入密码
6. 完成恢复
7. 对比 Snapshot 和附件完整性
8. 全部 PASS 后标记 Verified

必须防止仅点击“我已完成”跳过验证。

体验版可以在本地内存或当前测试会话记录演练结果，但不能让账户成为恢复依赖。

九、Task 8：基础版本更新演示

本周不需要完成正式账户和版本后台，但必须证明：

- Version 1 可生成 Kit 1
- 修改 Recovery Map 后生成完整 Version 2 和 Kit 2
- Kit 1 只能恢复 Version 1
- Kit 2 只能恢复 Version 2
- 交叉组合必须失败
- 两个版本均不依赖对方

可以使用本地测试界面或测试工具演示。

十、Task 9：浏览器测试

Week 2 至少实测当前 Mac 上：

- Chrome
- Safari
- Edge（如已安装）

测试：

- Wizard
- Snapshot
- 密码设置
- Kit 下载
- Kit 导入
- 独立恢复
- 中文输入
- 附件恢复
- 错误密码
- 页面关闭后的恢复
- 浏览器持久存储扫描

Windows 测试如当前无设备，保留为后续明确待测项，不得虚构。

十一、Task 10：测试与安全要求

扩展自动化测试，至少覆盖：

- UI 到 Snapshot 的完整流程
- 配置化 Wizard
- Recovery Review
- 密码确认
- Kit 下载与导入
- 新会话恢复
- 错误密码
- 损坏 Kit
- 错误密文
- Kit 与版本交叉
- 附件篡改
- 中文文件名
- 页面刷新后的秘密清除
- localStorage/sessionStorage/IndexedDB 无敏感数据
- console 和日志无秘密
- 独立恢复工具无钱包、主网和账户依赖

单一测试命令必须继续可用。

十二、明确暂缓

本周不开发：

- 正式轻量账户后端
- 支付
- Arweave 写入
- 平台代付服务
- 真实钱包
- 正式版本后台
- AI Advisor
- Guardian
- Legacy
- App
- 移动端适配
- 正式品牌视觉
- 生产部署

十三、Git 与执行纪律

继续在：

feature/independent-recovery-v1.1

开发。

要求：

- 小步提交
- 每个核心模块单独测试
- 不修改 main
- 不修改 v1.0 基线
- 不 push
- 不部署
- 不产生费用
- 完成后工作树干净

非关键问题写入 DEFERRED_ISSUES.md。

真正阻塞端到端体验的问题，必须报告根因、证据和推荐方案，不能绕过。

十四、Week 2 PASS 标准

只有同时满足以下条件，Week 2 才算 PASS：

1. CEO 可在 Web 中完成 Recovery Wizard
2. 能生成完整 Recovery Map Snapshot
3. 能设置恢复密码
4. 能下载 .cjas Recovery Kit
5. 能保存本地加密档案
6. 关闭创建页面后可在独立入口恢复
7. 错误密码和错误 Kit 必须失败
8. 创建后必须完成恢复演练才能标记 Verified
9. 两个版本分别独立恢复，交叉 Kit 失败
10. 用户全程不接触钱包、AR、Transaction ID、Gateway、JSON、Key 或 Hash
11. 无敏感信息进入日志、浏览器持久存储或 Git
12. 自动测试全部 PASS
13. 至少完成当前 Mac 主流浏览器测试
14. 无主网、钱包、部署或费用
15. v1.0 基线哈希不变
16. 形成可供 CEO 实际打开体验的明确运行方式

十五、最终交付

完成后提交：

《CJAS Vault Week 2 Development Report》

必须包括：

1. 实际开发内容
2. 新增和修改文件
3. 运行方式和本地地址
4. CEO 体验操作步骤
5. Wizard 当前五类模板
6. Recovery Review 规则
7. Snapshot 创建结果
8. Recovery Kit 格式版本
9. 暂行 PBKDF2 参数及理由
10. 新会话独立恢复证据
11. 两版本独立恢复证据
12. 负向测试结果
13. 浏览器实测结果
14. 自动测试数量与结果
15. 敏感信息扫描
16. Git commit hash
17. v1.0 基线复核
18. 是否产生费用
19. 当前阻塞项
20. 暂缓项
21. 是否达到 Week 2 PASS
22. Week 3 推荐任务

完成后停止，不自动进入 Week 3，等待 CEO 体验和评审。