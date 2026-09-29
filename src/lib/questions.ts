import rawQuestions from "@/data/questions.json";
import type { Category, CategoryFilter, Level, Question } from "@/types";

export const questions = rawQuestions as Question[];

const byId = new Map(questions.map((q) => [q.id, q]));

export function getQuestionById(id: string): Question | undefined {
  return byId.get(id);
}

/** Questions of a level, optionally restricted to one category. */
export function getPool(
  level: Level,
  category: CategoryFilter = "todas",
  bank: readonly Question[] = questions,
): Question[] {
  return bank.filter((q) => q.level === level && (category === "todas" || q.category === category));
}

export function cellSize(level: Level, category: Category, bank: readonly Question[] = questions): number {
  return getPool(level, category, bank).length;
}
