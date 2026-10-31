---
title: 键位方案的按住模式：市场侧待办
subtitle: buttonHoldModes 能力、Schema 与校验的改动清单
template: doc
theme: shadcn
lang: zh
---

## A 结论

无线麦SayAll.app 已经可以在键位方案里保存「按住」效果：一个普通按键被按住时，持续执行单击动作还是长按动作。
这个效果随方案保存，也随共享包导出。

市场侧目前还不认识它。结果是：**带按住设置的方案现在无法通过本仓库的清单与校验，也无法上架**。
反过来，已经发布的 10 套 1.0 方案**不需要重发**，它们没有按住设置，行为和兼容性都不会变。

本文列出需要改的四处、验证方式和已有的 1.0 方案该怎么处理。

## B 现状核对

核对基准：`origin/main` 的 `b68d8f3`。

| 位置 | 现状 | 影响 |
|---|---|---|
| `schemas/marketplace-manifest.schema.json` → `declaredCapabilities.items.enum` | 9 项能力，没有 `buttonHoldModes` | 带按住的清单直接过不了 Schema |
| `scripts/transfer-contract.mjs:4` → `supportedTransferCapabilities` | 同上 9 项 | 包里声明该能力会被判 `unsupportedCapabilities` |
| `scripts/validate.mjs:134` → `actualCapabilities()` | 只从 `bindings` 推导 `invokeMacro` / `builtInAction` | 声明与实际不一致，校验必然报错 |
| `schemas/transfer-package.schema.json` → `$defs.buttonProfile` | `additionalProperties: false`，字段表里没有 `holdModes` | 带按住的传输包过不了 Schema |
| `examples/profiles/*.sayall`（14 个） | `requirements.capabilities` 全为 `[]`，没有 `holdModes` 字段 | 仍可导入，行为等于全部继承基础映射 |

客户端侧的契约，市场只需要对齐三点：

1. 方案里多一个可选字段 `holdModes`：对象，键是控制项（`controlID`），值是 `once` / `repeatLong` / `repeatSingle`。
2. 缺字段表示「未设置」，宿主继续继承基础映射；空对象也应视同未设置。
3. 只有确实带按住设置时才声明 `buttonHoldModes` 能力。**没有按住的方案不要声明**——旧读取器不认识这个能力，会整包拒绝，本来能打开的包会变成打不开。

## C 需要改的四处

### C1 传输包 Schema 接受 `holdModes`

`schemas/transfer-package.schema.json` 的 `$defs.buttonProfile` 是封闭对象（`additionalProperties: false`），需要新增：

- `holdModes`：`object`，`maxProperties: 32`
- 键：沿用 `controlID` 定义
- 值：`enum ["once", "repeatLong", "repeatSingle"]`
- 不加入 `required`

### C2 市场清单允许声明该能力

`schemas/marketplace-manifest.schema.json` 的 `declaredCapabilities.items.enum` 增加 `buttonHoldModes`。

### C3 传输契约白名单增加该能力

`scripts/transfer-contract.mjs:4` 的 `supportedTransferCapabilities` 增加 `buttonHoldModes`，否则 C1/C2 改完仍然会被这一步拦下。

### C4 校验脚本按内容推导该能力

`scripts/validate.mjs` 的 `actualCapabilities()` 现在只看 `bindings`。需要加一条：读取方案里的 `holdModes`，**非空**时追加 `buttonHoldModes`。

同时要处理两种内容形态：已发布的 `.sayall` 是单个 `profile`，当前客户端导出的包是 `buttonProfiles` 数组（见 H 节）。推导逻辑必须两种都能读，否则校验会随内容形态不同而漏判或抛错。

### C5 补测试与样例

- `tests/fixtures/transfer-compatibility.json`：增加「声明 `buttonHoldModes` 且读取器支持」的用例，保留「未知能力一律拒绝」的用例。
- `tests/` 增加断言：带 `holdModes` 的包能被 `actualCapabilities` 推导出 `buttonHoldModes`；不带按住的包推导结果不受影响。
- 示例：可在 `examples/profiles/` 增一个带按住的 draft，用于回归；不得移动到 `profiles/`。

## D 已有的 1.0 方案要不要重发

**不需要。** 现在释放的 10 套（`examples/profiles/*.sayall`，打包成 `key-profiles-v1.0.2`）里既没有 `holdModes`，`requirements.capabilities` 也是空数组，新旧客户端都能导入。

需要重发只有一种情况：**想给某个已发布方案加上按住效果**。步骤是固定的：

1. 在 App 里打开该方案，设置按住
2. 重新导出共享包，覆盖 `examples/profiles/<name>-ten-key-mac.sayall`
3. 运行 `scripts/build-downloads.py` 重新打包
4. 递增 release 版本（例如 `key-profiles-v1.0.3`），更新 README 下载链接
5. `npm run validate` 必须通过，且清单里的 `declaredCapabilities` 与实际内容一致

## E 验收标准

- `npm run validate` 通过。
- 带 `holdModes` 的样例包：Schema 校验通过，`actualCapabilities` 结果为 `buttonHoldModes` + 原有动作能力。
- 不带按住的包：清单能力声明与改动前完全一致（回归）。
- 未知能力仍然被拒绝，提示更新客户端。
- 文档：`docs/portable-transfer-standard.md` 的能力说明补一句 `buttonHoldModes` 的含义与「仅确有设置时声明」。

## F 不做

- 不移动 `examples/` 里的内容到 `profiles/`，生产目录继续关闭。
- 不改许可、不改仓库范围、不动签名基础设施。
- 不因为本文就重发任何已发布资产。

## G 风险

- **旧读取器整包拒收**：只要声明了 `buttonHoldModes`，不认识该能力的旧客户端会拒绝整个包。所以「有才声明」必须由导出端保证，市场侧在 C4 里也要按内容校验，不能只信清单。
- **两种内容形态并存**：只处理一种形态会让另一类包漏过能力校验（详见 H 节）。

## H 附带发现（建议单独开工作项）

这两条不在按住模式范围内，但会影响上面的校验是否真的生效：

1. `schemas/button-profile.schema.json` 只有一个 `properties.buttonProfiles`，既没有 `required`，也没写 `additionalProperties`。结果是**任何对象都能通过**这套方案 Schema，包括现在实际发布的单 `profile` 形态。校验器报「方案通过」，并不代表方案结构被检查过。
2. `scripts/validate.mjs` 的 `actualCapabilities()` 假定内容是单个 `profile`（`content.bindings`），而当前客户端导出的是 `buttonProfiles` 数组。两种形态混用时，能力推导要么抛错，要么静默漏判。

建议把「统一方案内容的权威形态」单独作为一项工作，再在其上叠加按住能力。
