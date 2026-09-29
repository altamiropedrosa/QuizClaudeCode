import { describe, expect, it } from "vitest";
import { CATEGORY_FILTERS, LEVELS, MATCH_SIZE, QUESTIONS_PER_LEVEL } from "@/types";
import { buildMatch } from "./draw";
import { cellSize } from "./questions";
import { validateMatch } from "./validation";

const RUNS = 200;

describe("buildMatch", () => {
  it.each(CATEGORY_FILTERS)("categoria %s: 15 perguntas, níveis 5/5/5, sem repetição", (category) => {
    for (let run = 0; run < RUNS; run++) {
      const match = buildMatch(category);
      expect(match).toHaveLength(MATCH_SIZE);
      expect(new Set(match.map((q) => q.id)).size).toBe(MATCH_SIZE);
      LEVELS.forEach((level, i) => {
        const block = match.slice(i * QUESTIONS_PER_LEVEL, (i + 1) * QUESTIONS_PER_LEVEL);
        expect(block.every((q) => q.level === level)).toBe(true);
      });
    }
  });

  it("prioriza a categoria escolhida e só completa quando a célula é pequena", () => {
    for (let run = 0; run < RUNS; run++) {
      const match = buildMatch("api-sdk");
      LEVELS.forEach((level, i) => {
        const block = match.slice(i * QUESTIONS_PER_LEVEL, (i + 1) * QUESTIONS_PER_LEVEL);
        const inCategory = block.filter((q) => q.category === "api-sdk").length;
        expect(inCategory).toBe(Math.min(QUESTIONS_PER_LEVEL, cellSize(level, "api-sdk")));
      });
    }
  });

  it("com 'todas', mistura categorias em cada bloco", () => {
    for (let run = 0; run < RUNS; run++) {
      const match = buildMatch("todas");
      LEVELS.forEach((_level, i) => {
        const block = match.slice(i * QUESTIONS_PER_LEVEL, (i + 1) * QUESTIONS_PER_LEVEL);
        expect(new Set(block.map((q) => q.category)).size).toBeGreaterThanOrEqual(3);
      });
    }
  });

  it("toda partida sorteada passa na validação do servidor", () => {
    for (const category of CATEGORY_FILTERS) {
      for (let run = 0; run < RUNS; run++) {
        const answers = buildMatch(category).map((q) => ({ questionId: q.id, answer: q.answer, timeMs: 3000 }));
        expect(validateMatch(answers, category)).toEqual({ ok: true });
      }
    }
  });
});
