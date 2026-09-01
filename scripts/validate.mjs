import { createHash } from "node:crypto";
import { access, lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

const schemaFiles = {
  macro: "schemas/macro-package.schema.json",
  buttonProfile: "schemas/button-profile.schema.json",
  layout: "schemas/layout-template.schema.json",
  manifest: "schemas/marketplace-manifest.schema.json"
};

const contentDirectories = ["macros", "profiles", "layouts", "catalog", "examples"];
const forbiddenContentExtensions = new Set([
  ".app",
  ".bin",
  ".command",
  ".dylib",
  ".js",
  ".mjs",
  ".py",
  ".sh",
  ".so",
  ".ts"
]);
const allowedContentExtensions = new Set([".json", ".md"]);
const forbiddenKeyPattern = /(?:password|passwd|token|secret|credential|cookie|certificate|private[_-]?key|device[_-]?id|deviceidentifier|bluetooth[_-]?address|mac[_-]?address|serial[_-]?number|hid[_-]?fingerprint|accessibility[_-]?tree|ax[_-]?path)/i;
const forbiddenValuePattern = /(?:https?:\/\/|file:\/\/|javascript:|data:|\/bin\/(?:sh|bash|zsh)|\bosascript\b|\bcurl\b|\bwget\b|\bpowershell\b)/i;

function relativePath(filePath) {
  return path.relative(repositoryRoot, filePath).split(path.sep).join("/");
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(relativeDirectory) {
  const absoluteDirectory = path.join(repositoryRoot, relativeDirectory);
  if (!(await exists(absoluteDirectory))) {
    return [];
  }

  const entries = await readdir(absoluteDirectory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(absoluteDirectory, entry.name);
    if (entry.isSymbolicLink()) {
      errors.push(`${relativePath(entryPath)}: 内容目录不允许符号链接`);
    } else if (entry.isDirectory()) {
      files.push(...(await listFiles(relativePath(entryPath))));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files.sort();
}

async function loadJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    errors.push(`${relativePath(filePath)}: JSON 解析失败：${error.message}`);
    return null;
  }
}

function formatAjvErrors(validationErrors = []) {
  return validationErrors
    .map((error) => `${error.instancePath || "/"} ${error.message}`)
    .join("；");
}

function scanSensitiveValues(value, filePath, jsonPath = "$") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanSensitiveValues(item, filePath, `${jsonPath}[${index}]`));
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (forbiddenKeyPattern.test(key)) {
        errors.push(`${relativePath(filePath)}: ${jsonPath}.${key} 使用了禁止的敏感字段名`);
      }
      scanSensitiveValues(child, filePath, `${jsonPath}.${key}`);
    }
    return;
  }

  if (typeof value === "string" && forbiddenValuePattern.test(value)) {
    errors.push(`${relativePath(filePath)}: ${jsonPath} 包含脚本、下载或网络地址特征`);
  }
}

function assertUnique(values, filePath, description) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) {
      errors.push(`${relativePath(filePath)}: ${description} 重复：${value}`);
    }
    seen.add(value);
  }
}

function versionMatches(version, requirement) {
  const requiredParts = requirement.split(".");
  const versionParts = version.split(".");
  return requiredParts.every((part, index) => part === "x" || part === versionParts[index]);
}

function actualCapabilities(packageType, content) {
  if (packageType === "macro") {
    return [...new Set(content.steps.map((step) => step.action))].sort();
  }

  const capabilities = new Set();
  for (const binding of content.bindings) {
    capabilities.add(binding.target.kind === "macro" ? "invokeMacro" : "builtInAction");
  }
  return [...capabilities].sort();
}

function arraysEqual(left, right) {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

const ajv = new Ajv2020({ allErrors: true, strict: true });
const validators = {};

for (const [schemaType, schemaFile] of Object.entries(schemaFiles)) {
  const schemaPath = path.join(repositoryRoot, schemaFile);
  const schema = await loadJson(schemaPath);
  if (!schema) {
    continue;
  }
  if (!ajv.validateSchema(schema)) {
    errors.push(`${schemaFile}: Schema 本身无效：${formatAjvErrors(ajv.errors)}`);
    continue;
  }
  try {
    validators[schemaType] = ajv.compile(schema);
  } catch (error) {
    errors.push(`${schemaFile}: Schema 编译失败：${error.message}`);
  }
}

const macroFiles = [
  ...(await listFiles("macros")),
  ...(await listFiles("examples/macros"))
].filter((filePath) => path.extname(filePath) === ".json");
const layoutFiles = [
  ...(await listFiles("layouts")),
  ...(await listFiles("examples/layouts"))
].filter((filePath) => path.extname(filePath) === ".json");
const buttonProfileFiles = [
  ...(await listFiles("profiles")),
  ...(await listFiles("examples/profiles"))
].filter((filePath) => path.extname(filePath) === ".json");
const manifestFiles = [
  ...(await listFiles("catalog/manifests")),
  ...(await listFiles("examples/manifests"))
].filter((filePath) => path.extname(filePath) === ".json");
const classifiedJsonFiles = new Set(
  [...macroFiles, ...buttonProfileFiles, ...layoutFiles, ...manifestFiles].map((filePath) => path.resolve(filePath))
);

const macros = new Map();
const buttonProfiles = new Map();
const layouts = new Map();

for (const [schemaType, files, destination] of [
  ["macro", macroFiles, macros],
  ["buttonProfile", buttonProfileFiles, buttonProfiles],
  ["layout", layoutFiles, layouts]
]) {
  for (const filePath of files) {
    const content = await loadJson(filePath);
    if (!content) {
      continue;
    }
    scanSensitiveValues(content, filePath);

    const validate = validators[schemaType];
    if (!validate || !validate(content)) {
      errors.push(`${relativePath(filePath)}: 不符合 ${schemaType} Schema：${formatAjvErrors(validate?.errors)}`);
      continue;
    }

    const identifier =
      schemaType === "macro"
        ? content.macroID
        : schemaType === "buttonProfile"
          ? content.profileID
          : content.layoutID;
    const key = `${identifier}@${content.version}`;
    if (destination.has(key)) {
      errors.push(`${relativePath(filePath)}: 内容身份与版本重复：${key}`);
    } else {
      destination.set(key, { content, filePath });
    }

    if (schemaType === "macro") {
      assertUnique(content.steps.map((step) => step.stepID), filePath, "stepID");
    } else {
      assertUnique(
        content.bindings.map((binding) => `${binding.controlID}:${binding.gesture}`),
        filePath,
        "controlID 与 gesture 组合"
      );
    }
  }
}

for (const { content: bindingCollection, filePath } of [...buttonProfiles.values(), ...layouts.values()]) {
  for (const binding of bindingCollection.bindings) {
    if (binding.target.kind !== "macro") {
      continue;
    }
    const contentIsDraftExample = relativePath(filePath).startsWith("examples/");
    const candidates = [...macros.values()].filter(
      ({ content: macro, filePath: macroPath }) =>
        macro.macroID === binding.target.macroID &&
        versionMatches(macro.version, binding.target.versionRequirement) &&
        (contentIsDraftExample || !relativePath(macroPath).startsWith("examples/"))
    );
    if (candidates.length === 0) {
      errors.push(
        `${relativePath(filePath)}: 宏引用无法解析：${binding.target.macroID}@${binding.target.versionRequirement}`
      );
    }
  }
}

for (const filePath of manifestFiles) {
  const manifest = await loadJson(filePath);
  if (!manifest) {
    continue;
  }
  scanSensitiveValues(manifest, filePath);

  const validate = validators.manifest;
  if (!validate || !validate(manifest)) {
    errors.push(`${relativePath(filePath)}: 不符合 manifest Schema：${formatAjvErrors(validate?.errors)}`);
    continue;
  }

  const contentPath = path.resolve(repositoryRoot, manifest.contentPath);
  if (!contentPath.startsWith(`${repositoryRoot}${path.sep}`) || !(await exists(contentPath))) {
    errors.push(`${relativePath(filePath)}: contentPath 不存在或越出仓库：${manifest.contentPath}`);
    continue;
  }

  const contentBytes = await readFile(contentPath);
  const actualDigest = `sha256:${createHash("sha256").update(contentBytes).digest("hex")}`;
  if (manifest.contentDigest !== actualDigest) {
    errors.push(`${relativePath(filePath)}: contentDigest 与 ${manifest.contentPath} 不一致`);
  }

  const content = await loadJson(contentPath);
  if (!content) {
    continue;
  }
  const contentValidator = validators[manifest.packageType];
  if (!contentValidator || !contentValidator(content)) {
    errors.push(
      `${relativePath(filePath)}: contentPath 目标不符合 ${manifest.packageType} Schema：${formatAjvErrors(contentValidator?.errors)}`
    );
    continue;
  }

  const expectedPathPrefixes = {
    macro: ["macros/", "examples/macros/"],
    buttonProfile: ["profiles/", "examples/profiles/"],
    layout: ["layouts/", "examples/layouts/"]
  };
  const expectedPathPrefix = expectedPathPrefixes[manifest.packageType];
  if (!expectedPathPrefix.some((prefix) => manifest.contentPath.startsWith(prefix))) {
    errors.push(`${relativePath(filePath)}: packageType 与 contentPath 目录不一致`);
  }

  const contentID =
    manifest.packageType === "macro"
      ? content.macroID
      : manifest.packageType === "buttonProfile"
        ? content.profileID
        : content.layoutID;
  if (contentID !== manifest.packageID || content.version !== manifest.version) {
    errors.push(`${relativePath(filePath)}: packageID/version 与目标内容不一致`);
  }

  const declared = [...manifest.declaredCapabilities].sort();
  const actual = actualCapabilities(manifest.packageType, content);
  if (!arraysEqual(declared, actual)) {
    errors.push(
      `${relativePath(filePath)}: declaredCapabilities 不准确；声明 ${declared.join(", ")}，实际 ${actual.join(", ")}`
    );
  }

  if (manifest.status === "published" && manifest.contentPath.startsWith("examples/")) {
    errors.push(`${relativePath(filePath)}: published manifest 不得引用 examples/`);
  }
  if (relativePath(filePath).startsWith("catalog/manifests/") && manifest.status !== "published") {
    errors.push(`${relativePath(filePath)}: catalog/manifests/ 只能包含 published manifest`);
  }

  if (manifest.verification.status === "realHardware") {
    const recordPath = path.resolve(repositoryRoot, manifest.verification.recordPath);
    if (!recordPath.startsWith(`${repositoryRoot}${path.sep}`) || !(await exists(recordPath))) {
      errors.push(`${relativePath(filePath)}: 真实硬件验证记录不存在：${manifest.verification.recordPath}`);
    }
  }
}

for (const directory of contentDirectories) {
  for (const filePath of await listFiles(directory)) {
    const fileStat = await lstat(filePath);
    if (!fileStat.isFile() || path.basename(filePath) === ".gitkeep") {
      continue;
    }

    const extension = path.extname(filePath).toLowerCase();
    if (forbiddenContentExtensions.has(extension)) {
      errors.push(`${relativePath(filePath)}: 内容目录包含禁止的可执行或脚本文件`);
    } else if (!allowedContentExtensions.has(extension)) {
      errors.push(`${relativePath(filePath)}: 内容目录包含未允许的文件类型`);
    } else if (extension === ".json" && !classifiedJsonFiles.has(path.resolve(filePath))) {
      errors.push(`${relativePath(filePath)}: JSON 文件不在已定义的内容或 Manifest 目录中`);
    }
  }
}

if (errors.length > 0) {
  console.error(`校验失败，共 ${errors.length} 项：`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(
    `校验通过：${macroFiles.length} 个宏、${buttonProfileFiles.length} 个键位方案、${layoutFiles.length} 个布局、${manifestFiles.length} 个 manifest。`
  );
}
