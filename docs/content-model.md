# 公开内容模型

## 分层

```text
MacroDefinition（执行什么）
        ↓ 被引用
RemoteLayoutTemplate（哪种遥控器的哪些触发方式执行哪些宏）
        ↓ 被安装
LocalInstalledLayout（某台 Mac / 某只遥控器的本地实例）
```

只有前两层进入公开仓库。本地安装实例、设备身份和输入框学习数据始终留在用户设备。

## 宏

宏有稳定 `macroID`、不可变发布版本、名称、说明和有序白名单步骤。多个物理按键和布局可以引用同一个宏。

Draft 白名单动作：

- `openApplication`
- `waitForApplication`
- `focusLearnedTarget`
- `sendKeyboardShortcut`
- `builtInAction`

`focusLearnedTarget` 只能引用本机 profile key；公开包不能携带实际 AX 学习数据。

## 布局

布局声明遥控器标准型号、控制项、单击/双击/长按和宏引用。布局不包含具体遥控器序列号、蓝牙地址或用户本地覆盖。

## 发布版本

- `packageID`、`macroID` 和 `layoutID` 是稳定身份；
- `version` 是不可变内容版本；
- `schemaVersion` 是数据格式版本；
- 发布版本不原地修改，修复通过新版本完成；
- 本地修改形成 fork 或 override，不覆盖市场原件。

## 来源

目录和路径必须明确区分 `system`、`official` 和 `community`。作者声明不能把社区内容升级为官方来源。
