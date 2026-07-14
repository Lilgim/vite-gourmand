import "server-only";
import { query, queryOne } from "@/lib/db";

export const ORDER_STATUS_LABELS: Record<string, string> = {
  submitted: "Soumise — en attente d'acceptation",
  accepted: "Acceptée",
  in_preparation: "En préparation",
  in_delivery: "En cours de livraison",
  delivered: "Livrée",
  awaiting_equipment_return: "En attente du retour de matériel",
  completed: "Terminée",
  cancelled: "Annulée",
};

export type OrderDetail = {
  id: number;
  user_id: number;
  menu_id: number;
  menu_title: string;
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

export const getOrderForUser = (
  orderId: number,
  userId: number,
): Promise<OrderDetail | null> =>
  queryOne<OrderDetail>(
    `SELECT o.id, o.user_id, o.menu_id, m.title AS menu_title, o.people_count,
            o.event_date::text, o.event_time::text, o.event_address,
            o.event_postal_code, o.event_city, o.phone, o.distance_km::text,
            o.unit_price::text, o.base_price::text, o.discount_amount::text,
            o.delivery_fee::text, o.total_price::text, o.current_status,
            o.created_at::text
       FROM orders o
       JOIN menus m ON m.id = o.menu_id
      WHERE o.id = $1 AND o.user_id = $2`,
    [orderId, userId],
  );

export type OrderSummary = {
  id: number;
  menu_title: string;
  event_date: string;
  people_count: number;
  total_price: string;
  current_status: string;
  created_at: string;
};

export const getOrdersForUser = (userId: number): Promise<OrderSummary[]> =>
  query<OrderSummary>(
    `SELECT o.id, m.title AS menu_title, o.event_date::text, o.people_count,
            o.total_price::text, o.current_status, o.created_at::text
       FROM orders o
       JOIN menus m ON m.id = o.menu_id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC`,
    [userId],
  );

export type StatusHistoryEntry = {
  status: string;
  created_at: string;
  contact_mode: string | null;
  reason: string | null;
};

export const getOrderStatusHistory = (
  orderId: number,
): Promise<StatusHistoryEntry[]> =>
  query<StatusHistoryEntry>(
    `SELECT status, created_at::text, contact_mode, reason
       FROM order_status_history
      WHERE order_id = $1
      ORDER BY created_at`,
    [orderId],
  );
