# Journal de vérification

Chaque contrôle consigne la commande exécutée, la sortie réelle (extrait) et la date. Un contrôle non exécuté est marqué `NON EXÉCUTÉ` avec la raison.

## 2026-07-14 — Fondations

| Contrôle | Commande | Résultat |
|---|---|---|
| Compte GitHub actif | `gh api user --jq .login` | `Lilgim` ✔ |
| Scaffold | `bunx create-next-app@latest vite-gourmand ...` | Succès — Next 16.2.10, React 19.2.4, Tailwind 4.3.2, TS 5.9.3 |
| Lint | `bun run lint` | ✔ `Checked 7 files in 17ms. No fixes applied.` |
| Typecheck | `bun run typecheck` | ✔ `tsc --noEmit` sans erreur |
| Build de production | `bun run build` | ✔ `Compiled successfully in 1027ms`, 2 routes statiques (`/`, `/_not-found`) |
| Tests | — | NON EXÉCUTÉ — aucun test encore écrit (voir entrée du 15/07) |

## 2026-07-15 — Suite de tests (story-tests)

| Contrôle | Commande | Résultat |
|---|---|---|
| Tests unitaires règles métier | `bun test tests/` | ✔ `16 pass, 0 fail, 60 expect() calls` (pricing : remise/seuils/livraison/arrondis centimes ; statuts : progression, sauts interdits, retours interdits, états finaux) |
| Reset base pour e2e | `node --env-file=.env scripts/reset-db.ts` | ✔ schéma + seed + stats Mongo resynchronisées |
| Parcours end-to-end 4 rôles | `bun run test:e2e` (Playwright) | ✔ `9 passed (1.1m)` — visiteur (filtres sans rechargement, invitation connexion), client (inscription, commande avec détail prix 554,86 € vérifié avant validation), employé (progression complète des statuts, transition directe vers Terminée absente), avis (dépôt + modération + publication accueil), admin (stats Mongo, comptes employés), sécurité (client refoulé de /employe et /admin), responsive desktop + Pixel 7 |

## 2026-07-18 — Intégration (merges) et infra de déploiement

| Contrôle | Commande | Résultat |
|---|---|---|
| Compte GitHub actif | `gh api user --jq .login` | `Lilgim` ✔ |
| Merges PR 1→11 dans `dev` (ordre respecté) | `gh pr merge <n> --merge` | ✔ 11 merges sans conflit, branches conservées |
| Vérifs sur `dev` après merges | `bun run lint` / `bun run typecheck` / `bun run test` / `bun run build` | ✔ 0 erreur lint (71 fichiers), 0 erreur TS, `16 pass`, build 24 routes |
| Merge `dev` → `main` | PR #12, `gh pr merge 12 --merge` | ✔ `main` = `ce01cb9` |
| Build image Docker prod | `docker build -t vite-gourmand:test .` | ✔ après correction : build Next exécuté sous Node dans l'image (le driver mongodb ne se charge pas sous Bun — `node:v8 isBuildingSnapshot` non implémenté) |
| Stack prod locale (sans Caddy) | `docker compose --env-file .env.prod-test -f docker-compose.prod.yml up -d --build app` | ✔ app + postgres + mongo `healthy`, pg/mongo sans port publié |
| Init données de démo dans le conteneur | `docker compose ... exec app node scripts/reset-db.ts` | ✔ `Base réinitialisée : schéma + seed + 2 stat(s) Mongo.` |
| Smoke test HTTP | `Invoke-WebRequest http://127.0.0.1:3001/` et `/menus` | ✔ HTTP 200 ×2, en-tête CSP présent, contenu accueil correct |
| e2e après passage `output: standalone` conditionnel | `bun run test:e2e` | ✔ `9 passed (10.8s)` (un premier échec venait d'un serveur Node zombie sur :3000, tué) |
| Déploiement HTTPS sur le VPS | — | NON EXÉCUTÉ — en attente du sous-domaine DNS (action lilgim) |

## 2026-07-18 — Passe design (charte « Crème & Bordeaux »)

DA validée dans Paper (fichier « Vite & Gourmand — charte & maquettes » : 3 maquettes desktop + 3 mobiles, palette parchemin/bordeaux/bronze, Playfair Display + Inter). Application à tout le front (PR #14, mergée dans `dev`).

| Contrôle | Commande | Résultat |
|---|---|---|
| Lint | `bun run lint:fix` puis `bun run lint` | ✔ 14 fichiers reformatés, 0 erreur restante (71 fichiers) |
| Typecheck | `bun run typecheck` | ✔ `tsc --noEmit` sans erreur |
| Tests unitaires | `bun run test` | ✔ `16 pass, 60 expect()` |
| Build production | `bun run build` | ✔ 24 routes |
| Parcours e2e (4 rôles + responsive) | `bun run test:e2e` | ✔ `9 passed (13.0s)` — textes/labels/rôles ARIA inchangés |
| Audit visuel du front restylé | captures Playwright réelles (accueil, menus, commande, suivi horodaté, stats admin, mobile) | ✔ DA fidèle : eyebrow bronze, titres Playfair, boutons/étoiles/prix bordeaux, footer profond, visuels menus en aplats pastel |

## 2026-07-19 — Audit final et complétude du sujet

| Contrôle | Commande | Résultat |
|---|---|---|
| Compte GitHub actif | `gh api user --jq .login` | `Lilgim` ✔ |
| Board public | `gh issue create ...` | ✔ https://github.com/Lilgim/vite-gourmand/issues/15 |
| Lint / format | `bun run lint:fix` | ✔ 78 fichiers, aucune correction restante |
| TypeScript | `bun run typecheck` | ✔ aucune erreur |
| Tests unitaires | `bun test tests/` | ✔ 21 tests, 70 assertions, 0 échec |
| Build production hors ligne | `bun run build` | ✔ compilation, TypeScript et 26 routes ; aucun téléchargement Google Fonts |
| Configuration Compose prod | `docker compose -f docker-compose.prod.yml --env-file .env.production.example config --quiet` | ✔ configuration valide |
| Manuel utilisateur PDF | génération ReportLab + lecture pypdf + rendu PyMuPDF | ✔ 5 pages, contrôle visuel sans débordement |
| Charte graphique PDF | génération ReportLab + lecture pypdf + rendu PyMuPDF | ✔ 7 pages, palette + 3 desktop + 3 mobiles |
| Copie officielle DOCX | génération python-docx + ouverture python-docx + contrôle ZIP | ✔ fichier structurellement valide ; rendu LibreOffice NON EXÉCUTÉ (LibreOffice/Word absents) |
| Parcours E2E après correctifs | `bun run test:e2e` | NON EXÉCUTÉ — service Docker Desktop Windows impossible à démarrer, PostgreSQL/MongoDB indisponibles. Dernier run complet avant correctifs : 9/9 le 18/07. |
| Déploiement HTTPS | SSH/DNS | NON EXÉCUTÉ — aucun domaine réel ni accès VPS/alias SSH disponible dans l'environnement. |
