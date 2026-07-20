import "server-only";
import { query } from "@/lib/db";
import { getStatsDb } from "@/lib/mongo";

// ---------- Statistiques MongoDB (exigence : base NoSQL) ----------

export type MenuStat = {
  menuId: number;
  menuTitle: string;
  orders: number;
  revenue: number;
};

// Nombre de commandes et chiffre d'affaires par menu, filtrables par
// période. Les commandes annulées sont exclues du chiffre d'affaires.
export const getMenuStats = async (
  from?: Date,
  to?: Date,
  menuId?: number,
): Promise<MenuStat[]> => {
  const statsDb = await getStatsDb();
  const match: Record<string, unknown> = { status: { $ne: "cancelled" } };
  if (from || to) {
    match.createdAt = {
      ...(from ? { $gte: from } : {}),
      ...(to ? { $lte: to } : {}),
    };
  }
  if (menuId) match.menuId = menuId;

  const results = await statsDb
    .collection("order_stats")
    .aggregate<{
      _id: { menuId: number; menuTitle: string };
      orders: number;
      revenue: number;
    }>([
      { $match: match },
      {
        $group: {
          _id: { menuId: "$menuId", menuTitle: "$menuTitle" },
          orders: { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { orders: -1 } },
    ])
    .toArray();

  return results.map((entry) => ({
    menuId: entry._id.menuId,
    menuTitle: entry._id.menuTitle,
    orders: entry.orders,
    revenue: Math.round(entry.revenue * 100) / 100,
  }));
};

export type AdminMenuOption = { id: number; title: string };

export const getAdminMenuOptions = (): Promise<AdminMenuOption[]> =>
  query<AdminMenuOption>("SELECT id, title FROM menus ORDER BY title");

// ---------- Comptes employés ----------

export type EmployeeAccount = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  created_at: string;
};

export const getEmployeeAccounts = (): Promise<EmployeeAccount[]> =>
  query<EmployeeAccount>(
    `SELECT id, email, first_name, last_name, is_active, created_at::text
       FROM users
      WHERE role = 'employee'
      ORDER BY created_at DESC`,
  );
