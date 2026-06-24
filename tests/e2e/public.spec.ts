import { expect, test } from "@playwright/test";

test("public localized archive pages render real content", async ({ page }) => {
  await page.goto("/ru/journal");

  await expect(page.getByRole("heading", { name: "Журнал", exact: true })).toBeVisible();
  await expect(page.getByText(/Путевые заметки|The Forest|asdf/i).first()).toBeVisible();

  await page.goto("/pt/experiments");

  await expect(page.getByRole("heading", { name: /Experimentos/i })).toBeVisible();
  await expect(page.getByRole("searchbox")).toBeVisible();
});

test("experiments search filters visible cards", async ({ page }) => {
  await page.goto("/pt/experiments");

  const search = page.getByRole("searchbox");
  await search.fill("definitely-no-such-experiment");

  await expect(page.getByText(/No experiments match/i)).toBeVisible();
});
