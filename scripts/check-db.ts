// Contrôle de santé : connexion applicative aux deux bases.
// Usage : bun scripts/check-db.ts
import { MongoClient } from "mongodb";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const menus = await pool.query("SELECT count(*)::int AS n FROM menus");
const users = await pool.query("SELECT email, role FROM users ORDER BY id");
console.log(
  "PG — menus:",
  menus.rows[0].n,
  "| users:",
  users.rows.map((u) => `${u.email}:${u.role}`).join(", "),
);

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) throw new Error("MONGODB_URI manquante");
const mc = new MongoClient(mongoUri);
await mc.connect();
const ping = await mc.db().command({ ping: 1 });
console.log("Mongo — ping:", ping.ok);
await mc.close();
await pool.end();
