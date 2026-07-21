import { expect, type Page, test } from "@playwright/test";

// Domaine : Authentification / Compte / Contrôle d'accès
// Chaque test crée ses propres données avec un suffixe unique basé sur Date.now().
// Les comptes seedés ne sont jamais modifiés ni supprimés.

test.setTimeout(60_000);

// ---------- Comptes seedés (lecture seule) ----------
const SEEDED_CLIENT = {
  email: "client@demo.vite-gourmand.fr",
  password: "ClientDemo2026!",
};

// ---------- Helpers ----------
const loginWith = async (page: Page, email: string, password: string) => {
  await page.goto("/connexion");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
};

/**
 * Remplit le formulaire d'inscription avec des valeurs valides sauf le mot de
 * passe (à remplir par l'appelant). Utilise les id des inputs pour éviter
 * les ambiguïtés de label (ex. "Prénom" contient "Nom" en substring).
 */
const fillRegistrationFields = async (page: Page, email: string) => {
  await page.goto("/inscription");
  // Les id des inputs correspondent aux noms des champs dans FormField (id={name}).
  await page.locator("#first_name").fill("Test");
  await page.locator("#last_name").fill("Auth");
  await page.locator("#email").fill(email);
  await page.locator("#phone").fill("0612345678");
  await page.locator("#address").fill("12 rue de la Paix");
  await page.locator("#postal_code").fill("33000");
  await page.locator("#city").fill("Bordeaux");
};

// ---------- 1. Inscription — rejets de mot de passe ----------

test.describe("Inscription — validation du mot de passe", () => {
  test("rejet : mot de passe trop court (< 10 caractères)", async ({
    page,
  }) => {
    const ts = Date.now();
    await fillRegistrationFields(page, `test-auth-short-${ts}@example.com`);
    await page.locator("#password").fill("Ab1!xy");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(
      page.getByText(/au moins 10 caractères/i),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page).not.toHaveURL("/");
  });

  test("rejet : mot de passe sans majuscule", async ({ page }) => {
    const ts = Date.now();
    await fillRegistrationFields(page, `test-auth-nomaj-${ts}@example.com`);
    await page.locator("#password").fill("abcdef1!xy");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(
      page.getByText(/au moins une majuscule/i),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page).not.toHaveURL("/");
  });

  test("rejet : mot de passe sans minuscule", async ({ page }) => {
    const ts = Date.now();
    await fillRegistrationFields(page, `test-auth-nomin-${ts}@example.com`);
    await page.locator("#password").fill("ABCDEF1!XY");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(
      page.getByText(/au moins une minuscule/i),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page).not.toHaveURL("/");
  });

  test("rejet : mot de passe sans chiffre", async ({ page }) => {
    const ts = Date.now();
    await fillRegistrationFields(page, `test-auth-nonum-${ts}@example.com`);
    await page.locator("#password").fill("Abcdefgh!x");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(
      page.getByText(/au moins un chiffre/i),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page).not.toHaveURL("/");
  });

  test("rejet : mot de passe sans caractère spécial", async ({ page }) => {
    const ts = Date.now();
    await fillRegistrationFields(page, `test-auth-nospec-${ts}@example.com`);
    await page.locator("#password").fill("Abcdefgh12");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(
      page.getByText(/au moins un caractère spécial/i),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page).not.toHaveURL("/");
  });
});

// ---------- 2. Inscription réussie + rôle client ----------

test("Inscription réussie : redirection vers accueil, rôle client", async ({
  page,
}) => {
  const ts = Date.now();
  const email = `test-auth-reg-${ts}@example.com`;

  await page.goto("/inscription");
  await page.locator("#first_name").fill("Gabin");
  await page.locator("#last_name").fill("AuthTest");
  await page.locator("#email").fill(email);
  await page.locator("#phone").fill("0612345678");
  await page.locator("#address").fill("1 rue Test");
  await page.locator("#postal_code").fill("33000");
  await page.locator("#city").fill("Bordeaux");
  await page.locator("#password").fill("TestAuth2026!");
  await page.getByRole("button", { name: "Créer mon compte" }).click();

  // Redirection vers la page d'accueil
  await page.waitForURL("/", { timeout: 15_000 });

  // Message de bienvenue / prénom visible dans la nav
  await expect(page.getByText(/Gabin/)).toBeVisible({ timeout: 10_000 });

  // Le rôle est "client" : les espaces employé/admin ne sont PAS accessibles
  await page.goto("/employe");
  await expect(page).not.toHaveURL(/\/employe/, { timeout: 10_000 });

  await page.goto("/admin");
  await expect(page).not.toHaveURL(/\/admin/, { timeout: 10_000 });
});

// ---------- 3. Connexion / Déconnexion ----------

test.describe("Connexion / Déconnexion", () => {
  test("connexion avec le compte client seedé puis déconnexion", async ({
    page,
  }) => {
    await loginWith(page, SEEDED_CLIENT.email, SEEDED_CLIENT.password);
    await page.waitForURL("/", { timeout: 15_000 });

    // On est connecté : le lien "Se connecter" n'est plus visible
    await expect(
      page.getByRole("link", { name: "Se connecter" }),
    ).not.toBeVisible();

    // Déconnexion
    await page.getByRole("button", { name: "Se déconnecter" }).click();
    await expect(
      page.getByRole("link", { name: "Se connecter" }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("connexion avec un compte créé à la volée", async ({ page }) => {
    const ts = Date.now();
    const email = `test-auth-login-${ts}@example.com`;

    // Inscription d'abord
    await page.goto("/inscription");
    await page.locator("#first_name").fill("Login");
    await page.locator("#last_name").fill("Fresh");
    await page.locator("#email").fill(email);
    await page.locator("#phone").fill("0698765432");
    await page.locator("#address").fill("5 avenue de Bordeaux");
    await page.locator("#postal_code").fill("33000");
    await page.locator("#city").fill("Bordeaux");
    await page.locator("#password").fill("FreshLogin2026!");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await page.waitForURL("/", { timeout: 15_000 });

    // Déconnexion
    await page.getByRole("button", { name: "Se déconnecter" }).click();
    await page.waitForURL("/", { timeout: 10_000 });

    // Reconnexion avec les identifiants du compte fraichement créé
    await loginWith(page, email, "FreshLogin2026!");
    await page.waitForURL("/", { timeout: 15_000 });
    await expect(page.getByText(/Login/)).toBeVisible({ timeout: 10_000 });
  });

  test("connexion avec identifiants incorrects : message générique", async ({
    page,
  }) => {
    await loginWith(
      page,
      "inexistant@example.com",
      "MauvaisMotDePasse2026!",
    );
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/identifiants incorrects/i)).toBeVisible({
      timeout: 10_000,
    });
    await expect(page).not.toHaveURL("/");
  });
});

// ---------- 4. Mot de passe oublié — anti-énumération ----------

test.describe("Mot de passe oublié — anti-énumération", () => {
  const GENERIC_MSG =
    "Si ce compte existe, un lien de réinitialisation a été envoyé.";

  test("email existant : message générique", async ({ page }) => {
    await page.goto("/mot-de-passe-oublie");
    await page.locator("#email").fill(SEEDED_CLIENT.email);
    await page.getByRole("button", { name: "Recevoir le lien" }).click();
    await expect(page.getByRole("status")).toContainText(GENERIC_MSG, {
      timeout: 10_000,
    });
  });

  test("email inexistant : même message générique (anti-énumération)", async ({
    page,
  }) => {
    await page.goto("/mot-de-passe-oublie");
    await page
      .locator("#email")
      .fill(`inexistant-${Date.now()}@example.com`);
    await page.getByRole("button", { name: "Recevoir le lien" }).click();
    await expect(page.getByRole("status")).toContainText(GENERIC_MSG, {
      timeout: 10_000,
    });
  });

  test("les deux messages sont IDENTIQUES (pas d'énumération de comptes)", async ({
    page,
  }) => {
    // Email existant
    await page.goto("/mot-de-passe-oublie");
    await page.locator("#email").fill(SEEDED_CLIENT.email);
    await page.getByRole("button", { name: "Recevoir le lien" }).click();
    const msgExistant = await page
      .getByRole("status")
      .innerText({ timeout: 10_000 });

    // Email inexistant
    await page.goto("/mot-de-passe-oublie");
    await page
      .locator("#email")
      .fill(`inexistant-${Date.now()}@example.com`);
    await page.getByRole("button", { name: "Recevoir le lien" }).click();
    const msgInexistant = await page
      .getByRole("status")
      .innerText({ timeout: 10_000 });

    expect(msgExistant.trim()).toBe(msgInexistant.trim());
  });
});

// ---------- 5. Profil — modification persistée après reload ----------

test("Profil : modification du téléphone persistée après reload", async ({
  page,
}) => {
  const ts = Date.now();
  const email = `test-auth-profil-${ts}@example.com`;
  const newPhone = "0699887766";

  // Inscription
  await page.goto("/inscription");
  await page.locator("#first_name").fill("ProfilTest");
  await page.locator("#last_name").fill("Auth");
  await page.locator("#email").fill(email);
  await page.locator("#phone").fill("0612345678");
  await page.locator("#address").fill("7 rue du Profil");
  await page.locator("#postal_code").fill("33000");
  await page.locator("#city").fill("Bordeaux");
  await page.locator("#password").fill("ProfilAuth2026!");
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await page.waitForURL("/", { timeout: 15_000 });

  // Page compte — mise à jour du téléphone
  await page.goto("/compte");
  // Sur /compte le champ téléphone du profil a aussi id="phone"
  await page.locator("#phone").fill(newPhone);
  await page
    .getByRole("button", { name: "Enregistrer mes informations" })
    .click();

  // Message de succès
  await expect(page.getByRole("status")).toContainText(
    "Vos informations ont été mises à jour.",
    { timeout: 10_000 },
  );

  // Reload de la page et vérification de la persistance
  await page.reload();
  await expect(page.locator("#phone")).toHaveValue(newPhone, {
    timeout: 10_000,
  });
});

// ---------- 6. Contrôle d'accès ----------

test.describe("Contrôle d'accès", () => {
  test("client connecté : /employe et /admin redirigent hors de ces espaces", async ({
    page,
  }) => {
    const ts = Date.now();
    const email = `test-auth-acl-${ts}@example.com`;

    // Inscription client
    await page.goto("/inscription");
    await page.locator("#first_name").fill("ACL");
    await page.locator("#last_name").fill("Client");
    await page.locator("#email").fill(email);
    await page.locator("#phone").fill("0611223344");
    await page.locator("#address").fill("3 impasse ACL");
    await page.locator("#postal_code").fill("33000");
    await page.locator("#city").fill("Bordeaux");
    await page.locator("#password").fill("AclClient2026!");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await page.waitForURL("/", { timeout: 15_000 });

    // Tente d'accéder à /employe
    await page.goto("/employe");
    await expect(page).not.toHaveURL(/\/employe/, { timeout: 10_000 });

    // Tente d'accéder à /admin
    await page.goto("/admin");
    await expect(page).not.toHaveURL(/\/admin/, { timeout: 10_000 });
  });

  test("utilisateur déconnecté : /compte redirige vers /connexion", async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto("/compte");
    await page.waitForURL(/\/connexion/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/connexion/);
  });

  test("utilisateur déconnecté : /employe redirige vers /connexion", async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto("/employe");
    await page.waitForURL(/\/connexion/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/connexion/);
  });

  test("utilisateur déconnecté : /admin redirige vers /connexion", async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto("/admin");
    await page.waitForURL(/\/connexion/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/connexion/);
  });
});

// ---------- 7. Sécurité session : cookie vg_session httpOnly ----------

test("Sécurité : le cookie vg_session est httpOnly", async ({
  page,
  context,
}) => {
  const ts = Date.now();
  const email = `test-auth-cookie-${ts}@example.com`;

  // Inscription pour créer une session
  await page.goto("/inscription");
  await page.locator("#first_name").fill("Cookie");
  await page.locator("#last_name").fill("Sec");
  await page.locator("#email").fill(email);
  await page.locator("#phone").fill("0655443322");
  await page.locator("#address").fill("9 rue Securite");
  await page.locator("#postal_code").fill("33000");
  await page.locator("#city").fill("Bordeaux");
  await page.locator("#password").fill("CookieSec2026!");
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await page.waitForURL("/", { timeout: 15_000 });

  // Récupération des cookies via l'API Playwright
  const cookies = await context.cookies();
  const sessionCookie = cookies.find((c) => c.name === "vg_session");

  expect(sessionCookie).toBeDefined();
  expect(sessionCookie?.httpOnly).toBe(true);
});
