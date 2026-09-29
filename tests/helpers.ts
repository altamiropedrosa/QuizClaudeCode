import { expect, type Page } from "@playwright/test";
import type { Question } from "../src/types";

export interface PlayedQuestion {
  id: string;
  level: string;
  category: string;
}

/**
 * Starts a match at /quiz?category=… and plays all 15 questions via keyboard.
 * `pick` decides the answer given the question (which the API returns with the key).
 */
export async function playMatch(
  page: Page,
  category: string,
  pick: (q: Question, index: number) => boolean = (q) => q.answer,
): Promise<PlayedQuestion[]> {
  const responsePromise = page.waitForResponse((r) => r.url().includes("/api/questions"));
  await page.goto(`/quiz?category=${category}`);
  const { questions } = (await (await responsePromise).json()) as { questions: Question[] };
  const byId = new Map(questions.map((q) => [q.id, q]));
  const played: PlayedQuestion[] = [];

  for (let i = 0; i < 15; i++) {
    if (i % 5 === 0) {
      await expect(page.getByTestId("block-transition")).toBeVisible();
      await page.keyboard.press("Enter");
    }
    const card = page.getByTestId("question");
    await expect(page.getByTestId("progress")).toHaveText(`${i + 1}/15`);
    const id = (await card.getAttribute("data-question-id"))!;
    const q = byId.get(id)!;
    played.push({ id, level: q.level, category: (await page.getByTestId("category-badge").getAttribute("data-category"))! });
    await page.keyboard.press(pick(q, i) ? "v" : "f");
    await expect(page.getByTestId("feedback")).toBeVisible();
    await page.keyboard.press("Enter");
  }

  await page.waitForURL("**/resultado");
  return played;
}
