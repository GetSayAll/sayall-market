# Contributing

> 社区投稿当前暂停。本文档描述批准后的预期流程，不代表现在已经开始接受生产配置。

## 计划中的投稿流程

1. Fork 本仓库并从最新 `main` 创建分支。
2. 使用 `examples/` 和已冻结 Schema 创建宏或遥控器布局。
3. 在本机执行逐步骤、整宏和回退测试。
4. 填写目标 App、遥控器型号、系统版本、无线麦版本和验证边界。
5. 运行仓库校验，确认没有私密信息、脚本或悬空引用。
6. 创建 Pull Request，由自动检查和维护者审核。
7. 合并后由 GetSayAll 维护流程生成不可变发布版本和公开目录索引。

## 内容目录

- 系统内容由维护者放入 `macros/system/` 或 `layouts/system/`。
- 官方内容由维护者放入 `macros/official/` 或 `layouts/official/`。
- 社区投稿放入 `macros/community/<author>/<package>/` 或 `layouts/community/<author>/<package>/`。
- Draft、教程和未验证示例只能放在 `examples/`。

## PR 必须说明

- 内容用途和目标用户；
- 作者身份及可持续维护方式；
- 全部动作、快捷键和系统权限；
- 支持的遥控器、App 和版本；
- 实际测试过的前台、后台、未运行和焦点状态；
- 已知限制、失败判定和回退方法；
- 是否基于现有内容 fork，以及来源和差异。

## 明确拒绝

- Shell、AppleScript、JXA、JavaScript、动态库、插件和二进制；
- 远程下载并执行、隐藏 HTTP 请求；
- 读取屏幕、剪贴板、文件或环境变量；
- 设备 ID、蓝牙地址、用户数据和输入框学习特征；
- 冒充官方、隐藏危险快捷键或声称未经真实测试的兼容性；
- 包含凭据、Cookie、Token、证书或个人联系方式的配置。

## License

仓库当前没有最终 License。负责人批准 License 和贡献者授权条款前，不接受外部生产内容贡献。
