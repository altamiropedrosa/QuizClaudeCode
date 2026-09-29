export const LEVELS = ["iniciante", "intermediario", "avancado"] as const;
export type Level = (typeof LEVELS)[number];

export const CATEGORIES = ["fundamentos", "features", "api-sdk", "boas-praticas"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_FILTERS = ["todas", ...CATEGORIES] as const;
export type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

export const LEVEL_LABELS: Record<Level, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  todas: "Todas",
  fundamentos: "Fundamentos",
  features: "Features e Produtividade",
  "api-sdk": "Claude API/SDK",
  "boas-praticas": "Boas práticas e casos de uso",
};

/** Questions per level block; a match has one block per level, in LEVELS order. */
export const QUESTIONS_PER_LEVEL = 5;
export const MATCH_SIZE = QUESTIONS_PER_LEVEL * LEVELS.length;
export const QUESTION_TIME_MS = 10_000;

export interface Question {
  id: string;
  level: Level;
  category: Category;
  statement: string;
  answer: boolean;
  explanation: string;
  sourceUrl: string;
  tags: string[];
}

/** One answered question. `answer: null` means the timer ran out. */
export interface AnswerSubmission {
  questionId: string;
  answer: boolean | null;
  timeMs: number;
}

export interface CategoryStats {
  correct: number;
  total: number;
}

export interface MatchResult {
  score: number;
  correct: number;
  totalTimeMs: number;
  perCategory: Partial<Record<Category, CategoryStats>>;
}

export interface RankingEntry {
  nickname: string;
  score: number;
  correct: number;
  createdAt: string;
}
