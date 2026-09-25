# CJAS Recovery Knowledge Base Pilot 5 Research Report

## Scope and result

Pilot 5 已完成 Binance、Coinbase、MetaMask、Ledger、Trezor 的统一 17 节研究文档、Recovery Requirement Matrix、官方来源索引和 D 级未决问题。研究只使用官方帮助/安全/恢复资料；未修改产品代码或数据格式。

## Core differences

1. Binance/Coinbase 为托管账户：登录、身份验证和提币/发送能力是不同状态；平台风控与等待期可能阻止转移。
2. Coinbase 有明确 Executor Services 遗产路径；Binance 当前公开官方资料不足以确认全球账户遗产操作流程。
3. MetaMask 为自托管：传统本地密码仅解锁设备；SRP恢复派生账户，导入账户需独立材料；社交登录型又是另一恢复组合。
4. Ledger/Trezor 为硬件自托管：原设备在有正确备份时不是必要条件；Passphrase 会生成不同钱包，遗失后不可由厂商恢复。
5. Trezor 的 BIP39/SLIP39、词数和多份门限随型号/创建时期变化；不能用单一“助记词”字段概括。

## Confirmed necessary conditions

- CEX：平台/地区、账户标识、已启用安全因素、身份材料存在性/位置、恢复后发送状态、白名单/安全期状态。
- MetaMask：创建方式、公开地址、SRP存在性/位置、导入账户/硬件账户关系、自定义网络/代币发现线索。
- Ledger：设备型号、24词存在性/位置、Passphrase是否启用、公开账户与链、配套应用和地址核验步骤。
- Trezor：型号/时期、备份标准、词数或份额门限、各份额位置、Passphrase是否启用、公开账户。

## Fallback paths

- Coinbase：官方账户恢复、ID验证、配置时可用 trusted contacts；死亡账户使用 Executor Services。
- Binance：官方账户恢复存在，但材料、等待期和遗产路径须实时人工核验。
- MetaMask：SRP或原社交登录组合；导入账户需对应私钥/其他SRP/外部材料。核心条件全失时无中心化恢复。
- Ledger/Trezor：正确钱包备份恢复到兼容设备；Passphrase或门限份额不足时无法由厂商替代。

## Death or incapacity

- Coinbase：A 级正式遗产流程，包含死亡证明、probate/授权文件、申请人照片 ID 和签署转移指示。
- Binance：D 级未确认，只有一般继承教育资料，不能视为操作流程。
- MetaMask/Ledger/Trezor：无托管式转移；法律授权必须与合法取得自托管恢复材料同时成立。

## CJAS template candidates

后续模板应使用存在性、位置、关联和最近复核日期字段；平台策略字段必须配置化并附 source/version。A/B 级候选详见各平台第 17 节和统一矩阵；C/D 不进入正式模板。

## Prohibited storage

不得存储完整密码、PIN、OTP、Authenticator seed、恢复码全集、SRP/助记词、私钥、keystore及密码、Passphrase、Security Key/API secret、完整身份材料或所有控制条件的集中副本。

## Evidence summary

- 官方来源记录：21
- A：8
- A/B：6
- B：4
- B/C：2
- C：1
- D：仅在 `OPEN_QUESTIONS.md`，不计为来源结论

## Open questions

主要阻塞包括 Binance 遗产流程与精确恢复/提币安全期、Coinbase 产品/地区等待期分派、MetaMask 社交登录与同步覆盖、Ledger 可选恢复产品适用范围、Trezor 型号/时期备份格式与 SLIP39 兼容。

## Expansion readiness

**CONDITIONAL YES**：目录、证据分级、模板和矩阵方法已可复用；扩大到 Batch 1 其余平台前，需 CEO/Product Architect 批准，并要求每个平台继续只使用官方来源、逐项保留产品/地区/配置差异。Pilot 5 不授权任何产品实现。
