import { expect, test } from "@playwright/test";
import { playMatch } from "./helpers";

test("partida completa pela Home: 15 perguntas, níveis em ordem, resultado", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("contentinfo")).toContainText("não afiliado à Anthropic");
  const responsePromise = page.waitForResponse((r) => r.url().includes("/api/questions?category=todas"));
  await page.getByRole("button", { name: /Começar/ }).click();
  await responsePromise;
  await page.waitForURL("**/quiz?category=todas");

  const played = await playMatch(page, "todas");
  expect(played.map((p) => p.level)).toEqual([
    ...Array(5).fill("iniciante"),
    ...Array(5).fill("intermediario"),
    ...Array(5).fill("avancado"),
  ]);
  expect(new Set(played.map((p) => p.id)).size).toBe(15);

  await expect(page.getByTestId("final-correct")).toHaveText("15/15");
  await expect(page.getByTestId("classification")).toHaveText("Mestre do Claude Code");
  await expect(page.getByTestId("review-list")).toHaveCount(0);

  // Result survives a refresh (sessionStorage).
  await page.reload();
  await expect(page.getByTestId("final-correct")).toHaveText("15/15");
});

test("feedback mostra explicação e link da fonte; erros aparecem na revisão", async ({ page }) => {
  await playMatch(page, "features", (q, i) => (i < 2 ? !q.answer : q.answer));
  await expect(page.getByTestId("final-correct")).toHaveText("13/15");
  const review = page.getByTestId("review-list").locator("li");
  await expect(review).toHaveCount(2);
  await expect(review.first().getByRole("link", { name: /fonte/ })).toHaveAttribute("href", /docs\.claude\.com/);
});

test("filtro de categoria: selo em cada pergunta e prioridade para a categoria", async ({ page }) => {
  const played = await playMatch(page, "api-sdk");
  // Células api-sdk no seed: iniciante 2, intermediário 4, avançado 6 → 2 + 4 + 5 = 11.
  expect(played.filter((p) => p.category === "api-sdk")).toHaveLength(11);
  await expect(page.getByText("Claude API/SDK").first()).toBeVisible();
});

test("tempo esgotado conta como erro", async ({ page }) => {
  await page.clock.install();
  await page.goto("/quiz?category=todas");
  await expect(page.getByTestId("block-transition")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("question")).toBeVisible();
  await page.clock.runFor(10_500);
  const feedback = page.getByTestId("feedback");
  await expect(feedback).toHaveAttribute("data-outcome", "timeout");
  await expect(feedback).toContainText("O tempo acabou");
  await expect(page.getByTestId("score")).toContainText("0");
});

test("partida corrompida no sessionStorage não quebra o resultado", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() =>
    sessionStorage.setItem("qcc:match", JSON.stringify({ category: "todas", questions: [], answers: [{ questionId: "x" }] })),
  );
  await page.goto("/resultado");
  await expect(page.getByText("Nenhuma partida encontrada por aqui.")).toBeVisible();
  await expect(page.getByTestId("error-boundary")).toHaveCount(0);
});

test("transição de bloco aparece antes da 6ª pergunta", async ({ page }) => {
  const responsePromise = page.waitForResponse((r) => r.url().includes("/api/questions"));
  await page.goto("/quiz");
  await responsePromise;
  await page.keyboard.press("Enter");
  for (let i = 0; i < 5; i++) {
    await expect(page.getByTestId("progress")).toHaveText(`${i + 1}/15`);
    await page.keyboard.press("v");
    await expect(page.getByTestId("feedback")).toBeVisible();
    await page.keyboard.press("Enter");
  }
  await expect(page.getByTestId("block-transition")).toContainText("Agora a coisa esquenta: nível Intermediário");
});
