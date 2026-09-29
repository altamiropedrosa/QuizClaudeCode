import type { AnswerSubmission, CategoryFilter, Question } from "@/types";
import { STORAGE_KEYS, writeJson } from "./storage";

/** A finished match, kept in sessionStorage so /resultado survives a refresh. */
export interface StoredMatch {
  category: CategoryFilter;
  questions: Question[];
  answers: AnswerSubmission[];
  saved?: { nickname: string; rank: number };
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
  if (raw !== cache.raw) {
    let value: StoredMatch | null = null;
    try {
      value = raw ? (JSON.parse(raw) as StoredMatch) : null;
    } catch {
      value = null;
    }
    cache = { raw, value };
  }
  return cache.value;
}

export function saveMatch(match: StoredMatch) {
  writeJson("session", STORAGE_KEYS.match, match);
  listeners.forEach((l) => l());
}
