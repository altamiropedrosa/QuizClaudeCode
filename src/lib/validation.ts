import { z } from "zod";
import {
  CATEGORIES,
  CATEGORY_FILTERS,
  LEVELS,
  MATCH_SIZE,
  QUESTIONS_PER_LEVEL,
  QUESTION_TIME_MS,
  type AnswerSubmission,
  type CategoryFilter,
  type Question,
} from "@/types";
import { cellSize, getQuestionById, questions as defaultBank } from "./questions";

export const MIN_ANSWER_MS = 400;
export const MAX_ANSWER_MS = 10_500;

export const questionSchema = z.object({
  id: z.string().regex(/^[a-z]+-\d{3}$/),
  level: z.enum(LEVELS),
  category: z.enum(CATEGORIES),
  statement: z.string().min(10),
  answer: z.boolean(),
  explanation: z.string().min(10),
  sourceUrl: z.url().startsWith("https://docs.claude.com/"),
  tags: z.array(z.string()),
});

export const nicknameSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_-]{3,16}$/, "Use de 3 a 16 caracteres: letras, números, _ ou -.");

export const categoryFilterSchema = z.enum(CATEGORY_FILTERS).default("todas");

export const answerSchema = z.object({
  questionId: z.string().max(32),
  answer: z.boolean().nullable(),
  timeMs: z.number().int(),
});

export const submitScoreSchema = z.object({
  nickname: nicknameSchema,
  category: categoryFilterSchema,
  answers: z.array(answerSchema).max(MATCH_SIZE * 2),
});

export type SubmitScoreInput = z.infer<typeof submitScoreSchema>;

export type MatchValidation = { ok: true } | { ok: false; reason: string };

/** Plausibility checks for a submitted match (PRD §8.3). */
export function validateMatch(
  answers: readonly AnswerSubmission[],
  category: CategoryFilter,
  lookup: (id: string) => Question | undefined = getQuestionById,
  bank: readonly Question[] = defaultBank,
): MatchValidation {
  if (answers.length !== MATCH_SIZE) return fail(`esperadas ${MATCH_SIZE} respostas`);

  const ids = new Set(answers.map((a) => a.questionId));
  if (ids.size !== answers.length) return fail("perguntas repetidas");

  const resolved: Question[] = [];
  for (const a of answers) {
    const q = lookup(a.questionId);
    if (!q) return fail(`pergunta desconhecida: ${a.questionId}`);
    if (a.timeMs < MIN_ANSWER_MS || a.timeMs > MAX_ANSWER_MS) return fail("tempo de resposta implausível");
    if (a.answer === null && a.timeMs < QUESTION_TIME_MS) return fail("tempo esgotado antes do limite");
    resolved.push(q);
  }

  for (const [blockIndex, level] of LEVELS.entries()) {
    const block = resolved.slice(blockIndex * QUESTIONS_PER_LEVEL, (blockIndex + 1) * QUESTIONS_PER_LEVEL);
    if (block.some((q) => q.level !== level)) return fail("ordem de níveis inválida");

    if (category !== "todas") {
      // Off-category questions are only legitimate as fill-ins when the cell is too small (RF02).
      const allowedOff = Math.max(0, QUESTIONS_PER_LEVEL - cellSize(level, category, bank));
      const off = block.filter((q) => q.category !== category).length;
      if (off > allowedOff) return fail("perguntas não correspondem à categoria");
    }
  }

  return { ok: true };
}

function fail(reason: string): MatchValidation {
  return { ok: false, reason };
}
