export const MARKET_PROFILES_PATH = "feeds/market-profiles.json";

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

export function marketProfileIssues(feed) {
  const errors = [];
  if (!Array.isArray(feed?.profiles) || feed.profiles.length === 0) {
    return ["profiles 必须为非空数组"];
  }

  const seen = {
    id: new Map(),
    slug: new Map(),
    sourceUrl: new Map(),
    downloadUrl: new Map(),
    imageUrl: new Map(),
  };

  feed.profiles.forEach((profile, index) => {
    const label = `profiles[${index}]`;
    for (const [key, values] of Object.entries(seen)) {
      const value = profile?.[key];
      if (typeof value !== "string") continue;
      if (values.has(value)) {
        errors.push(`${label}.${key} 与 profiles[${values.get(value)}] 重复`);
      } else {
        values.set(value, index);
      }
    }
    if (!isValidCalendarDate(profile?.addedAt)) {
      errors.push(`${label}.addedAt 不是有效的 YYYY-MM-DD 日期`);
    }
    if (!httpsHost(profile?.sourceUrl, "github.com")) {
      errors.push(`${label}.sourceUrl 必须指向 https://github.com/`);
    }
    if (!httpsHost(profile?.downloadUrl, "github.com")) {
      errors.push(`${label}.downloadUrl 必须指向 https://github.com/`);
    }
    if (typeof profile?.downloadUrl === "string" && typeof profile?.slug === "string" && !profile.downloadUrl.endsWith(`/${profile.slug}-mac-v1.0.13.sayall`)) {
      errors.push(`${label}.downloadUrl 文件名必须与 slug 一致`);
    }
    if (typeof profile?.imageUrl === "string") {
      if (!httpsHost(profile.imageUrl, "raw.githubusercontent.com")) {
        errors.push(`${label}.imageUrl 必须指向 https://raw.githubusercontent.com/`);
      }
      if (!Number.isInteger(profile.imageWidth) || profile.imageWidth <= 0) {
        errors.push(`${label}.imageWidth 必须为正整数`);
      }
      if (!Number.isInteger(profile.imageHeight) || profile.imageHeight <= 0) {
        errors.push(`${label}.imageHeight 必须为正整数`);
      }
    } else if (profile?.imageWidth !== undefined || profile?.imageHeight !== undefined) {
      errors.push(`${label}.imageWidth / imageHeight 只能在 imageUrl 存在时出现`);
    }
  });

  return errors;
}
