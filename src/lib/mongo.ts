import { type Db, MongoClient } from "mongodb";
import { env } from "@/lib/env";

// Client unique réutilisé entre les rechargements HMR de Next.js
const globalForMongo = globalThis as unknown as { mongoClient?: MongoClient };

const client = globalForMongo.mongoClient ?? new MongoClient(env.MONGODB_URI);

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClient = client;
}

export const getStatsDb = async (): Promise<Db> => {
  await client.connect();
  return client.db();
};

// Document inséré à chaque commande : source des statistiques administrateur
// (nombre de commandes par menu, comparaison, chiffre d'affaires filtrable).
export type OrderStatDocument = {
  orderId: number;
  menuId: number;
  menuTitle: string;
  peopleCount: number;
  totalPrice: number;
  status: string;
  createdAt: Date;
};

export const getOrderStatsCollection = async () => {
  const statsDb = await getStatsDb();
  return statsDb.collection<OrderStatDocument>("order_stats");
};
