export const MARKET_FEED_PATH = "examples/extensions/makerworld-accessories.json";
export const MARKET_DRAFT_PATH = "examples/extensions/makerworld-accessories.draft.md";

const DRAFT_START = "## 展示条目\n";
const DRAFT_END = "\n## 公开边界";
const TYPE_PAIRS = new Map([
  ["外壳", "Shell"],
  ["底座", "Base"],
  ["收纳", "Storage"],
  ["支架", "Mount"],
]);

function isValidCalendarDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function httpsHost(value, host) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === host;
  } catch {
    return false;
  }
}

export function marketFeedIssues(feed) {
  const errors = [];
  if (!Array.isArray(feed?.entries) || feed.entries.length === 0) {
    return ["entries 必须为非空数组"];
  }

  const seen = {
    id: new Map(),
    title: new Map(),
    url: new Map(),
    imageUrl: new Map(),
  };

  feed.entries.forEach((entry, index) => {
    const label = `entries[${index}]`;
    for (const [key, values] of Object.entries(seen)) {
      const value = entry?.[key];
      if (typeof value !== "string") continue;
      if (values.has(value)) {
        errors.push(`${label}.${key} 与 entries[${values.get(value)}] 重复`);
      } else {
        values.set(value, index);
      }
    }
    if (!isValidCalendarDate(entry?.addedAt)) {
      errors.push(`${label}.addedAt 不是有效的 YYYY-MM-DD 日期`);
    }
    if (!TYPE_PAIRS.has(entry?.type) || TYPE_PAIRS.get(entry.type) !== entry?.typeEn) {
      errors.push(`${label}.type / typeEn 不是允许的配对`);
    }
    if (!httpsHost(entry?.url, "makerworld.com.cn")) {
      errors.push(`${label}.url 必须指向 https://makerworld.com.cn/`);
    }
    if (!httpsHost(entry?.imageUrl, "makerworld.bblmw.cn")) {
      errors.push(`${label}.imageUrl 必须指向 https://makerworld.bblmw.cn/`);
    }
    if (!Number.isInteger(entry?.imageWidth) || entry.imageWidth <= 0) {
      errors.push(`${label}.imageWidth 必须为正整数`);
    }
    if (!Number.isInteger(entry?.imageHeight) || entry.imageHeight <= 0) {
      errors.push(`${label}.imageHeight 必须为正整数`);
    }
  });

  return errors;
}

export function renderEntries(feed) {
  return feed.entries
    .map((entry) =>
      [
        `### ${entry.title}`,
        "",
        entry.description,
        "",
        `![${entry.imageAlt}](${entry.imageUrl})`,
        "",
        `[在 MakerWorld 查看](${entry.url})`,
      ].join("\n"),
    )
    .join("\n\n");
}

export function renderDraft(source, feed) {
  const start = source.indexOf(DRAFT_START);
  const end = source.indexOf(DRAFT_END, start + DRAFT_START.length);
  if (start < 0 || end < 0) {
    throw new Error("Draft 缺少「## 展示条目」或「## 公开边界」标记");
  }
  return `${source.slice(0, start + DRAFT_START.length)}\n${renderEntries(feed)}\n${source.slice(end)}`;
}
