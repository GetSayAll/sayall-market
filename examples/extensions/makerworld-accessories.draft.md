# MakerWorld 外壳与底座外部链接（Draft）

- 内容类型：外部外壳、底座 / 配件介绍
- 内容状态：`draft`
- 来源状态：外部公开链接目录
- 发布仓库：`GetSayAll/sayall-market`
- 许可证说明：本文件只记录外部页面链接；模型文件、图片、商标和其他页面内容仍以原始作者及平台规则为准

## 展示条目

### 3D 打印外壳

用于展示与无线麦SayAll.app 语音遥控器相关的 3D 打印外壳项目。

![3D 打印外壳的实物预览](https://makerworld.bblmw.cn/makerworld/model/DSM00000002959835/design/58603c32df673d7a.jpg?x-oss-process=image/resize,w_1000/format,webp/ignore-error,1)

[在 MakerWorld 查看](https://makerworld.com.cn/zh/models/2959835-vibegrip-ma-shang-wo-wei-vibe-coding-zuo-de-xiao-m?appSharePlatform=sayall.app)

### 3D 打印外壳迭代版

作为第二个外部 3D 打印外壳入口，用于查看原始页面与图片。

![3D 打印外壳握持视角的实物预览](https://makerworld.bblmw.cn/makerworld/model/DSM00000002959835/design/3c9cd7eb831fc197.jpg?x-oss-process=image/resize,w_1000/format,webp/ignore-error,1)

[在 MakerWorld 查看](https://makerworld.com.cn/zh/models/2959835-vibegrip-ma-shang-wo-wei-vibe-coding-zuo-de-xiao-m?appSharePlatform=wx#profileId-3474299)

### 3D 打印底座

用于展示与无线麦使用场景相关的外部 3D 打印底座项目。

[在 MakerWorld 查看](https://makerworld.com.cn/models/3017370?appSharePlatform=sayall.app)

### 3D 打印带壳适配底座

为安装 3D 打印外壳后的遥控器提供直立放置方案。

![3D 打印带壳适配底座的实物预览](https://makerworld.bblmw.cn/makerworld/model/CN954b30364fb30d/design/740a96c4a2ed4e6a.jpg?x-oss-process=image/resize,w_1000/format,webp/ignore-error,1)

[在 MakerWorld 查看](https://makerworld.com.cn/zh/models/3079776-xiao-mi-lan-ya-yao-kong-qi-2-pro-dai-wai-ke-di-zuo?appSharePlatform=sayall.app#profileId-3624439)

### 3D 打印倾斜底座

原始页面标题为「小米蓝牙遥控器2底座」，用于查看倾斜底座项目的原始页面。

![3D 打印倾斜底座的实物预览](https://makerworld.bblmw.cn/makerworld/model/CNdf460a270de32e/design/1901021298adb6de.jpg?x-oss-process=image/resize,w_1000/format,webp/ignore-error,1)

[在 MakerWorld 查看](https://makerworld.com.cn/models/3095313?appSharePlatform=sayall.app)

### 3D 打印 Apple TV 遥控器底座

原始页面为 Apple TV 遥控器底座项目，用于查看一体成型底座的原始页面。

![3D 打印 Apple TV 遥控器底座的实物预览](https://makerworld.bblmw.cn/makerworld/model/CN5adbfd8c5a23ba/design/2025-08-04_7d62fdf7eaeb78.jpg?x-oss-process=image/resize,w_1000/format,webp/ignore-error,1)

[在 MakerWorld 查看](https://makerworld.com.cn/models/1463694?appSharePlatform=sayall.app)

## 公开边界

- 这里只做外部页面索引，不复制模型文件、图片或页面正文；
- 任何 MakerWorld 链接进入官网开放市场展示前，都必须核对并提供来自原始页面、可公开访问的图片预览；没有已核实图片的条目只能继续留在待核对草稿中；
- 图片预览使用原始平台公开资源，不使用截图、重绘或生成图片替代，也不把图片文件提交到本仓库；
- 不声明外壳或底座适配某个具体遥控器型号，除非后续有公开验证记录；
- 不声明 SayAll 官方制造、销售、授权、质量担保或售后；
- 不把外部链接当成可安装的 SayAll 扩展包；
- 如发现来源、版权、链接或描述有问题，应在正式发布前修正或撤回。

## 图片获取方法（维护者备注）

MakerWorld 的模型页是单页应用，并且有 Cloudflare 托管挑战前置：直接请求页面 HTML 只能拿到「请稍候…」挑战页，读不到 `og:image`（curl、`r.jina.ai`、无头浏览器均如此）。站点的 JSON 接口没有这层拦截，可以直接读取：

```
https://makerworld.com.cn/api/v1/design-service/design/<模型ID>
```

在浏览器中打开上述地址即可看到返回的 JSON，其中可用于取图的字段：

| 字段 | 内容 |
| --- | --- |
| `designExtension.real_pictures[].url` | 作者上传的实拍图，优先使用 |
| `designExtension.design_pictures[].url` | 页面图库中的其余图片，可能混有渲染图 |
| `coverUrl` | 平台封面，常见为带文字的合成宣传图，选用需谨慎 |
| `instances[].plates[].thumbnail` | 打印板缩略图 |

使用注意：

- 图片完整地址已在 JSON 中给出，主机名为 `makerworld.bblmw.cn`。路径中的 `model/CNxxxxxxx` 或 `model/DSM0000000xxxxxxx` 是平台内部模型 UID，与页面地址里显示的模型 ID 不是一回事，**不要自行拼接地址**，一律取接口返回值。
- 确认图片后追加 `?x-oss-process=image/resize,w_1000/format,webp/ignore-error,1` 控制体积，与本文件其余条目保持一致。
- 同一模型常有多张不同配色、不同视角的图，选定后要与目标页面做视觉比对，确认是同一张；再用 `curl -o /dev/null -w '%{http_code}'` 确认返回 `200` 且 `content-type` 为图片类型。
- 截图只用于比对定位，不作为展示图；本仓库不提交任何图片文件。
