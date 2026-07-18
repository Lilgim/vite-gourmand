import { expect, test } from "@playwright/test";

// Contrôle responsive : les parcours clés restent utilisables sur mobile
// (projet "mobile" de playwright.config.ts : iPhone 14).

test("mobile : accueil, menus et fiche menu utilisables", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /traiteur bordelais/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Découvrir nos menus" }),
  ).toBeVisible();

  await page.goto("/menus");
  await expect(page.getByLabel("Régime alimentaire")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Voir le menu/ }).first(),
  ).toBeVisible();

  await page.goto("/menus/2");
  await expect(
    page.getByRole("link", { name: "Commander ce menu" }),
  ).toBeVisible();

  // Aucun débordement horizontal
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(overflow).toBe(false);
});
