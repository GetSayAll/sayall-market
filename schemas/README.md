# Draft Schemas

本目录中的 Schema 状态均为 **DRAFT / Not an implementation contract**。

它们用于公开评审产品分层、兼容边界和安全约束。负责人批准并冻结版本前，不得用于生产客户端接入或正式社区投稿。

- `macro-package.schema.json`：可复用宏包草案；
- `button-profile.schema.json`：单个目标 App 与遥控器型号的键位方案草案；
- `layout-template.schema.json`：遥控器布局模板草案；
- `marketplace-manifest.schema.json`：公开目录发布元数据草案。
- `marketplace-catalog.schema.json`：只读目录、Manifest 摘要、签名和撤销元数据草案。

宏步骤的动作和参数均采用逐字段白名单。Manifest 声明内容路径、SHA-256、许可、能力、验证状态和 Ed25519 签名元数据；发布为 `official` 的内容必须引用真实硬件验证记录。

Manifest 和 Catalog 的签名输入均为移除顶层 `signature` 后的 JSON：对象键递归按 UTF-16 码元顺序排序，数组保序，不加入空白，并编码为 UTF-8。Catalog 中的 `manifestDigest` 是包含 Manifest `signature` 的同一 canonical JSON 的 SHA-256。Codex Manifest 和 Catalog Draft 示例中的全零签名只用于展示字段形状，不是有效签名。网易云音乐候选 Manifest 使用 `tests/fixtures/draft-signing-public-keys.json` 中固定、公开且仅供测试的公钥提供可复验 Fixture；对应私钥从未写入仓库或文件系统。两类 Fixture 都不是生产信任根或客户端接入凭据。

执行 `npm run validate` 可校验 Schema 自身、Draft 示例、跨文件引用、确定性摘要、合同验签 Fixture、撤销 Fixture 和仓库安全边界。测试同时使用进程内临时 Ed25519 密钥和上述固定 Draft 测试公钥；不保存任何私钥。自动校验通过只代表格式、摘要和测试签名一致，不代表真实硬件验收或生产密钥验证。
