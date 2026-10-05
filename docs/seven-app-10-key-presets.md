---
title: 8 个 App · 遥控器 10 键方案
subtitle: 无线麦SayAll.app · 下载 JSON 后在 Mac App 导入
lang: zh
template: doc
theme: shadcn
status: 候选方案，待真机验收
---

## A 下载方案

**[一键下载全部方案 ZIP](https://github.com/GetSayAll/sayall-market/releases/download/key-profiles-v0.1.0-preview.3/sayall-key-profiles-v0.1.0-preview.3.zip)**

ZIP 包含本页 8 套 App 方案和 Full Keyboard Access 试用方案。
先解压 ZIP，再按需导入其中的 `.sayall` 文件。
完整步骤见 [打包下载与导入说明](download-bundle.html)。

每个 JSON 文件包含一套方案及其所需动作。
适用遥控器：小米遥控器 2 Pro（RC003）。
全部使用单击，不设置双击或长按。
这些文件供手动导入，市场尚未上线。

| App | 下载文件 |
|---|---|
| Codex | [下载方案](https://github.com/GetSayAll/sayall-market/releases/download/key-profiles-v0.1.0-preview.3/codex-ten-key.candidate.sayall) |
| Claude Code desktop | [下载方案](https://github.com/GetSayAll/sayall-market/releases/download/key-profiles-v0.1.0-preview.3/claude-code-desktop-ten-key.candidate.sayall) |
| WorkBuddy | [下载方案](https://github.com/GetSayAll/sayall-market/releases/download/key-profiles-v0.1.0-preview.3/workbuddy-ten-key.candidate.sayall) |
| 微信 | [下载方案](https://github.com/GetSayAll/sayall-market/releases/download/key-profiles-v0.1.0-preview.3/wechat-ten-key.candidate.sayall) |
| 剪映桌面版 | [下载方案](https://github.com/GetSayAll/sayall-market/releases/download/key-profiles-v0.1.0-preview.3/jianying-ten-key.candidate.sayall) |
| 抖音 Mac 客户端 | [下载方案](https://github.com/GetSayAll/sayall-market/releases/download/key-profiles-v0.1.0-preview.3/douyin-ten-key.candidate.sayall) |
| Chrome | [下载方案](https://github.com/GetSayAll/sayall-market/releases/download/key-profiles-v0.1.0-preview.3/chrome-ten-key.candidate.sayall) |
| 网易云音乐 | [下载方案](https://github.com/GetSayAll/sayall-market/releases/download/key-profiles-v0.1.0-preview.3/netease-music-ten-key.candidate.sayall) |

单套入口下载独立 JSON 附件。
ZIP 不直接导入 Mac App。
格式为 `sayall-transfer 1.0`，方案版本为 `0.1.0`。
文件的最低客户端版本字段为 `1.9.21`。
需使用已包含第一版导入功能的客户端。
格式验证不代表已安装客户端的界面验收。

## B 在 Mac App 导入

1. 下载需要的 JSON 文件。
2. 打开无线麦SayAll.app 的「键位方案」。
3. 选择导入，再选择 JSON 文件。
4. 检查方案名称、遥控器型号和全部按键。
5. 确认后保存，再按需要选择或启用方案。

导入需要客户端提供键位方案功能及相应访问权限。
导入器会检查最低版本和遥控器型号。
缺少目标 App 时，导入预览会显示提示。
导入后，App 自动切换规则默认停用。
保存不会立即替换当前正在使用的方案。
启用前，请检查目标 App 和按键效果。

“不设置”表示该键不发送动作。
空键不会沿用该位置的普通映射。
这些方案只调用已有快捷键和系统媒体控制功能。
无需在目标 App 添加快捷键。
不包含复制、粘贴、换行或多步清空操作。

## C AI App 的按键

符号：⌘ = Command，⌃ = Control，⌥ = Option，⇧ = Shift。
⌫ = Backspace，删除光标前的字符。

| 遥控器按键 | Codex | Claude Code desktop | WorkBuddy |
|---|---|---|---|
| 上 | ⌘ Return：Steer 候选 | 不设置 | 不设置 |
| 下 | 不设置 | 不设置 | 不设置 |
| 左 | ⌃ ⇧ Tab：上一个会话 | ⌃ ⇧ Tab：上一个会话 | ⌘ [：上一个任务，方向待验 |
| 右 | ⌃ Tab：下一个会话 | ⌃ Tab：下一个会话 | ⌘ ]：下一个任务，方向待验 |
| OK | Return：提交 / 确认 | Return：提交 / 确认 | Return：发送 / 确认 |
| 返回 | ⌫：删除字符 | ⌫：删除字符 | ⌫：删除字符 |
| 主页 | 不设置 | 不设置 | 不设置 |
| 音量+ | Page Up：向上翻一屏 | Page Up：向上翻一屏 | Page Up：向上翻一屏 |
| 音量- | Page Down：向下翻一屏 | Page Down：向下翻一屏 | Page Down：向下翻一屏 |
| 关机 | Esc：停止 / 取消 | Esc：停止回复 | Esc：停止生成 |

Claude 方案面向 Claude Desktop 的 Code 页。
Codex 上键发送 ⌘ Return。
是否立即 Steer 取决于现有后续消息行为。
如果当前行为是排队，该键不能保证立即 Steer。
WorkBuddy 的任务切换方向仍需实际验收。

## D 微信、剪映、抖音和 Chrome 的按键

| 遥控器按键 | 微信 | 剪映桌面版 | 抖音 Mac 客户端 | Chrome |
|---|---|---|---|---|
| 上 | ↑：光标 / 列表上移 | 不设置 | ↑：上一条视频 | Page Up |
| 下 | ↓：光标 / 列表下移 | 不设置 | ↓：下一条视频 | Page Down |
| 左 | ←：光标左移 | ←：上一帧 | ←：视频后退 | ⌘ ⌥ ←：上一个标签页 |
| 右 | →：光标右移 | →：下一帧 | →：视频快进 | ⌘ ⌥ →：下一个标签页 |
| OK | Return：发送 / 确认 | Space：播放 / 暂停 | Space：播放 / 暂停 | ⌘ R：刷新当前标签页 |
| 返回 | ⌫：删除字符 | ⌫：删除选中片段，待验 | Esc：退出全屏，候选 | ⌘ ←：返回上一页 |
| 主页 | 不设置 | 不设置 | 不设置 | ⌘ ⇧ H：打开现有主页 |
| 音量+ | Page Up | 不设置：放大键值待确认 | 增大系统音量 | Page Up |
| 音量- | Page Down | Page Down | 减小系统音量 | Page Down |
| 关机 | ⌘ H：隐藏窗口 | ⌘ Z：撤销 | ⌘ H：隐藏窗口 | ⌘ W：关闭当前标签页 |

微信方向键用于光标或列表导航，不保证切换聊天。
微信 Return 遵循现有发送模式。
剪映放大时间线的默认键值未确认，音量+暂不发送动作。
剪映音量-保留 Page Down，不将它解释为缩小时间线。

抖音 Esc 的资料来自网页版，Mac 客户端效果待验。
抖音音量键改变系统音量，不改变播放器音量滑块。
⌘ H 隐藏目标 App 的全部窗口，App 继续运行。
抖音方案不能用于网页标签，否则会隐藏浏览器。

Chrome 主页键使用现有主页地址。
关闭最后一个标签页时，Chrome 可能关闭窗口。

## E 网易云音乐 · 第 8 套方案

适用 macOS 网易云音乐。
上键和主页键均用于喜欢歌曲。
喜欢歌曲使用用户提供的快捷键页中的全局键值。

| 遥控器按键 | 操作 | 发出的键值 |
|---|---|---|
| 上 | 喜欢歌曲 | ⌥ ⌘ L |
| 下 | 不设置 | — |
| 左 | 上一曲 | 系统 Previous Track 媒体键 |
| 右 | 下一曲 | 系统 Next Track 媒体键 |
| OK | 播放 / 暂停 | 系统 Play / Pause 媒体键 |
| 返回 | 返回 / 取消 | Esc |
| 主页 | 喜欢歌曲 | ⌥ ⌘ L |
| 音量+ | 增大系统音量 | 系统 Volume Up 媒体键 |
| 音量- | 减小系统音量 | 系统 Volume Down 媒体键 |
| 关机 | 隐藏网易云音乐窗口 | ⌘ H |

上键和主页键引用同一个快捷键。
无需修改网易云音乐的快捷键设置。
使用现有全局快捷键时，需网易云音乐接受该键。
再次按喜欢歌曲键的效果取决于目标 App 的现有行为。

播放和切歌作用于系统当前媒体会话。
它们可能控制其他播放器，不能保证总是控制网易云音乐。
音量键改变系统输出音量，不改变网易云音乐的音量滑块。
Esc 的效果取决于当前界面或弹层。
⌘ H 隐藏 App 窗口，App 继续运行。

来源：用户提供的网易云音乐 Mac 快捷键页。
尚未完成实体遥控器和目标 App 的可见响应验收。

## F 验证状态和 App 识别

这些文件是候选数据，不是官方兼容承诺。
市场合同检查和 16 项合同测试已通过。
Mac 端已有的 8 项导入导出测试已通过。
8 个文件均通过 Debug 和 Release 库的解析、预览和安装准备。
已核对全部 80 个按键位置。
重复导入、缺失 App 提示及规则停用检查已通过。

本轮未完成已安装 App 的生产页面验收。
读取 Mac 客户端界面的工具请求超时。

安装准备检查使用模拟宿主动作序列化。
该检查不执行按键，也不证明目标 App 已响应。
尚未完成实体遥控器与全部目标 App 的功能验收。
翻页、删除、发送和方向键均受当前焦点影响。
文件不包含自动定位输入框或自动切换焦点的步骤。

| App | 用于识别的 App 标识 |
|---|---|
| Codex | `com.openai.codex` |
| Claude Desktop | `com.anthropic.claudefordesktop` |
| WorkBuddy | `com.tencent.workbuddy.mac`；旧版 `com.workbuddy.workbuddy` |
| 微信 | `com.tencent.xinWeChat` |
| 剪映专业版 | `com.lemon.lvpro` |
| 抖音 Mac 客户端 | `com.bytedance.douyin.desktop` |
| Chrome | `com.google.Chrome` |
| 网易云音乐 | `com.netease.163music` |

WorkBuddy 保留当前和已知旧版标识。
只安装其中一个版本时，另一标识可能产生缺失提示。
请在导入预览中核对自己安装的版本。

公开依据：[Codex 命令表](https://developers.openai.com/codex/reference/commands)、[Claude 快捷键](https://code.claude.com/docs/en/desktop#keyboard-shortcuts)、[Chrome 快捷键](https://support.google.com/chrome/answer/157179?co=GENIE.Platform%3DDesktop&hl=en)、[Apple 通用快捷键](https://support.apple.com/en-us/102650)。
App 标识补充依据：[Claude Cask](https://formulae.brew.sh/cask/claude)、[抖音 Cask](https://formulae.brew.sh/cask/douyin)、[剪映 App Store](https://apps.apple.com/cn/app/id1529999940)。
WorkBuddy 键值参考本机已有快捷键设置。
部分映射来自用户选定操作，实际效果仍需验收。

本页的 Markdown 是内容稿，HTML 是生成的阅读页面。
只导入下载表中的 JSON，不导入文档。
