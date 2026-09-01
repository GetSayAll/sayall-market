# Catalog

此目录未来保存由审核和发布流程生成的公开目录索引。

在 Schema 与发布流程获得批准前，不提交生产索引，也不手工维护会被客户端消费的 `latest` 指针。

计划中的 `catalog/manifests/` 只保存已发布内容的不可变 Manifest。每个 Manifest 必须包含内容相对路径、SHA-256、CC BY-NC 4.0 许可标识、能力声明和验证状态；目录索引由发布流程根据这些 Manifest 生成。
