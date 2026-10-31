---
title: 键位方案的按住模式
subtitle: buttonHoldModes 能力、字段与校验的接入说明
template: doc
theme: shadcn
lang: zh
---

## A 结论

无线麦SayAll.app 已经可以在键位方案里保存「按住」效果：一个普通按键被按住时，持续执行单击动作还是长按动作。
这个效果随方案保存，也随共享包导出。

市场侧原本认不出它，带按住的方案因此过不了本仓库的清单与校验，也上不了架。
现在三处已经对齐：传输包合同接受 `profile.holdModes`，清单与校验白名单接受 `buttonHoldModes`，
能力按内容推导，不再只信声明。

已经发布的 10 套 1.0 方案不需要重发。它们没有按住设置，能力声明仍为空，行为和兼容性都不变。

## B 客户端契约

| 项目 | 约定 |
|---|---|
| 字段 | `profile.holdModes`，可选 |
| 键 | `controlID`，与 `bindings` 同一套（`power`、`up`、`home`、`volume-up` 等） |
| 值 | `once` 按住不重复；`repeatLong` 按住执行长按动作；`repeatSingle` 按住重复单击 |
| 上限 | 32 项 |
| 未设置 | 缺字段；空对象同样视为未设置，宿主继续继承基础映射 |

共享包仍是单个 `profile` 的形态。按住是方案内的一个可选字段，不新增主对象，也不改变文件结构。

能力声明：只有确实带按住设置时，才在 `requirements.capabilities` 里声明 `buttonHoldModes`。
旧读取器不认识这个能力，会拒绝整个包；给没有按住的方案误声明，会让本来能导入的包变成打不开。

## C 市场侧改动

| 位置 | 改动 |
|---|---|
| `schemas/transfer-package.schema.json` → `$defs.buttonProfile` | 新增可选 `holdModes`：键复用 `controlID` 定义，值三选一，最多 32 项 |
| `schemas/marketplace-manifest.schema.json` → `declaredCapabilities` | 枚举加入 `buttonHoldModes` |
| `scripts/transfer-contract.mjs` → `supportedTransferCapabilities` | 白名单加入该能力，否则包会被判 `unsupportedCapabilities` |
| `scripts/transfer-contract.mjs` → `transferCapabilities()` | 非空 `holdModes` 追加 `buttonHoldModes`。`validate.mjs` 的 `actualCapabilities()` 对键位方案直接调用它，不需要另改 |
| `scripts/transfer-contract.mjs` → `transferIssues()` | 带按住却未声明能力时判 `requirements:buttonHoldModes`，防止旧读取器静默丢掉按住效果 |

`minimumReaderVersion` 不变，仍是 `1.0`。兼容性由能力门控，不由版本号承担。

## D 测试与样例

- `tests/transfer-contract.test.mjs`：带按住的包推导出 `buttonHoldModes`；未声明能力被拒；空对象等同未设置；未知控制项与未知取值被 Schema 拒绝。
- `tests/marketplace-contract.test.mjs`：清单允许声明 `buttonHoldModes`，仍拒绝未知能力。
- 草稿样例 `examples/profiles/douyin-ten-key-mac-hold.example.sayall`：`up`、`down` 为 `repeatSingle`，`ok` 为 `once`，用于回归和真机导入验证。

## E 已发布的 1.0 方案要不要重发

**不需要。** 仓库现有 15 个方案样例，其中 10 套在 `key-profiles-v1.0.2` 发布包里。
这 10 套既没有 `holdModes`，`requirements.capabilities` 也是空数组，新旧客户端都能导入。

需要重发只有一种情况：想给某个已发布方案加上按住效果。步骤固定：

1. 在 App 里打开该方案，设置按住
2. 重新导出共享包，覆盖 `examples/profiles/<name>-ten-key-mac.sayall`
3. 运行 `scripts/build-downloads.py` 重新打包
4. 递增 release 版本（例如 `key-profiles-v1.0.3`），同步更新写死旧版本的四处下载链接：
   `README.md`、`README.html`、`docs/seven-app-10-key-presets.md`、`docs/seven-app-10-key-presets.html`
5. `npm run validate` 必须通过，且清单里的 `declaredCapabilities` 与实际内容一致

## F 验收

- `npm run validate` 通过：1 个宏、15 个键位方案、2 个布局、3 个 manifest、1 个 catalog，25 项测试。
- 带 `holdModes` 的样例：传输包 Schema、方案 Schema、语义校验、清单 Schema 全部通过，
  能力推导结果为 `buttonHoldModes` 加上原有动作能力。
- 不带按住的方案：能力推导与改动前完全一致。
- 未知能力仍被拒绝，提示更新客户端。
- 真机导入后按住效果生效。这一条需要实体遥控器和目标 App 验收，仓库内的自动校验不能替代。

## G 不做

- 不移动 `examples/` 里的内容到 `profiles/`，生产目录继续关闭。
- 不改许可、不改仓库范围、不动签名基础设施。
- 不因为本文重发任何已发布资产。
- 不抬高 `minimumReaderVersion`。

## H 风险

- **旧读取器整包拒收**：声明了 `buttonHoldModes` 的包在旧客户端打不开。
  所以「有才声明」必须由导出端保证，市场侧在 `transferIssues()` 里也按内容复核，不只信清单。
- **空对象与缺字段的差异**：客户端把 `holdModes: {}` 与 `nil` 都按未设置处理，市场侧同样如此。
  两者在 JSON 里形态不同，做内容摘要或人工审阅时不要误判成「已设置」。
