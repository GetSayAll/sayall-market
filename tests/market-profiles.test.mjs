import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";

import { MARKET_PROFILES_PATH, marketProfileIssues } from "../scripts/market-profiles.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function loadFeed() {
  return JSON.parse(await readFile(path.join(repositoryRoot, MARKET_PROFILES_PATH), "utf8"));
}

test("键位方案 JSON 符合 Schema 和语义规则", async () => {
  const schema = JSON.parse(
    await readFile(path.join(repositoryRoot, "schemas/market-profiles.schema.json"), "utf8"),
  );
  const feed = await loadFeed();
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);
  assert.equal(validate(feed), true, JSON.stringify(validate.errors));
  assert.deepEqual(marketProfileIssues(feed), []);
});

test("重复 ID、错误日期和错误下载文件名会被拒绝", async () => {
  const feed = await loadFeed();
  const broken = structuredClone(feed);
  broken.profiles[1].id = broken.profiles[0].id;
  broken.profiles[1].addedAt = "2026-02-31";
  broken.profiles[2].downloadUrl = broken.profiles[2].downloadUrl.replace(
    `${broken.profiles[2].slug}-mac-v1.0.14.sayall`,
    "wrong-mac-v1.0.14.sayall",
  );
  const issues = marketProfileIssues(broken).join("\n");
  assert.match(issues, /profiles\[1\]\.id 与 profiles\[0\] 重复/);
  assert.match(issues, /profiles\[1\]\.addedAt/);
  assert.match(issues, /profiles\[2\]\.downloadUrl 文件名必须与 slug 一致/);
});

test("无图方案不能携带图片尺寸", async () => {
  const feed = await loadFeed();
  const broken = structuredClone(feed);
  const noImage = broken.profiles.find((profile) => !profile.imageUrl);
  noImage.imageWidth = 1000;
  const issues = marketProfileIssues(broken).join("\n");
  assert.match(issues, /imageWidth \/ imageHeight 只能在 imageUrl 存在时出现/);
});
