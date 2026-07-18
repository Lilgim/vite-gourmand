// Reconstruit la collection MongoDB order_stats depuis PostgreSQL.
// Sert à l'initialisation (données de démo insérées en SQL) et à la
// resynchronisation si les deux bases divergent.
// Usage : node --env-file=.env scripts/sync-stats.ts
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
  const { rows } = await pool.query(
    `SELECT o.id AS order_id, o.menu_id, m.title AS menu_title,
            o.people_count, o.total_price::float8 AS total_price,
            o.current_status, o.created_at
       FROM orders o
       JOIN menus m ON m.id = o.menu_id
      ORDER BY o.id`,
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
  console.log(`order_stats synchronisée : ${rows.length} document(s).`);
} finally {
  await pool.end();
  await mc.close();
}
