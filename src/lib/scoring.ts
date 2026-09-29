import { QUESTION_TIME_MS, type AnswerSubmission, type Level, type MatchResult, type Question } from "@/types";

export const BASE_POINTS: Record<Level, number> = {
  iniciante: 100,
  intermediario: 150,
  avancado: 200,
};

export const MAX_SCORE = 3375;

/** Points for one answer (PRD RF05): base + speed bonus when correct, 0 otherwise. */
export function scoreAnswer(level: Level, isCorrect: boolean, timeMs: number): number {
  if (!isCorrect) return 0;
  const base = BASE_POINTS[level];
  const secondsLeft = Math.min(Math.max((QUESTION_TIME_MS - timeMs) / 1000, 0), QUESTION_TIME_MS / 1000);
  return base + Math.round((base * 0.5 * secondsLeft) / 10);
}

export function isCorrectAnswer(question: Question, answer: boolean | null): boolean {
  return answer !== null && answer === question.answer;
}

/** Scores a full match. Unknown question IDs are skipped (validate first on the server). */
export function scoreMatch(
  answers: readonly AnswerSubmission[],
  lookup: (id: string) => Question | undefined,
): MatchResult {
  const result: MatchResult = { score: 0, correct: 0, totalTimeMs: 0, perCategory: {} };
  for (const { questionId, answer, timeMs } of answers) {
    const question = lookup(questionId);
    if (!question) continue;
    const correct = isCorrectAnswer(question, answer);
    const stats = (result.perCategory[question.category] ??= { correct: 0, total: 0 });
    stats.total++;
    result.totalTimeMs += timeMs;
    if (correct) {
      stats.correct++;
      result.correct++;
      result.score += scoreAnswer(question.level, true, timeMs);
    }
  }
  return result;
}

export type Classification = "Aprendiz" | "Praticante" | "Especialista" | "Mestre do Claude Code";

export function classify(score: number): Classification {
  const pct = (score / MAX_SCORE) * 100;
  if (pct >= 90) return "Mestre do Claude Code";
  if (pct >= 70) return "Especialista";
  if (pct >= 40) return "Praticante";
  return "Aprendiz";
}
