# CEO Decision Memo 001

状态：正式决策，立即生效
地位：`CJAS_Product_Blueprint_v1.0.md` 的补充基线

## 1. 加密架构

Vault 采用 CJAS 内置客户端本地加密方案：

- 使用公开标准密码学算法，不自行设计密码算法。
- 核心加密模块必须可独立审计，并保留未来开源能力。
- 所有加密、解密均在用户设备完成。
- 平台服务器永远不得获得明文、Recovery Password、完整 Data Key 或完整 Recovery Kit。
- 用户不需要安装或使用第三方加密软件。
- 平台提供统一、简单、可信的加密体验。

## 2. 账户体系

Vault MVP 采用“轻量账户管理＋完全独立恢复”。

账户可以负责登录、订单、支付、Vault 名称、创建和更新时间、版本状态、恢复演练状态、更新提醒、客服及必要公开定位信息。

账户绝不能保存 Vault 明文、Recovery Password、完整密钥、Recovery Kit 或任何可单独恢复 Vault 的信息。

即使用户停止续费、忘记账户、CJAS 网站关闭或公司停止运营，只要持有 Recovery Kit 和 Recovery Password，仍必须完成恢复。恢复能力永远不能依赖 CJAS 在线平台。

## 3. Recovery Map

Vault 的核心是 Recovery Map，而不是 Asset List。Vault 保存的是恢复知识，而不仅仅是数据。正式数据模型围绕 Asset、Location、Contact、Device、Order、Hint、Warning 和 Attachment 建立。

## 4. Recovery Kit

采用一版本一个 Recovery Kit：Version 1 对应 Kit 1，Version 2 对应 Kit 2。每个版本完全独立、互不依赖；旧 Kit 永远恢复旧版本，新 Kit 永远恢复新版本，不得共享恢复能力。

## 5. KDF

当前不锁定 Argon2id。必须完成 Argon2id 与 PBKDF2 Compatibility Study，重点验证 Chrome、Safari、Edge、Windows 和 macOS，再形成推荐报告，由 CEO 最终决策。

## 6. 产品定位

Vault 不是文件上传器、资产列表或加密工具，而是 Recovery Map Builder。Vault 帮助用户建立未来恢复资产的能力，而不是保存资产本身。

## 7. 开发原则

任何功能增加前必须回答是否提高 Recovery Confidence。Recovery Confidence 是 CJAS 第一产品指标，功能数量不是核心指标。
