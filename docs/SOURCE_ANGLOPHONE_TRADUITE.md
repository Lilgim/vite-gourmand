# Source anglophone traduite et exploitée

## Source

OWASP Cheat Sheet Series, « Authentication Cheat Sheet » : https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html — consulté le 19 juillet 2026.

## Synthèse traduite

L'authentification vérifie l'identité déclarée d'un utilisateur. La gestion de session conserve cet état au moyen d'un identifiant difficile à prédire. OWASP recommande une longueur minimale de mot de passe, un stockage par hachage adapté, un mécanisme sûr de récupération, un transport exclusivement chiffré et des réponses génériques pour éviter de révéler si un compte existe. Après une récupération de compte, les sessions existantes doivent être invalidées ou renouvelées.

## Application au projet

- bcrypt avec coût 12 pour le stockage ;
- cookie de session serveur non accessible à JavaScript ;
- même message en cas d'email absent ou présent lors d'une réinitialisation ;
- lien signé et expirant au bout de 30 minutes ;
- révocation des sessions après changement de mot de passe ;
- HTTPS prévu par Caddy en production ;
- comptes employés et administrateur impossibles à créer publiquement.

## Écart assumé

Le sujet impose une règle de composition du mot de passe. Elle est donc appliquée même si les recommandations modernes privilégient généralement la longueur, les phrases de passe et le blocage des mots de passe compromis.
