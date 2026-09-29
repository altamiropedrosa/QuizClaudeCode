// Browser storage can throw (private mode, blocked site data) or be absent (SSR): every access is guarded.

type Area = "local" | "session";

function area(kind: Area): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readJson<T>(kind: Area, key: string): T | null {
  try {
    const raw = area(kind)?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJson(kind: Area, key: string, value: unknown): void {
  try {
    area(kind)?.setItem(key, JSON.stringify(value));
  } catch {
    // ignore: storage is a convenience only
  }
}

export function removeItem(kind: Area, key: string): void {
  try {
    area(kind)?.removeItem(key);
  } catch {
    // ignore
  }
}

export const STORAGE_KEYS = {
  theme: "qcc:theme",
  lastNickname: "qcc:nickname",
  bestScore: "qcc:best-score",
  match: "qcc:match",
} as const;
