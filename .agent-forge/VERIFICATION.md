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
