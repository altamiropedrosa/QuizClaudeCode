import { describe, expect, it } from "vitest";
import type { AnswerSubmission } from "@/types";
import { buildMatch } from "./draw";
import { questions } from "./questions";
import { nicknameSchema, submitScoreSchema, validateMatch } from "./validation";

function validAnswers(category: Parameters<typeof buildMatch>[0] = "todas"): AnswerSubmission[] {
  return buildMatch(category).map((q) => ({ questionId: q.id, answer: q.answer, timeMs: 4000 }));
}

function reason(answers: AnswerSubmission[], category: Parameters<typeof validateMatch>[1] = "todas") {
  const result = validateMatch(answers, category);
  return result.ok ? null : result.reason;
}

describe("validateMatch", () => {
  it("aceita uma partida válida", () => {
    expect(reason(validAnswers())).toBeNull();
  });

  it("rejeita quantidade errada de respostas", () => {
    expect(reason(validAnswers().slice(0, 14))).toMatch(/15 respostas/);
  });

  it("rejeita IDs repetidos", () => {
    const answers = validAnswers();
    answers[1] = { ...answers[0] };
    expect(reason(answers)).toMatch(/repetidas/);
  });

  it("rejeita pergunta desconhecida", () => {
    const answers = validAnswers();
    answers[0] = { ...answers[0], questionId: "xxx-999" };
    expect(reason(answers)).toMatch(/desconhecida/);
  });

  it.each([399, 10_501])("rejeita timeMs %i", (timeMs) => {
    const answers = validAnswers();
    answers[3] = { ...answers[3], timeMs };
    expect(reason(answers)).toMatch(/implausível/);
  });

  it("rejeita timeout antes de 10 s e aceita timeout em 10 s", () => {
    const answers = validAnswers();
    answers[0] = { ...answers[0], answer: null, timeMs: 9000 };
    expect(reason(answers)).toMatch(/esgotado/);
    answers[0] = { ...answers[0], answer: null, timeMs: 10_000 };
    expect(reason(answers)).toBeNull();
  });

  it("rejeita ordem de níveis trocada", () => {
    const answers = validAnswers();
    [answers[0], answers[14]] = [answers[14], answers[0]];
    expect(reason(answers)).toMatch(/ordem/);
  });

  it("rejeita perguntas de outra categoria quando a célula comporta o bloco", () => {
    const answers = validAnswers("features");
    // intermediário × features tem 7 perguntas: nenhuma de fora é aceitável
    const intruder = questions.find((q) => q.level === "intermediario" && q.category !== "features")!;
    answers[5] = { questionId: intruder.id, answer: intruder.answer, timeMs: 4000 };
    expect(reason(answers, "features")).toMatch(/categoria/);
  });
});

describe("schemas", () => {
  it.each(["abc", "maria_dev", "Dev-2025", "a234567890123456"])("apelido válido: %s", (n) => {
    expect(nicknameSchema.safeParse(n).success).toBe(true);
  });

  it.each(["ab", "a2345678901234567", "com espaço", "ação", "x<script>"])("apelido inválido: %s", (n) => {
    expect(nicknameSchema.safeParse(n).success).toBe(false);
  });

  it("categoria padrão é 'todas' e categoria inválida é rejeitada", () => {
    const base = { nickname: "maria", answers: [] };
    expect(submitScoreSchema.parse(base).category).toBe("todas");
    expect(submitScoreSchema.safeParse({ ...base, category: "outra" }).success).toBe(false);
  });
});
