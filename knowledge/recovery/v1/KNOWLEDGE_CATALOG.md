# CJAS Recovery Knowledge Base v1 — CEO Catalog

Last updated: 2026-08-02

Authority: `knowledge/recovery/v1/`

Status: Knowledge Architecture PASS; Product Knowledge and AI Support remain gated.

## CEO快速阅读页

- 当前覆盖：7个中心化交易所、5个软件钱包、5个硬件钱包，共17个平台文档和112条Atomic Claims；全部Claims均已进入审批决策记录。
- 最成熟：Trezor（7 Approved）、Ledger（6）、MetaMask（5）；Coinbase有5条Approved，但3条遗产事实仅限人工处理。
- 最薄弱：Binance、Rabby、Trust Wallet、Keystone仍无Approved或缺少关键恢复/转移证据；其确定性产品与AI范围受限。
- 最值得补强：优先补齐Binance邮箱、Authenticator、提币限制及安全停止条件的操作级官方证据；随后原子化其余12个平台。
- Recovery Map重构：**仍未获授权**。44条Template-eligible Claims可支持受控设计，但CEX和三个钱包仍有关键缺口。
- AI客服MVP：**尚不足以正式启动**。48条AI-eligible Claims可支持有限问题，但缺口必须拒答，法律流程必须人工升级。

## 1. 知识库总体结构

| 指标 | 当前值 |
|---|---:|
| 平台分类 | 3 |
| Platform Documents | 17 |
| Atomic Knowledge Items | 112 |
| Approved / Reviewed / Draft | 52 / 25 / 35 |
| Rejected / Stale | 0 / 0 |
| Official Source Records | 48（47个唯一URL） |
| Open Questions | 10 |
| Product Template Candidates | 17个平台 + 4类通用模板 |
| AI offline test cases | 22 |

目录分层：平台事实、模板、规则、Guidance、AI支持、来源、矩阵、Open Questions、Atomic Claims、质量审计及产品模板候选。旧`knowledge/recovery-research/v1/`只作为Pilot归档，不是产品读取源。

## 2. 平台覆盖清单

`READY`仅表示该平台的核心候选知识具备Claim支持，不代表已接入产品。

## 17个平台恢复与控制权完整度总表

| 平台 | 类型 | 恢复信息 | 操作转账路径 | 指定第三人技术控制 | 需原持有人 | 官方/法律程序 | 当前缺口/不完整原因 | 模板 | AI |
|---|---|---|---|---|---|---|---|---|---|
| Binance | CEX | 不完整 | 不完整 | NO | YES | 条件需要 | 无操作级恢复/提币证据 | NOT READY | NOT READY |
| OKX | CEX | 本人恢复 | 受限制 | NO | YES | 第三人/失能需要 | Verified Transfer与非美国范围 | ACCOUNT HOLDER ONLY | PARTIAL |
| Coinbase | CEX | 本人恢复完整 | 部分 | NO | YES | 遗产必须 | 小额验证与主动交接缺口 | LIMITED | PARTIAL |
| Kraken | CEX | 部分 | 不完整 | NO | YES | 遗产必须 | 本人失因恢复与完整转账路径 | NOT READY | PARTIAL |
| Bybit | CEX | 部分 | 部分 | NO | YES | 未确认 | 失因恢复与继承流程 | NOT READY | PARTIAL-controls |
| Bitget | CEX | 本人恢复 | 受24h限制 | NO | YES | 未确认 | 交接/继承与Verified Transfer | ACCOUNT HOLDER ONLY | PARTIAL |
| KuCoin | CEX | 本人恢复 | 受因素/审核限制 | NO | YES | 未确认 | 交接/继承与Verified Transfer | ACCOUNT HOLDER ONLY | PARTIAL |
| MetaMask | 软件钱包 | 条件完整 | 通用框架可验证 | CONDITIONAL | NO—材料齐备 | 法律授权另行 | 需真实演练 | CONDITIONAL READY | READY-core |
| Rabby | 软件钱包 | 不完整 | 不完整 | CONDITIONAL/未确认 | 未确认 | 法律授权另行 | 官方恢复资料不足 | NOT READY | NOT READY |
| Trust Wallet | 软件钱包 | 部分 | 不完整 | CONDITIONAL | NO—材料齐备 | 法律授权另行 | 云/导入/地址与转账证据弱 | NOT READY | NOT READY |
| Phantom | 软件钱包 | 条件完整 | 通用框架可验证 | CONDITIONAL | NO—材料齐备 | 法律授权另行 | 需跨链真实演练 | CONDITIONAL READY | READY-core |
| OKX Wallet | 软件钱包 | 条件完整 | 通用框架可验证 | CONDITIONAL | NO—材料齐备 | 法律授权另行 | 云/派生细节与演练 | CONDITIONAL READY | READY-core |
| Ledger | 硬件钱包 | 条件完整 | 通用框架可验证 | CONDITIONAL | NO—材料齐备 | 法律授权另行 | 需真实演练 | CONDITIONAL READY | READY-core |
| Trezor | 硬件钱包 | 条件完整 | 通用框架可验证 | CONDITIONAL | NO—材料齐备 | 法律授权另行 | 需真实演练 | CONDITIONAL READY | READY-core |
| OneKey | 硬件钱包 | 条件完整 | 通用框架可验证 | CONDITIONAL | NO—材料齐备 | 法律授权另行 | 型号/派生与演练 | CONDITIONAL READY | READY-core |
| Keystone | 硬件钱包 | 部分 | 不完整 | CONDITIONAL/未确认 | 未确认 | 法律授权另行 | Passphrase/固件/派生证据不足 | NOT READY | NOT READY |
| SafePal | 硬件钱包 | 条件完整 | 通用框架可验证 | CONDITIONAL | NO—材料齐备 | 法律授权另行 | 派生细节与演练 | CONDITIONAL READY | READY-core |

重新评估后仍无无条件`COMPLETE AND TRANSFER-VERIFIABLE`平台；7个自托管钱包达到`COMPLETE WITH CONDITIONS`，其真实Vault仍需完成本地演练才可标记Verified。

### A. 中心化交易所

| 平台 | 知识状态 | A/R/D | 官方来源 | 产品模板 | AI能力 | 关键缺口 |
|---|---|---:|---:|---|---|---|
| Binance | NOT_READY | 0/4/4 | 2 | 候选，不READY | 无确定性回答 | YES—操作级恢复与提币状态 |
| OKX | ACCOUNT_HOLDER_ONLY | 3/1/2 | 1 | 本人恢复候选 | 部分 | YES—Verified Transfer/法律路径 |
| Coinbase | LIMITED_READY | 5/3/0 | 5 | 本人恢复有限READY | 有限；遗产人工升级 | YES—主动交接与复合记录建议 |
| Kraken | LEGAL_PATH_ONLY | 3/0/3 | 2 | 不READY | 部分 | YES—本人恢复/转账 |
| Bybit | PARTIAL | 3/0/3 | 2 | 不READY | 控制项部分 | YES—本人恢复/继承 |
| Bitget | ACCOUNT_HOLDER_ONLY | 2/2/2 | 2 | 本人恢复候选 | 部分 | YES—交接/继承/Verified Transfer |
| KuCoin | ACCOUNT_HOLDER_ONLY | 3/1/2 | 2 | 本人恢复候选 | 部分 | YES—交接/继承/Verified Transfer |

### B. 软件钱包

| 平台 | 知识状态 | A/R/D | 官方来源 | 产品模板 | AI能力 | 关键缺口 |
|---|---|---:|---:|---|---|---|
| MetaMask | CORE_READY | 5/3/0 | 4 | 核心技术READY | 核心恢复可回答 | YES—法律/复合Guidance |
| Trust Wallet | EVIDENCE_WEAK | 0/2/4 | 1 | 候选，不READY | 无确定性回答 | YES—云/导入/转账证据 |
| Rabby | EVIDENCE_WEAK | 0/1/5 | 1 | 候选，不READY | 无 | YES—官方恢复资料不足 |
| Phantom | CONDITIONAL_READY | 5/0/1 | 3 | 条件READY | 核心恢复 | YES—跨链演练 |
| OKX Wallet | CONDITIONAL_READY | 3/2/1 | 3 | 条件READY | 核心恢复 | YES—云/派生细节 |

### C. 硬件钱包

| 平台 | 知识状态 | A/R/D | 官方来源 | 产品模板 | AI能力 | 关键缺口 |
|---|---|---:|---:|---|---|---|
| Ledger | CORE_READY | 6/2/0 | 5 | 核心技术READY | 核心恢复可回答 | YES—复合Guidance/型号细节 |
| Trezor | CORE_READY | 7/1/0 | 5 | 核心技术READY | 核心恢复可回答 | YES—复合记录Guidance |
| OneKey | CONDITIONAL_READY | 3/1/2 | 3 | 条件READY | 核心恢复 | YES—型号/派生/演练 |
| Keystone | EVIDENCE_WEAK | 0/2/4 | 4 | 候选，不READY | 无 | YES—Passphrase/固件/派生 |
| SafePal | CONDITIONAL_READY | 4/0/2 | 3 | 条件READY | 核心恢复 | YES—派生/演练 |

## 3. 每个平台涵盖的信息维度

17个平台文档均使用统一18节，覆盖以下维度；“已覆盖”不等于Claim已批准：

1. 平台或钱包类型与账户类型；2. 托管模式和控制权来源；3. 正常登录条件；4. 账户或钱包恢复条件；5. 提币或资产转移条件；6. 二次验证；7. 设备、位置与查找线索；8. 条件失效备用路径；9. 主动资产交接；10. 死亡或失能兜底；11. 风险与停止条件；12. 建议记录；13. 禁止记录；14. 推荐附件；15. Recovery Map候选内容；16. 官方流程与来源；17. 地区、型号或版本差异；18. 更新时间与Evidence Grade。

其中CEX必须区分本人恢复、主动交接、死亡/失能法律兜底；自托管必须区分技术控制、法律授权与安全转移。

## 4. Recovery Rules目录

状态为`CANDIDATE`时仍需Rule级产品审批；`NOT_READY`不得进入Rule Engine。

| rule_id | 规则/用途 | 适用类型 | 来源Claim | 状态 | Rule Engine |
|---|---|---|---|---|---|
| RK-001 | 每项资产有类型和公开识别线索 | ALL | 无Approved直接Claim | REVIEWED | NO |
| RK-002 | 每项资产关联实际恢复条件 | ALL | 无Approved直接Claim | REVIEWED | NO |
| RK-003 | 控制条件记录存在性与位置 | ALL | 无Approved直接Claim | REVIEWED | NO |
| RK-004 | 禁止完整密码、OTP、助记词、私钥、Passphrase | ALL | MM-005, LED-005, TRZ-006 | CANDIDATE | YES |
| RK-005 | CEX区分登录、身份和提币状态 | CEX | CB-001, CB-006 | CANDIDATE_COINBASE | YES—scoped |
| RK-006 | 邮箱/手机失效必须有备用路径 | CEX | CB-001（部分） | REVIEWED | NO |
| RK-007 | Authenticator记录设备与丢失路径 | CEX | 无Approved | REVIEWED | NO |
| RK-008 | 因素重置后复核提币限制 | CEX | CB-006（ID恢复范围） | REVIEWED | NO—过宽 |
| RK-009 | 记录地址白名单/新地址锁 | CEX | 无Approved | REVIEWED | NO |
| RK-010 | 未确认遗产流程不得承诺继承 | CEX | CB-002–004仅内部 | INTERNAL | NO |
| RK-011 | 软件钱包本地密码不是恢复密钥 | SOFTWARE | MM-001, MM-002 | CANDIDATE | YES |
| RK-012 | 导入账户需要独立恢复材料 | SOFTWARE | MM-004 | CANDIDATE | YES |
| RK-013 | 云/社交登录记录创建方式和条件 | SOFTWARE | 无Approved | REVIEWED | NO |
| RK-014 | 硬件钱包记录型号和备份格式 | HARDWARE | TRZ-001；LED-001/002部分 | CANDIDATE | YES—scoped |
| RK-015 | Passphrase记录存在性与分离位置 | SELF_CUSTODY | LED-003/004, TRZ-004（存在性） | REVIEWED | NO—位置建议未批准 |
| RK-016 | 分片备份记录份额总数与门限 | HARDWARE | TRZ-005（门限） | CANDIDATE | YES—Trezor scoped |
| RK-017 | 设备损坏需有恢复或不可恢复说明 | HARDWARE | LED-001, TRZ-002/003 | CANDIDATE | YES—scoped |
| RK-018 | 恢复后先核对公开地址 | SELF_CUSTODY | 地址差异事实已批准；Guidance未批准 | REVIEWED | NO |
| RK-019 | 首次转移建议小额测试 | ALL | 无Approved直接Claim | REVIEWED | NO |
| RK-020 | 网络、链、地址或授权不确定时停止 | ALL | 部分平台停止条件 | REVIEWED | NO—过宽 |
| RK-021 | 客服索取秘密/OTP/远程控制时停止 | ALL | MM-005, LED-005, TRZ-006 | CANDIDATE_PILOT | YES—Pilot scope |
| RK-022 | 多次身份验证失败转官方支持 | CEX | 无Approved直接Claim | REVIEWED | NO |
| RK-023 | 平台政策记录来源和复核日期 | ALL | Governance policy | INTERNAL | NO |
| RK-024 | 只有合格知识可进入产品 | SYSTEM | Claim Approval Gate | SUPERSEDED | NO—由APPROVED闸门替代 |

## 5. Product Templates目录

### 通用模板

| 模板 | 支持平台 | 必须项 | 条件必填 | 建议项 | 可选项 | Approved支持比例 | READY |
|---|---|---|---|---|---|---:|---|
| CEX Recovery Template | 7 CEX | 身份、账户、恢复入口 | 启用的2FA/KYC/转出限制 | 备用路径、来源 | 子账户/地区备注 | 6/7平台有范围受限的Approved | NO |
| Software Wallet Template | 5软件钱包 | 地址、钱包类型、恢复材料存在性 | 导入账户/社交或云条件 | 地址核验、设备图 | 网络备注 | 3/5平台有范围受限的Approved | NO |
| Hardware Wallet Template | 5硬件钱包 | 型号、备份类型、地址 | Passphrase/门限/配套应用 | 演练和设备关系 | 固件备注 | 4/5平台有范围受限的Approved | NO |
| Multi-Wallet Template | 跨平台高级组合 | 账户清单、控制源、顺序 | 每个子模板关键条件 | 风险分散、去重 | 高级协调 | 13个平台共44条Template-eligible | NO |

### 平台专属候选

- 条件或核心候选READY：MetaMask、Phantom、OKX Wallet、Ledger、Trezor、OneKey、SafePal；仅表示知识候选可用，仍需真实演练。
- 本人恢复有限候选：OKX、Coinbase、Bitget、KuCoin。
- NOT READY：Binance、Kraken、Bybit、Trust Wallet、Rabby、Keystone。
- 字段分类：每个平台模板均列出必须项、条件必填项、建议项、可选项、风险停止、附件及禁止内容；详细闸门见`PILOT5_TEMPLATE_GATE.md`。

## 6. Guidance目录

| Guidance类型 | 当前能力 | 状态 |
|---|---|---|
| 为什么需要填写 | 解释资产、控制条件和完成判断 | REVIEWED_CANDIDATE |
| 建议填写什么 | 存在性、受控位置、公开地址、官方入口 | PARTIAL_APPROVED |
| 不要填写什么 | 禁止秘密、OTP、恢复材料全集 | APPROVED_PILOT_SUPPORT |
| 条件失效怎么办 | 记录备用路径和不可恢复后果 | PARTIAL_APPROVED |
| 常见遗漏 | 登录/提币、导入账户、Passphrase、门限 | PARTIAL_APPROVED |
| 推荐附件 | 脱敏清单、位置说明、演练结果 | REVIEWED_CANDIDATE |
| 高风险提醒 | 秘密请求、地址不符、范围误用 | APPROVED_PILOT_SUPPORT |
| 何时联系官方/专业人士 | 平台恢复、法律权属、不确定范围 | PARTIAL；法律人工升级 |

## 7. AI客服目录

| 问题类别 | 可回答平台 | Approved覆盖 | 人工升级 | 限制 |
|---|---|---|---|---|
| 邮箱无法访问 | Coinbase | CB-001 | Binance及其他平台YES | Coinbase零售账户状态 |
| 手机丢失 | 无确定性Pilot 5答案 | 无 | YES | 平台/地区差异 |
| Authenticator丢失 | 无确定性Pilot 5答案 | 无 | YES | Binance证据缺口 |
| 忘记钱包密码 | MetaMask | MM-001/002 | 社交登录差异时YES | SRP钱包范围 |
| 丢失SRP | MetaMask | MM-002 | YES—无材料时不可编造路径 | 钱包创建类型 |
| 导入账户恢复 | MetaMask | MM-003/004 | 地址不符时YES | 导入方式/账户来源 |
| 硬件钱包损坏 | Ledger、Trezor | LED-001, TRZ-002 | 型号不明时YES | 兼容型号/备份格式 |
| Passphrase遗失 | Ledger、Trezor | LED-003/004, TRZ-004 | 无重建路径；安全升级 | 精确值/隐藏钱包 |
| 已故账户流程 | Coinbase事实存在 | CB-002–004 INTERNAL_ONLY | ALWAYS | 地区和法律范围 |
| 为什么不能上传助记词 | MetaMask、Ledger、Trezor | MM-005, LED-005, TRZ-006 | 异常请求时YES | Pilot 5范围 |
| 为什么登录不等于可提币 | Coinbase有限 | CB-001/006 | 其他平台YES | ID恢复场景/time-sensitive |

AI当前只能检索APPROVED、未过期且含`ELIGIBLE_FOR_AI_SUPPORT`的Claim；无结果时必须输出“当前知识库无法确认”。

## 8. Open Questions目录

| 优先级 | 问题 | 影响 |
|---|---|---|
| P0 | Binance邮箱、Authenticator和恢复后提币状态 | 阻塞Binance模板和整体Pilot 5 READY |
| P0 | Binance停止条件拆分及操作级官方来源 | 阻塞安全规则/AI |
| P1 | Coinbase主动交接与权属边界 | 阻塞主动交接确定性回答 |
| P1 | MetaMask/Ledger恢复后地址核验的直接官方依据 | 阻塞正式Guidance |
| P1 | 登录与提币分离的跨CEX逐平台证据 | 阻塞通用AI/Rule |
| P2 | Rabby官方恢复文档 | 阻塞其Atomic化 |
| P2 | Trust Wallet云备份、Phantom seedless范围 | 版本/平台差异 |
| P2 | Ledger/OneKey/Keystone型号与固件差异 | 模板精度 |
| P2 | 跨品牌派生路径兼容 | 禁止形成保证性结论 |
| P3 | CEX跨地区死亡/失能与法律流程 | 长期人工/法律研究 |

## 9. 产品可用性总结

- 可进入Recovery Map候选映射：44条Template-eligible Claims，必须保留平台范围与条件。
- 可进入Guidance候选：48条Guidance-eligible Claims，另有Verified Transfer通用CJAS Guidance。
- 可进入AI客服候选：48条AI-eligible Claims；法律事实除外。
- 可进入Rule Engine候选评审：33条；仍需Rule级批准，不代表已接入。
- 只能内部使用：4条已批准法律事实及所有非APPROVED知识。
- 不能对客户展示为确定结论：25条REVIEWED、35条DRAFT、未限定地区/型号/版本的政策、任何恢复保证或跨平台推断。

## 10. 决策结论

- Recovery Map整体业务重构：**NOT READY / NOT AUTHORIZED**；无平台具备无条件且已演练的A–F完整闭环，且Binance、Rabby、Trust Wallet、Keystone仍有关键证据缺口。
- AI客服MVP：**NOT READY**；可先做离线检索/拒答验证，不得接入对客AI服务。
- Batch 2：**NOT AUTHORIZED**。
- 当前最优先工作：关闭Binance P0证据缺口并获得Claim级审批。
