# SayAll Macro Market

SayAll / 无线麦的公开宏、不同 App 键位方案与遥控器布局市场。

> Status: **Public Design Preview / Contributions Paused**
> 当前公开 Schema 和示例仍为 Draft。本仓库尚未上线运行，是第一版公开内容仓库；Schema 冻结和真实硬件验证完成前，仓库可公开审阅，但暂停正式社区内容投稿和客户端生产接入。

> 命名计划：后续仓库计划更名为 **`GetSayAll/sayall-market`**。在 GitHub 实际改名前，仍使用当前仓库名和地址；改名后保留旧地址跳转并同步所有客户端、文档和 CI 引用。

## 这里存放什么

- `schemas/`：公开、版本化的数据合同；
- `macros/`：系统、官方和社区共享的宏按键；
- `profiles/`（计划）：按不同 App、场景和设备组织的键位方案；
- `layouts/`：按遥控器型号和使用场景组织的完整布局；
- `catalog/`：供 App 和网站消费的公开目录索引；
- `examples/`：只用于讨论格式的 Draft 示例；
- `docs/`：内容模型、安全边界、验证状态和仓库关系；
- `scripts/`：公开内容的本地自动校验工具；
- `CONTRIBUTING.md`：未来社区投稿流程。

## 不允许存放什么

- 未经批准的 Shell、AppleScript/JXA、JavaScript、插件、二进制或下载后执行内容；
- API Key、Token、密码、证书和其他凭据；
- 用户输入、剪贴板、文件、环境变量或窗口私密内容；
- 设备 ID、蓝牙地址、HID 指纹；
- 用户本机学习到的辅助功能树、输入框路径和窗口特征；
- 未经审查的可执行链接或隐式网络请求。

经过批准的 Shell、AppleScript/JXA 或 JavaScript 可以作为显式高风险内容进入未来版本，但必须声明能力范围、固定内容摘要、审核记录和可撤销状态；不能借助公开 Market 绕过客户端授权或远程执行任意步骤。

## 发布与审核

本仓库未来是公开共享内容的数据来源，但当前尚未上线，没有生产目录或正式客户端依赖。正式内容通过 Pull Request、自动检查和维护者审核进入；脚本类内容还必须经过人工批准、签名发布和可撤销登记。已发布版本保留公开历史，不允许绕过公开提交记录替换配置。

## 内容来源

- `system`：随客户端提供的基础预设；
- `official`：由 GetSayAll 维护和真实环境验证的官方内容；
- `community`：社区作者投稿且通过审核的内容。

来源必须明确展示。社区内容通过审核不等于获得官方背书。

## 本地优先

无线麦客户端未来下载固定、不可变的内容版本，校验后安装到本机。已安装内容离线执行；市场和移动端只能请求执行本机已安装、已批准的 `contentID`，不能携带临时步骤或脚本远程执行。

## 当前批准门禁

在 Schema 和发布流程获得产品负责人批准前：

- Draft Schema 不是实现合同；
- 示例不代表已验证兼容性；
- 不接受生产宏和布局投稿；
- 不接受未经人工批准的脚本内容；
- 不声明任何无线麦版本已经支持本仓库；

## 后续归属

- 本仓库继续保持公开、独立，不迁入 `sayall-private-platform`。
- 未来更名为 `sayall-market` 后，范围扩展为宏、App 键位方案、布局和经过批准的脚本内容。
- 私有执行实现、会员/收费授权、审核后台、签名密钥和撤销控制不放在本仓库；这些能力按需进入私有大仓库。

## 本地校验

需要 Node.js 20 或更新版本：

```bash
npm ci
npm run validate
```

校验会覆盖 Schema、本地引用、版本、内容摘要、能力声明、重复绑定、敏感字段，以及脚本、下载地址和其他禁止内容。Pull Request 和 `main` 分支推送会运行同一套 GitHub Actions 检查。

发布阶段和真实硬件验证要求见 `docs/release-process.md` 与 `docs/verification-record-template.md`。

## License

除文件中另有说明的第三方材料外，本仓库内容采用 [Creative Commons Attribution-NonCommercial 4.0 International](LICENSE)（CC BY-NC 4.0）许可。

- 可以在署名并标明修改的前提下复制、分享和改编；
- 只允许非商业用途；
- 商业授权需要另行取得 GetSayAll 的书面许可；
- 商标、专利、隐私权以及第三方材料不因本许可自动授权。

CC BY-NC 4.0 含“非商业”限制，因此不是 OSI 认可的开源软件许可证。

Copyright © 2026 GetSayAll.
