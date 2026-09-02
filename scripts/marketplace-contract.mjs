import { createHash, verify } from "node:crypto";

export const forbiddenContractKeyPattern = /(?:password|passwd|token|secret|credential|cookie|certificate|private[_-]?key|device[_-]?id|deviceidentifier|bluetooth[_-]?address|mac[_-]?address|serial[_-]?number|hid[_-]?fingerprint|accessibility[_-]?tree|ax[_-]?path)/i;
export const forbiddenContractValuePattern = /(?:https?:\/\/|file:\/\/|javascript:|data:|(?:^|\s)\/(?:Applications|Users|Volumes|private|tmp|var|etc|bin|sbin|usr|opt)(?:\/|\b)|\b[A-Za-z]:\\|\/bin\/(?:sh|bash|zsh)|\bosascript\b|\bcurl\b|\bwget\b|\bpowershell\b)/i;

export function forbiddenContractPaths(value, jsonPath = "$") {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => forbiddenContractPaths(item, `${jsonPath}[${index}]`));
  }

  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => [
      ...(forbiddenContractKeyPattern.test(key) ? [`${jsonPath}.${key}`] : []),
      ...forbiddenContractPaths(child, `${jsonPath}.${key}`)
    ]);
  }

  return typeof value === "string" && forbiddenContractValuePattern.test(value) ? [jsonPath] : [];
}

export function isIso8601UtcDateTime(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?Z$/.exec(value);
  if (!match) {
    return false;
  }

  const [, year, month, day, hour, minute, second] = match.map(Number);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute, second, 0);
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    date.getUTCHours() === hour &&
    date.getUTCMinutes() === minute &&
    date.getUTCSeconds() === second
  );
}

function canonicalizeValue(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalizeValue).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalizeValue(value[key])}`)
      .join(",")}}`;
  }

  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return JSON.stringify(value);
  }

  throw new TypeError("canonical JSON 只接受 JSON 可表示的值");
}

export function canonicalizeJson(value) {
  return canonicalizeValue(value);
}

export function canonicalJsonBytes(value) {
  return Buffer.from(canonicalizeJson(value), "utf8");
}

export function sha256CanonicalJson(value) {
  return `sha256:${createHash("sha256").update(canonicalJsonBytes(value)).digest("hex")}`;
}

export function unsignedDocument(document) {
  const { signature: _signature, ...unsigned } = document;
  return unsigned;
}

export function verifySignedDocument(document, publicKey) {
  if (document?.signature?.algorithm !== "ed25519" || typeof document.signature.value !== "string") {
    return false;
  }

  let signatureBytes;
  try {
    signatureBytes = Buffer.from(document.signature.value, "base64");
  } catch {
    return false;
  }
  if (signatureBytes.length !== 64 || signatureBytes.toString("base64") !== document.signature.value) {
    return false;
  }

  try {
    return verify(null, canonicalJsonBytes(unsignedDocument(document)), publicKey, signatureBytes);
  } catch {
    return false;
  }
}

export function isManifestRevoked(manifest, revocations) {
  return revocations.entries.some((entry) => {
    if (entry.packageID === undefined && entry.keyID === undefined && entry.contentDigest === undefined) {
      return false;
    }
    if (entry.packageID !== undefined && entry.packageID !== manifest.packageID) {
      return false;
    }
    if (entry.version !== undefined && entry.version !== manifest.version) {
      return false;
    }
    if (entry.keyID !== undefined && entry.keyID !== manifest.signature.keyID) {
      return false;
    }
    if (entry.contentDigest !== undefined && entry.contentDigest !== manifest.contentDigest) {
      return false;
    }
    return true;
  });
}
