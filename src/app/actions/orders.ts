"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { queryOne, withTransaction } from "@/lib/db";
import { orderConfirmationMail, sendMail } from "@/lib/mailer";
import { getOrderStatsCollection } from "@/lib/mongo";
import { computePriceDetail, isDeliveryFree } from "@/lib/pricing";
import { createOrderSchema, type FormState } from "@/lib/validation";

type MenuForOrder = {
  id: number;
  title: string;
  min_people: number;
  price_per_person: string;
  stock: number;
};

export const createOrder = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  // Autorisation serveur : seule une personne connectée peut commander.
  const user = await requireUser();

  const menuId = Number(formData.get("menu_id"));
  if (!Number.isInteger(menuId) || menuId <= 0) {
    return { status: "error", message: "Menu invalide." };
  }

  const menu = await queryOne<MenuForOrder>(
    `SELECT id, title, min_people, price_per_person::text, stock
       FROM menus WHERE id = $1 AND is_active`,
    [menuId],
  );
  if (!menu) return { status: "error", message: "Ce menu n'existe plus." };

  const parsed = createOrderSchema(menu.min_people).safeParse({
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
    const errors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] = [...(errors[key] ?? []), issue.message];
    }
    return { status: "error", errors };
  }

  const data = parsed.data;
  // La distance ne compte que hors Bordeaux (livraison offerte sinon).
  const distanceKm = isDeliveryFree(data.event_city) ? 0 : data.distance_km;

  // Le prix qui fait foi est recalculé côté serveur.
  const price = computePriceDetail({
    pricePerPerson: Number(menu.price_per_person),
    peopleCount: data.people_count,
    minPeople: menu.min_people,
    city: data.event_city,
    distanceKm,
  });

  let orderId: number;
  try {
    orderId = await withTransaction(async (client) => {
      // Décrément conditionnel : échoue si le stock est épuisé entre-temps.
      const stockUpdate = await client.query(
        "UPDATE menus SET stock = stock - 1 WHERE id = $1 AND stock > 0 RETURNING stock",
        [menu.id],
      );
      if (stockUpdate.rowCount === 0) {
        throw new Error("STOCK_EPUISE");
      }

      const inserted = await client.query(
        `INSERT INTO orders
           (user_id, menu_id, people_count, event_date, event_time,
            event_address, event_postal_code, event_city, phone, distance_km,
            unit_price, base_price, discount_amount, delivery_fee, total_price,
            current_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'submitted')
         RETURNING id`,
        [
          user.id,
          menu.id,
          data.people_count,
          data.event_date,
          data.event_time,
          data.event_address,
          data.event_postal_code,
          data.event_city,
          data.phone,
          distanceKm,
          Number(menu.price_per_person),
          price.basePrice,
          price.discountAmount,
          price.deliveryFee,
          price.totalPrice,
        ],
      );
      const id: number = inserted.rows[0].id;

      await client.query(
        `INSERT INTO order_status_history (order_id, status, changed_by)
         VALUES ($1, 'submitted', $2)`,
        [id, user.id],
      );

      return id;
    });
  } catch (error) {
    if (error instanceof Error && error.message === "STOCK_EPUISE") {
      return {
        status: "error",
        message:
          "Ce menu vient d'être épuisé. Contactez-nous pour une alternative.",
      };
    }
    throw error;
  }

  // Statistiques MongoDB : ne doit jamais faire échouer la commande.
  try {
    const stats = await getOrderStatsCollection();
    await stats.insertOne({
      orderId,
      menuId: menu.id,
      menuTitle: menu.title,
      peopleCount: data.people_count,
      totalPrice: price.totalPrice,
      status: "submitted",
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Écriture des statistiques MongoDB impossible :", error);
  }

  // Email de confirmation (mode test documenté si SMTP absent).
  await sendMail(
    orderConfirmationMail(
      user.email,
      user.first_name,
      orderId,
      menu.title,
      price.totalPrice,
    ),
  );

  redirect(`/compte/commandes/${orderId}`);
};
