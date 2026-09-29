import type { AnswerSubmission, CategoryFilter, Question } from "@/types";
import { STORAGE_KEYS, writeJson } from "./storage";
import { storedMatchSchema } from "./validation";

/** A finished match, kept in sessionStorage so /resultado survives a refresh. */
export interface StoredMatch {
  category: CategoryFilter;
  questions: Question[];
  answers: AnswerSubmission[];
  saved?: { nickname: string; rank: number };
}

/** Parses stored JSON; anything malformed, stale or tampered counts as "no match". */
export function parseStoredMatch(raw: string | null): StoredMatch | null {
  if (!raw) return null;
  try {
    const parsed = storedMatchSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

const listeners = new Set<() => void>();
let cache: { raw: string | null; value: StoredMatch | null } = { raw: null, value: null };

export function subscribeMatch(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Snapshot for useSyncExternalStore: returns the same object while the stored JSON is unchanged. */
export function getStoredMatch(): StoredMatch | null {
  let raw: string | null = null;
  try {
    raw = window.sessionStorage.getItem(STORAGE_KEYS.match);
  } catch {
    return cache.value;
  }
  if (raw !== cache.raw) cache = { raw, value: parseStoredMatch(raw) };
  return cache.value;
}

export function saveMatch(match: StoredMatch) {
  writeJson("session", STORAGE_KEYS.match, match);
  listeners.forEach((l) => l());
}
