import { describe, expect, it } from "vitest";
import { LEVELS } from "@/types";
import { getPool, questions } from "./questions";
import { questionSchema } from "./validation";

describe("banco de perguntas", () => {
  it.each(questions.map((q) => [q.id, q]))("%s segue o schema", (_id, q) => {
    expect(questionSchema.safeParse(q).success).toBe(true);
  });

  it("tem IDs únicos", () => {
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
  });

  it.each(LEVELS)("tem ao menos 10 perguntas no nível %s", (level) => {
    expect(getPool(level).length).toBeGreaterThanOrEqual(10);
  });
});
