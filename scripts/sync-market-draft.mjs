import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { MARKET_DRAFT_PATH, MARKET_FEED_PATH, renderDraft } from "./market-feed.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const feedPath = path.join(repositoryRoot, MARKET_FEED_PATH);
const draftPath = path.join(repositoryRoot, MARKET_DRAFT_PATH);

const feed = JSON.parse(await readFile(feedPath, "utf8"));
const draft = await readFile(draftPath, "utf8");
const next = renderDraft(draft, feed);

if (next === draft) {
  console.log("市场 Draft 已与 JSON 一致。");
} else {
  await writeFile(draftPath, next);
  console.log(`已从 ${MARKET_FEED_PATH} 重新生成 ${MARKET_DRAFT_PATH}。`);
}
