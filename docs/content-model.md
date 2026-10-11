# 公开内容模型

## 分层

```text
MacroDefinition（执行什么）
        ↓ 被引用
AppButtonProfile（某个 App 与遥控器型号的按键方案）
        ↓ 可组合为完整布局
RemoteLayoutTemplate（某种遥控器和场景的完整布局）
        ↓ 安装后形成本机实例
LocalInstalledLayout（某台 Mac / 某只遥控器的本地实例）
```

前三层可以进入公开仓库。本地安装实例、设备身份和输入框学习数据始终留在用户设备。

## 宏

宏有稳定 `macroID`、不可变发布版本、名称、说明和有序白名单步骤。多个物理按键和布局可以引用同一个宏。

第一版白名单动作：

- `openApplication`：只接受目标 App 的 bundle identifier；
- `waitForApplication`：只接受 bundle identifier 和有限状态；
- `focusLearnedTarget`：只接受 bundle identifier 和本机 profile key；
- `sendKeyboardShortcut`：只接受有限修饰键和普通按键名称；
- `builtInAction`：只接受 Schema 中枚举的内建动作。

`focusLearnedTarget` 只能引用本机 profile key；公开包不能携带实际 AX 学习数据。

动作参数由 JSON Schema 逐字段封闭，未知字段会被拒绝。公开内容不能借助参数携带 URL、脚本、命令、设备身份或用户数据。

## App 键位方案

App 键位方案使用稳定 `profileID`，声明目标 App 和一个标准遥控器型号。
macOS 方案可以使用 Bundle ID 自动匹配。
方案只声明按键、手势及其宏或内建动作引用，不携带 App 安装路径、窗口内容、用户快捷键库或设备身份。
本轮键位方案只面向 macOS。
平台记录在 `app.sayall:platform` 扩展中。
普通用户入口统一使用 `sayall.app`。
`getsayall.com` 只供中国大陆普通用户场景使用。
macOS 使用 macOS CGKeyCode。
扩展用于选择文件，不改变 1.0 读取器的动作语义。

同一键位方案中的 `controlID + gesture` 必须唯一。第一版合成与候选示例放在 `examples/profiles/`；正式系统、官方和社区内容未来分别进入 `profiles/system/`、`profiles/official/` 与 `profiles/community/`。

## 布局

布局声明遥控器标准型号、目标平台、目标 App、控制项、单击/双击/三击/长按和宏或快捷键引用。
本轮布局的 `platforms` 使用 `["macOS"]`。
布局不包含具体遥控器序列号、蓝牙地址或用户本地覆盖。

正式 `sayall-transfer 1.0` 不把平台扩展解释为执行参数。
客户端必须选择正确的平台文件。
Draft Layout 使用 `platforms` 数组表达目标平台。

## 发布版本

- `packageID`、`macroID`、`profileID` 和 `layoutID` 是稳定身份；
- `version` 是不可变内容版本；
- `schemaVersion` 是数据格式版本；
- 发布版本不原地修改，修复通过新版本完成；
- 本地修改形成 fork 或 override，不覆盖市场原件。

## 来源

目录和路径必须明确区分 `system`、`official` 和 `community`。作者声明不能把社区内容升级为官方来源。
