import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Service-role client. Server-only; created lazily so builds work without env vars. */
export function getSupabase(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não configuradas");
    // Only the origin matters: tolerate values copied with a path (e.g. ".../rest/v1/"), which break PostgREST.
    client = createClient(new URL(url).origin, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client;
}
