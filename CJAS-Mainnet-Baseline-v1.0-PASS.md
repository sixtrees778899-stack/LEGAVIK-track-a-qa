# CJAS v2 · Arweave 主网最小闭环 · 最终验收报告 (Baseline v1.0)

- 报告生成时间: 2026-07-29
- 正式文件路径: ~/Documents/CJAS-mainnet/index.html
- 唯一URL: http://localhost:8080/
- Build ID: CJAS-mainnet-1.0-20260729

---

## 一、交易信息

| 项目 | 内容 |
|---|---|
| Transaction ID | e5u4ROo6nWgEirK4_xWS6a3MS7mXNC-c-1SK0FZWiOE |
| 广播时间 | 2026-07-29 17:27:30 |
| 广播结果 | 成功（HTTP 202） |
| 区块高度 | 1968820 |
| 确认数 | 5（2026-07-29 17:43:57 观测值，持续增长） |
| 实际费用 | 0.002761168267 AR |
| 钱包地址 | DmZsrrWZuSMpjjm-kT2wnxca8kXdMybn514NC8jjPcc |
| 本轮是否存在第二笔交易 | 否 |
| 本轮是否再次签名 | 否 |

---

## 二、文件与哈希核验

| 项目 | 内容 |
|---|---|
| 原始文件 | test.pdf，663 B |
| 原始文件完整SHA-256 | e8a8d6b25b35fea15befd1556c7988465ea1b1781949ea8ae6142d1d22effdde |
| 上传密文大小 | 767 B |
| 上传密文完整SHA-256 | dbaf32fef17653096d79c7aeaa2d9e156cfbb6af5ad0fcd29f1e5ce81dc6e1ca |
| 下载网关 | https://arweave.net |
| 下载密文大小 | 767 B |
| 下载密文完整SHA-256 | dbaf32fef17653096d79c7aeaa2d9e156cfbb6af5ad0fcd29f1e5ce81dc6e1ca |
| 上传与下载密文是否一致 | 是 |
| 恢复文件路径 | ~/Documents/CJAS-mainnet/test_recovered.pdf（同时保留于 ~/Downloads/test_recovered.pdf） |
| 恢复文件大小 | 663 B |
| 恢复文件完整SHA-256 | e8a8d6b25b35fea15befd1556c7988465ea1b1781949ea8ae6142d1d22effdde |
| 原始与恢复是否一致 | 是（字节级完全一致，本机 diff 独立复核） |
| 恢复PDF可否正常打开 | 结构校验通过（macOS `file` 命令识别为 "PDF document, version 1.4, 1 pages"，%PDF 头与 %%EOF 尾均合法）；最终视觉打开确认由 CEO 完成 |

---

## 三、首次网关异常与重试记录

| 时间 | 事件 |
|---|---|
| 17:28:19 | 首次尝试下载，https://arweave.net 返回 97781 B（非预期767 B），SHA-256不一致；ar-io.net / g8way.io 当时连接失败（Failed to fetch） |
| 17:28:25 | 首轮判定 PENDING/FAIL，解密未执行 |
| 约17:31 起 | 本机独立 curl 复核，确认 arweave.net 已能正确返回 767 B、哈希一致的密文（网关数据已完成传播/索引） |
| 17:43:41 | 在同一未刷新浏览器标签页内，通过控制台重新调用页面既有函数 `phase3(STATE.txId)`（未重连钱包、未重新签名、未产生新交易），复用内存中原有密钥 |
| 17:43:57 | https://arweave.net 返回 767 B，SHA-256一致；解密成功；触发 test_recovered.pdf 下载 |
| 17:44:02 | 页面最终状态：PASS |

根因：Arweave 网关的交易头（确认）与交易数据体（data）索引非同步完成，确认后数据体存在数分钟至十几分钟的传播延迟，期间部分网关会先返回异常尺寸/错误响应。

---

## 四、当前环境状态

| 项目 | 内容 |
|---|---|
| 本地8080测试服务器 | 已停止，端口已释放 |
| 正式页面文件 | 未做任何修改，原样保留 |
| 本轮页面/代码优化 | 无 |

---

## 五、最终状态

**PASS**

判定依据（全部满足）：
1. 真实主网广播成功，交易已确认；
2. 密文可通过 Transaction ID 从网关成功下载；
3. 下载密文 SHA-256 与上传前完全一致；
4. 成功解密并导出 PDF；
5. 恢复文件 SHA-256 与原始文件完全一致；
6. 本轮未发起第二笔交易，未重复签名。
