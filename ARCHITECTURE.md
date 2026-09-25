# CJAS v1.0 架构

## 运行形态

项目是无构建步骤的静态单页应用。正式业务代码全部位于 `index.html`，通过本地 HTTP 服务在 `http://localhost:8080/` 运行；代码会阻止 `file://` 方式执行。

## 主要流程

1. 从同目录读取 `test.pdf`。
2. 计算原文件 SHA-256。
3. 使用浏览器 `crypto.getRandomValues` 生成 32 B 随机密钥。
4. 使用 Web Crypto AES-GCM 加密，并把文件元数据及原始哈希封装进明文载荷。
5. 动态加载 Arweave SDK。
6. 检测 Wander 注入的 `window.arweaveWallet`，请求 `ACCESS_ADDRESS` 与 `SIGN_TRANSACTION` 权限。
7. 创建、钱包签名并广播携带密文的 Arweave 交易。
8. 查询交易状态，并依次尝试 `arweave.net`、`ar-io.net`、`g8way.io`。
9. 下载密文并与上传前密文 SHA-256 比对。
10. 使用仍保留在当前页面内存中的密钥解密，核对恢复文件 SHA-256，然后导出 PDF。

## 数据边界

- 随机密钥仅存在于页面内存，不随密文上传。
- 链上数据为加密后的文件。
- 钱包签名由浏览器钱包扩展完成，代码中没有钱包私钥。
- v1.0 恢复依赖原页面会话仍持有密钥；页面关闭后无法仅凭交易 ID 恢复。这一限制由 v1.1 参考方案专门研究。

## 外部依赖

- 浏览器 Web Crypto API。
- Wander/ArConnect 兼容的 `window.arweaveWallet` API。
- 通过 CDN 加载的 Arweave JavaScript SDK。
- Arweave 价格、交易状态和数据网关接口。

## 当前结构限制

项目没有 `package.json`、`src`、`public`、Vite/Next 配置或自动化构建流程。业务逻辑、状态和 UI 位于同一个 HTML 文件中。

