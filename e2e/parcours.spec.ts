import { expect, type Page, test } from "@playwright/test";

// Parcours complet des 4 rôles du sujet, exécuté en série sur une base
// réinitialisée (bun run test:e2e lance scripts/reset-db.ts avant).
//
// visiteur → inscription client → commande → employé accepte et fait
// progresser → client dépose un avis → employé le modère → admin
// consulte les statistiques et gère les comptes employés.

const CLIENT = {
  email: "e2e.client@test.vite-gourmand.fr",
  password: "MotDePasseE2E2026!",
};
const EMPLOYEE = {
  email: "employe@demo.vite-gourmand.fr",
  password: "EmployeDemo2026!",
};
const ADMIN = {
  email: "admin@demo.vite-gourmand.fr",
  password: "AdminDemo2026!",
};

const login = async (page: Page, email: string, password: string) => {
  await page.goto("/connexion");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL("/");
};

const logout = async (page: Page) => {
  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await expect(page.getByRole("link", { name: "Se connecter" })).toBeVisible();
};

test.describe.serial("parcours ECF complet", () => {
  test("visiteur : consultation, filtres sans rechargement, invitation à se connecter", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /traiteur bordelais/i }),
    ).toBeVisible();
    // Avis validés et horaires visibles sur l'accueil
    await expect(page.getByText(/unanimité/)).toBeVisible();
    await expect(page.getByText("09h00 – 18h00").first()).toBeVisible();

    // Filtres combinables sans navigation
    await page.goto("/menus");
    await expect(page.getByRole("link", { name: /Voir le menu/ })).toHaveCount(
      6,
    );
    await page.getByLabel("Régime alimentaire").selectOption("Végan");
    await expect(page.getByRole("link", { name: /Voir le menu/ })).toHaveCount(
      1,
    );
    await expect(page).toHaveURL("/menus"); // aucune navigation
    await page.getByLabel("Régime alimentaire").selectOption("");
    await page.getByLabel("Prix maximum par personne (€)").fill("30");
    await expect(page.getByRole("link", { name: /Voir le menu/ })).toHaveCount(
      2,
    );

    // Détail d'un menu : plats, allergènes, conditions
    await page.goto("/menus/2");
    await expect(
      page.getByRole("heading", { name: "Menu Anniversaire Gourmand" }),
    ).toBeVisible();
    await expect(
      page.getByText("Pavlova aux fruits rouges", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText(/Allergènes présents/)).toBeVisible();

    // Un visiteur qui veut commander est invité à se connecter
    await page.getByRole("link", { name: "Commander ce menu" }).click();
    await page.waitForURL(/\/connexion/);
  });

  test("client : inscription puis commande avec détail du prix avant validation", async ({
    page,
  }) => {
    await page.goto("/inscription");
    await page.getByLabel("Prénom").fill("Éva");
    await page.getByLabel(/^Nom\b/).fill("Testeuse");
    await page.getByLabel("Adresse email").fill(CLIENT.email);
    await page.getByLabel("Mot de passe").fill(CLIENT.password);
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await page.waitForURL("/");
    await expect(page.getByText("Mon compte (Éva)")).toBeVisible();

    // Commande du menu 2 : 16 convives → remise (16 ≥ 10 + 5)
    await page.goto("/commander/2");
    await page.getByLabel("Nombre de convives").fill("16");
    await page.getByLabel("Date de l'événement").fill("2026-09-20");
    await page.getByLabel("Heure").fill("19:30");
    await page
      .getByLabel("Adresse du lieu de réception")
      .fill("8 quai des Chartrons");
    await page.getByLabel("Code postal").fill("33110");
    await page.getByLabel(/^Ville\b/).fill("Le Bouscat");
    await page
      .getByLabel(/Distance depuis notre boutique/)
      .fill("4.5");
    await page.getByLabel("Numéro de GSM pour le jour J").fill("0612345678");

    // Détail du prix affiché AVANT validation :
    // 16 × 38 = 608 ; remise 60,80 ; livraison 5 + 0,59×4,5 = 7,66 ; total 554,86
    const priceDetail = page.getByRole("region", { name: "Détail du prix" });
    await expect(priceDetail.getByText("608,00 €")).toBeVisible();
    await expect(priceDetail.getByText("− 60,80 €")).toBeVisible();
    await expect(priceDetail.getByText("7,66 €")).toBeVisible();
    await expect(priceDetail.getByText("554,86 €")).toBeVisible();

    await page.getByRole("button", { name: "Valider ma commande" }).click();
    await page.waitForURL(/\/compte\/commandes\/\d+/);
    await expect(
      page.getByText(/Soumise — en attente d'acceptation/).first(),
    ).toBeVisible();
    await expect(page.getByText("554,86 €").first()).toBeVisible();
    // Modifiable/annulable tant que non acceptée
    await expect(
      page.getByRole("link", { name: "Modifier la commande" }),
    ).toBeVisible();
    await logout(page);
  });

  test("employé : progression des statuts jusqu'à terminée", async ({
    page,
  }) => {
    await login(page, EMPLOYEE.email, EMPLOYEE.password);
    await page.goto("/employe?statut=submitted&client=Testeuse");
    await page.getByRole("link", { name: /Gérer/ }).click();
    await page.waitForURL(/\/employe\/commandes\/\d+/);

    // La transition directe vers "Terminée" n'est pas proposée
    await expect(
      page.getByRole("button", { name: "→ Terminée" }),
    ).toHaveCount(0);

    // On considère la transition effectuée quand l'étape suivante devient
    // disponible (le refresh RSC a rechargé le nouveau statut).
    const advance = async (label: string, nextLabel: string | null) => {
      await page.getByRole("button", { name: `→ ${label}` }).click();
      await page.getByRole("button", { name: "Confirmer" }).click();
      if (nextLabel) {
        await expect(
          page.getByRole("button", { name: `→ ${nextLabel}` }),
        ).toBeVisible({ timeout: 10_000 });
      } else {
        await expect(
          page.getByText("Cette commande est dans un état final", {
            exact: false,
          }),
        ).toBeVisible({ timeout: 10_000 });
      }
    };

    await advance("Acceptée", "En préparation");
    await advance("En préparation", "En cours de livraison");
    await advance("En cours de livraison", "Livrée");
    await advance("Livrée", "En attente du retour de matériel");
    await advance("En attente du retour de matériel", "Terminée");
    await advance("Terminée", null);
    await logout(page);
  });

  test("client : dépôt d'un avis après commande terminée", async ({ page }) => {
    await login(page, CLIENT.email, CLIENT.password);
    await page.goto("/compte");
    await page.getByRole("link", { name: /Détail/ }).first().click();
    await page.waitForURL(/\/compte\/commandes\/\d+/);

    // Plus modifiable une fois terminée
    await expect(
      page.getByRole("link", { name: "Modifier la commande" }),
    ).toHaveCount(0);

    await page.getByLabel("5 — Excellent").check();
    await page
      .getByRole("textbox", { name: /Votre avis/ })
      .fill("Prestation impeccable du début à la fin, équipe adorable !");
    await page.getByRole("button", { name: "Déposer mon avis" }).click();
    // Le refresh RSC remplace le formulaire par l'avis en attente de modération.
    await expect(page.getByText(/Prestation impeccable/)).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByText(/En attente de validation par notre équipe/),
    ).toBeVisible();
    await logout(page);
  });

  test("employé : modération de l'avis", async ({ page }) => {
    await login(page, EMPLOYEE.email, EMPLOYEE.password);
    await page.goto("/employe/avis");
    await expect(page.getByText(/Prestation impeccable/)).toBeVisible();
    await page.getByRole("button", { name: "Valider et publier" }).click();
    // Après modération, la liste des avis en attente se vide (refresh RSC).
    await expect(
      page.getByText("Aucun avis en attente de modération."),
    ).toBeVisible({ timeout: 10_000 });
    await logout(page);

    // L'avis validé apparaît publiquement sur l'accueil
    await page.goto("/");
    await expect(page.getByText(/Prestation impeccable/)).toBeVisible();
  });

  test("admin : statistiques MongoDB et gestion des comptes employés", async ({
    page,
  }) => {
    await login(page, ADMIN.email, ADMIN.password);

    await page.goto("/admin");
    await expect(
      page.getByRole("heading", { name: "Statistiques" }),
    ).toBeVisible();
    // La nouvelle commande apparaît dans les stats du menu Anniversaire
    await expect(
      page.getByText("Menu Anniversaire Gourmand").first(),
    ).toBeVisible();

    // Création d'un compte employé
    await page.goto("/admin/employes");
    await page.getByLabel("Prénom").fill("Nino");
    await page.getByLabel(/^Nom\b/).fill("Nouveau");
    await page
      .getByLabel("Adresse email")
      .fill("nino.nouveau@test.vite-gourmand.fr");
    await page.getByLabel("Mot de passe initial").fill("EmployeNino2026!");
    await page.getByRole("button", { name: "Créer le compte" }).click();
    await expect(page.getByText("Compte employé créé.")).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Nino Nouveau", exact: true }),
    ).toBeVisible();

    // Désactivation
    await page
      .getByRole("button", { name: /Désactiver le compte de Nino/ })
      .click();
    // Après désactivation, le bouton devient « Réactiver » (refresh RSC).
    await expect(
      page.getByRole("button", { name: /Réactiver le compte de Nino/ }),
    ).toBeVisible({ timeout: 10_000 });
    await logout(page);
  });

  test("sécurité : un client ne peut pas atteindre les espaces employé et admin", async ({
    page,
  }) => {
    await login(page, CLIENT.email, CLIENT.password);
    await page.goto("/employe");
    await expect(page).not.toHaveURL(/\/employe/);
    await page.goto("/admin");
    await expect(page).not.toHaveURL(/\/admin/);
  });
});
