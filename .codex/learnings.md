# Learnings

## 2026-07-20 — Livraison ECF et production

- L'application a été complétée selon la matrice du sujet : contact, réinitialisation de mot de passe, inscription complète, emails métier et filtres.
- Le VPS possède déjà un Caddy central sur le réseau Docker `nestboard-v2`. La stack projet utilise donc `docker-compose.vps.yml` et rattache seulement l'application à ce réseau ; PostgreSQL et MongoDB restent sur le réseau interne.
- La production est accessible sur `https://vite-gourmand.lilgim.cloud`. Les secrets sont générés directement sur le VPS dans `/srv/vite-gourmand/.env` et ne transitent pas dans Git.
- Pour tester une URL distante, `playwright.config.ts` accepte `PLAYWRIGHT_BASE_URL` et désactive alors le serveur local.
- Le sélecteur Playwright d'une statistique doit viser la cellule visible par rôle, car `getByText(...).first()` peut choisir une option cachée d'un `select`.
- Validation finale : 21 tests unitaires / 70 assertions, lint, TypeScript et build verts ; 9 parcours E2E verts contre la production.
- Fichiers principaux ajoutés ou modifiés : `docker-compose.vps.yml`, `playwright.config.ts`, `e2e/parcours.spec.ts`, `README.md`, `docs/*`, `.agent-forge/*`.
