# KDF Compatibility Report — Week 1

## 结论

工程暂行推荐是：CEO 体验版优先采用浏览器原生 **PBKDF2-HMAC-SHA-256**，参数必须写入每个 Kit、经过上下限验证且禁止静默降级。Argon2id 在获得经审计、可离线打包的实现并完成五个目标浏览器实测后再提交 CEO 最终选择。此结论不是最终产品决策。

## 当前实测

- 当前执行环境：macOS 上的 Node.js Web Crypto；使用 `npm run compatibility` 可复现。
- 已验证 PBKDF2 派生为 32 字节、相同输入结果稳定、参数越界拒绝。
- 已验证 Argon2id 未提供实现时明确失败，不回退 PBKDF2。
- 本机结果是运行时兼容证据，**不是** Chrome、Safari 或 Edge 浏览器实测。

## 待设备实测

macOS Chrome、Safari、Edge，以及 Windows Chrome、Edge 均尚未实际执行。`tools/kdf-browser-harness.html` 已提供同源、零网络测试工具，输出 user agent、平台、耗时和能力状态；结果需连同浏览器版本归档。

## 比较

| 维度 | Argon2id | PBKDF2-HMAC-SHA-256 |
|---|---|---|
| 浏览器原生支持 | Web Crypto 不原生提供，通常需 WASM | Web Crypto 原生提供 |
| 离线打包 | 可行，但需审计 WASM/JS 包 | 无额外密码学包 |
| 包体与启动 | 候选实现未定，未测 | 无明显额外包体，已在 Node 测试 |
| 抗专用硬件 | 内存硬设计更强 | 主要依赖迭代次数与密码质量 |
| 参数验证 | 内存、迭代、并行度 | 迭代、哈希 |
| 长期兼容 | 取决于实现及 WASM 支持 | 标准与浏览器覆盖更成熟 |
| 失败行为 | 缺实现必须明确失败 | 缺 Web Crypto 必须明确失败 |
| 静默降级 | 禁止 | 禁止 |

## 安全约束

所有 Kit 显式记录算法、参数和 salt。恢复工具必须只使用 Kit 声明的 KDF；能力缺失、参数非法或输出异常均 fail-closed。真实性能、内存、包体和启动数据在 Argon2id 候选实现确定前不得声称已测。
