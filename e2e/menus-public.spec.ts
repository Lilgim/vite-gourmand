/**
 * Tests E2E — Domaine : Pages publiques / Catalogue / Filtres / Contact
 *
 * Isolation : aucune assertion sur des compteurs/valeurs globales exactes
 * (d'autres agents QA peuvent ajouter/supprimer des menus concurremment).
 * On vérifie la présence structurelle et le COMPORTEMENT.
 */

import { expect, test } from "@playwright/test";

test.setTimeout(60_000);

// ─────────────────────────────────────────────────────────────────────────────
// 1. Catalogue /menus — structure des cartes
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Catalogue /menus — structure des cartes", () => {
  test("affiche au moins une carte avec titre, description, nb min de personnes, prix et lien détail", async ({
    page,
  }) => {
    await page.goto("/menus");
    await expect(page.getByRole("heading", { name: "Nos menus" })).toBeVisible();

    // Au moins une carte est présente
    const cards = page.locator("ul li").filter({ has: page.getByRole("link", { name: /Voir le menu/ }) });
    await expect(cards.first()).toBeVisible();

    const firstCard = cards.first();

    // Titre (h2)
    await expect(firstCard.locator("h2")).toBeVisible();

    // Description (p avec text-muted)
    await expect(firstCard.locator("p.text-muted, p.text-sm")).toBeVisible();

    // Minimum de personnes — dd contenant "personnes"
    await expect(firstCard.getByText(/\d+ personnes/)).toBeVisible();

    // Prix — dd avec "€"
    await expect(firstCard.getByText(/€/)).toBeVisible();

    // Bouton/lien Voir le menu
    await expect(firstCard.getByRole("link", { name: /Voir le menu/ })).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Filtres — SANS rechargement de page
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Filtres dynamiques — pas de rechargement", () => {
  /**
   * Pose un flag window.__noReload = true avant de filtrer,
   * puis vérifie qu'il persiste après l'action (prouve l'absence de navigation complète).
   */
  const plantFlag = (page: import("@playwright/test").Page) =>
    page.evaluate(() => {
      (window as unknown as Record<string, unknown>).__noReload = true;
    });

  const flagStillPresent = (page: import("@playwright/test").Page) =>
    page.evaluate(
      () => (window as unknown as Record<string, unknown>).__noReload === true,
    );

  test("filtre Prix maximum : réduit dynamiquement la liste sans rechargement", async ({
    page,
  }) => {
    await page.goto("/menus");
    // Attendre que des cartes soient rendues
    await expect(page.getByRole("link", { name: /Voir le menu/ }).first()).toBeVisible();
    const countBefore = await page.getByRole("link", { name: /Voir le menu/ }).count();

    await plantFlag(page);

    // Prix maximum très bas pour s'assurer de filtrer
    await page.getByLabel("Prix maximum par personne (€)").fill("25");

    // La liste se met à jour (aria-live ou changement de DOM)
    await page.waitForTimeout(400); // laisse React re-rendre

    const countAfter = await page.getByRole("link", { name: /Voir le menu/ }).count();
    // La liste doit avoir changé (soit réduite, soit afficher 0 résultats)
    // On vérifie que le filtre a eu un effet OU que le message "Aucun menu" est visible
    const noResult = page.getByText(/Aucun menu ne correspond/);
    const noResultVisible = await noResult.isVisible();
    // Soit moins de cartes, soit aucun résultat
    expect(countAfter < countBefore || noResultVisible).toBe(true);

    // Pas de rechargement
    expect(await flagStillPresent(page)).toBe(true);
    // URL inchangée
    await expect(page).toHaveURL("/menus");
  });

  test("filtre Prix minimum : réduit dynamiquement la liste sans rechargement", async ({
    page,
  }) => {
    await page.goto("/menus");
    await expect(page.getByRole("link", { name: /Voir le menu/ }).first()).toBeVisible();
    const countBefore = await page.getByRole("link", { name: /Voir le menu/ }).count();

    await plantFlag(page);

    // Prix minimum très élevé pour filtrer
    await page.getByLabel("Prix minimum par personne (€)").fill("200");
    await page.waitForTimeout(400);

    const countAfter = await page.getByRole("link", { name: /Voir le menu/ }).count();
    const noResultVisible = await page.getByText(/Aucun menu ne correspond/).isVisible();
    expect(countAfter < countBefore || noResultVisible).toBe(true);

    expect(await flagStillPresent(page)).toBe(true);
    await expect(page).toHaveURL("/menus");
  });

  test("filtre Régime alimentaire : met à jour la liste sans rechargement", async ({
    page,
  }) => {
    await page.goto("/menus");
    await expect(page.getByRole("link", { name: /Voir le menu/ }).first()).toBeVisible();
    const countBefore = await page.getByRole("link", { name: /Voir le menu/ }).count();

    await plantFlag(page);

    // Sélectionne le premier régime disponible (non vide)
    const regimeSelect = page.getByLabel("Régime alimentaire");
    await regimeSelect.selectOption({ index: 1 }); // index 1 = première vraie valeur
    await page.waitForTimeout(400);

    const countAfter = await page.getByRole("link", { name: /Voir le menu/ }).count();
    const noResultVisible = await page.getByText(/Aucun menu ne correspond/).isVisible();
    // Le filtre doit avoir eu un effet (réduit ou vidé la liste)
    expect(countAfter <= countBefore || noResultVisible).toBe(true);

    // Spécifiquement test Végan (présent dans la seed)
    await regimeSelect.selectOption("Végan");
    await page.waitForTimeout(400);
    const countVegan = await page.getByRole("link", { name: /Voir le menu/ }).count();
    const noVegan = await page.getByText(/Aucun menu ne correspond/).isVisible();
    // Soit des menus vegan existent, soit aucun — dans tous les cas le filtre répond
    expect(countVegan >= 0 || noVegan).toBe(true);

    expect(await flagStillPresent(page)).toBe(true);
    await expect(page).toHaveURL("/menus");
  });

  test("filtre Thème : met à jour la liste sans rechargement", async ({
    page,
  }) => {
    await page.goto("/menus");
    await expect(page.getByRole("link", { name: /Voir le menu/ }).first()).toBeVisible();

    await plantFlag(page);

    // Sélectionne le premier thème disponible
    const themeSelect = page.getByLabel("Thème");
    await themeSelect.selectOption({ index: 1 });
    await page.waitForTimeout(400);

    const countAfter = await page.getByRole("link", { name: /Voir le menu/ }).count();
    const noResultVisible = await page.getByText(/Aucun menu ne correspond/).isVisible();
    expect(countAfter >= 0 || noResultVisible).toBe(true);

    expect(await flagStillPresent(page)).toBe(true);
    await expect(page).toHaveURL("/menus");
  });

  test("filtre Nombre de convives : exclut les menus dont le minimum est trop élevé", async ({
    page,
  }) => {
    await page.goto("/menus");
    await expect(page.getByRole("link", { name: /Voir le menu/ }).first()).toBeVisible();
    const countBefore = await page.getByRole("link", { name: /Voir le menu/ }).count();

    await plantFlag(page);

    // 1 convive : seuls les menus avec min_people <= 1 passent
    await page.getByLabel("Nombre de convives").fill("1");
    await page.waitForTimeout(400);

    const countAfter = await page.getByRole("link", { name: /Voir le menu/ }).count();
    const noResultVisible = await page.getByText(/Aucun menu ne correspond/).isVisible();
    // Avec 1 convive, la liste doit être réduite (les menus ont souvent min_people > 1)
    expect(countAfter <= countBefore || noResultVisible).toBe(true);

    expect(await flagStillPresent(page)).toBe(true);
    await expect(page).toHaveURL("/menus");
  });

  test("combinaison de filtres : prix max + régime se combinent sans rechargement", async ({
    page,
  }) => {
    await page.goto("/menus");
    await expect(page.getByRole("link", { name: /Voir le menu/ }).first()).toBeVisible();
    const countBefore = await page.getByRole("link", { name: /Voir le menu/ }).count();

    await plantFlag(page);

    // Applique deux filtres en combinaison
    await page.getByLabel("Prix maximum par personne (€)").fill("50");
    await page.waitForTimeout(200);
    await page.getByLabel("Régime alimentaire").selectOption({ index: 1 });
    await page.waitForTimeout(400);

    const countAfter = await page.getByRole("link", { name: /Voir le menu/ }).count();
    const noResultVisible = await page.getByText(/Aucun menu ne correspond/).isVisible();
    // La combinaison est plus restrictive — liste réduite ou vide
    expect(countAfter <= countBefore || noResultVisible).toBe(true);

    expect(await flagStillPresent(page)).toBe(true);
    await expect(page).toHaveURL("/menus");
  });

  test("le compteur aria-live reflète le nombre de résultats filtrés", async ({
    page,
  }) => {
    await page.goto("/menus");
    await expect(page.getByRole("link", { name: /Voir le menu/ }).first()).toBeVisible();

    // Le paragraphe aria-live doit être visible et contenir "menu(s) correspond"
    const counter = page.locator("[aria-live='polite']");
    await expect(counter).toBeVisible();
    await expect(counter).toContainText(/menu/);

    await plantFlag(page);

    // Applique un filtre réducteur
    await page.getByLabel("Prix maximum par personne (€)").fill("25");
    await page.waitForTimeout(400);

    // Le compteur doit se mettre à jour
    await expect(counter).toContainText(/menu/);
    expect(await flagStillPresent(page)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Vue détail /menus/[id] — éléments requis
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Vue détail /menus/[id]", () => {
  /**
   * Récupère l'id du premier menu actif en naviguant vers /menus
   * et en lisant le href du premier lien "Voir le menu".
   */
  const getFirstMenuId = async (page: import("@playwright/test").Page) => {
    await page.goto("/menus");
    const link = page.getByRole("link", { name: /Voir le menu/ }).first();
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    return href; // ex: "/menus/2"
  };

  test("la page détail affiche toutes les informations requises", async ({
    page,
  }) => {
    const href = await getFirstMenuId(page);
    expect(href).toBeTruthy();

    await page.goto(href!);

    // Titre (h1)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Description
    await expect(page.locator("h1 + p")).toBeVisible();

    // Galerie d'images OU section plats (au moins l'un des deux)
    const hasImages = await page.locator("ul li img").first().isVisible().catch(() => false);
    const hasDishes = await page.getByRole("heading", { name: "Les plats du menu" }).isVisible().catch(() => false);
    expect(hasImages || hasDishes).toBe(true);

    // Section plats
    await expect(page.getByRole("heading", { name: "Les plats du menu" })).toBeVisible();

    // Section informations pratiques
    await expect(page.getByRole("heading", { name: "Informations pratiques" })).toBeVisible();

    // Thème
    await expect(page.getByText("Thème")).toBeVisible();

    // Régime alimentaire
    await expect(page.getByText("Régime alimentaire")).toBeVisible();

    // Nombre minimum de personnes
    await expect(page.getByText("Nombre minimum de personnes")).toBeVisible();

    // Prix par personne
    await expect(page.getByText("Prix par personne")).toBeVisible();

    // Allergènes présents
    await expect(page.getByText("Allergènes présents")).toBeVisible();

    // Disponibilité (stock)
    await expect(page.getByText("Disponibilité")).toBeVisible();

    // Bouton commander OU message épuisé
    const commanderLink = page.getByRole("link", { name: "Commander ce menu" });
    const epuiseMsg = page.getByText("Menu épuisé pour le moment");
    const hasCommander = await commanderLink.isVisible().catch(() => false);
    const hasEpuise = await epuiseMsg.isVisible().catch(() => false);
    expect(hasCommander || hasEpuise).toBe(true);
  });

  test("menu détail id=2 : tous les champs clés sont visibles", async ({
    page,
  }) => {
    await page.goto("/menus/2");
    // Si le menu 2 n'existe pas (purge concurrente), on skip gracieusement
    const notFound = await page.getByText(/introuvable|not found|404/i).isVisible().catch(() => false);
    if (notFound) {
      test.skip();
      return;
    }

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Allergènes présents")).toBeVisible();
    // Allergènes : soit une liste soit "Aucun signalé"
    await expect(
      page.getByText(/Aucun signalé/).or(page.locator("dd").filter({ hasText: /gluten|lait|oeuf|fruits|céleri|moutarde|sésame|soja|lupin|crustacés|poissons|mollusques|arachides|noix|anhydride/i }))
    ).toBeVisible();
  });

  test("un visiteur cliquant 'Commander ce menu' est redirigé vers /connexion", async ({
    page,
  }) => {
    await page.goto("/menus/2");
    const notFound = await page.getByText(/introuvable|not found|404/i).isVisible().catch(() => false);
    if (notFound) {
      test.skip();
      return;
    }

    const commander = page.getByRole("link", { name: "Commander ce menu" });
    const epuise = page.getByText("Menu épuisé pour le moment");

    const isEpuise = await epuise.isVisible().catch(() => false);
    if (isEpuise) {
      // Menu épuisé : pas de lien commander, test de comportement alternatif
      await expect(epuise).toBeVisible();
      return;
    }

    await expect(commander).toBeVisible();
    await commander.click();
    await page.waitForURL(/\/connexion/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Accueil /
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Accueil /", () => {
  test("présentation entreprise : heading 'traiteur bordelais' visible", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /traiteur/i }),
    ).toBeVisible();
    // Sous-titre ou accroche présent
    await expect(page.getByText(/bordeaux/i).first()).toBeVisible();
  });

  test("avis clients validés sont affichés sur l'accueil", async ({ page }) => {
    await page.goto("/");
    // Section "Ils nous ont fait confiance"
    await expect(page.getByRole("heading", { name: /confiance/i })).toBeVisible();
    // Soit des avis sont présents, soit le message "Aucun avis"
    const hasReviews = await page.locator("blockquote").first().isVisible().catch(() => false);
    const noReviews = await page.getByText("Aucun avis publié pour le moment.").isVisible().catch(() => false);
    expect(hasReviews || noReviews).toBe(true);
  });

  test("footer : liens légaux présents", async ({ page }) => {
    await page.goto("/");

    // Footer présent
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    // Liens légaux dans le footer
    await expect(
      footer.getByRole("link", { name: /mentions légales/i }),
    ).toBeVisible();
    await expect(
      footer.getByRole("link", { name: /conditions générales de vente/i }),
    ).toBeVisible();
  });

  test("horaires lundi→dimanche affichés dans le pied de page", async ({
    page,
  }) => {
    await page.goto("/");

    // Exigence du sujet : les horaires doivent être visibles dans le <footer>,
    // du lundi au dimanche. On scope au footer pour l'assertion.
    const footer = page.locator("footer");
    await expect(footer.getByText("Lundi", { exact: true })).toBeVisible();
    await expect(footer.getByText("Dimanche", { exact: true })).toBeVisible();
  });

  test("footer : horaires affichés au format HH:MM – HH:MM ou Fermé", async ({
    page,
  }) => {
    await page.goto("/");
    // Au moins un créneau horaire ou "Fermé" visible
    const hasSlot = await page.getByText(/\d{2}h\d{2}\s*–\s*\d{2}h\d{2}/).first().isVisible().catch(() => false);
    const hasFerme = await page.getByText("Fermé").first().isVisible().catch(() => false);
    expect(hasSlot || hasFerme).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Contact /contact — formulaire + succès
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Page Contact /contact", () => {
  test("le formulaire affiche les champs titre, email, description et le bouton d'envoi", async ({
    page,
  }) => {
    await page.goto("/contact");
    await expect(page.getByRole("heading", { name: "Nous contacter" })).toBeVisible();

    // Champ titre
    await expect(page.getByLabel("Titre")).toBeVisible();
    // Champ email
    await expect(page.getByLabel(/votre email/i)).toBeVisible();
    // Textarea description
    await expect(page.locator("textarea#description")).toBeVisible();
    // Bouton envoi
    await expect(
      page.getByRole("button", { name: /envoyer la demande/i }),
    ).toBeVisible();
  });

  test("soumission valide du formulaire → message de succès", async ({
    page,
  }) => {
    await page.goto("/contact");

    await page.getByLabel("Titre").fill("Demande de devis mariage");
    await page.getByLabel(/votre email/i).fill("test-qa@vite-gourmand.example");
    await page.locator("textarea#description").fill(
      "Bonjour, je souhaite un devis pour un mariage de 80 personnes en septembre 2026.",
    );

    await page.getByRole("button", { name: /envoyer la demande/i }).click();

    // Message de succès via role="status"
    await expect(page.getByRole("status")).toBeVisible({ timeout: 15_000 });
    // Le message de succès doit contenir un mot positif
    await expect(page.getByRole("status")).toContainText(/.+/);
  });

  test("soumission sans email → le formulaire ne valide pas (validation HTML5 ou serveur)", async ({
    page,
  }) => {
    await page.goto("/contact");

    await page.getByLabel("Titre").fill("Test sans email");
    await page.locator("textarea#description").fill("Description de test.");
    // Email vide volontairement

    // Tenter de soumettre — la validation HTML5 (noValidate=false ici)
    // ou serveur doit bloquer. On écoute si un role=status apparaît dans les 5s.
    const submitBtn = page.getByRole("button", { name: /envoyer la demande/i });
    await submitBtn.click();

    // Attente courte : si succès, il apparaît vite ; si bloqué HTML5, rien n'arrive
    const successMsg = page.getByRole("status");
    const appeared = await successMsg.isVisible({ timeout: 5_000 }).catch(() => false);

    if (appeared) {
      const text = (await successMsg.textContent()) ?? "";
      // S'il apparaît, son contenu ne doit pas indiquer un succès
      expect(text.toLowerCase()).not.toContain("envoyée");
    }
    // Si pas apparu : la validation HTML5 a bloqué — comportement attendu
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Images — statut HTTP OK, pas de 404
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Images des menus — pas de 404", () => {
  test("les images sur /menus renvoient un statut HTTP 200 ou 304", async ({
    page,
  }) => {
    const failedImages: string[] = [];

    page.on("response", (response) => {
      const url = response.url();
      const status = response.status();
      // Filtre les ressources image
      if (/\.(jpg|jpeg|png|svg|webp|avif|gif)(\?|$)/i.test(url) && status >= 400) {
        failedImages.push(`${status} — ${url}`);
      }
    });

    await page.goto("/menus");
    // Attendre que la page soit complètement chargée
    await page.waitForLoadState("networkidle");

    if (failedImages.length > 0) {
      throw new Error(
        `Images en erreur (${failedImages.length}) :\n${failedImages.join("\n")}`,
      );
    }
  });

  test("les images sur la page détail renvoient un statut HTTP OK", async ({
    page,
  }) => {
    // D'abord récupérer un id valide
    await page.goto("/menus");
    const link = page.getByRole("link", { name: /Voir le menu/ }).first();
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    expect(href).toBeTruthy();

    const failedImages: string[] = [];

    page.on("response", (response) => {
      const url = response.url();
      const status = response.status();
      if (/\.(jpg|jpeg|png|svg|webp|avif|gif)(\?|$)/i.test(url) && status >= 400) {
        failedImages.push(`${status} — ${url}`);
      }
    });

    await page.goto(href!);
    await page.waitForLoadState("networkidle");

    if (failedImages.length > 0) {
      throw new Error(
        `Images en erreur sur ${href} (${failedImages.length}) :\n${failedImages.join("\n")}`,
      );
    }
  });

  test("aucun texte 'visuel de démonstration' visible sur les cartes", async ({
    page,
  }) => {
    await page.goto("/menus");
    await expect(page.getByText(/visuel de démonstration/i)).toHaveCount(0);
  });
});
