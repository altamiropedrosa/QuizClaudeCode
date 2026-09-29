import { expect, test } from "@playwright/test";
import { playMatch } from "./helpers";

test("salva o apelido ao final da partida e mostra a posição", async ({ page }) => {
  await playMatch(page, "todas");

  let posted: { nickname: string; category: string; answers: unknown[] } | null = null;
  await page.route("**/api/scores", async (route) => {
    posted = route.request().postDataJSON();
    await route.fulfill({ status: 201, json: { score: 3300, correct: 15, rank: 1 } });
  });

  const input = page.getByLabel("Salvar no ranking (opcional)");
  await input.fill("ab");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("3 a 16 caracteres")).toBeVisible();
  expect(posted).toBeNull();

  await input.fill("maria_dev");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("status").filter({ hasText: "#1" })).toContainText("maria_dev");
  expect(posted!.nickname).toBe("maria_dev");
  expect(posted!.category).toBe("todas");
  expect(posted!.answers).toHaveLength(15);
});

test("mensagem amigável quando o servidor limita as submissões", async ({ page }) => {
  await playMatch(page, "todas");
  await page.route("**/api/scores", (route) => route.fulfill({ status: 429, json: { error: "rate_limited" } }));
  await page.getByLabel("Salvar no ranking (opcional)").fill("maria_dev");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "última hora" })).toBeVisible();
});

test("ranking indisponível não quebra o app", async ({ page }) => {
  // No Supabase env in the E2E server: the ranking must degrade gracefully.
  test.skip(!!process.env.SUPABASE_URL, "Supabase configurado neste ambiente");
  await page.goto("/ranking?category=features");
  await expect(page.getByTestId("ranking-unavailable")).toContainText("Ranking indisponível no momento");
  await expect(page.getByRole("link", { name: "Features e Produtividade" })).toHaveAttribute("aria-current", "page");
  await page.getByRole("link", { name: "bora jogar" }).click();
  await expect(page.getByRole("button", { name: /Começar/ })).toBeVisible();
});
