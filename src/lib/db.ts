import { Pool } from "pg";
import { env } from "@/lib/env";

// Pool unique réutilisé entre les rechargements HMR de Next.js
const globalForDb = globalThis as unknown as { pgPool?: Pool };

export const db =
  globalForDb.pgPool ??
  new Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = db;
}

// Sans écouteur, une erreur sur un client inactif du pool ferait
// tomber le process Node en exception non gérée. Le garde évite
// d'empiler des écouteurs sur le pool réutilisé entre rechargements HMR.
if (db.listenerCount("error") === 0) {
  db.on("error", (error) => {
    console.error("Erreur pool PostgreSQL (client inactif) :", error.message);
  });
}

// Toutes les requêtes passent par cette fonction : paramétrées, jamais de concaténation.
export const query = async <T extends Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> => {
  const result = await db.query(text, params);
  return result.rows as T[];
};

export const queryOne = async <T extends Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> => {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
};
