# Recovery Matrix

本矩阵用于选模板和发现依赖，不取代平台条目或执行时官方复核。

| 平台类型 | 平台 | 主要控制源 | 关键失效路径 | 首选模板 |
|---|---|---|---|---|
| CEX | Binance、OKX、Coinbase、Kraken、Bybit、Bitget、KuCoin | 平台账户、2FA、身份与风控 | 邮箱/手机/Authenticator失效、身份审核、等待期 | CEX |
| 软件钱包 | MetaMask、Trust Wallet、Phantom、OKX Wallet | SRP、私钥或特定云登录 | 设备丢失、SRP/私钥缺失、导入账户遗漏 | Software Wallet |
| 软件钱包 | Rabby | 原始密钥或连接设备 | 官方恢复证据不足，回到原始账户类型 | Software Wallet |
| 硬件钱包 | Ledger、Trezor、OneKey、Keystone、SafePal | 备份、可选Passphrase、签名设备 | 设备损坏、备份缺失、Passphrase错误、路径差异 | Hardware Wallet |
| 组合 | 任意两类以上 | 多个独立控制源 | 单点依赖、重复地址、恢复顺序冲突 | Multi Wallet |

## 中立性约束

- 不把平台覆盖清单解释为推荐名单。
- 不承诺覆盖全部交易所、钱包、链、派生路径或司法辖区。
- 优缺点、适用场景与备用路径必须分别陈述。
- 多签是高级方案，默认不面向普通个人推荐。
