# 发布流程

当前流程用于公开评审，只有 Schema 和发布门禁获得产品负责人批准后才可发布正式内容。

## 1. Draft

- 新格式和未验证内容只放在 `examples/`；
- `schemaVersion` 使用 `0.1-draft`；
- Draft Manifest 的 `status` 为 `draft`、验证状态为 `notVerified`；
- Draft Catalog 的 `status` 为 `candidate`，只放在 `examples/catalog/`；
- Draft 不进入 `macros/`、`profiles/`、`layouts/` 或生产 Catalog。

## 2. 内容验证

候选宏、App 键位方案和布局必须通过：

1. JSON Schema 和逐字段动作白名单；
2. 稳定 ID、语义版本和重复项检查；
3. 键位方案、布局到宏的引用解析；
4. Manifest 内容路径、SHA-256 和能力声明一致性；
5. 敏感字段、网络地址、脚本和可执行文件检查；
6. Manifest/Catalog canonical JSON 摘要、Ed25519 签名和撤销项匹配；
7. 维护者人工审核权限、快捷键、失败状态与回退方式。

`npm run validate` 负责前六项中的自动化部分。自动校验不能替代人工安全审核，也不配置生产信任根。

## 3. 真实硬件验证

官方兼容声明必须由维护者使用真实遥控器、目标 App 和指定无线麦版本测试，并按照 `verification-record-template.md` 保存公开记录。

- 不记录设备序列号、蓝牙地址、HID 指纹或用户数据；
- 自动化、模拟器和代码审查不能标记为 `realHardware`；
- 未通过全部关键场景时只能保留 Draft 或社区未验证状态。

## 4. Pull Request

正式内容只能通过 Pull Request 进入。PR 必须包含内容文件、Manifest、验证记录和兼容边界；所有自动检查及维护者审核通过后才能合并。

## 5. 不可变发布

- 合并后的 `packageID + version` 不原地修改；
- 修复通过新版本发布；
- Manifest 使用目标文件原始字节的 SHA-256；
- Manifest 和 Catalog 签名覆盖移除顶层 `signature` 后的 canonical JSON UTF-8；
- Catalog 的 `manifestDigest` 使用包含签名的 Manifest canonical JSON SHA-256；
- Catalog 根据已审核 Manifest 生成，不手工覆盖 `latest`；
- 客户端只安装固定版本并在本机复核摘要、能力和授权。

## 6. 撤销

发现明确安全风险时可以从后续 Catalog 中下架版本，并通过递增 `revocations.revision` 发布按 package/version、签名 key ID 或内容摘要匹配的撤销项与风险提示，但不得静默替换原文件、远程执行替代宏或修改用户本地配置。Draft Schema 和示例不定义生产信任根、密钥轮换或在线分发地址。
