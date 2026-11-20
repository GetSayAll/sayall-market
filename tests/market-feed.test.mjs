import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  MARKET_DRAFT_PATH,
  MARKET_FEED_PATH,
  marketFeedIssues,
  renderDraft,
} from "../scripts/market-feed.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function loadFixture() {
  return JSON.parse(await readFile(path.join(repositoryRoot, MARKET_FEED_PATH), "utf8"));
}

test("市场 JSON 与生成的 Draft 一致", async () => {
  const feed = await loadFixture();
  const draft = await readFile(path.join(repositoryRoot, MARKET_DRAFT_PATH), "utf8");
  assert.deepEqual(marketFeedIssues(feed), []);
  assert.equal(renderDraft(draft, feed), draft);
});

test("重复 ID、错误类型配对和非市场域名会被拒绝", async () => {
  const feed = await loadFixture();
  const broken = structuredClone(feed);
  broken.entries[1].id = broken.entries[0].id;
  broken.entries[1].typeEn = "Base";
  broken.entries[2].url = "https://example.com/models/1?appSharePlatform=sayall.app";
  const issues = marketFeedIssues(broken).join("\n");
  assert.match(issues, /entries\[1\]\.id 与 entries\[0\] 重复/);
  assert.match(issues, /entries\[1\]\.type \/ typeEn/);
  assert.match(issues, /entries\[2\]\.url/);
});

test("生成 Draft 只替换展示条目并保留公开边界", async () => {
  const feed = await loadFixture();
  const draft = await readFile(path.join(repositoryRoot, MARKET_DRAFT_PATH), "utf8");
  const rendered = renderDraft(draft, feed);
  assert.ok(rendered.includes("## 公开边界"));
  assert.ok(rendered.includes("## 图片获取方法（维护者备注）"));
  assert.ok(!rendered.includes("原始页面标题为「小米蓝牙遥控 2pro 大哥大外壳」"));
});
