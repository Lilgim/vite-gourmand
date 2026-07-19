# Veille sécurité — application web Vite & Gourmand

Date de revue : 19 juillet 2026.

## Sources surveillées

- OWASP Cheat Sheet Series : authentification, sessions, CSRF, XSS et en-têtes HTTP ;
- documentation sécurité Next.js : https://nextjs.org/docs/app/guides/authentication ;
- avis de sécurité GitHub et mises à jour des dépendances npm ;
- documentation PostgreSQL sur les contraintes et requêtes paramétrées.

## Menaces pertinentes

| Menace | Mesure actuelle | Suite recommandée |
|---|---|---|
| Injection SQL | paramètres `$1`, `$2`, validation Zod | revue continue des nouvelles requêtes |
| Usurpation de rôle | `requireRole` côté serveur | tests d'autorisation à chaque nouvelle route |
| Vol de session | cookie `httpOnly`, expiration, révocation | HTTPS obligatoire et rotation périodique |
| XSS | échappement React, CSP, pas de HTML utilisateur | maintenir la CSP et éviter `dangerouslySetInnerHTML` |
| CSRF | contrôles d'origine des Server Actions Next.js | surveiller les changements du framework |
| Brute force | messages génériques | ajouter limitation de fréquence en production |
| Secrets exposés | `.env` ignoré, modèles sans secret | scanner le dépôt avant chaque livraison |
| Bases exposées | aucun port PostgreSQL/Mongo public en prod | sauvegardes et contrôle firewall |

## Processus de veille

Une fois par mois : vérifier les alertes GitHub, exécuter l'audit des dépendances, lire les avis Next.js/Node/PostgreSQL/MongoDB et mettre à jour après passage des tests. En cas de vulnérabilité critique exploitable, corriger immédiatement, reconstruire l'image et révoquer les secrets concernés.
