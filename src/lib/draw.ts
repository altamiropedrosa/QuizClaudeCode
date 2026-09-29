import { CATEGORIES, LEVELS, QUESTIONS_PER_LEVEL, type CategoryFilter, type Level, type Question } from "@/types";
import { getPool, questions as defaultBank } from "./questions";
import { shuffle, type Rng } from "./shuffle";

/**
 * Builds a match (PRD RF02): one block of QUESTIONS_PER_LEVEL per level, in LEVELS order.
 * - Specific category: take from the level × category cell, then fill from other categories of the same level.
 * - "todas": round-robin across categories so each block mixes themes.
 */
export function buildMatch(
  category: CategoryFilter = "todas",
  bank: readonly Question[] = defaultBank,
  rng: Rng = Math.random,
): Question[] {
  return LEVELS.flatMap((level) => drawBlock(level, category, bank, rng));
}

function drawBlock(level: Level, category: CategoryFilter, bank: readonly Question[], rng: Rng): Question[] {
  const levelPool = getPool(level, "todas", bank);
  if (levelPool.length < QUESTIONS_PER_LEVEL) {
    throw new Error(`Banco insuficiente para o nível ${level}: ${levelPool.length} perguntas`);
  }

  if (category !== "todas") {
    const inCategory = shuffle(levelPool.filter((q) => q.category === category), rng);
    const others = shuffle(levelPool.filter((q) => q.category !== category), rng);
    return [...inCategory, ...others].slice(0, QUESTIONS_PER_LEVEL);
  }

  const queues = shuffle(CATEGORIES, rng).map((c) => shuffle(levelPool.filter((q) => q.category === c), rng));
  const picked: Question[] = [];
  while (picked.length < QUESTIONS_PER_LEVEL) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next) picked.push(next);
      if (picked.length === QUESTIONS_PER_LEVEL) break;
    }
  }
  return shuffle(picked, rng);
}
