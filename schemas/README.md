# 数据合同

导入导出、组合动作、Manifest 和 Catalog 已冻结为正式 1.0。后续版本必须保持兼容。

Schema 状态、签名规则、测试边界和兼容门禁见 [第一版数据合同](README.html)。尚未实现的布局模板仍为草案。

`.sayall` 内部使用 JSON。文件版本、最低读取版本和 App 版本独立判断。
键位方案使用 `app.sayall:platform` 扩展标记 `macOS`。
普通用户看到的官网、域名、来源链接和下载入口统一使用 `sayall.app`。
`getsayall.com` 只供中国大陆普通用户场景使用。
macOS 快捷键使用 macOS CGKeyCode。

Draft Layout 使用 `platforms` 数组标记运行平台。
完整规则见 [首版文件格式与兼容规则](../docs/portable-transfer-standard.html)。
