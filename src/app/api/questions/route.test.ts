import { describe, expect, it } from "vitest";
import type { Question } from "@/types";
import { GET } from "./route";

describe("GET /api/questions", () => {
  it("devolve 15 perguntas com gabarito e sem cache", async () => {
    const res = await GET(new Request("http://localhost/api/questions?category=features"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    const body = (await res.json()) as { questions: Question[] };
    expect(body.questions).toHaveLength(15);
    expect(typeof body.questions[0].answer).toBe("boolean");
  });

  it("usa 'todas' quando a categoria é omitida", async () => {
    const res = await GET(new Request("http://localhost/api/questions"));
    expect(res.status).toBe(200);
  });

  it("rejeita categoria inválida", async () => {
    const res = await GET(new Request("http://localhost/api/questions?category=xpto"));
    expect(res.status).toBe(400);
  });
});
