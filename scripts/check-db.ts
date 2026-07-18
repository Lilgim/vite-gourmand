// Contrôle de santé : connexion applicative aux deux bases.
// Usage : node --env-file=.env scripts/check-db.ts
// (le driver mongodb est incompatible avec Bun sur Windows)
import { MongoClient } from "mongodb";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL manquante");
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) throw new Error("MONGODB_URI manquante");

const pool = new Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 5_000,
});
try {
  const menus = await pool.query("SELECT count(*)::int AS n FROM menus");
  const users = await pool.query("SELECT count(*)::int AS n FROM users");
  console.log("PG — menus:", menus.rows[0].n, "| users:", users.rows[0].n);
} finally {
  await pool.end();
}

const mc = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5_000 });
try {
  await mc.connect();
  const ping = await mc.db().command({ ping: 1 });
  console.log("Mongo — ping:", ping.ok);
} finally {
  await mc.close();
}
