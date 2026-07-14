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
| Tests | — | NON EXÉCUTÉ — aucun test encore écrit |
