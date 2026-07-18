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
