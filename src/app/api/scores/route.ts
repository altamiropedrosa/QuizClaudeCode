import { z } from "zod";
import { clientIp, hashIp } from "@/lib/ipHash";
import { countRecentSubmissions, getLeaderboard, insertScore, rankOf } from "@/lib/leaderboard";
import { isOffensive } from "@/lib/profanity";
import { getQuestionById } from "@/lib/questions";
import { scoreMatch } from "@/lib/scoring";
import { categoryFilterSchema, submitScoreSchema, validateMatch } from "@/lib/validation";

export const dynamic = "force-dynamic";

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

const leaderboardQuerySchema = z.object({
  category: categoryFilterSchema,
  limit: z.coerce.number().int().min(1).max(20).default(20),
});

function unavailable(scope: string, err: unknown) {
  console.error(`[api/scores] ${scope}`, err);
  return Response.json({ error: "ranking_unavailable" }, { status: 503 });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_payload" }, { status: 400 });
  }

  const parsed = submitScoreSchema.safeParse(body);
  if (!parsed.success) {
    const nicknameIssue = parsed.error.issues.some((i) => i.path[0] === "nickname");
    return Response.json({ error: nicknameIssue ? "invalid_nickname" : "invalid_payload" }, { status: 400 });
  }
  const { nickname, category, answers } = parsed.data;

  if (isOffensive(nickname)) {
    return Response.json({ error: "invalid_nickname" }, { status: 400 });
  }

  const check = validateMatch(answers, category);
  if (!check.ok) {
    return Response.json({ error: "implausible_match", reason: check.reason }, { status: 400 });
  }

  // Score is always recomputed from the answer key; anything the client claims is ignored.
  const { score, correct, totalTimeMs } = scoreMatch(answers, getQuestionById);

  try {
    const ipHash = hashIp(clientIp(request.headers));
    const recent = await countRecentSubmissions(ipHash, new Date(Date.now() - RATE_WINDOW_MS));
    if (recent >= RATE_LIMIT) {
      return Response.json({ error: "rate_limited" }, { status: 429 });
    }
    await insertScore({ nickname, category, score, correct, totalTimeMs, ipHash });
    const rank = await rankOf(category, score, totalTimeMs);
    return Response.json({ score, correct, rank }, { status: 201 });
  } catch (err) {
    return unavailable("POST", err);
  }
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const parsed = leaderboardQuerySchema.safeParse({
    category: params.get("category") ?? undefined,
    limit: params.get("limit") ?? undefined,
  });
  if (!parsed.success) {
    return Response.json({ error: "invalid_query" }, { status: 400 });
  }

  try {
    const scores = await getLeaderboard(parsed.data.category, parsed.data.limit);
    return Response.json({ scores }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return unavailable("GET", err);
  }
}
