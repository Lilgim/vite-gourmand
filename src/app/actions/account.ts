"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { query, queryOne, withTransaction } from "@/lib/db";
import { getOrderStatsCollection } from "@/lib/mongo";
import { computePriceDetail, isDeliveryFree } from "@/lib/pricing";
import {
  createOrderSchema,
  type FormState,
  profileSchema,
} from "@/lib/validation";

const flattenIssues = (issues: { path: PropertyKey[]; message: string }[]) => {
  const errors: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] = [...(errors[key] ?? []), issue.message];
  }
  return errors;
};

// ---------- Profil ----------

export const updateProfile = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  const user = await requireUser();

  const parsed = profileSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    postal_code: formData.get("postal_code"),
    city: formData.get("city"),
  });
  if (!parsed.success) {
    return { status: "error", errors: flattenIssues(parsed.error.issues) };
  }

  const d = parsed.data;
  await query(
    `UPDATE users
        SET first_name = $1, last_name = $2, phone = $3,
            address = $4, postal_code = $5, city = $6
      WHERE id = $7`,
    [
      d.first_name,
      d.last_name,
      d.phone || null,
      d.address || null,
      d.postal_code || null,
      d.city || null,
      user.id,
    ],
  );

  revalidatePath("/compte");
  return {
    status: "success",
    message: "Vos informations ont été mises à jour.",
  };
};

// ---------- Commandes : annulation / modification avant acceptation ----------

type OwnedOrder = {
  id: number;
  menu_id: number;
  current_status: string;
  min_people: number;
  price_per_person: string;
};

const getModifiableOrder = async (
  orderId: number,
  userId: number,
): Promise<OwnedOrder | null> =>
  queryOne<OwnedOrder>(
    `SELECT o.id, o.menu_id, o.current_status, m.min_people,
            m.price_per_person::text
       FROM orders o
       JOIN menus m ON m.id = o.menu_id
      WHERE o.id = $1 AND o.user_id = $2`,
    [orderId, userId],
  );

export const cancelOrder = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  const user = await requireUser();

  const orderId = Number(formData.get("order_id"));
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return { status: "error", message: "Commande invalide." };
  }

  const order = await getModifiableOrder(orderId, user.id);
  if (!order) return { status: "error", message: "Commande introuvable." };

  // Règle du sujet : annulation possible uniquement avant acceptation.
  if (order.current_status !== "submitted") {
    return {
      status: "error",
      message:
        "Cette commande a déjà été acceptée : contactez-nous pour toute modification.",
    };
  }

  await withTransaction(async (client) => {
    await client.query(
      "UPDATE orders SET current_status = 'cancelled' WHERE id = $1",
      [orderId],
    );
    await client.query(
      `INSERT INTO order_status_history (order_id, status, changed_by, reason)
       VALUES ($1, 'cancelled', $2, 'Annulée par le client avant acceptation')`,
      [orderId, user.id],
    );
    // La prestation redevient disponible.
    await client.query("UPDATE menus SET stock = stock + 1 WHERE id = $1", [
      order.menu_id,
    ]);
  });

  try {
    const stats = await getOrderStatsCollection();
    await stats.updateOne({ orderId }, { $set: { status: "cancelled" } });
  } catch (error) {
    console.error("Mise à jour des statistiques MongoDB impossible :", error);
  }

  revalidatePath(`/compte/commandes/${orderId}`);
  revalidatePath("/compte");
  return { status: "success", message: "Votre commande a été annulée." };
};

export const updateOrder = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  const user = await requireUser();

  const orderId = Number(formData.get("order_id"));
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return { status: "error", message: "Commande invalide." };
  }

  // Le menu n'est jamais modifiable (règle du sujet) : on repart du menu
  // de la commande, jamais d'un identifiant fourni par le formulaire.
  const order = await getModifiableOrder(orderId, user.id);
  if (!order) return { status: "error", message: "Commande introuvable." };

  if (order.current_status !== "submitted") {
    return {
      status: "error",
      message:
        "Cette commande a déjà été acceptée : contactez-nous pour toute modification.",
    };
  }

  const parsed = createOrderSchema(order.min_people).safeParse({
    people_count: formData.get("people_count"),
    event_date: formData.get("event_date"),
    event_time: formData.get("event_time"),
    event_address: formData.get("event_address"),
    event_postal_code: formData.get("event_postal_code"),
    event_city: formData.get("event_city"),
    phone: formData.get("phone"),
    distance_km: formData.get("distance_km") || 0,
  });
  if (!parsed.success) {
    return { status: "error", errors: flattenIssues(parsed.error.issues) };
  }

  const data = parsed.data;
  const distanceKm = isDeliveryFree(data.event_city) ? 0 : data.distance_km;
  const price = computePriceDetail({
    pricePerPerson: Number(order.price_per_person),
    peopleCount: data.people_count,
    minPeople: order.min_people,
    city: data.event_city,
    distanceKm,
  });

  await withTransaction(async (client) => {
    await client.query(
      `UPDATE orders
          SET people_count = $1, event_date = $2, event_time = $3,
              event_address = $4, event_postal_code = $5, event_city = $6,
              phone = $7, distance_km = $8, base_price = $9,
              discount_amount = $10, delivery_fee = $11, total_price = $12
        WHERE id = $13`,
      [
        data.people_count,
        data.event_date,
        data.event_time,
        data.event_address,
        data.event_postal_code,
        data.event_city,
        data.phone,
        distanceKm,
        price.basePrice,
        price.discountAmount,
        price.deliveryFee,
        price.totalPrice,
        orderId,
      ],
    );
    await client.query(
      `INSERT INTO order_status_history (order_id, status, changed_by, reason)
       VALUES ($1, 'submitted', $2, 'Commande modifiée par le client avant acceptation')`,
      [orderId, user.id],
    );
  });

  try {
    const stats = await getOrderStatsCollection();
    await stats.updateOne(
      { orderId },
      {
        $set: {
          peopleCount: data.people_count,
          totalPrice: price.totalPrice,
        },
      },
    );
  } catch (error) {
    console.error("Mise à jour des statistiques MongoDB impossible :", error);
  }

  revalidatePath(`/compte/commandes/${orderId}`);
  return { status: "success", message: "Votre commande a été mise à jour." };
};
