---
title: SayAll 1.0 导入导出格式
subtitle: 一个文件只声明一个主对象
---

## 结论

SayAll 方案文件使用 `format: sayall-transfer` 和 `schemaVersion: "1.0"`。客户端只读取当前单主对象格式。旧版 Market 文件不再读取。

## 主对象

| type | 主对象 | 依赖 |
|---|---|---|
| `buttonProfile` | `profile` | `dependencies.macros`、快捷键、输入框和 App |
| `macro` | `macro` | `dependencies.macros`、快捷键、输入框和 App |
| `application` | `application` | 其他应用依赖 |
| `personalBackup` | `backup` | 本机备份内容 |

一个文件只能有一个主对象。键位方案可以引用组合动作。组合动作依赖不会改变文件的 `type`。

## 导入

客户端读取 `type`，自动判断文件用途。用户不需要选择用途。

导入前检查主对象、依赖 ID、遥控器型号和来源链接。来源链接只允许 HTTPS。

## 示例

```json
{
  "format": "sayall-transfer",
  "schemaVersion": "1.0",
  "type": "buttonProfile",
  "profile": {},
  "dependencies": {
    "macros": []
  }
}
```

## 兼容边界

不要在一个文件中同时放置 `profile` 和 `macro`。不要使用旧版顶层 `roots`、`buttonProfiles` 或 `macros`。
