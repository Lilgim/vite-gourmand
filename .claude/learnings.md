# Learnings — Vite & Gourmand (ECF TP DWWM)
Dernière mise à jour : 2026-07-18

## Intégration + infra de déploiement (session du 18/07)

**Ce qu'on a fait :** merge des 11 PR dans `dev` puis `dev`→`main` (PR 12), création de
l'infra de prod (Dockerfile multistage, docker-compose.prod.yml isolé, Caddy HTTPS),
validée par un vrai run local : stack complète healthy, seed dans le conteneur, smoke
test HTTP 200 avec CSP. Audit visuel des 4 rôles (22 screenshots) : aucun bug
fonctionnel, le design reste à faire.

**Pourquoi ces choix :** build et runtime Node dans l'image (pas Bun) car le driver
mongodb plante sous Bun (`node:v8 isBuildingSnapshot` non implémenté) — Bun reste
l'outil de dev et d'installation des deps (bun.lock fait foi). Caddy plutôt que
nginx+certbot : TLS Let's Encrypt automatique en 5 lignes, reproductible par un
correcteur.

**Concepts clés :**
- `output: "standalone"` de Next casse `next start` → on le conditionne à une variable
  d'env (`NEXT_OUTPUT_STANDALONE=1`) définie uniquement dans le Dockerfile.
- Node 24 exécute le TypeScript nativement → `scripts/reset-db.ts` sert tel quel
  d'init de données en prod (`docker compose exec app node scripts/reset-db.ts`).
- `reuseExistingServer: true` de Playwright peut réutiliser un serveur zombie d'une
  session précédente et faire échouer toute la suite : vérifier le port 3000 avant
  d'accuser le code.

**Fichiers modifiés :** Dockerfile, .dockerignore, docker-compose.prod.yml,
deploy/Caddyfile, .env.production.example, next.config.ts, README.md,
.agent-forge/{DECISIONS,VERIFICATION,STATE}.

**À retenir :** valider une infra de déploiement = la faire tourner vraiment en local
(compose up + seed + curl), pas juste écrire les fichiers.

## Vue d'ensemble

Application traiteur full-stack construite en boucle autonome (10 itérations Ralph) :
Next.js 16 App Router + PostgreSQL (relationnel) + MongoDB (stats) + sessions maison.
Chaque story = une branche `feature/*`, validée (lint, types, build, tests, smoke tests
réels), poussée en PR vers `dev` et relue par CodeRabbit avant merge manuel.

## Concepts clés du projet (pour l'oral)

**Ce qu'on a fait :** une app web complète avec 4 rôles, commande en ligne avec calcul
de prix, suivi horodaté, modération d'avis et statistiques NoSQL.

**Choix d'architecture défendables :**
- *Sessions en base + cookie httpOnly* (pas de JWT) : révocation immédiate (on le
  démontre : désactiver un employé supprime ses sessions), simple à expliquer.
- *Calculs d'argent en centimes entiers* : un bug d'arrondi IEEE 754 réel a été attrapé
  par les tests (7,655 € devenait 7,65 € au lieu de 7,66 €).
- *Machine à états pure* (`src/lib/status.ts`) : transitions de commande du sujet
  codées comme données, testables unitairement, refusées côté serveur si interdites.
- *Le serveur fait foi* : le client affiche un aperçu du prix, mais le prix enregistré
  est recalculé serveur ; le menu d'une commande n'est jamais modifiable (on repart de
  la base, pas du formulaire).
- *Requêtes 100 % paramétrées* (`$1, $2…`), validation zod de toutes les entrées,
  autorisation par rôle dans les layouts serveur.

**Pièges Next.js 16 rencontrés :**
- `middleware.ts` → `proxy.ts` ; `cookies()`/`params`/`searchParams` asynchrones.
- Un composant client qui importe une constante d'un module `server-only` tire `pg`
  dans le bundle client et casse le build → module neutre `src/lib/labels.ts`.
- Après une Server Action + `revalidatePath`, le re-rendu serveur peut remplacer le
  composant client et son message de succès → dans les tests, asserter le changement
  d'état visible, pas le toast.

**Vérifications (preuves) :**
- `bun test tests/` : 16 tests unitaires (pricing + statuts, transitions interdites).
- `bun run test:e2e` : reset complet de la base puis 9 parcours Playwright couvrant
  les 4 rôles, le détail du prix avant validation et le responsive mobile.
- `scripts/reset-db.ts` re-prouve à chaque exécution que les scripts SQL passent sur
  une base vide (critère du sujet).

## À retenir pour progresser

1. Vérifier tôt et pour de vrai : le check pricing a attrapé un bug d'arrondi qui
   aurait fini en production (et à l'oral…).
2. La review externe (CodeRabbit) attrape ce qu'on ne voit plus : bindings réseau,
   contraintes CHECK manquantes, aria-describedby dupliqué, double requête DB.
3. Sur Windows/PowerShell : jamais de `-replace | Set-Content` sur un fichier accentué
   (mojibake), jamais de header `Cookie` via `-Headers` (silencieusement ignoré).
## Tests E2E — Authentification / Compte / Contrôle d'accès (session du 21/07)

**Ce qu'on a fait :** création de `e2e/auth.spec.ts` (18 tests, domaine "auth") couvrant les rejets de mot de passe (5 violations testées individuellement), inscription réussie + rôle client, connexion/déconnexion avec compte seedé et compte créé à la volée, anti-énumération sur mot de passe oublié (message identique email existant/inexistant), persistance du profil après reload, contrôle d'accès par rôle (client vs employe/admin) et sans session, et vérification httpOnly du cookie `vg_session`. 18/18 passent en 14 s.

**Pourquoi ces choix :**
- Sélecteurs `page.locator("#field_id")` plutôt que `getByLabel("Nom")` : les labels avec `*` requis ont un texte accessible "Nom *" — `exact: true` échoue, et sans `exact` Playwright résout vers plusieurs éléments ("Prénom" et "Nom" partagent le substring). L'`id` du champ (`name={name}` → `id={name}`) est le sélecteur stable.
- Test d'identité des messages (anti-énumération) : récupérer les deux textes et les comparer `===` — plus robuste qu'un assert textuel fixé manuellement.
- `context.cookies()` pour vérifier `httpOnly` sans exécuter de JS dans la page.

**Concepts clés :**
- Playwright strict mode : `getByLabel("Nom")` retourne N > 1 si le texte accessible est un substring d'un autre label → toujours préférer `#id` quand disponible.
- `page.context().clearCookies()` dans un test permet de simuler une session expirée sans redémarrer le navigateur.

**Fichiers modifiés :** `e2e/auth.spec.ts` (créé).

**À retenir :** toujours inspecter les textes accessibles réels (y compris les `*` injectés par aria) avant d'écrire des `getByLabel` — un label visuellement "Nom" peut valoir "Nom *" pour les AT et donc pour Playwright.

## Tests E2E — Tunnel de commande (session du 21/07)

**Ce qu'on a fait :** création de `e2e/commande.spec.ts` (12 tests, domaine "commande client") couvrant l'accès visiteur, pré-remplissage, minimum convives, règles de prix (remise 10 % à min+5, livraison gratuite Bordeaux, 5€+0,59€/km hors Bordeaux), validation → historique, suivi horodaté, modification/annulation et verrou après acceptation employé. 12/12 passent en 18 s sans réinitialiser la base.

**Pourquoi ces choix :**
- Email unique par test (`client-order-${Date.now()}@example.com`) pour isoler les commandes quand d'autres agents tournent en parallèle sur la même base.
- Calculs de prix en centimes reproduits dans le test (fonction miroir de `pricing.ts`) pour comparer attendu vs affiché — essentiel pour détecter les bugs d'arrondi.
- Sélecteurs `.locator("dd").first()` et `.locator("dd").last()` plutôt que `getByText()` nu pour éviter les "strict mode violations" quand base = total (même valeur dans deux `<dd>`).

**Concepts clés :**
- Playwright strict mode : si un locator retourne N > 1 éléments, l'assertion échoue — utiliser `.first()`, `.last()`, `.nth()` ou `filter({ hasText: exact })`.
- `getByRole("region", { name: "Détail du prix" })` cible le `<section aria-label>` — bon point d'ancrage, mais les `<dd>` internes peuvent partager la même valeur quand base = total.
- `browser.newContext()` dans un même test permet d'ouvrir une session employé sans fermer la session client — utile pour le test du verrou.

**Fichiers modifiés :** `e2e/commande.spec.ts` (créé).

**À retenir :** pour tester des règles de prix critiques, toujours coder la formule en miroir dans le test et comparer bit à bit — un assert sur "le prix affiché est positif" ne valide rien.

# Session de livraison finale — 19/07/2026

- Audit direct des 12 pages du sujet : plusieurs exigences étaient absentes malgré les stories marquées passées (contact, mot de passe oublié, emails, adresse à l'inscription, filtres complets).
- Le build dépendait de Google Fonts : suppression du téléchargement de build et fallbacks CSS reproductibles.
- Ajout des parcours publics manquants avec validation Zod et réponse générique anti-énumération ; jeton de récupération signé HMAC et expirant.
- Livrables générés dans `docs/` : manuel et charte PDF contrôlés visuellement, documentation technique/projet, veille et source traduite.
- Board public créé sous forme d'issue GitHub à checklist : issue 15.
- Copie officielle recréée en DOCX hors dépôt public ; trois données restent humaines : date de naissance, URL prod et dépôt Studi.
- Validation finale : lint/tsc/build/21 tests verts ; E2E bloqué par le service Docker Desktop Windows, ne jamais le déclarer exécuté.

## Tests E2E — Domaine EMPLOYÉ (session du 21/07)

**Ce qu'on a fait :** création de `e2e/employe.spec.ts` (35 tests, 30 passent / 5 skips conditionnels) couvrant les 7 domaines back-office employé : CRUD plats (allergènes), CRUD menus (min 1 plat), CRUD horaires, machine à états commandes (7 transitions + interdictions), annulation avec contact+motif, modération avis, filtres commandes. Neuf runs successifs pour arriver à 0 failure.

**Pourquoi ces choix :**
- Noms uniques suffixés `Date.now()` pour l'isolation entre sessions.
- `PLAT_MENU_PLACEHOLDER` : la validation `dish_ids.min(1)` empêche de vider un menu — on garde un plat placeholder dans le menu pendant le nettoyage.
- Navigation dynamique vers un menu actif (via `/menus`) plutôt qu'un ID hardcodé : si le menu 2 est inactif (`is_active = false`), `/commander/2` retourne 404 et les tests machine à états timeout.
- `Promise.race` pour les assertions post-Server Action : la revalidation RSC peut retirer le composant `role="status"` (et son message de succès) avant que Playwright puisse le lire — on accepte soit le status soit le changement d'état visible.

**Bugs réels détectés dans l'application :**
- Race condition RSC : après `advanceOrderStatus("cancelled")` ou `moderateReview`, le composant success est éphémère (remplacé immédiatement par le RSC re-render).
- `select defaultValue` React ne se reset pas après soft RSC navigation — le filtre de statut reste affiché même après "Réinitialiser".

**Concepts clés :**
- `locator("details").filter({ has: locator("summary").filter({ hasText: ... }) })` pour cibler les formulaires collapsibles.
- `locator("li").filter({ has: getByRole("button", { name: "Refuser" }) })` pour ne cibler que les avis ayant des boutons de modération.
- `isEnabled()` avant `.click()` sur un bouton `disabled` évite le timeout de 120s.
- HTML5 `required` bloque la soumission côté navigateur — tester l'attribut + l'URL inchangée plutôt que le message serveur.

**Fichiers créés :** `e2e/employe.spec.ts`.

**À retenir :** pour les tests E2E sur une app RSC Next.js, ne jamais asserter sur un `role="status"` seul si la transition amène la commande dans un état final — le composant peut disparaître en quelques ms. Toujours `Promise.race` avec le changement d'état visible en alternative.
