---
title: SayAll Market · 技术与维护说明
subtitle: 数据格式、仓库范围、校验和发布边界
lang: zh
template: doc
theme: shadcn
---

## A 当前状态与仓库历史

当前状态为 `Public Design Preview / Contributions Paused`。
市场尚未上线，正式投稿和生产接入仍暂停。
README 面向普通用户，提供已有候选方案和配件入口。
试用文件可供手动导入，不代表生产目录已经开放。
内容发布、真实硬件验证和格式稳定是三个独立状态。

仓库名称为 `GetSayAll/sayall-market`。
仓库于 2026-09-01 从 `GetSayAll/sayall-macro-market` 改名。
旧 GitHub 地址仅保留平台重定向兼容。
新文档和客户端配置统一使用当前名称。

Full Keyboard Access 方案目前位于独立试用分支。
Full Keyboard Access 文件来源固定到提交 `4be8928eca066bcbb876bc15ffeffc02155d7109`。
README 通过试用版下载附件提供同一文件。
该链接对应现有试用文件，不改动其验收状态。
相关工作见 [PR #5](https://github.com/GetSayAll/sayall-market/pull/5)。
该 PR 保持试用状态，等待真机测试。

## B 仓库内容与归属

| 目录或文件 | 用途 |
|---|---|
| `schemas/` | 公开、版本化的数据合同 |
| `macros/` | 系统、官方和社区共享的宏按键 |
| `profiles/` | 按目标 App 和遥控器型号组织的键位方案 |
| `layouts/` | 按遥控器型号和场景组织的完整布局 |
| `catalog/` | 供 App 和网站消费的公开目录索引 |
| `examples/` | 合成示例、待验证候选和非安装内容的外部扩展介绍 |
| `docs/` | 使用说明、数据模型、验证状态和仓库关系 |
| `scripts/` | 公开内容的本地自动校验工具 |
| `CONTRIBUTING.md` | 未来社区投稿流程 |

本仓库保持公开、独立，不迁入私有仓库。
私有执行实现、会员授权、审核后台和签名密钥不放在这里。
撤销控制的私有实现也不放在这里。

## C 第一版导入导出合同

导入导出、组合动作、Manifest 和 Catalog 已冻结为第一版 `1.0`。
后续读取器必须兼容第一版。
尚未实现的布局模板仍为草案。

单个或批量方案、组合动作、App 配置和个人备份使用统一合同。
合同详见 [导入导出标准](portable-transfer-standard.html)。
分享包使用 `format: sayall-transfer` 和 `schemaVersion: 1.0`。
公开市场只接受分享用途，不提交个人备份。

8 套 App 候选方案位于 `examples/profiles/`。
它们是自包含分享包，每个文件包含一套方案及其所需动作。
每套仅使用指定的 10 个位置，手势为单击。
禁用位置明确使用 `disabled`，避免继承普通映射。
方案版本为 `0.1.0`，最低客户端版本字段为 `1.9.21`。
格式检查不构成已发布客户端的界面兼容声明。

网易云 10 键文件为 `netease-music-ten-key.candidate.json`。
喜欢歌曲快捷键由上键和主页键共同引用。
上一曲与下一曲各用一个内置媒体动作步骤表示。
共享包内嵌所需动作，导入无需另行下载依赖。
旧四键候选保留为合同与签名测试样例，不再作为 README 下载入口。

## D 内容与数据边界

禁止提交以下内容：

- 未经批准的 Shell、AppleScript/JXA 或 JavaScript。
- 未经批准的插件、二进制或下载后执行内容。
- API Key、Token、密码、证书及其他凭据。
- 用户输入、剪贴板、文件、环境变量或窗口私密内容。
- 设备 ID、蓝牙地址及 HID 指纹。
- 本机学习到的辅助功能树、输入框路径和窗口特征。
- 未经审查的可执行链接或隐式网络请求。

经过批准的脚本可以作为未来版本的显式高风险内容。
这类内容必须声明能力范围，并固定内容摘要。
还必须有审核记录和可撤销状态。
不能借助公开市场绕过客户端授权或远程执行任意步骤。
该预期流程不表示当前已接受脚本投稿。

外部扩展介绍只记录公开来源和链接。
这些条目不是客户端安装包，也不构成官方适配或售后承诺。
模型、图片和页面内容仍受原作者及平台规则约束。

## E 发布、来源和本地执行

正式内容通过 Pull Request、自动检查和维护者审核进入。
脚本内容还需人工批准、签名发布和可撤销登记。
已发布版本保留公开历史。
同一版本不得绕过公开记录静默替换。

| 来源 | 含义 |
|---|---|
| `system` | 随客户端提供的基础预设 |
| `official` | GetSayAll 维护并在真实环境验证的官方内容 |
| `community` | 社区作者投稿并通过审核的内容 |

来源必须明确展示。
社区内容通过审核不等于官方背书。
候选示例不代表已经完成兼容性验证。
官方兼容声明必须附真实遥控器和目标 App 的验证记录。
自动化与模拟检查不得写成真实硬件验收。

未来客户端下载固定、不可变的内容版本。
客户端校验后将内容安装到本机，再离线执行。
市场和移动端只能请求执行已安装、已批准的 `contentID`。
请求不得携带临时步骤或脚本。

## F 本地校验与维护入口

使用 Node.js 20 或更新版本。

```bash
npm ci
npm run validate
```

校验覆盖 Schema、引用、版本、摘要、能力声明和重复绑定。
校验还检查敏感字段、脚本、下载地址及禁止内容。
Pull Request 和 main 推送运行同一套 GitHub Actions 检查。
格式通过不代表动作已在目标 App 生效。

| 文档 | 内容 |
|---|---|
| [导入导出标准](portable-transfer-standard.html) | 第一版分享、批量传输与个人备份合同 |
| [内容模型](content-model.md) | 内容类型和引用关系 |
| [仓库范围](repository-scope.md) | 公开与私有内容边界 |
| [发布流程](release-process.md) | 内容发布阶段和审核条件 |
| [验证记录模板](verification-record-template.md) | 真实硬件与目标 App 验收记录 |
| [投稿说明](../CONTRIBUTING.md) | 投稿恢复后的预期流程 |
| [安全说明](../SECURITY.md) | 安全问题报告入口 |
| [Schema 说明](../schemas/README.html) | 数据合同入口 |

## G 下载附件

单套 JSON 和 ZIP 使用 GitHub Release 附件下载入口。
附件响应应带 `Content-Disposition: attachment`。
这样浏览器会下载文件，不直接展示 JSON。

集合版本为 `key-profiles-v0.1.0-preview.1`，保持 Pre-release。
ZIP 包含 8 个 App 分享包、全键盘试用包、说明、许可和摘要。
它不是客户端安装包，不修改方案内容，也不加入生产 Catalog。
ZIP 中的 JSON 与各来源文件逐字节一致。
发布后更新附件需使用新的集合版本，不覆盖旧附件。

操作步骤见 [下载说明](download-bundle.html)。
数据使用边界与真实硬件验收状态保持不变。

## H 许可

除另有说明的第三方材料外，仓库内容采用 CC BY-NC 4.0。
完整条款见 [LICENSE](../LICENSE)。
复制、分享和改编须署名，并标明修改。
商业授权需另行取得 GetSayAll 的书面许可。
商标、专利、隐私权及第三方材料不因该许可自动授权。

CC BY-NC 4.0 含非商业限制。
它不是 OSI 认可的开源软件许可证。

Copyright © 2026 GetSayAll.
