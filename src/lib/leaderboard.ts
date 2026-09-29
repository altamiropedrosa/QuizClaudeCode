import "server-only";
import type { CategoryFilter, RankingEntry } from "@/types";
import { getSupabase } from "./supabase";

export interface NewScore {
  nickname: string;
  category: CategoryFilter;
  score: number;
  correct: number;
  totalTimeMs: number;
  ipHash: string;
}

export async function countRecentSubmissions(ipHash: string, since: Date): Promise<number> {
  const { count, error } = await getSupabase()
    .from("scores")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since.toISOString());
  if (error) throw error;
  return count ?? 0;
}

export async function insertScore(row: NewScore): Promise<void> {
  const { error } = await getSupabase().from("scores").insert({
    nickname: row.nickname,
    category: row.category,
    score: row.score,
    correct: row.correct,
    total_time_ms: row.totalTimeMs,
    ip_hash: row.ipHash,
  });
  if (error) throw error;
}

/** 1-based position: entries with a higher score, or same score and lower time, come first. */
export async function rankOf(category: CategoryFilter, score: number, totalTimeMs: number): Promise<number> {
  const s = Math.trunc(score);
  const t = Math.trunc(totalTimeMs);
  const { count, error } = await getSupabase()
    .from("scores")
    .select("id", { count: "exact", head: true })
    .eq("category", category)
    .or(`score.gt.${s},and(score.eq.${s},total_time_ms.lt.${t})`);
  if (error) throw error;
  return (count ?? 0) + 1;
}

export async function getLeaderboard(category: CategoryFilter, limit: number): Promise<RankingEntry[]> {
  const { data, error } = await getSupabase()
    .from("scores")
    .select("nickname, score, correct, created_at")
    .eq("category", category)
    .order("score", { ascending: false })
    .order("total_time_ms", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    nickname: r.nickname,
    score: r.score,
    correct: r.correct,
    createdAt: r.created_at,
  }));
}
