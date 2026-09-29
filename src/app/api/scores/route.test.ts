import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildMatch } from "@/lib/draw";
import { getQuestionById } from "@/lib/questions";
import { scoreMatch } from "@/lib/scoring";

vi.mock("@/lib/leaderboard", () => ({
  countRecentSubmissions: vi.fn(),
  insertScore: vi.fn(),
  rankOf: vi.fn(),
  getLeaderboard: vi.fn(),
}));

const leaderboard = await import("@/lib/leaderboard");
const { GET, POST } = await import("./route");

const mocked = vi.mocked(leaderboard);

function answers(category: Parameters<typeof buildMatch>[0] = "todas") {
  return buildMatch(category).map((q, i) => ({ questionId: q.id, answer: i % 3 === 0 ? !q.answer : q.answer, timeMs: 2500 }));
}

function post(body: unknown, ip = "203.0.113.7") {
  return POST(
    new Request("http://localhost/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": `${ip}, 10.0.0.1` },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  vi.stubEnv("IP_HASH_SALT", "test-salt");
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocked.countRecentSubmissions.mockReset().mockResolvedValue(0);
  mocked.insertScore.mockReset().mockResolvedValue(undefined);
  mocked.rankOf.mockReset().mockResolvedValue(3);
  mocked.getLeaderboard.mockReset().mockResolvedValue([]);
});

describe("POST /api/scores", () => {
  it("recalcula a pontuação no servidor, salva e devolve a posição", async () => {
    const submitted = answers("features");
    const expected = scoreMatch(submitted, getQuestionById);

    const res = await post({ nickname: "maria_dev", category: "features", answers: submitted, score: 999999 });

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ score: expected.score, correct: expected.correct, rank: 3 });
    const row = mocked.insertScore.mock.calls[0][0];
    expect(row).toMatchObject({ nickname: "maria_dev", category: "features", score: expected.score, totalTimeMs: 37_500 });
    expect(row.ipHash).toMatch(/^[0-9a-f]{64}$/);
    expect(row.ipHash).not.toContain("203.0.113.7");
    expect(mocked.rankOf).toHaveBeenCalledWith("features", expected.score, 37_500);
  });

  it.each([
    ["JSON inválido", "{", "invalid_payload"],
    ["apelido curto", { nickname: "ab", answers: [] }, "invalid_nickname"],
    ["apelido com espaço", { nickname: "maria dev", answers: [] }, "invalid_nickname"],
    ["apelido ofensivo", { nickname: "m3rda_dev", answers: answers() }, "invalid_nickname"],
    ["categoria inválida", { nickname: "maria", category: "xpto", answers: answers() }, "invalid_payload"],
    ["14 respostas", { nickname: "maria", answers: answers().slice(0, 14) }, "implausible_match"],
  ])("400 para %s", async (_name, body, error) => {
    const res = await post(body);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe(error);
    expect(mocked.insertScore).not.toHaveBeenCalled();
  });

  it("429 a partir da 6ª submissão na hora", async () => {
    mocked.countRecentSubmissions.mockResolvedValue(5);
    const res = await post({ nickname: "maria", answers: answers() });
    expect(res.status).toBe(429);
    expect(mocked.insertScore).not.toHaveBeenCalled();
  });

  it("503 quando o banco falha", async () => {
    mocked.insertScore.mockRejectedValue(new Error("db down"));
    const res = await post({ nickname: "maria", answers: answers() });
    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe("ranking_unavailable");
  });

  it("503 quando o salt não está configurado", async () => {
    vi.stubEnv("IP_HASH_SALT", "");
    const res = await post({ nickname: "maria", answers: answers() });
    expect(res.status).toBe(503);
  });
});

describe("GET /api/scores", () => {
  it("usa categoria 'todas' e limite 20 por padrão", async () => {
    const entries = [{ nickname: "ana", score: 3000, correct: 15, createdAt: "2026-01-01T00:00:00Z" }];
    mocked.getLeaderboard.mockResolvedValue(entries);
    const res = await GET(new Request("http://localhost/api/scores"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ scores: entries });
    expect(mocked.getLeaderboard).toHaveBeenCalledWith("todas", 20);
  });

  it("rejeita limite acima de 20 e categoria inválida", async () => {
    expect((await GET(new Request("http://localhost/api/scores?limit=500"))).status).toBe(400);
    expect((await GET(new Request("http://localhost/api/scores?category=xpto"))).status).toBe(400);
  });

  it("503 quando o banco falha", async () => {
    mocked.getLeaderboard.mockRejectedValue(new Error("paused"));
    expect((await GET(new Request("http://localhost/api/scores?category=features"))).status).toBe(503);
  });
});
