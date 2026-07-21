/**
 * e2e/commande.spec.ts — Tunnel de commande côté client
 *
 * Domaine testé : accès, validation minimum convives, règles de prix
 * (remise 10 % à min+5 et livraison 5€+0,59€/km hors Bordeaux),
 * validation, historique horodaté, modification/annulation avant acceptation
 * et verrou après acceptation (bonus employé).
 *
 * Isolation : chaque test inscrit son propre client ou réutilise celui créé
 * en setup. Lecture seule sur les menus seedés.
 *
 * Lancement :
 *   PLAYWRIGHT_BASE_URL=http://localhost:3000 \
 *   bunx playwright test e2e/commande.spec.ts --reporter=line
 */

import { expect, type Page, test } from "@playwright/test";

// ─── Constantes menus seedés ───────────────────────────────────────────────
// Menu 2 : Anniversaire Gourmand — 38 €/pers, min 10
const MENU_2 = { id: 2, pricePerPerson: 38, minPeople: 10, title: "Menu Anniversaire Gourmand" };
// Seuil remise : minPeople + 5 = 15 convives

// Identifiants employé seedé (bonus point 8)
const EMPLOYEE = {
  email: "employe@demo.vite-gourmand.fr",
  password: "EmployeDemo2026!",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Crée un compte client avec un email unique horodaté. Retourne l'email utilisé. */
const registerClient = async (
  page: Page,
  suffix: string,
): Promise<string> => {
  const email = `client-order-${suffix}@example.com`;
  await page.goto("/inscription");
  await page.getByLabel("Prénom").fill("Test");
  await page.getByLabel(/^Nom\b/).fill("QA");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Téléphone").fill("0600000001");
  await page.getByLabel("Adresse postale").fill("1 rue de la Paix");
  await page.getByLabel("Code postal").fill("33000");
  await page.getByLabel("Ville").fill("Bordeaux");
  await page.getByLabel("Mot de passe").fill("TestQA2026Secure!");
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await page.waitForURL("/");
  return email;
};

/** Connexion simple. */
const login = async (page: Page, email: string, password: string) => {
  await page.goto("/connexion");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL("/");
};

/** Déconnexion. */
const logout = async (page: Page) => {
  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await expect(
    page.getByRole("link", { name: "Se connecter" }),
  ).toBeVisible({ timeout: 10_000 });
};

// ─── Calculs de prix attendus (fonction pure miroir de pricing.ts) ──────────
// Tous les arrondi en centimes, comme le fait pricing.ts.
const computeExpected = ({
  pricePerPerson,
  peopleCount,
  minPeople,
  city,
  distanceKm,
}: {
  pricePerPerson: number;
  peopleCount: number;
  minPeople: number;
  city: string;
  distanceKm: number;
}) => {
  const toCents = (euros: number) => Math.round(euros * 100);
  const FREE_CITY = "bordeaux";

  const baseCents = toCents(pricePerPerson) * peopleCount;
  const discountApplied = peopleCount >= minPeople + 5;
  const discountCents = discountApplied ? Math.round(baseCents * 0.1) : 0;
  const isFree = city.trim().toLowerCase() === FREE_CITY;
  const deliveryCents = isFree
    ? 0
    : toCents(5) + Math.round(toCents(0.59) * distanceKm);
  const totalCents = baseCents - discountCents + deliveryCents;

  const fmt = (cents: number) =>
    (cents / 100).toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €";

  return {
    base: fmt(baseCents),
    discount: discountApplied ? `− ${fmt(discountCents)}` : null,
    delivery: isFree ? null : fmt(deliveryCents),
    total: fmt(totalCents),
    totalValue: totalCents / 100,
  };
};

// ─── Tests ──────────────────────────────────────────────────────────────────

test.describe("Tunnel de commande — domaine client", () => {
  // Timeout généreux pour chaque test
  test.setTimeout(90_000);

  // ── Point 1a : visiteur redirigé vers connexion ─────────────────────────
  test("1a — visiteur non connecté → redirigé vers connexion depuis le détail menu", async ({
    page,
  }) => {
    await page.goto(`/menus/${MENU_2.id}`);
    await page.getByRole("link", { name: "Commander ce menu" }).click();
    await page.waitForURL(/\/connexion/, { timeout: 15_000 });
    await expect(page).toHaveURL(/\/connexion/);
  });

  // ── Point 1b : client connecté → page commande pré-remplie ─────────────
  test("1b — client connecté → page commande avec menu pré-positionné et champs pré-remplis", async ({
    page,
  }) => {
    const email = await registerClient(page, `1b-${Date.now()}`);

    // Navigation depuis le détail du menu
    await page.goto(`/menus/${MENU_2.id}`);
    await page.getByRole("link", { name: "Commander ce menu" }).click();
    await page.waitForURL(/\/commander\/\d+/, { timeout: 15_000 });

    // Le bon menu est affiché
    await expect(
      page.getByRole("heading", { name: new RegExp(MENU_2.title) }),
    ).toBeVisible();

    // Les infos client sont pré-remplies (ville du compte = Bordeaux)
    // On vérifie au moins le champ ville qui est contrôlé
    const cityInput = page.locator("#event_city");
    await expect(cityInput).toHaveValue("Bordeaux");

    // Email utilisé est bien unique (pour isolation)
    expect(email).toMatch(/^client-order-/);

    await logout(page);
  });

  // ── Point 2 : minimum de convives ───────────────────────────────────────
  test("2 — impossible de commander en dessous du minimum de convives", async ({
    page,
  }) => {
    await registerClient(page, `2-${Date.now()}`);

    await page.goto(`/commander/${MENU_2.id}`);

    // Saisit une valeur inférieure au minimum (10)
    const countInput = page.locator("#people_count");
    await countInput.fill("5"); // < 10
    await countInput.blur();

    await page.getByRole("button", { name: "Valider ma commande" }).click();

    // Doit afficher une erreur de validation
    await expect(
      page.getByText(/minimum|minimum.*10|10.*personnes|convives/i).first(),
    ).toBeVisible({ timeout: 10_000 });

    // Ne doit PAS avoir navigué vers la confirmation
    await expect(page).not.toHaveURL(/\/compte\/commandes\/\d+/);

    await logout(page);
  });

  // ── Point 3 : remise 10 % à min+5 ────────────────────────────────────────
  test("3 — règle remise : sans remise sous le seuil, avec remise à partir de min+5", async ({
    page,
  }) => {
    await registerClient(page, `3-${Date.now()}`);
    await page.goto(`/commander/${MENU_2.id}`);

    const priceDetail = page.getByRole("region", { name: "Détail du prix" });
    const countInput = page.locator("#people_count");

    // ── Cas A : 12 convives — sous le seuil (seuil = 15) ──
    // Attendu : 12 × 38 = 456 €, pas de remise, livraison offerte (Bordeaux)
    const casA = computeExpected({
      pricePerPerson: MENU_2.pricePerPerson,
      peopleCount: 12,
      minPeople: MENU_2.minPeople,
      city: "Bordeaux",
      distanceKm: 0,
    });
    // Attendu : basePrice = 456,00 €, discount = null, total = 456,00 €

    await countInput.fill("12");
    await countInput.blur();

    // Vérifie que la région contient le prix de base (peut apparaître 2× si base=total)
    await expect(priceDetail.locator("dd").filter({ hasText: casA.base }).first()).toBeVisible({ timeout: 8_000 });
    await expect(priceDetail.getByText("Non applicable", { exact: true })).toBeVisible({
      timeout: 8_000,
    });
    // Le total est dans le dernier <dd> (bloc "Total")
    await expect(priceDetail.locator("dd").last()).toContainText(casA.total, { timeout: 8_000 });

    // ── Cas B : 14 convives — encore sous le seuil (seuil = 15) ──
    // Attendu : 14 × 38 = 532 €, pas de remise, total = 532 €
    const casB = computeExpected({
      pricePerPerson: MENU_2.pricePerPerson,
      peopleCount: 14,
      minPeople: MENU_2.minPeople,
      city: "Bordeaux",
      distanceKm: 0,
    });

    await countInput.fill("14");
    await countInput.blur();

    await expect(priceDetail.locator("dd").filter({ hasText: casB.base }).first()).toBeVisible({ timeout: 8_000 });
    await expect(priceDetail.getByText("Non applicable", { exact: true })).toBeVisible({
      timeout: 8_000,
    });

    // ── Cas C : 15 convives — exactement au seuil (min+5) → remise ──
    // Attendu : 15 × 38 = 570 €, remise 57 €, total 513 €
    const casC = computeExpected({
      pricePerPerson: MENU_2.pricePerPerson,
      peopleCount: 15,
      minPeople: MENU_2.minPeople,
      city: "Bordeaux",
      distanceKm: 0,
    });
    // casC.base = "570,00 €", casC.discount = "− 57,00 €", casC.total = "513,00 €"

    await countInput.fill("15");
    await countInput.blur();

    // Prix de base dans la première dd
    await expect(priceDetail.locator("dd").first()).toContainText(casC.base, { timeout: 8_000 });
    // La remise s'affiche (valeurs différentes → pas d'ambiguïté)
    if (casC.discount) {
      await expect(priceDetail.locator("dd").filter({ hasText: casC.discount })).toBeVisible({
        timeout: 8_000,
      });
    }
    // Total dans la dernière dd
    await expect(priceDetail.locator("dd").last()).toContainText(casC.total, { timeout: 8_000 });

    // ── Cas D : 20 convives — clairement au-dessus du seuil ──
    // Attendu : 20 × 38 = 760 €, remise 76 €, total 684 €
    const casD = computeExpected({
      pricePerPerson: MENU_2.pricePerPerson,
      peopleCount: 20,
      minPeople: MENU_2.minPeople,
      city: "Bordeaux",
      distanceKm: 0,
    });

    await countInput.fill("20");
    await countInput.blur();

    await expect(priceDetail.locator("dd").first()).toContainText(casD.base, { timeout: 8_000 });
    if (casD.discount) {
      await expect(priceDetail.locator("dd").filter({ hasText: casD.discount })).toBeVisible({
        timeout: 8_000,
      });
    }
    await expect(priceDetail.locator("dd").last()).toContainText(casD.total, { timeout: 8_000 });

    await logout(page);
  });

  // ── Point 4 : livraison Bordeaux gratuite ────────────────────────────────
  test("4a — livraison GRATUITE si ville = Bordeaux", async ({ page }) => {
    await registerClient(page, `4a-${Date.now()}`);
    await page.goto(`/commander/${MENU_2.id}`);

    const priceDetail = page.getByRole("region", { name: "Détail du prix" });
    const countInput = page.locator("#people_count");
    const cityInput = page.locator("#event_city");

    await countInput.fill("10");
    // Assure que la ville est bien Bordeaux
    await cityInput.fill("");
    await cityInput.fill("Bordeaux");
    await cityInput.blur();

    // Le champ distance ne doit pas être visible pour Bordeaux
    await expect(page.locator("#distance_km")).toHaveCount(0);

    // Livraison affichée comme "Offerte" (dans le <dd>)
    await expect(priceDetail.locator("dd").filter({ hasText: /^Offerte$/ })).toBeVisible({ timeout: 8_000 });

    // Total = 10 × 38 = 380 € (pas de remise, pas de livraison)
    const expected = computeExpected({
      pricePerPerson: MENU_2.pricePerPerson,
      peopleCount: 10,
      minPeople: MENU_2.minPeople,
      city: "Bordeaux",
      distanceKm: 0,
    });
    await expect(priceDetail.locator("dd").last()).toContainText(expected.total, {
      timeout: 8_000,
    });

    await logout(page);
  });

  // ── Point 4b : livraison hors Bordeaux 5€ + 0,59€/km ───────────────────
  test("4b — livraison hors Bordeaux : 5 € + 0,59 €/km", async ({ page }) => {
    await registerClient(page, `4b-${Date.now()}`);
    await page.goto(`/commander/${MENU_2.id}`);

    const priceDetail = page.getByRole("region", { name: "Détail du prix" });
    const countInput = page.locator("#people_count");
    const cityInput = page.locator("#event_city");

    await countInput.fill("10");
    // Saisit une ville hors Bordeaux
    await cityInput.fill("");
    await cityInput.fill("Le Bouscat");
    await cityInput.blur();

    // Le champ distance devient visible
    const distanceInput = page.locator("#distance_km");
    await expect(distanceInput).toBeVisible({ timeout: 8_000 });

    // Distance = 4,5 km → livraison = 5 + 0,59×4,5
    // En centimes : 500 + Math.round(59 × 4.5) = 500 + Math.round(265.5) = 500 + 266 = 766 → 7,66 €
    await distanceInput.fill("4.5");
    await distanceInput.blur();

    const expected = computeExpected({
      pricePerPerson: MENU_2.pricePerPerson,
      peopleCount: 10,
      minPeople: MENU_2.minPeople,
      city: "Le Bouscat",
      distanceKm: 4.5,
    });
    // expected.delivery = "7,66 €", expected.total = "387,66 €"

    // Le montant de livraison dans la <dd> — exact pour éviter de matcher le total
    // Livraison : la valeur exacte est dans la 3ème <dd> (base, remise, livraison, total)
    // On vérifie que la région contient ce montant de livraison
    await expect(priceDetail.locator("dd").filter({ hasText: expected.delivery! }).first()).toBeVisible({
      timeout: 8_000,
    });
    // Total : dernier <dd>
    await expect(priceDetail.locator("dd").last()).toContainText(expected.total, {
      timeout: 8_000,
    });

    // ── Variante : 10 km ──
    // Livraison = 5 + 0,59×10 = 500 + Math.round(590) = 1090 → 10,90 €
    await distanceInput.fill("10");
    await distanceInput.blur();

    const expected10 = computeExpected({
      pricePerPerson: MENU_2.pricePerPerson,
      peopleCount: 10,
      minPeople: MENU_2.minPeople,
      city: "Le Bouscat",
      distanceKm: 10,
    });

    await expect(priceDetail.locator("dd").filter({ hasText: expected10.delivery! }).first()).toBeVisible({
      timeout: 8_000,
    });
    await expect(priceDetail.locator("dd").last()).toContainText(expected10.total, {
      timeout: 8_000,
    });

    await logout(page);
  });

  // ── Point 4c : combinaison remise + livraison (reproduit le cas parcours.spec) ─
  test("4c — remise + livraison hors Bordeaux : détail complet avant validation", async ({
    page,
  }) => {
    await registerClient(page, `4c-${Date.now()}`);
    await page.goto(`/commander/${MENU_2.id}`);

    const priceDetail = page.getByRole("region", { name: "Détail du prix" });
    const countInput = page.locator("#people_count");
    const cityInput = page.locator("#event_city");

    // 16 convives (>= 15 = min+5 → remise), Le Bouscat 4,5 km
    // Base : 16 × 38 = 608 €
    // Remise : Math.round(60800 × 0.1) = 6080 centimes = 60,80 €
    // Livraison : 500 + Math.round(59 × 4.5) = 500 + 266 = 766 centimes = 7,66 €
    // Total : (60800 - 6080 + 766) / 100 = 55486 / 100 = 554,86 €
    const expected = computeExpected({
      pricePerPerson: MENU_2.pricePerPerson,
      peopleCount: 16,
      minPeople: MENU_2.minPeople,
      city: "Le Bouscat",
      distanceKm: 4.5,
    });

    await countInput.fill("16");
    await cityInput.fill("");
    await cityInput.fill("Le Bouscat");
    await cityInput.blur();

    const distanceInput = page.locator("#distance_km");
    await expect(distanceInput).toBeVisible({ timeout: 8_000 });
    await distanceInput.fill("4.5");
    await distanceInput.blur();

    await expect(priceDetail.getByText(expected.base)).toBeVisible({ timeout: 8_000 });
    await expect(priceDetail.getByText(expected.discount!)).toBeVisible({
      timeout: 8_000,
    });
    await expect(priceDetail.getByText(expected.delivery!)).toBeVisible({
      timeout: 8_000,
    });
    await expect(priceDetail.getByText(expected.total)).toBeVisible({ timeout: 8_000 });

    await logout(page);
  });

  // ── Point 5 : validation → confirmation → historique ────────────────────
  test("5 — commande validée → confirmation puis apparaît dans l'historique", async ({
    page,
  }) => {
    await registerClient(page, `5-${Date.now()}`);
    await page.goto(`/commander/${MENU_2.id}`);

    const countInput = page.locator("#people_count");
    const cityInput = page.locator("#event_city");

    // Formulaire complet — Bordeaux, pas de livraison, pas de remise (10 = min)
    await countInput.fill("10");
    await page
      .getByLabel("Date de l'événement")
      .fill("2026-10-15");
    await page.getByLabel("Heure").fill("12:00");
    await page
      .getByLabel("Adresse du lieu de réception")
      .fill("10 allée des Roses");
    await page.getByLabel("Code postal").fill("33000");
    // La ville est déjà "Bordeaux" (pré-remplie du compte)
    await cityInput.fill("Bordeaux");
    await page.getByLabel("Numéro de GSM pour le jour J").fill("0600000001");

    await page.getByRole("button", { name: "Valider ma commande" }).click();

    // Redirigé vers la page de détail
    await page.waitForURL(/\/compte\/commandes\/\d+/, { timeout: 20_000 });

    // Statut "Soumise" visible
    await expect(
      page.getByText(/Soumise|en attente/i).first(),
    ).toBeVisible({ timeout: 10_000 });

    // Le total est correct : 10 × 38 = 380 €, pas de remise, Bordeaux
    const expected = computeExpected({
      pricePerPerson: MENU_2.pricePerPerson,
      peopleCount: 10,
      minPeople: MENU_2.minPeople,
      city: "Bordeaux",
      distanceKm: 0,
    });
    await expect(page.getByText(expected.total).first()).toBeVisible({ timeout: 8_000 });

    // La commande apparaît dans l'historique (/compte)
    await page.goto("/compte");
    await expect(
      page.getByRole("link", { name: /Détail|commande/i }).first(),
    ).toBeVisible({ timeout: 10_000 });

    await logout(page);
  });

  // ── Point 6 : suivi horodaté ─────────────────────────────────────────────
  test("6 — la commande affiche ses statuts avec date/heure", async ({
    page,
  }) => {
    await registerClient(page, `6-${Date.now()}`);
    await page.goto(`/commander/${MENU_2.id}`);

    // Saisie minimale valide
    await page.locator("#people_count").fill("10");
    await page.getByLabel("Date de l'événement").fill("2026-10-20");
    await page.getByLabel("Heure").fill("14:00");
    await page.getByLabel("Adresse du lieu de réception").fill("5 cours Victor Hugo");
    await page.getByLabel("Code postal").fill("33000");
    await page.locator("#event_city").fill("Bordeaux");
    await page.getByLabel("Numéro de GSM pour le jour J").fill("0600000002");

    await page.getByRole("button", { name: "Valider ma commande" }).click();
    await page.waitForURL(/\/compte\/commandes\/\d+/, { timeout: 20_000 });

    // Section "Suivi de la commande" présente
    await expect(
      page.getByRole("heading", { name: /Suivi de la commande/i }),
    ).toBeVisible({ timeout: 10_000 });

    // Au moins une entrée d'historique avec un statut et une date lisible
    // Le statut "Soumise" doit être dans la liste de suivi
    const suivi = page.getByRole("list").filter({
      has: page.locator("li"),
    });

    // La page affiche le statut "Soumise" et une date formatée en FR
    // Exemple : "1 janvier 2026 à 14:00"
    const statusInTimeline = page.locator("section").filter({
      hasText: /Suivi de la commande/i,
    });
    await expect(statusInTimeline.getByText(/Soumise/i)).toBeVisible({
      timeout: 10_000,
    });
    // Vérifie qu'une date est affichée (format fr-FR : "21 juillet 2026")
    await expect(
      statusInTimeline.getByText(/\d{1,2}\s+\w+\s+\d{4}/),
    ).toBeVisible({ timeout: 10_000 });

    await logout(page);
  });

  // ── Point 7 : modification avant acceptation ─────────────────────────────
  test("7a — modification d'une commande avant acceptation", async ({
    page,
  }) => {
    await registerClient(page, `7a-${Date.now()}`);

    // Crée une commande
    await page.goto(`/commander/${MENU_2.id}`);
    await page.locator("#people_count").fill("10");
    await page.getByLabel("Date de l'événement").fill("2026-11-01");
    await page.getByLabel("Heure").fill("12:00");
    await page.getByLabel("Adresse du lieu de réception").fill("3 place Gambetta");
    await page.getByLabel("Code postal").fill("33000");
    await page.locator("#event_city").fill("Bordeaux");
    await page.getByLabel("Numéro de GSM pour le jour J").fill("0600000003");
    await page.getByRole("button", { name: "Valider ma commande" }).click();
    await page.waitForURL(/\/compte\/commandes\/\d+/, { timeout: 20_000 });

    // Le lien "Modifier la commande" est présent
    const modifyLink = page.getByRole("link", { name: "Modifier la commande" });
    await expect(modifyLink).toBeVisible({ timeout: 10_000 });

    // Clique sur modifier
    await modifyLink.click();
    await page.waitForURL(/\/compte\/commandes\/\d+\/modifier/, { timeout: 15_000 });

    // Modifie le nombre de convives (on passe à 12 — sans remise)
    const countInput = page.locator("#people_count");
    await countInput.fill("12");

    // Modifie le GSM
    await page.getByLabel("Numéro de GSM pour le jour J").fill("0700000099");

    await page.getByRole("button", { name: "Enregistrer les modifications" }).click();

    // Confirmation de mise à jour
    await expect(
      page.getByText(/mise à jour|modifiée/i).first(),
    ).toBeVisible({ timeout: 15_000 });

    await logout(page);
  });

  // ── Point 7b : annulation avant acceptation ──────────────────────────────
  test("7b — annulation d'une commande avant acceptation", async ({ page }) => {
    await registerClient(page, `7b-${Date.now()}`);

    // Crée une commande
    await page.goto(`/commander/${MENU_2.id}`);
    await page.locator("#people_count").fill("10");
    await page.getByLabel("Date de l'événement").fill("2026-11-05");
    await page.getByLabel("Heure").fill("13:00");
    await page.getByLabel("Adresse du lieu de réception").fill("7 rue Fondaudège");
    await page.getByLabel("Code postal").fill("33000");
    await page.locator("#event_city").fill("Bordeaux");
    await page.getByLabel("Numéro de GSM pour le jour J").fill("0600000004");
    await page.getByRole("button", { name: "Valider ma commande" }).click();
    await page.waitForURL(/\/compte\/commandes\/\d+/, { timeout: 20_000 });

    // Le bouton annuler est présent
    await expect(
      page.getByRole("button", { name: "Annuler la commande" }),
    ).toBeVisible({ timeout: 10_000 });

    // Premier clic → armement de la confirmation
    await page.getByRole("button", { name: "Annuler la commande" }).click();
    await expect(
      page.getByText(/Confirmer l'annulation/i),
    ).toBeVisible({ timeout: 8_000 });

    // Second clic → annulation effective
    await page.getByRole("button", { name: "Oui, annuler la commande" }).click();
    await expect(
      page.getByText(/annulée/i).first(),
    ).toBeVisible({ timeout: 15_000 });

    // Les boutons modifier/annuler ne sont plus présents
    await expect(
      page.getByRole("link", { name: "Modifier la commande" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Annuler la commande" }),
    ).toHaveCount(0);

    await logout(page);
  });

  // ── Point 8 (Bonus) : verrou après acceptation par l'employé ────────────
  test("8 — bonus : verrou modification/annulation après acceptation employé", async ({
    page,
    browser,
  }) => {
    // ── Étape 1 : créer et récupérer l'ID de la commande ──
    const clientEmail = await registerClient(page, `8-${Date.now()}`);
    await page.goto(`/commander/${MENU_2.id}`);
    await page.locator("#people_count").fill("10");
    await page.getByLabel("Date de l'événement").fill("2026-12-01");
    await page.getByLabel("Heure").fill("15:00");
    await page.getByLabel("Adresse du lieu de réception").fill("2 quai Richelieu");
    await page.getByLabel("Code postal").fill("33000");
    await page.locator("#event_city").fill("Bordeaux");
    await page.getByLabel("Numéro de GSM pour le jour J").fill("0600000005");
    await page.getByRole("button", { name: "Valider ma commande" }).click();
    await page.waitForURL(/\/compte\/commandes\/(\d+)/, { timeout: 20_000 });

    // Extrait l'ID depuis l'URL
    const orderUrl = page.url();
    const orderIdMatch = orderUrl.match(/\/compte\/commandes\/(\d+)/);
    expect(orderIdMatch).not.toBeNull();
    const orderId = orderIdMatch![1];

    // ── Étape 2 : l'employé accepte la commande dans un nouveau contexte ──
    const employeeContext = await browser.newContext();
    const employeePage = await employeeContext.newPage();

    await employeePage.goto("/connexion");
    await employeePage.getByLabel("Adresse email").fill(EMPLOYEE.email);
    await employeePage.getByLabel("Mot de passe").fill(EMPLOYEE.password);
    await employeePage.getByRole("button", { name: "Se connecter" }).click();
    await employeePage.waitForURL("/", { timeout: 15_000 });

    // Navigue directement vers la page de gestion de la commande
    await employeePage.goto(`/employe/commandes/${orderId}`);

    // Clique sur → Acceptée
    const acceptButton = employeePage.getByRole("button", { name: "→ Acceptée" });
    await expect(acceptButton).toBeVisible({ timeout: 15_000 });
    await acceptButton.click();
    await employeePage.getByRole("button", { name: "Confirmer" }).click();
    // Attend que le nouveau bouton "→ En préparation" apparaisse
    await expect(
      employeePage.getByRole("button", { name: "→ En préparation" }),
    ).toBeVisible({ timeout: 15_000 });

    await employeeContext.close();

    // ── Étape 3 : côté client, modification/annulation bloquée ──
    // Recharge la page de la commande (le client est toujours connecté)
    await page.goto(orderUrl);
    await page.waitForLoadState("networkidle");

    // Le lien "Modifier" ne doit plus être présent
    await expect(
      page.getByRole("link", { name: "Modifier la commande" }),
    ).toHaveCount(0, { timeout: 10_000 });

    // Le bouton "Annuler" ne doit plus être présent
    await expect(
      page.getByRole("button", { name: "Annuler la commande" }),
    ).toHaveCount(0, { timeout: 10_000 });

    // Le statut affiché doit refléter "Acceptée"
    await expect(
      page.getByText(/Acceptée/i).first(),
    ).toBeVisible({ timeout: 10_000 });

    await logout(page);
  });
});
