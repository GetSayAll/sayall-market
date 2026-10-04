# SayAll Market · 遥控器方案与配件

为无线麦SayAll.app 选择遥控器键位方案，用按键操作常用 App。
这里也收录全键盘控制方案，以及外壳、底座等配件入口。

当前内容供试用。在线市场尚未上线，社区投稿暂未开放。

## 7 个 App 的 10 键方案

选择常用 App，下载对应方案。每个文件包含一套完整方案。
以下方案适用于小米遥控器 2 Pro（RC003），全部使用单击。

| App | 常用操作 | 下载 |
|---|---|---|
| Codex | 会话切换、提交、删除、翻页、停止 | [下载方案](https://raw.githubusercontent.com/GetSayAll/sayall-market/main/examples/profiles/codex-ten-key.candidate.json) |
| Claude Code desktop | Code 页会话切换、提交、删除、翻页、停止 | [下载方案](https://raw.githubusercontent.com/GetSayAll/sayall-market/main/examples/profiles/claude-code-desktop-ten-key.candidate.json) |
| WorkBuddy | 任务切换、发送、删除、翻页、停止 | [下载方案](https://raw.githubusercontent.com/GetSayAll/sayall-market/main/examples/profiles/workbuddy-ten-key.candidate.json) |
| 微信 | 光标移动、发送、删除、翻页、隐藏窗口 | [下载方案](https://raw.githubusercontent.com/GetSayAll/sayall-market/main/examples/profiles/wechat-ten-key.candidate.json) |
| 剪映桌面版 | 逐帧移动、播放暂停、删除片段、撤销 | [下载方案](https://raw.githubusercontent.com/GetSayAll/sayall-market/main/examples/profiles/jianying-ten-key.candidate.json) |
| 抖音 Mac 客户端 | 切换视频、快进后退、播放暂停、音量、隐藏窗口 | [下载方案](https://raw.githubusercontent.com/GetSayAll/sayall-market/main/examples/profiles/douyin-ten-key.candidate.json) |
| Chrome | 切换标签、刷新、后退、主页、翻页、关闭标签 | [下载方案](https://raw.githubusercontent.com/GetSayAll/sayall-market/main/examples/profiles/chrome-ten-key.candidate.json) |

10 个位置为：上、下、左、右、OK、返回、主页、音量+、音量-、关机。
没有合适动作的位置设为“不设置”。
这些方案使用已有快捷键，无需在目标 App 添加快捷键。

查看 [完整按键和导入说明](docs/seven-app-10-key-presets.html)（[在线文字版](docs/seven-app-10-key-presets.md)）。
剪映的音量+暂不设置，待确认放大时间线的默认按键。

## Full Keyboard Access · 全键盘控制

用遥控器选择屏幕上的按钮、输入框和其他可操作项目。
此方案适用于小米遥控器 2 Pro（RC003），供手动选择使用。

[下载全键盘控制试用方案](https://raw.githubusercontent.com/GetSayAll/sayall-market/4be8928eca066bcbb876bc15ffeffc02155d7109/examples/transfers/full-keyboard-access.json)

使用前，打开 Mac 的「系统设置 → 辅助功能 → 键盘」。
开启「全键盘控制」，再导入并选择此方案。
方案不会自动开启系统设置。

方案配置以下 6 个单击按键：

| 遥控器按键 | 操作 |
|---|---|
| 上 | 选择上一个可操作项目 |
| 下 | 选择下一个可操作项目 |
| 左 | 向左移动 |
| 右 | 向右移动 |
| OK | 执行当前选中的项目 |
| 返回 | 返回或取消 |

上下键按界面的选择顺序移动，不一定对应屏幕上的上下方向。
左右键的效果取决于当前选中的控件。
此方案仍待实体遥控器和目标 App 验收。

## 如何导入方案

1. 点击下载链接，保存方案文件。
2. 打开无线麦SayAll.app 的「键位方案」。
3. 选择「导入」，再选择下载的文件。
4. 检查方案名称、遥控器型号和全部按键。
5. 保存后，按需要选择或启用方案。

若浏览器显示文件内容，请另存为 `.json` 文件。
不要保存成网页或 `.txt` 文件。

需要使用已提供键位方案导入功能的客户端。
若没有导入入口，请检查客户端版本及功能权限。
导入后，请检查预览中的提示，再启用所需方案。

## 更多方案与配件

| 内容 | 用途 | 入口 |
|---|---|---|
| 网易云音乐方案 | 播放暂停、调节音量和静音 | [下载试用方案](https://raw.githubusercontent.com/GetSayAll/sayall-market/main/examples/profiles/netease-music-media-controls.candidate.json) |
| 3D 打印外壳与底座 | 查看相关配件和制作项目 | [查看官网市场](https://sayall.app/market/) |

网易云音乐方案适用于小米遥控器 2 Pro（RC003）。
静音操作使用菜单键，请先核对自己的遥控器按键。

配件入口指向无线麦SayAll.app 官网市场。
请在具体项目页面核对适配型号、制作说明及作者许可。

## 使用提示

这些方案尚未完成全部 App 与实体遥控器验收。
先检查每个按键的实际效果，再用于日常操作。

翻页、删除和方向移动会受到当前选中位置的影响。
Codex 的上键是否立即补充运行中指令，取决于现有发送行为。
微信和抖音的关机键用于隐藏窗口，App 会继续运行。
抖音方案面向 Mac 客户端，请勿用于浏览器中的抖音网页。

需要帮助或反馈使用问题，可在 [Issues](https://github.com/GetSayAll/sayall-market/issues) 中说明。
请写明 App、遥控器型号、按键和实际结果。

## 技术与维护文档

开发和维护人员请查看 [技术与维护说明](docs/maintainer-guide.html)（[在线文字版](docs/maintainer-guide.md)）。

## 使用许可

本站整理的内容采用 [CC BY-NC 4.0](LICENSE) 许可。
分享或改编时，请署名并标明修改。商业使用需另行取得书面许可。
外部配件、图片和模型按原作者及平台规则使用。

Copyright © 2026 GetSayAll.
