import { describe, expect, it } from "vitest";
import { buildMatch } from "./draw";
import { parseStoredMatch, type StoredMatch } from "./matchStore";

function validMatch(): StoredMatch {
  const questions = buildMatch("todas");
  return {
    category: "todas",
    questions,
    answers: questions.map((q) => ({ questionId: q.id, answer: q.answer, timeMs: 3000 })),
  };
}

describe("parseStoredMatch", () => {
  it("aceita uma partida válida, com ou sem 'saved'", () => {
    const match = validMatch();
    expect(parseStoredMatch(JSON.stringify(match))).toEqual(match);
    const saved = { ...match, saved: { nickname: "maria", rank: 4 } };
    expect(parseStoredMatch(JSON.stringify(saved))).toEqual(saved);
  });

  it.each([
    ["vazio", null],
    ["JSON quebrado", "{"],
    ["objeto sem campos", "{}"],
    ["formato antigo", JSON.stringify({ score: 100 })],
  ])("trata %s como nenhuma partida", (_name, raw) => {
    expect(parseStoredMatch(raw)).toBeNull();
  });

  it("rejeita respostas que não correspondem às perguntas", () => {
    const match = validMatch();
    match.answers[0] = { ...match.answers[0], questionId: "xxx-999" };
    expect(parseStoredMatch(JSON.stringify(match))).toBeNull();
  });

  it("rejeita partida incompleta", () => {
    const match = validMatch();
    match.answers = match.answers.slice(0, 10);
    expect(parseStoredMatch(JSON.stringify(match))).toBeNull();
  });
});
