# Crypto Recovery Materials：Recovery Map 应记录什么、不应记录什么？

**Status：PUBLISHED**

## 快速了解

Recovery Map 应记录恢复材料的类型、用途、对应资产、保管位置线索和使用顺序，而不是记录材料本身的完整秘密。Seed Phrase、Private Key、额外 Passphrase、OTP 和 Authenticator Setup Key 等高敏感材料不应作为普通内容记录或上传。

## 详细说明

Crypto Recovery Materials 可能包括：

- Recovery Phrase、Seed Phrase 或 Wallet Backup；
- Private Key；
- 额外 Passphrase；
- 硬件钱包设备；
- Keyfile 或 JSON 文件；
- 钱包登录或恢复所依赖的 Email、手机号和身份认证方式；
- 2FA Backup Code 或 Authenticator Setup Key；
- 交易所官方身份验证所需的非秘密资料；
- 用于确认地址、网络和版本的公开记录。

这些材料的作用和敏感程度不同。Recovery Map 采用 `clue-first / recovery-path` 原则，重点回答：

- 存在什么材料；
- 对应哪个钱包、账户或版本；
- 在哪里保管；
- 获得适当授权的人如何找到；
- 应在什么官方环境中使用；
- 缺失或异常时应在哪里停止。

Recovery Map 不应成为集中保存所有秘密的 Secret Vault。

Ledger、Trezor 和 MetaMask 均明确提醒，掌握 Recovery Phrase、Wallet Backup 或 Private Key 的人可能控制对应钱包，且官方客服不会替客户恢复遗失的自托管核心秘密。[Ledger Recovery Sheet](https://www.ledger.com/academy/glossary/recovery-sheet) [Trezor Hardware Wallet](https://trezor.io/learn/basics/what-is-a-hardware-wallet) [MetaMask Security Guide](https://support.metamask.io/start/user-guide-secret-recovery-phrase-password-and-private-keys)

## 客户应该怎么做

### 应记录的内容

- 材料类型；
- 对应平台、钱包或公开地址；
- 对应设备、网络或版本；
- 安全保管位置的线索；
- 是否存在额外 Passphrase；
- 是否有多份备份或多个 share；
- 使用材料前应核验的官方入口；
- 恢复步骤和停止条件；
- 必要协助人的角色与边界；
- 最后检查日期和状态。

示例：

> “该硬件钱包存在独立 Wallet Backup，保存在既定离线位置；恢复前先核对设备型号、公开地址及厂商官方说明。”

### 不应记录或上传的内容

- 完整 Seed Phrase / Recovery Phrase / Wallet Backup；
- 完整 Private Key；
- 完整额外 Passphrase；
- PIN 或钱包密码；
- OTP、验证码；
- Authenticator Setup Key；
- 可直接解密的 Keyfile 与密码组合；
- 足以让单一人员直接取得全部控制权的材料组合。

### 应建立的关联

每项恢复材料应能关联到：

- 对应资产或账户；
- 对应钱包或平台；
- 对应恢复场景；
- 对应保管位置；
- 对应使用顺序；
- 必要停止条件。

## 注意事项

- “只记录一部分秘密”不一定安全；部分内容仍可能增加猜测、钓鱼或社会工程风险。
- 应避免将 Recovery Phrase / Wallet Backup 与其对应的额外 Passphrase 集中保存在同一普通记录或同一易受影响的位置。
- Authenticator Setup Key 属于高敏感认证材料，不应作为普通恢复线索公开记录或发送给客服。
- 附件不能因为经过加密就自动视为适合集中上传。
- 材料疑似泄露、被复制或归属不明：`NEEDS REVIEW / HUMAN ESCALATION`。
- 死亡、失能、继承和法律授权安排：`NEEDS REVIEW / HUMAN ESCALATION`。

## 相关知识

- Recovery Map 填写指南
- 附件与说明材料
- Recovery Material 安全
- 如何检查 Crypto 恢复体系中的单点故障？

## 相关 Recovery Map 模块

- 资产与账户清单
- 恢复所需条件与资料
- 位置与查找
- 恢复与转移步骤
- 协助人
- 给未来恢复人的嘱托

## 来源与核验

| Official Source | Official URL | Source / Updated Date | Last Verified | Applicable Region | Risk Notes |
|---|---|---|---|---|---|
| Ledger Academy — Recovery Sheet | [Official URL](https://www.ledger.com/academy/glossary/recovery-sheet) | Published/Updated 2025-07-24 | 2026-08-20 | Ledger | Recovery Phrase 属于钱包控制材料 |
| Ledger Academy — Recovery Key | [Official URL](https://www.ledger.com/academy/topics/ledgersolutions/what-is-ledger-recovery-key) | Published/Updated 2025-07-24 | 2026-08-20 | 支持相应产品的 Ledger 设备 | 不应将特定产品能力推广到所有设备 |
| Trezor — Keeping your wallet backup safe | [Official URL](https://trezor.io/guides/backups-recovery/general-standards/keeping-your-wallet-backup-safe) | 页面未显示 | 2026-08-20 | Trezor | 官方建议保持备份离线并防止泄露 |
| Trezor — Wallet backups | [Official URL](https://trezor.io/learn/security-privacy/personal-security-standards/understanding-trezor-wallet-backups-12-20-or-24-words) | 页面未显示 | 2026-08-20 | Trezor；依备份格式适用 | Single-share、Multi-share 和 Passphrase 依赖不同 |
| MetaMask — SRP, password and private keys | [Official URL](https://support.metamask.io/start/user-guide-secret-recovery-phrase-password-and-private-keys) | 页面未显示 | 2026-08-20 | MetaMask | SRP、Private Key 和本地密码作用不同 |
| Kraken — Authenticator setup key | [Official URL](https://support.kraken.com/hc/articles/360001486466-how-to-find-the-setup-key-or-backup-code-for-authenticator-app-2fa) | 页面未显示 | 2026-08-20 | Kraken | Setup Key 可生成验证码，必须按高敏感材料保护 |

## Needs Review

- Ledger Recovery Key、托管式恢复或厂商订阅恢复服务需单独研究，不能写成通用材料。
- SLIP39、Multisig、Collaborative Wallet 等多份或多方材料需要专门文章。
- 材料疑似泄露后的真实资产保护流程不在本文定义范围内。
- 法律授权、继承和第三方保管安排必须 Human Escalation。

**与现有 APPROVED Knowledge 冲突：未发现。**

---
