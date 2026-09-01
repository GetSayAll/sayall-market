# Draft Schemas

本目录中的 Schema 状态均为 **DRAFT / Not an implementation contract**。

它们用于公开评审产品分层、兼容边界和安全约束。负责人批准并冻结版本前，不得用于生产客户端接入或正式社区投稿。

- `macro-package.schema.json`：可复用宏包草案；
- `layout-template.schema.json`：遥控器布局模板草案；
- `marketplace-manifest.schema.json`：公开目录发布元数据草案。

宏步骤的动作和参数均采用逐字段白名单。Manifest 声明内容路径、SHA-256、许可、能力和验证状态；发布为 `official` 的内容必须引用真实硬件验证记录。

执行 `npm run validate` 可校验 Schema 自身、Draft 示例、跨文件引用、内容摘要和仓库安全边界。自动校验通过只代表格式和声明一致，不代表真实硬件验收。
