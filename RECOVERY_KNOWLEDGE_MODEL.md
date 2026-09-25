# CJAS Recovery Knowledge Model v1

状态：Vault P1 产品与数据模型基线
依据：Product Blueprint v1.0 与 CEO Decision Memo 001

## 1. 模型目的

Recovery Knowledge Model 定义 Vault 如何表达“未来怎样恢复资产的能力”。它不是资产余额清单，也不保存资产本身。模型必须让用户建立一张可维护、可验证的 Recovery Map，使本人或未来获授权的人能够理解：什么存在、在哪里、需要什么、按什么顺序行动、应联系谁、哪些行为危险。

模型的质量以 Recovery Confidence 衡量，而不是字段数量。

## 2. 核心实体

### 2.1 Asset

表示需要建立恢复路径的资产或权益，而不是资产本体。

建议字段：

- `id`：随机内部标识。
- `label`：用户可识别名称。
- `category`：硬件钱包、软件钱包、交易所、DeFi/NFT、其他。
- `existence_note`：资产存在性说明。
- `recovery_goal`：恢复完成应达到的结果。
- `location_refs`、`contact_refs`、`device_refs`、`attachment_refs`。
- `order_refs`、`hint_refs`、`warning_refs`。
- `custom_fields`。

默认不要求余额、完整私钥、助记词或钱包密码。

### 2.2 Location

表示恢复资料、设备、账户入口或线索在哪里。

- `label`：可识别名称。
- `location_type`：物理、设备内、在线服务、专业机构、其他。
- `description`：足以查找但不过度暴露的说明。
- `access_prerequisites`：到达该位置前需要满足的条件。
- `verification_note`：如何确认找对位置。

Location 不能被误解为自动提供访问权限。

### 2.3 Contact

表示恢复过程中可能需要联系的人或机构。

- 姓名或称呼、角色、联系方式。
- 何时联系、为何联系。
- 对方知道什么、不知道什么。
- 是否有替代联系人。

MVP 不通知联系人，也不向其释放任何材料。

### 2.4 Device

表示恢复依赖或可能存有线索的设备。

- 设备类型、用户可识别名称。
- 通常存放地点。
- 识别特征。
- 使用前提和风险提示。
- 相关 Asset、Location、Order。

不得默认记录设备解锁密码。

### 2.5 Order

表示恢复步骤和依赖关系，是 Recovery Map 的核心。

- `sequence`：明确顺序。
- `action`：普通语言行动说明。
- `prerequisites`：执行前置条件。
- `expected_result`：完成后应看到什么。
- `failure_action`：未达到预期时应停止或联系谁。
- `asset_refs`、`location_refs`、`contact_refs`、`device_refs`。

Order 必须支持分支、停止条件和“不要继续”的安全节点；MVP 可先实现线性步骤加条件说明。

### 2.6 Hint

表示帮助正确识别或理解恢复路径的提示，不应直接成为完整秘密。

- 提示内容。
- 适用对象或步骤。
- 显示时机。
- 误用风险。

### 2.7 Warning

表示可能造成资产损失、泄露或不可逆后果的禁止事项。

- 风险等级。
- 触发场景。
- 禁止或谨慎操作。
- 发生异常时的停止条件。
- 建议联系对象。

高风险步骤没有 Warning 时，完整性检查应提示用户补充。

### 2.8 Attachment

表示支持恢复知识的文件或证据，不是 Vault 的唯一主体。

- 随机内部 ID。
- 用户可读名称、媒体类型和大小。
- SHA-256 完整性值。
- 所属实体和用途说明。
- 是否属于高敏感内容的用户确认状态。

附件文件名不直接作为容器路径；附件只进入加密快照。

## 3. 关系模型

```text
Recovery Map
├── Asset
│   ├── Location
│   ├── Device
│   ├── Contact
│   ├── Order
│   ├── Hint
│   ├── Warning
│   └── Attachment
└── Global Recovery Guidance
    ├── Contact
    ├── Order
    ├── Hint
    ├── Warning
    └── Attachment
```

实体可以复用，例如一个 Device 或 Contact 可以关联多个 Asset。删除被引用实体前必须提示并处理引用，不能静默留下断链。

## 4. 最小完整性规则

一个可进入快照生成的 Recovery Map 至少满足：

1. 至少一个 Asset。
2. 每个 Asset 有一个明确恢复目标。
3. 每个 Asset 至少关联一个 Location 或 Contact。
4. 每个 Asset 至少有一个 Order 步骤。
5. 每个 Order 有预期结果或失败处理。
6. 高风险步骤至少有关联 Warning。
7. 每个 Attachment 可读取、大小合法且关联用途明确。
8. 所有引用都指向当前快照内存在的实体。
9. 没有重复 ID、循环依赖或无法到达的必要步骤。
10. 用户完成只读预览并确认 Recovery Map 表达准确。

## 5. Recovery Confidence

Recovery Confidence 是第一产品指标，用于判断一项功能或一个 Vault 版本是否提高实际恢复成功概率。

MVP 不应给出虚假的精确百分比分数。推荐用可解释的检查维度：

- **Coverage**：重要 Asset 是否都有恢复路径。
- **Findability**：Location、Device 和 Contact 是否足以找到起点。
- **Sequencing**：Order 是否明确、完整并有停止条件。
- **Safety**：高风险操作是否有 Warning。
- **Evidence**：必要 Attachment 是否存在且完整。
- **Freshness**：资料是否在建议周期内核对。
- **Recoverability**：当前版本是否完成独立恢复演练。

产品可显示“需要补充／可演练／已验证”三级状态。只有独立演练通过才能显示“已验证”。

## 6. 功能决策规则

任何新增字段、页面或服务必须回答：

1. 它提高哪个 Recovery Confidence 维度？
2. 用户是否更容易建立或验证恢复路径？
3. 是否增加不必要的秘密收集或单一主体控制权？
4. 是否仍支持完整快照和平台外恢复？
5. 是否可以通过失败测试证明不会降低恢复可靠性？

不能明确提高 Recovery Confidence 的功能不进入 Vault MVP。

## 7. 快照与版本

- Recovery Map 的全部实体、关系和附件构成一个完整快照。
- 每个版本复制当时完整模型，不引用旧版本实体或附件。
- 每个版本有新的 snapshot ID、密文、Data Key 和 Recovery Kit。
- 旧 Kit 只恢复对应旧快照，新 Kit 只恢复对应新快照。
- 更新提醒和演练状态可以进入轻量账户，但模型明文和完整恢复能力不能进入账户。

## 8. 非目标

- 不记录或验证资产余额。
- 不自动连接钱包盘点资产。
- 不判断法律继承权。
- 不通知 Guardian 或释放 Legacy 材料。
- 不把联系人关系解释为访问授权。
- 不保证用户填写的知识正确；通过预览和恢复演练降低错误风险。
