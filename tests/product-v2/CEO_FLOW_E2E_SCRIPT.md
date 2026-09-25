# CEO Flow Browser E2E Script

Target: `http://127.0.0.1:8080/web/v2/index.html`

This script is executed through visible browser controls only. It must not import or mutate the Canonical Store directly.

1. Reload the target and assert Dashboard shows Draft revision 0.
2. Open 资产与账户; select Binance, Australia, 个人账户; enter 主账户; click 添加账户.
3. Click 保存并继续; assert 恢复条件 contains Binance · 主账户.
4. Check 注册邮箱, 注册手机号, 登录密码存在性 and Authenticator; click 保存并继续.
5. Assert 位置与查找 contains exactly those four selected conditions.
6. Select the first three in 汇总位置, enter a summary description, save it; assert only Authenticator remains itemized.
7. Fill and save the Authenticator location.
8. In 上传位置说明附件 select the same three conditions, upload `fixtures/location-original.txt`, then replace it with `fixtures/location-replacement.txt`, delete it, and upload the replacement again.
9. Click 保存并继续; enter recovery steps and risk stop condition; click 保存并继续.
10. Choose 不需要 for assistance; continue; leave personal message blank; continue.
11. Assert Review has zero issues and open Recovery Report.
12. Return to Dashboard, enter modules 1–4, and assert account, conditions, coverage and instructions still exist.
13. Remove the Authenticator location, assert Dashboard and Review show exactly one business issue, follow its precise navigation target, restore the location and assert the issue disappears.
14. Assert Report is COMPLETE and Generation Gate is enabled.
15. Record every observed Draft revision, Store summary visible through projections, screenshots and browser console warning/error entries.
