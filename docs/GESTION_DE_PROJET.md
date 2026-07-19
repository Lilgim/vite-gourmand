# Gestion de projet — Vite & Gourmand

## Méthode

Le projet a été organisé en douze stories verticales, des fondations jusqu'à la livraison. Chaque story a été développée sur une branche `feature/*` issue de `dev`, contrôlée, puis fusionnée dans `dev`. Une version intégrée et testée est ensuite fusionnée dans `main`.

## Découpage

1. bases PostgreSQL et MongoDB ;
2. authentification et rôles ;
3. pages publiques ;
4. catalogue et filtres ;
5. commande et tarification ;
6. suivi client ;
7. avis ;
8. espace employé ;
9. administration et statistiques ;
10. tests ;
11. sécurité, accessibilité et emails ;
12. design, déploiement et documents.

## Priorisation

Les fonctions imposées par le sujet et les risques structurants ont été traités en premier : données, sécurité, calcul monétaire, statuts et déploiement. Les choix ont privilégié la simplicité de démonstration et la reproductibilité. Les décisions sont consignées dans `.agent-forge/DECISIONS.md`.

## Suivi et preuves

- `.agent-forge/PLAN.md` : plan initial ;
- `.agent-forge/STATE.yaml` : état courant ;
- `.agent-forge/REQUIREMENTS_MATRIX.md` : exigence vers preuve ;
- `.agent-forge/VERIFICATION.md` : commandes réellement exécutées ;
- `.agent-forge/REVIEWS.md` : retours et traitements ;
- GitHub : commits conventionnels, branches et pull requests.

## Qualité

La définition de fini d'une story comprend validation serveur, contrôle des rôles, lint, TypeScript, build et test proportionné au risque. Les règles métier isolées sont testées unitairement ; le parcours complet est vérifié par Playwright. Les anomalies découvertes en revue sont classées et corrigées avant intégration.

## Risques pilotés

- calculs financiers : centimes entiers et tests de seuil ;
- concurrence sur le stock : transaction et mise à jour conditionnelle ;
- sécurité : autorisation serveur, sessions révocables, requêtes paramétrées ;
- double base : PostgreSQL source et resynchronisation MongoDB disponible ;
- hébergement : image autonome, stack locale testée puis déploiement VPS isolé derrière le proxy HTTPS central ;
- délai : solution full-stack et dépendances limitées.

## Bilan

Le découpage vertical a permis d'obtenir rapidement un parcours démontrable, puis de le durcir. Les contrôles automatisés et le journal de preuves réduisent le risque de régression. Le déploiement public a ensuite été validé sur le VPS avec DNS, certificat HTTPS, conteneurs sains et neuf parcours Playwright exécutés contre l'URL publique.
