# Matrice des exigences

Statuts : `FAIT` · `ACTION_HUMAINE`

| ID | Exigence | Statut | Preuves |
|---|---|---|---|
| R-001 | Accueil : entreprise, professionnalisme, avis validés | FAIT | `src/app/page.tsx`, `src/lib/queries/home.ts` |
| R-002 | Navigation accueil, menus, connexion, contact | FAIT | `src/components/header.tsx` |
| R-003 | Pied de page : horaires, mentions légales, CGV | FAIT | `src/components/footer.tsx` |
| R-004 | Catalogue public et détail complet des menus | FAIT | `src/app/menus/**`, `src/lib/queries/menus.ts` |
| R-005 | Filtres prix min/max, thème, régime, convives sans rechargement | FAIT | `src/app/menus/menus-explorer.tsx` |
| R-006 | Inscription : identité, GSM, email, adresse, mot de passe conforme | FAIT | `register-form.tsx`, `validation.ts`, `actions/auth.ts` |
| R-007 | Attribution automatique du rôle client et email de bienvenue | FAIT | `src/app/actions/auth.ts`, `src/lib/mailer.ts` |
| R-008 | Connexion et mot de passe oublié par email | FAIT | `src/app/(auth)/**`, `password-reset.ts` |
| R-009 | Commande réservée aux authentifiés, menu prérempli | FAIT | `src/app/commander/[id]`, `src/proxy.ts` |
| R-010 | Informations de prestation et données client préremplies | FAIT | `order-form.tsx`, `queries/orders.ts` |
| R-011 | Minimum, remise 10 %, livraison Bordeaux/hors Bordeaux | FAIT | `pricing.ts`, `tests/pricing.test.ts` |
| R-012 | Détail du prix avant validation et confirmation email | FAIT | `order-form.tsx`, `actions/orders.ts` |
| R-013 | Historique client, profil, modification/annulation avant acceptation | FAIT | `src/app/compte/**`, `actions/account.ts` |
| R-014 | Suivi horodaté des statuts | FAIT | `order_status_history`, pages commande |
| R-015 | Avis 1 à 5 après terminaison | FAIT | `actions/reviews.ts`, `review-form.tsx` |
| R-016 | Employé : CRUD menus, plats, horaires | FAIT | `src/app/employe/**`, `actions/employee.ts` |
| R-017 | Employé : filtres commandes par statut/client | FAIT | `src/app/employe/page.tsx`, `queries/employee.ts` |
| R-018 | Transitions de commande contrôlées | FAIT | `status.ts`, `tests/status.test.ts` |
| R-019 | Contact obligatoire avant annulation, motif et mode historisés | FAIT | `actions/employee.ts`, `status-actions.tsx` |
| R-020 | Notification retour matériel, 10 jours ouvrés et 600 € | FAIT | `mailer.ts`, `cgv/page.tsx` |
| R-021 | Modération des avis | FAIT | `employe/avis`, `actions/employee.ts` |
| R-022 | Admin : création/désactivation employés et email | FAIT | `admin/employes`, `actions/admin.ts` |
| R-023 | Admin hérite des fonctions employé | FAIT | `requireRole`, layouts admin/employé |
| R-024 | Statistiques MongoDB, graphique et CA filtré menu/période | FAIT | `admin/page.tsx`, `queries/admin.ts`, `mongo.ts` |
| R-025 | Formulaire de contact avec email | FAIT | `contact/contact-form.tsx`, `actions/contact.ts` |
| R-026 | Accessibilité et responsive | FAIT | styles, sémantique, `e2e/responsive.spec.ts` |
| R-027 | Base relationnelle et base non relationnelle | FAIT | PostgreSQL, MongoDB, `docker-compose.yml` |
| R-028 | Scripts SQL création et insertion | FAIT | `sql/01_create.sql`, `sql/02_seed.sql` |
| R-029 | README de déploiement local | FAIT | `README.md` |
| R-030 | Gitflow main/dev/feature | FAIT | dépôt GitHub et historique des PR |
| R-031 | Manuel utilisateur PDF | FAIT | `docs/MANUEL_UTILISATEUR.pdf` |
| R-032 | Charte PDF : palette, typographies, 3 desktop et 3 mobiles | FAIT | `docs/CHARTE_GRAPHIQUE.pdf` |
| R-033 | Documentation gestion de projet | FAIT | `docs/GESTION_DE_PROJET.md` |
| R-034 | Documentation technique, MCD, cas d'utilisation, séquence | FAIT | `docs/DOCUMENTATION_TECHNIQUE.md` |
| R-035 | Documentation de déploiement | FAIT | documentation technique, README, Compose/Caddy |
| R-036 | Source anglophone traduite et veille sécurité | FAIT | `docs/SOURCE_ANGLOPHONE_TRADUITE.md`, `docs/VEILLE_SECURITE.md` |
| R-037 | Application déployée et HTTPS | FAIT | https://vite-gourmand.lilgim.cloud ; HTTP 200, certificat valide, conteneurs sains, E2E 9/9 |
| R-038 | Lien public outil de gestion | FAIT | https://github.com/Lilgim/vite-gourmand/issues/15 |
| R-039 | Copie officielle complétée et renommée | FAIT | date de naissance, URL de production, board et identifiants insérés dans le DOCX final |
| R-040 | Dépôt final Studi avant échéance | ACTION_HUMAINE | Lucas Gimenez uniquement |
