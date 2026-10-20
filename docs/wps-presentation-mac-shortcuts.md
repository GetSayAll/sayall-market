---
title: WPS 演示 · macOS 放映快捷键
subtitle: macOS 的 WPS 放映映射和验证边界
lang: zh
template: doc
theme: shadcn
status: Draft，未完成真机验收
---

## A 结论

WPS Office for Mac 支持用键盘启动和控制 PPT 放映。
WPS 官方 Mac 快捷键页列出 F5、Shift+F5、方向键、Esc、⌘B 和窗口切换键。
这些快捷键可以表达遥控器的主要 macOS 放映操作。

当前仓库新增 macOS 平台维度。
WPS 方案放在 `examples/profiles/`。
macOS 使用 `.sayall` 文件。
该方案尚未完成验收，也不进入下载包。

## B 平台维度

布局模板必须声明 `platforms`。
本轮布局使用 `["macOS"]`。
客户端不得从 App 名称推断平台。
本轮只处理 macOS。
Windows 方案暂不作为本轮验证目标。

正式 `sayall-transfer 1.0` 仍保持兼容。
现有正式包主要面向 macOS。
未来正式合同需要单独定义平台字段和 Windows 读取行为。

## C WPS Mac 放映快捷键

| 操作 | 快捷键 | 用途 | 证据状态 |
|---|---|---|---|
| 从头放映 | F5 | 从第 1 页开始放映 | ok 官方列出 |
| 从当前页放映 | ⇧F5 | 从当前页开始放映 | ok 官方列出 |
| 下一页 | Space、Return、↓、→ | 播放下一页或下一动画 | ok 官方列出 |
| 上一页 | Delete、↑、← | 返回上一页或上一动画 | warn 官方页面的方向键表存在文字冲突，需实机确认 |
| 跳到指定页 | 数字 + Return | 跳到指定页 | ok 官方列出 |
| 结束放映 | Esc | 返回编辑状态 | ok 官方列出 |
| 黑屏 | ⌘B | 暂停并显示黑屏，再按一次恢复 | ok 官方列出 |
| 白屏 | ⌘W | 暂停并显示白屏，再按一次恢复 | ok 官方列出 |
| 下一个 WPS 窗口 | ⌃Tab | 切换到下一个窗口或工作区 | warn 需在当前 WPS 版本确认 |
| 上一个 WPS 窗口 | ⇧⌃Tab | 切换到上一个窗口或工作区 | warn 需在当前 WPS 版本确认 |

Mac 键盘可能把 F5 用作系统功能键。
如果 WPS 没有收到 F5，按 Fn+F5，或检查 macOS 的功能键设置。

WPS 官方页面说明，部分 macOS 系统的快捷键可能与其他 App 冲突。
因此，表格中的 `ok` 只表示公开资料有记录，不表示本机验收完成。
`⌘B` 在编辑状态也可能表示粗体。
客户端必须只在放映状态发送这个映射。

## D 遥控器映射

| 遥控器按键 | 动作 | 说明 |
|---|---|---|
| Home 单击 | F5 | 从第 1 页进入放映 |
| Home 双击 | ⇧F5 | 从当前页进入放映 |
| OK | Space | 下一页 |
| 上 | ↑ | 上一页候选 |
| 下 | ↓ | 下一页 |
| 左 | ⌃⇧Tab | 上一个 WPS 窗口 |
| 右 | ⌃Tab | 下一个 WPS 窗口 |
| 返回 | Esc | 结束放映，回到编辑状态 |
| 关机 | ⌘B | 黑屏切换 |
| 音量+ | 系统音量增加 | 不发送 WPS 文档快捷键 |
| 音量− | 系统音量减少 | 不发送 WPS 文档快捷键 |

macOS 文件是 `examples/profiles/wps-presentation-mac.sayall`。
macOS 文件使用 `com.kingsoft.wpsoffice.mac` 作为候选 Bundle ID。
导入器和客户端仍必须在本机确认实际 Bundle ID。

## E 暂不绑定的用户意见

| 需求 | 当前处理 | 原因 |
|---|---|---|
| 三条横线跳到固定文件夹 | 暂不绑定 | 需要用户明确文件夹。公开内容不能写入用户绝对路径。 |
| 语音键插入转写批注或摘要 | 暂不绑定 | 需要转写服务、当前页上下文和批注写入能力。当前白名单没有该动作。 |
| 三击切换放映模式 | 保留为后续手势 | Schema 现在支持 `triplePress`，但当前示例先使用 Home 双击。 |

不要把“固定文件夹”和“转写批注”写成脚本或动态路径。
这类动作需要新的白名单能力、权限说明和真实验收记录。

## F 验证步骤

1. 在 macOS 打开 WPS 演示文稿。
2. 记录 WPS 版本、macOS 版本和显示器数量。
3. 在编辑状态测试 F5 和 ⇧F5。
4. 在放映状态测试 Space、方向键、Esc 和 ⌘B。
5. 打开两个 PPT，测试 ⌃Tab 和 ⇧⌃Tab。
6. 使用真实遥控器逐键测试单击和双击。
7. 记录失败按键、焦点状态和回退动作。

自动化检查不能替代真实遥控器验收。

## G 来源

- [WPS Office for Mac 快捷键](https://help.wps.com/articles/the-shortcuts-of-wps-office-for-mac/)
- [WPS Presentation 快捷键](https://help.wps.com/articles/list-of-keyboard-shortcuts-for-presentation)
- [WPS 放映快捷技巧](https://www.wps.com/academy/must-have-shortcut-tricks-in-showing-slides/1862885/)
- [WPS Office Mac Bundle ID 参考](https://bbs.wps.cn/topic/82203)
