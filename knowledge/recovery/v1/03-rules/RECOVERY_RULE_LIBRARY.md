# Recovery Rule Library

Status: `REVIEWED_CANDIDATE`; not connected to Rule Engine. A rule becomes product-eligible only after its dependent Atomic Items are `APPROVED`.

| ID | Rule | Severity | Applies to |
|---|---|---|---|
| RK-001 | 每项资产必须有平台/钱包类型和公开识别线索 | BLOCK | ALL |
| RK-002 | 每项资产必须至少关联一个实际控制条件 | BLOCK | ALL |
| RK-003 | 每个控制条件必须记录存在性和查找位置 | BLOCK | ALL |
| RK-004 | 不得保存完整密码、OTP、助记词、私钥或Passphrase | BLOCK | ALL |
| RK-005 | CEX必须区分登录、身份验证和提币状态 | BLOCK | CEX |
| RK-006 | 邮箱/手机启用时必须记录失效备用路径 | BLOCK | CEX |
| RK-007 | Authenticator启用时必须记录设备位置和丢失路径 | BLOCK | CEX |
| RK-008 | 安全因素重置后必须重新核对提币锁定/等待期 | BLOCK | CEX |
| RK-009 | 地址白名单/新地址锁存在时必须记录状态 | ADVISE | CEX |
| RK-010 | 平台遗产流程未获官方确认时不得承诺可继承 | BLOCK | CEX |
| RK-011 | 软件钱包本地密码不得标记为链上恢复密钥 | BLOCK | SOFTWARE |
| RK-012 | 导入账户必须有独立恢复材料引用 | BLOCK | SOFTWARE |
| RK-013 | 云/社交登录型钱包必须记录创建方式和双重条件 | BLOCK | SOFTWARE |
| RK-014 | 硬件钱包必须记录设备型号和备份格式 | BLOCK | HARDWARE |
| RK-015 | Passphrase启用时必须记录存在性和分离位置 | BLOCK | SELF_CUSTODY |
| RK-016 | 分片备份必须记录份额总数与恢复门限 | BLOCK | HARDWARE |
| RK-017 | 设备损坏/丢失必须有兼容恢复或不可恢复说明 | BLOCK | HARDWARE |
| RK-018 | 恢复后必须先核对预期公开地址 | BLOCK | SELF_CUSTODY |
| RK-019 | 首次转移建议使用可承受损失的小额测试 | ADVISE | ALL |
| RK-020 | 网络、链、地址或授权不确定时必须停止 | BLOCK | ALL |
| RK-021 | 客服索取秘密、OTP或远程控制时必须停止 | BLOCK | ALL |
| RK-022 | 多次身份验证失败时停止并走官方支持 | ADVISE | CEX |
| RK-023 | 每项平台政策必须记录来源与最近复核日期 | BLOCK | ALL |
| RK-024 | 只有A/B级知识可进入自动Guidance/AI答案 | BLOCK | SYSTEM |
