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
# Session de livraison finale — 19/07/2026

- Audit direct des 12 pages du sujet : plusieurs exigences étaient absentes malgré les stories marquées passées (contact, mot de passe oublié, emails, adresse à l'inscription, filtres complets).
- Le build dépendait de Google Fonts : suppression du téléchargement de build et fallbacks CSS reproductibles.
- Ajout des parcours publics manquants avec validation Zod et réponse générique anti-énumération ; jeton de récupération signé HMAC et expirant.
- Livrables générés dans `docs/` : manuel et charte PDF contrôlés visuellement, documentation technique/projet, veille et source traduite.
- Board public créé sous forme d'issue GitHub à checklist : issue 15.
- Copie officielle recréée en DOCX hors dépôt public ; trois données restent humaines : date de naissance, URL prod et dépôt Studi.
- Validation finale : lint/tsc/build/21 tests verts ; E2E bloqué par le service Docker Desktop Windows, ne jamais le déclarer exécuté.
