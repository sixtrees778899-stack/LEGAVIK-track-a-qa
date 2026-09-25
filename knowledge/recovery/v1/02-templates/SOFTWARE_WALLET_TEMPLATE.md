# Software Wallet Recovery Template

Status: `REVIEWED_CANDIDATE`; not product-connected.

1. 钱包名称、创建方式、公开地址、网络和账户派生关系。
2. 本地密码/PIN作用与真正恢复条件分开记录。
3. SRP/私钥/keystore/云备份仅记录存在性和位置，绝不记录原文。
4. 导入账户、硬件账户、社交登录或keyless账户分别建立引用。
5. 恢复后核对公开地址、链、派生账户、自定义网络和代币显示。
6. 签名前核对目标、链、金额、授权和gas；先小额测试。
7. 所有秘密缺失且无可用设备时，明确标记可能不可恢复。
