import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { playMatch } from "./helpers";

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" | ")}`)).toEqual([]);
}

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

for (const theme of ["light", "dark"] as const) {
  test.describe(`tema ${theme}`, () => {
    test.use({ colorScheme: theme });

    test("home, quiz, resultado e ranking sem violações de acessibilidade", async ({ page }) => {
      await page.goto("/");
      await expectNoAxeViolations(page);
      await expectNoHorizontalScroll(page);

      await page.goto("/quiz");
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("question")).toBeVisible();
      await expectNoAxeViolations(page);
      await expectNoHorizontalScroll(page);

      await playMatch(page, "todas", (q, i) => (i % 2 === 0 ? q.answer : !q.answer));
      await expectNoAxeViolations(page);
      await expectNoHorizontalScroll(page);

      await page.goto("/ranking");
      await expectNoAxeViolations(page);
      await expectNoHorizontalScroll(page);
    });
  });
}

test("tema escolhido é aplicado antes da pintura e persiste", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("radio", { name: "Tema escuro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("radio", { name: "Tema escuro" })).toHaveAttribute("aria-checked", "true");
});

test("nenhum segredo do servidor no bundle do cliente", () => {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (path.endsWith(".js")) files.push(path);
    }
  };
  walk(join(process.cwd(), ".next", "static"));
  expect(files.length).toBeGreaterThan(0);
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    expect(content, file).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY|SUPABASE_URL|IP_HASH_SALT|service_role/);
  }
});
