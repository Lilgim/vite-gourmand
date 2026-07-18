<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Vite & Gourmand — guide agent

Application web de commande de menus pour un traiteur bordelais (TP Développeur Web et Web Mobile). Deadline de dépôt : **23 juillet 2026, 23:59 heure de Paris**. Le cadrage complet (exigences, contraintes, livrables) vit hors de ce dépôt : `C:\Users\elloc\Documents\STUDI\CLAUDE.md`.

## Commandes

```bash
bun dev              # serveur de dev (http://localhost:3000)
bun run build        # build de production
bun run lint         # biome check .
bun run lint:fix     # biome check --write .
bun run typecheck    # tsc --noEmit
```

## Règles du dépôt

- Dépôt **public** : jamais de secret (`.env` est ignoré, `.env.example` fait référence), jamais de contenu Studi sous licence.
- Gitflow : `feature/*` part de `dev`, fusionne dans `dev` après vérification ; `dev` validée rejoint `main`. Commits conventionnels `type(scope): description en minuscule`.
- Avant tout push : le compte actif doit être `Lilgim` (`gh api user --jq .login`).
- Chaque exigence implémentée se trace dans `.agent-forge/REQUIREMENTS_MATRIX.md` ; chaque décision dans `.agent-forge/DECISIONS.md` ; chaque contrôle exécuté (sortie réelle) dans `.agent-forge/VERIFICATION.md` — écrire `NON EXÉCUTÉ` plutôt qu'inventer.
- TypeScript strict, pas de `any` (Biome le bloque). Validation serveur de toutes les entrées.

## Architecture prévue

- `src/app/` — App Router : pages publiques, espace client, espace employé, espace admin, API.
- PostgreSQL : données relationnelles (utilisateurs, rôles, menus, plats, allergènes, commandes, statuts, avis, horaires) + scripts SQL explicites de création/insertion exigés par le sujet.
- MongoDB : statistiques administrateur (commandes par menu, chiffre d'affaires).
- `docs/` : documentation technique, gestion de projet, charte graphique, manuel utilisateur.
