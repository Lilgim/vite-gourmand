import { expect, type BrowserContext, type Page, test } from "@playwright/test";

// ─── Données seedées (ne pas modifier / ne pas supprimer) ───────────────────
const ADMIN = {
  email: "admin@demo.vite-gourmand.fr",
  password: "AdminDemo2026!",
};
const EMPLOYEE_SEEDED = {
  email: "employe@demo.vite-gourmand.fr",
  password: "EmployeDemo2026!",
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const login = async (page: Page, email: string, password: string) => {
  await page.goto("/connexion");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL("/");
};

const loginFails = async (
  page: Page,
  email: string,
  password: string,
): Promise<boolean> => {
  await page.goto("/connexion");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  // Si on reste sur /connexion (ou qu'un message d'erreur apparaît), la
  // connexion a échoué.  On attend un court délai pour laisser la navigation
  // éventuelle se produire.
  await page.waitForTimeout(1500);
  return page.url().includes("/connexion");
};

// ─── Tests ──────────────────────────────────────────────────────────────────

test.describe("Admin — Espace administrateur + statistiques NoSQL", () => {
  // Timeout généreux pour les Server Actions Next.js
  test.setTimeout(90_000);

  // ── 1. Création d'un compte employé ────────────────────────────────────
  test("1a — admin : création d'un compte employé avec succès", async ({
    page,
  }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto("/admin/employes");

    // Le formulaire de création est visible
    await expect(
      page.getByRole("heading", { name: "Créer un compte employé" }),
    ).toBeVisible();

    const uniqueEmail = `emp-${Date.now()}@example.com`;
    await page.getByLabel("Prénom").fill("TestPrenom");
    await page.getByLabel(/^Nom\b/).fill("TestNom");
    await page.getByLabel("Adresse email").fill(uniqueEmail);
    await page.getByLabel("Mot de passe initial").fill("MotDePasseTest2026!");
    await page.getByRole("button", { name: "Créer le compte" }).click();

    // Message de succès attendu
    await expect(page.getByText("Compte employé créé.")).toBeVisible({
      timeout: 15_000,
    });

    // Le compte apparaît dans la liste (au moins une cellule avec ce nom)
    await expect(
      page.getByRole("cell", { name: "TestPrenom TestNom", exact: true }).first(),
    ).toBeVisible();
  });

  test("1b — le nouvel employé peut se connecter avec ses identifiants", async ({
    browser,
  }) => {
    // Phase 1 : admin crée l'employé dans un contexte dédié
    const adminCtx: BrowserContext = await browser.newContext();
    const adminPage = await adminCtx.newPage();

    await login(adminPage, ADMIN.email, ADMIN.password);
    await adminPage.goto("/admin/employes");

    const uniqueEmail = `emp-login-${Date.now()}@example.com`;
    const password = "ConnexionTest2026!";

    await adminPage.getByLabel("Prénom").fill("LoginPrenom");
    await adminPage.getByLabel(/^Nom\b/).fill("LoginNom");
    await adminPage.getByLabel("Adresse email").fill(uniqueEmail);
    await adminPage.getByLabel("Mot de passe initial").fill(password);
    await adminPage.getByRole("button", { name: "Créer le compte" }).click();
    await expect(adminPage.getByText("Compte employé créé.")).toBeVisible({
      timeout: 15_000,
    });
    await adminCtx.close();

    // Phase 2 : le nouvel employé se connecte dans un NOUVEAU contexte
    const empCtx: BrowserContext = await browser.newContext();
    const empPage = await empCtx.newPage();

    await empPage.goto("/connexion");
    await empPage.getByLabel("Adresse email").fill(uniqueEmail);
    await empPage.getByLabel("Mot de passe").fill(password);
    await empPage.getByRole("button", { name: "Se connecter" }).click();
    // La connexion réussie redirige vers "/"
    await empPage.waitForURL("/", { timeout: 15_000 });
    await empCtx.close();
  });

  // ── 2. Désactivation d'un compte employé ───────────────────────────────
  test("2 — désactivation : l'employé désactivé ne peut plus se connecter", async ({
    browser,
  }) => {
    // Phase 1 : admin crée PUIS désactive un employé
    const adminCtx: BrowserContext = await browser.newContext();
    const adminPage = await adminCtx.newPage();

    await login(adminPage, ADMIN.email, ADMIN.password);
    await adminPage.goto("/admin/employes");

    const uniqueEmail = `emp-deact-${Date.now()}@example.com`;
    const password = "DesactivTest2026!";
    const fullName = `DeactPrenom DeactNom`;

    await adminPage.getByLabel("Prénom").fill("DeactPrenom");
    await adminPage.getByLabel(/^Nom\b/).fill("DeactNom");
    await adminPage.getByLabel("Adresse email").fill(uniqueEmail);
    await adminPage.getByLabel("Mot de passe initial").fill(password);
    await adminPage.getByRole("button", { name: "Créer le compte" }).click();
    await expect(adminPage.getByText("Compte employé créé.")).toBeVisible({
      timeout: 15_000,
    });

    // Désactiver le compte créé (pas le compte seedé !)
    // On cible la ligne du tableau via l'email unique pour éviter les conflits
    // avec des runs précédents qui auraient laissé des "DeactPrenom" en base.
    const targetRow = adminPage.getByRole("row", {
      name: new RegExp(uniqueEmail),
    });
    await targetRow
      .getByRole("button", { name: /Désactiver/ })
      .click();

    // Après désactivation, le bouton de la même ligne doit devenir "Réactiver"
    await expect(
      targetRow.getByRole("button", { name: /Réactiver/ }),
    ).toBeVisible({ timeout: 15_000 });
    await adminCtx.close();

    // Phase 2 : l'employé désactivé tente de se connecter (nouveau contexte)
    const empCtx: BrowserContext = await browser.newContext();
    const empPage = await empCtx.newPage();

    const failed = await loginFails(empPage, uniqueEmail, password);
    expect(failed).toBe(true);
    await empCtx.close();
  });

  // ── 3. Impossible de créer un ADMIN depuis l'UI ─────────────────────────
  test("3 — formulaire de création : aucune option rôle admin proposée", async ({
    page,
  }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto("/admin/employes");

    // Vérification : pas de sélecteur de rôle dans le formulaire
    const roleSelect = page.locator("select[name='role']");
    await expect(roleSelect).toHaveCount(0);

    // Vérification supplémentaire : aucun texte "admin" parmi les options
    // du formulaire (au cas où le select aurait un autre name)
    const allOptions = await page.locator("form option").allTextContents();
    const hasAdminOption = allOptions.some((opt) =>
      opt.toLowerCase().includes("admin"),
    );
    expect(hasAdminOption).toBe(false);
  });

  // ── 4. L'admin hérite des capacités employé ─────────────────────────────
  test("4 — admin accède à l'espace employé et voit les commandes", async ({
    page,
  }) => {
    await login(page, ADMIN.email, ADMIN.password);

    // L'admin peut naviguer vers /employe
    await page.goto("/employe");
    // Doit rester sur /employe (pas de redirection)
    await expect(page).toHaveURL(/\/employe/);

    // Le titre de l'espace employé est visible (le <p> dans le layout)
    await expect(page.locator("p.text-primary", { hasText: "Espace employé" })).toBeVisible();

    // Le heading principal des commandes est visible
    await expect(
      page.getByRole("heading", { name: "Commandes" }),
    ).toBeVisible();

    // La navigation employe est bien présente (lien "Menus")
    await expect(
      page.getByRole("link", { name: "Menus" }).first(),
    ).toBeVisible();
  });

  // ── 5. Statistiques MongoDB ──────────────────────────────────────────────
  test("5a — tableau de bord admin : heading Statistiques et section Commandes par menu", async ({
    page,
  }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto("/admin");

    await expect(
      page.getByRole("heading", { name: "Statistiques" }),
    ).toBeVisible();

    // Mention de la source MongoDB
    await expect(
      page.getByText(/base NoSQL \(MongoDB\)/i),
    ).toBeVisible();

    // Section "Commandes par menu"
    await expect(
      page.getByRole("heading", { name: "Commandes par menu" }),
    ).toBeVisible();
  });

  test("5b — graphique : au moins une barre (role=img) est rendue", async ({
    page,
  }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto("/admin");

    // Les barres graphiques sont des div[role=img] avec aria-label
    const bars = page.locator('[role="img"][aria-label]');
    const count = await bars.count();
    // Il doit y avoir au moins une barre si des commandes existent
    // (la base seedée contient des commandes)
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("5c — chiffre d'affaires global affiché en format numérique avec €", async ({
    page,
  }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto("/admin");

    // Le CA est affiché dans la section des métriques
    const caSection = page.locator("text=Chiffre d'affaires sur la période");
    await expect(caSection).toBeVisible();

    // Un montant en euros est présent (format "X XXX,XX €" ou "0,00 €")
    const caAmount = page.locator("p.mt-1.text-3xl").nth(1);
    await expect(caAmount).toBeVisible();
    const caText = await caAmount.textContent();
    // Contient "€" et des chiffres
    expect(caText).toMatch(/\d/);
    expect(caText).toContain("€");
  });

  test("5d — filtre par menu : soumettre le filtre modifie l'URL et le tableau", async ({
    page,
  }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto("/admin");

    // Récupère la première option de menu (hors "Tous les menus")
    const menuSelect = page.locator("select#menu");
    await expect(menuSelect).toBeVisible();
    const options = await menuSelect.locator("option").all();
    // Il doit y avoir au moins une option de menu en plus de "Tous les menus"
    expect(options.length).toBeGreaterThanOrEqual(2);

    const firstMenuValue = await options[1].getAttribute("value");
    const firstMenuText = await options[1].textContent();

    // Sélectionne le premier menu et soumet
    await menuSelect.selectOption(firstMenuValue ?? "");
    await page.getByRole("button", { name: "Filtrer la période" }).click();

    // L'URL contient le paramètre menu
    await expect(page).toHaveURL(new RegExp(`menu=${firstMenuValue}`));

    // La page affiche des données filtrées : soit le menu sélectionné
    // apparaît dans le tableau, soit le message "Aucune commande"
    const hasMenuInTable = await page
      .getByRole("cell", { name: firstMenuText?.trim() ?? "" })
      .isVisible()
      .catch(() => false);
    const hasNoOrderMsg = await page
      .getByText("Aucune commande sur cette période.")
      .isVisible()
      .catch(() => false);
    expect(hasMenuInTable || hasNoOrderMsg).toBe(true);
  });

  test("5e — filtre par période : saisir des dates et soumettre modifie l'URL", async ({
    page,
  }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto("/admin");

    await page.locator("input#du").fill("2025-01-01");
    await page.locator("input#au").fill("2026-12-31");
    await page.getByRole("button", { name: "Filtrer la période" }).click();

    // L'URL reflète les paramètres de période
    await expect(page).toHaveURL(/du=2025-01-01/);
    await expect(page).toHaveURL(/au=2026-12-31/);

    // La page reste sur /admin (pas de redirection)
    await expect(page).toHaveURL(/\/admin/);
  });

  test("5f — filtre combiné menu + période : tableau cohérent", async ({
    page,
  }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto("/admin");

    const menuSelect = page.locator("select#menu");
    const options = await menuSelect.locator("option").all();
    if (options.length >= 2) {
      const firstMenuValue = await options[1].getAttribute("value");
      await menuSelect.selectOption(firstMenuValue ?? "");
    }

    await page.locator("input#du").fill("2025-01-01");
    await page.locator("input#au").fill("2026-12-31");
    await page.getByRole("button", { name: "Filtrer la période" }).click();

    // La page se recharge avec les deux filtres
    await expect(page).toHaveURL(/du=2025-01-01/);
    await expect(page).toHaveURL(/au=2026-12-31/);

    // Le tableau de détail est toujours présent
    await expect(
      page.getByRole("heading", { name: "Détail chiffré" }),
    ).toBeVisible();
  });

  // ── 6. Contrôle d'accès : un employé ne peut pas accéder à /admin ───────
  test("6 — contrôle d'accès : l'employé seedé est refoulé de /admin", async ({
    page,
  }) => {
    await login(page, EMPLOYEE_SEEDED.email, EMPLOYEE_SEEDED.password);

    // Tentative d'accès à /admin
    await page.goto("/admin");
    // L'app redirige vers "/" (requireRole("admin") → redirect("/"))
    await expect(page).not.toHaveURL(/\/admin/);
  });
});
