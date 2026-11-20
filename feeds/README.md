# Feeds

此目录保存官网开放市场读取的公开机器可读数据。

- `market-profiles.json`：键位方案列表。官网读取方案名、中英文说明、预览图、完整图和下载地址。
- 修改方案时，同时更新根目录 `README.md` 的键位方案说明和此 JSON。
- `npm run validate` 会校验字段、日期、重复项、URL、图片尺寸，以及 `sourceUrl` / `imageUrl` 指向的文件是否存在。
- 图片和 `.sayall` 文件仍保存在本仓库；官网只引用公开地址，不复制文件。
