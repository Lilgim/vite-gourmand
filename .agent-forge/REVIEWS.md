# Journal des revues

Chaque fonctionnalité est relue par un agent/une session qui ne l'a pas implémentée. Findings classés : `BLOCANT` · `CORRECTIF` · `DIFFERE` · `FAUX_POSITIF`.

## PR #1 — feat(db) : fondations données — review CodeRabbit (2026-07-14)

10 findings. Classement et traitement :

| # | Finding | Classement | Traitement |
|---|---|---|---|
| 1 | Ports docker exposés sur 0.0.0.0 (mongo sans auth) | CORRECTIF | Binding `127.0.0.1:` sur les deux services |
| 2 | check-db.ts : usage `bun` documenté alors que bun incompatible mongodb | CORRECTIF | Commentaire d'usage passé à `node --env-file` |
| 3 | check-db.ts : DATABASE_URL non vérifiée avant Pool | CORRECTIF | Garde explicite ajoutée |
| 4 | check-db.ts : pas de cleanup sur erreur | CORRECTIF | try/finally + timeouts de connexion |
| 5 | check-db.ts : logs d'emails utilisateurs (CWE-532) | CORRECTIF | Comptes uniquement, plus d'identifiants loggés |
| 6 | orders : montants négatifs possibles | CORRECTIF | CHECK >= 0 sur les 5 colonnes + discount <= base |
| 7 | order_status_history : audit (contact_mode/reason/rôle) non imposé en base | DIFFÉRÉ | Sera imposé par les Server Actions employé (story-employee) ; trigger envisagé si le temps le permet |
| 8 | opening_hours : incohérences possibles | CORRECTIF | CONSTRAINT opening_hours_coherence |
| 9 | pool pg sans timeouts | CORRECTIF | connectionTimeoutMillis 5s, idleTimeoutMillis 30s |
| 10 | env.ts : URLs non trimées | CORRECTIF | .trim() ajouté |

Vérifications après correctifs : conteneurs recréés en loopback, scripts SQL re-testés sur base vide (COMMIT), check-db OK, lint/typecheck/build OK.
