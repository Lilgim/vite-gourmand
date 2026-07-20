# --- Dépendances (Bun : bun.lock fait foi) ---
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# --- Build (Node : le driver mongodb ne se charge pas sous Bun,
#     node:v8 isBuildingSnapshot non implémenté) ---
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Valeurs factices : src/lib/env.ts (zod) est importé pendant le build,
# aucune connexion n'est ouverte (pools pg/mongo paresseux)
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    MONGODB_URI="mongodb://localhost:27017/build" \
    AUTH_SECRET="build-placeholder-secret-0000" \
    NEXT_OUTPUT_STANDALONE=1 \
    NEXT_TELEMETRY_DISABLED=1
RUN node node_modules/next/dist/bin/next build

# --- Runtime (Node, sortie standalone de Next) ---
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
COPY --from=builder --chown=app:app /app/public ./public
# Initialisation/remise à zéro des données de démo en production
# (Node 24 exécute le TypeScript nativement) :
#   docker compose -f docker-compose.prod.yml exec app node scripts/reset-db.ts
COPY --chown=app:app sql ./sql
COPY --chown=app:app scripts/reset-db.ts ./scripts/reset-db.ts
USER app
EXPOSE 3000
CMD ["node", "server.js"]
