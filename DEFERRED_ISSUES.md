# Deferred Issues

以下事项不阻塞 Week 1，但不得被误报为已完成：

- 在 macOS Chrome、Safari、Edge 中执行浏览器 KDF harness 并记录设备、版本与耗时。
- 在 Windows Chrome、Edge 中执行同一 harness。
- 选择并审计一个可离线打包的 Argon2id/WASM 候选实现后，测量包体、启动、内存与性能；当前未引入外部密码学依赖。
- KDF 最终选择及正式参数仍需 CEO 在兼容性设备实测后决策。
- Windows Chrome、Edge 的 Week 2 完整浏览器闭环仍等待 Windows 设备实测。
- Recovery Map V2 已由 CEO 完成 Chrome 与 Safari 本地真实体验并通过；Safari 上传页面字体略小，记录为 P3 UI 微调，不阻塞 `v2.0.0-local-freeze`，且不得在 AR Mainnet Experience Sprint 中顺带修改。
- 正式视觉、移动端适配、账户后端和版本后台均不属于 Week 2。
- Week 3 Revision 2 Phase A 的 Chrome 真实创建、生成、保存和独立恢复已由 CEO 验收通过。
- Recovery Map V2 Final Local Freeze 的 Chrome、Safari、上传、下载与整体流程一致性已由 CEO 验收通过。
- Edge 与 Windows 的 Week 3 实机交互、保存路径和多媒体选择仍待对应设备验证。
- Week 3 Version History 仅为当前内存会话演示，不是正式账户历史后台，也不参与独立恢复。
- 自定义计划当前支持配置化模块组合、自定义分类和自定义字段；任意新问卷 schema 的可视化编辑器不属于 Week 3。
- Recovery Map V2 产品开发在 Final Local Freeze 后停止；后续仅允许独立审批的阻塞性 Bug 修复。
- 正式视觉、复杂图谱可视化和移动端专项不属于当前 Phase C 线框验收范围。
