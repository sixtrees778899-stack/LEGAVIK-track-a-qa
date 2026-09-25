# CEX Recovery Template

Status: `REVIEWED_CANDIDATE`; not product-connected.

## Required blocks

1. 平台法律实体、地区、账户类型和脱敏登录标识。
2. 已启用登录条件：密码、邮箱、手机、Authenticator、Passkey/Security Key。
3. 身份认证材料“存在性＋受控位置”，不保存证件全集。
4. 提币控制：交易/资金密码、2FA、白名单、新地址锁、设备限制和风控状态。
5. 每个条件的失效路径、官方恢复入口、等待期是否需要实时核对。
6. 死亡/失能路径：仅在平台有官方流程时启用。
7. 成功判断：能登录、能完成身份验证、发送限制已解除、目标地址已核验。
8. 停止条件：非官方客服、OTP索取、远程控制、陌生地址或绕过安全期。
