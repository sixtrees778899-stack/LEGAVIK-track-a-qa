# CJAS v2 · Arweave 主网最小闭环 · 最终验收报告

日期: 2026-07-29
正式文件路径: ~/Documents/CJAS-mainnet/index.html
唯一URL: http://localhost:8080/
Build ID: CJAS-mainnet-1.0-20260729

## 交易信息

- Transaction ID: e5u4ROo6nWgEirK4_xWS6a3MS7mXNC-c-1SK0FZWiOE
- 广播时间: 2026-07-29 17:27:30
- 广播结果: 成功 (HTTP 202)
- 最终交易状态: 已确认（区块 1968820，观察到确认数 ≥5）
- 钱包地址: DmZsrrWZuSMpjjm-kT2wnxca8kXdMybn514NC8jjPcc
- 预计费用: 0.002761168 AR
- 实际费用: 0.002761168267 AR
- 本轮是否发起第二笔交易: 否
- 本轮是否再次签名: 否

## 文件与哈希

- 原始文件: test.pdf，663 B
- 原始文件 SHA-256: e8a8d6b25b35fea15befd1556c7988465ea1b1781949ea8ae6142d1d22effdde
- 加密文件（上传前）: 767 B
- 加密文件 SHA-256: dbaf32fef17653096d79c7aeaa2d9e156cfbb6af5ad0fcd29f1e5ce81dc6e1ca
- 下载网关: https://arweave.net
- 下载密文大小: 767 B
- 下载密文 SHA-256: dbaf32fef17653096d79c7aeaa2d9e156cfbb6af5ad0fcd29f1e5ce81dc6e1ca
- 上传与下载密文是否一致: 是（本机 curl 独立复核 + 浏览器内核验均一致）
- 解密结果: 成功
- 恢复文件路径: ~/Documents/CJAS-mainnet/test_recovered.pdf（同时保留于 ~/Downloads/test_recovered.pdf）
- 恢复文件大小: 663 B
- 恢复文件 SHA-256: e8a8d6b25b35fea15befd1556c7988465ea1b1781949ea8ae6142d1d22effdde
- 原始与恢复是否一致: 是（字节级完全一致，本机 diff 独立复核）
- 恢复 PDF 结构校验: `file` 命令识别为 "PDF document, version 1.4, 1 pages"，含合法 %PDF 头与 %%EOF 尾；可视化"能否正常打开"由 CEO 双击确认

## 已知问题：网关数据同步延迟

现象：交易在链上确认后（confirmations=2）立即尝试从网关下载数据时，arweave.net 首次返回了错误尺寸的响应（97781 B，非预期 767 B），导致哈希比对失败、解密未被触发，页面判定为 PENDING/FAIL。约15分钟后同一网关已能正确返回 767 B 数据，二次调用同一套下载/解密逻辑后立即成功。

根因：Arweave 网关的交易头（header/确认）与交易数据体（data）索引不是同步完成的，确认后数据体可能有数分钟到十几分钟的传播/索引延迟，期间部分网关会先返回占位或异常响应。

修复建议（下阶段处理，本轮不做）：
- 网关下载步骤增加自动重试（如每30秒一次，持续10-15分钟），而非单次尝试后即判定失败/待定
- 优先使用交易数据可用性探测接口（如 HEAD 请求或 `/tx/{id}` 状态字段中的数据可用标记）再发起完整下载
- 多网关下载失败时保留手动"重试网关下载"按钮，避免必须依赖控制台手动调用

## 归档清单（~/Documents/CJAS-mainnet/）

- index.html（正式页面，保留，未做任何修改）
- test.pdf（原始测试文件）
- test_recovered.pdf（恢复文件）
- ACCEPTANCE_REPORT_2026-07-29.md（本报告）

历史版本文件（~/Downloads 下的 cjas-v2-mainnet-test*.html、cjas-mainnet*.html、cjas-v7*.html、wander-connect-test.html、go.html 等）保留原位，未删除、未覆盖。

## 最终状态：PASS
