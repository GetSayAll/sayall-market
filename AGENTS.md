# Repository Rules

## Approval gate

- 当前状态为 `Public Design Preview / Contributions Paused`。
- 未经产品负责人批准，只允许调整公开文档、Draft Schema、目录骨架和 Draft 示例。
- 禁止把 Draft 示例移动到 `macros/`、`layouts/` 或 `catalog/` 形成生产内容。
- License 未批准前不得擅自添加许可证或接受外部贡献。

## Content boundary

- 本仓库是共享 Schema、宏、遥控器布局和目录索引的公开事实来源。
- 本仓库只保存适合公开审阅和分发的内容，不提交内部服务实现、审核资料、签名基础设施或凭据。
- 所有内容必须是声明式白名单数据，不得包含脚本、二进制、动态下载或隐式网络。
- 不得提交设备身份、真实用户数据、输入框学习特征、凭据、证书或内部审核信息。

## Review

- 正式内容只通过 Pull Request 进入。
- Schema、目录、引用、能力声明和敏感信息检查必须通过。
- 官方兼容声明必须有真实遥控器和目标 App 的明确验证记录。
- 自动化和模拟测试不得表述为真实硬件验收。
