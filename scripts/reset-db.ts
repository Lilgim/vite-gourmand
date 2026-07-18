// Remet la base dans l'état de démonstration : schéma recréé depuis
// sql/01_create.sql, données depuis sql/02_seed.sql, stats Mongo
// resynchronisées. Utilisé avant les tests end-to-end.
// Usage : node --env-file=.env scripts/reset-db.ts
import { readFileSync } from "node:fs";
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
const mc = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5_000 });

try {
  await pool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  await pool.query(readFileSync("sql/01_create.sql", "utf8"));
  await pool.query(readFileSync("sql/02_seed.sql", "utf8"));

  const { rows } = await pool.query(
    `SELECT o.id AS order_id, o.menu_id, m.title AS menu_title,
            o.people_count, o.total_price::float8 AS total_price,
            o.current_status, o.created_at
       FROM orders o JOIN menus m ON m.id = o.menu_id ORDER BY o.id`,
  );
  await mc.connect();
  const collection = mc.db().collection("order_stats");
  await collection.deleteMany({});
  if (rows.length > 0) {
    await collection.insertMany(
      rows.map((row) => ({
        orderId: row.order_id,
        menuId: row.menu_id,
        menuTitle: row.menu_title,
        peopleCount: row.people_count,
        totalPrice: row.total_price,
        status: row.current_status,
        createdAt: new Date(row.created_at),
      })),
    );
  }
  console.log(
    `Base réinitialisée : schéma + seed + ${rows.length} stat(s) Mongo.`,
  );
} finally {
  await pool.end();
  await mc.close();
}
