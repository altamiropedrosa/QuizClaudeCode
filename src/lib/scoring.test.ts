import { describe, expect, it } from "vitest";
import type { Question } from "@/types";
import { classify, MAX_SCORE, scoreAnswer, scoreMatch } from "./scoring";
import { buildMatch } from "./draw";
import { getQuestionById } from "./questions";

describe("scoreAnswer", () => {
  it("acerto instantâneo vale base + 50%", () => {
    expect(scoreAnswer("iniciante", true, 0)).toBe(150);
    expect(scoreAnswer("intermediario", true, 0)).toBe(225);
    expect(scoreAnswer("avancado", true, 0)).toBe(300);
  });

  it("acerto no limite vale só a base", () => {
    expect(scoreAnswer("avancado", true, 10_000)).toBe(200);
    expect(scoreAnswer("avancado", true, 10_500)).toBe(200);
  });

  it("aceita fração de segundo e arredonda o bônus", () => {
    // 5.4 s gastos -> 4.6 s restantes -> 150 * 0.5 * 0.46 = 34.5 -> 35
    expect(scoreAnswer("intermediario", true, 5_400)).toBe(185);
  });

  it("erro vale zero", () => {
    expect(scoreAnswer("avancado", false, 1_000)).toBe(0);
  });
});

describe("scoreMatch", () => {
  it("partida perfeita e instantânea atinge o máximo de 3375", () => {
    const answers = buildMatch().map((q) => ({ questionId: q.id, answer: q.answer, timeMs: 0 }));
    const result = scoreMatch(answers, getQuestionById);
    expect(result.score).toBe(MAX_SCORE);
    expect(result.correct).toBe(15);
  });

  it("timeout conta como erro e soma tempo e desempenho por categoria", () => {
    const q = (id: string, category: Question["category"], answer: boolean): Question => ({
      id, category, answer, level: "iniciante", statement: "", explanation: "", sourceUrl: "", tags: [],
    });
    const bank = new Map([
      ["a", q("a", "features", true)],
      ["b", q("b", "features", false)],
      ["c", q("c", "api-sdk", true)],
    ]);
    const result = scoreMatch(
      [
        { questionId: "a", answer: true, timeMs: 10_000 },
        { questionId: "b", answer: true, timeMs: 2_000 },
        { questionId: "c", answer: null, timeMs: 10_000 },
      ],
      (id) => bank.get(id),
    );
    expect(result).toEqual({
      score: 100,
      correct: 1,
      totalTimeMs: 22_000,
      perCategory: { features: { correct: 1, total: 2 }, "api-sdk": { correct: 0, total: 1 } },
    });
  });
});

describe("classify", () => {
  it.each([
    [0, "Aprendiz"],
    [1349, "Aprendiz"],
    [1350, "Praticante"],
    [2362, "Praticante"],
    [2363, "Especialista"],
    [3037, "Especialista"],
    [3038, "Mestre do Claude Code"],
    [3375, "Mestre do Claude Code"],
  ] as const)("%i pontos → %s", (score, label) => {
    expect(classify(score)).toBe(label);
  });
});
