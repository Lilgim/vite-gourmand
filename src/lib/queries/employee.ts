import "server-only";
import { query, queryOne } from "@/lib/db";

// ---------- Commandes ----------

export type EmployeeOrderSummary = {
  id: number;
  menu_title: string;
  client_name: string;
  client_email: string;
  event_date: string;
  people_count: number;
  total_price: string;
  current_status: string;
  created_at: string;
};

// Filtrage par statut et/ou client (nom ou email, insensible à la casse).
export const getOrdersForEmployee = (
  status?: string,
  clientSearch?: string,
): Promise<EmployeeOrderSummary[]> => {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status) {
    params.push(status);
    conditions.push(`o.current_status = $${params.length}::order_status`);
  }
  if (clientSearch) {
    params.push(`%${clientSearch}%`);
    conditions.push(
      `(u.email ILIKE $${params.length}
        OR u.first_name || ' ' || u.last_name ILIKE $${params.length})`,
    );
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return query<EmployeeOrderSummary>(
    `SELECT o.id, m.title AS menu_title,
            u.first_name || ' ' || u.last_name AS client_name,
            u.email AS client_email, o.event_date::text, o.people_count,
            o.total_price::text, o.current_status, o.created_at::text
       FROM orders o
       JOIN menus m ON m.id = o.menu_id
       JOIN users u ON u.id = o.user_id
      ${where}
      ORDER BY o.created_at DESC`,
    params,
  );
};

export type EmployeeOrderDetail = {
  id: number;
  menu_id: number;
  menu_title: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  people_count: number;
  event_date: string;
  event_time: string;
  event_address: string;
  event_postal_code: string;
  event_city: string;
  phone: string;
  distance_km: string;
  unit_price: string;
  base_price: string;
  discount_amount: string;
  delivery_fee: string;
  total_price: string;
  current_status: string;
  created_at: string;
};

export const getOrderForEmployee = (
  orderId: number,
): Promise<EmployeeOrderDetail | null> =>
  queryOne<EmployeeOrderDetail>(
    `SELECT o.id, o.menu_id, m.title AS menu_title,
            u.first_name || ' ' || u.last_name AS client_name,
            u.email AS client_email, u.phone AS client_phone,
            o.people_count, o.event_date::text, o.event_time::text,
            o.event_address, o.event_postal_code, o.event_city, o.phone,
            o.distance_km::text, o.unit_price::text, o.base_price::text,
            o.discount_amount::text, o.delivery_fee::text,
            o.total_price::text, o.current_status, o.created_at::text
       FROM orders o
       JOIN menus m ON m.id = o.menu_id
       JOIN users u ON u.id = o.user_id
      WHERE o.id = $1`,
    [orderId],
  );

// ---------- Avis en attente ----------

export type PendingReview = {
  id: number;
  rating: number;
  comment: string;
  client_name: string;
  menu_title: string;
  created_at: string;
};

export const getPendingReviews = (): Promise<PendingReview[]> =>
  query<PendingReview>(
    `SELECT r.id, r.rating, r.comment,
            u.first_name || ' ' || u.last_name AS client_name,
            m.title AS menu_title, r.created_at::text
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       JOIN orders o ON o.id = r.order_id
       JOIN menus m ON m.id = o.menu_id
      WHERE r.status = 'pending'
      ORDER BY r.created_at`,
  );

// ---------- Catalogue (gestion) ----------

export type ManagedMenu = {
  id: number;
  title: string;
  theme: string;
  diet: string;
  min_people: number;
  price_per_person: string;
  stock: number;
  is_active: boolean;
};

export const getAllMenus = (): Promise<ManagedMenu[]> =>
  query<ManagedMenu>(
    `SELECT m.id, m.title, t.name AS theme, d.name AS diet, m.min_people,
            m.price_per_person::text, m.stock, m.is_active
       FROM menus m
       JOIN themes t ON t.id = m.theme_id
       JOIN diets d ON d.id = m.diet_id
      ORDER BY m.title`,
  );

export type MenuForEdit = {
  id: number;
  title: string;
  description: string;
  theme_id: number;
  diet_id: number;
  min_people: number;
  price_per_person: string;
  conditions: string | null;
  stock: number;
  dish_ids: number[];
  images_text: string;
};

export const getMenuForEdit = (menuId: number): Promise<MenuForEdit | null> =>
  queryOne<MenuForEdit>(
    `SELECT m.id, m.title, m.description, m.theme_id, m.diet_id,
            m.min_people, m.price_per_person::text, m.conditions, m.stock,
            COALESCE(
              (SELECT array_agg(dish_id) FROM menu_dishes WHERE menu_id = m.id),
              '{}'
            ) AS dish_ids,
            COALESCE(
              (SELECT string_agg(url || ' | ' || alt, E'\\n' ORDER BY position)
                 FROM menu_images WHERE menu_id = m.id),
              ''
            ) AS images_text
       FROM menus m
      WHERE m.id = $1`,
    [menuId],
  );

export type ManagedDish = {
  id: number;
  name: string;
  description: string | null;
  allergen_ids: number[];
  menu_count: number;
};

export const getAllDishes = (): Promise<ManagedDish[]> =>
  query<ManagedDish>(
    `SELECT di.id, di.name, di.description,
            COALESCE(
              (SELECT array_agg(allergen_id) FROM dish_allergens WHERE dish_id = di.id),
              '{}'
            ) AS allergen_ids,
            (SELECT count(*)::int FROM menu_dishes WHERE dish_id = di.id) AS menu_count
       FROM dishes di
      ORDER BY di.name`,
  );

export type Referential = { id: number; name: string };

export const getThemesWithIds = (): Promise<Referential[]> =>
  query<Referential>("SELECT id, name FROM themes ORDER BY name");

export const getDietsWithIds = (): Promise<Referential[]> =>
  query<Referential>("SELECT id, name FROM diets ORDER BY name");

export const getAllergensWithIds = (): Promise<Referential[]> =>
  query<Referential>("SELECT id, name FROM allergens ORDER BY name");
