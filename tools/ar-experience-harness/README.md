# CJAS AR Mainnet Experience Harness V1

独立的主网体验测试工具，不属于 Recovery Map V2 产品层。

入口：`http://127.0.0.1:8080/tools/ar-experience-harness/`

边界：

- 只上传已生成的 `.cjasvault` 密文，不读取或修改 Snapshot/Archive 格式。
- 钱包权限仅通过 CEO Chrome 中的 ArConnect/Wander 请求；不请求 JWK、私钥或助记词。
- 每次上传先获得实时价格并执行 `0.01 AR` 单次、`0.06 AR` 累计门控。
- 每类 PDF、DOCX、PNG、JPG、MP3、MP4 最多一次，共六次。
- 按 TxID 从多个网关下载，先校验密文 SHA-256，再调用稳定的独立恢复 API 本地解密。
- 所有结果仅保存在当前页面内存；可手动导出不含密码和钱包地址的 JSON 证据。
