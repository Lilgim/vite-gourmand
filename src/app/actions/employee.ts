"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { query, queryOne, withTransaction } from "@/lib/db";
import { getOrderStatsCollection } from "@/lib/mongo";
import {
  canTransition,
  isOrderStatus,
  requiresContactAndReason,
} from "@/lib/status";
import {
  dishSchema,
  type FormState,
  menuSchema,
  openingHoursSchema,
} from "@/lib/validation";

const flattenIssues = (issues: { path: PropertyKey[]; message: string }[]) => {
  const errors: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] = [...(errors[key] ?? []), issue.message];
  }
  return errors;
};

// ---------- Progression des statuts de commande ----------

export const advanceOrderStatus = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  const employee = await requireRole("employee");

  const orderId = Number(formData.get("order_id"));
  const newStatus = String(formData.get("new_status") ?? "");
  const contactMode = String(formData.get("contact_mode") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!Number.isInteger(orderId) || orderId <= 0 || !isOrderStatus(newStatus)) {
    return { status: "error", message: "Requête invalide." };
  }

  const order = await queryOne<{
    id: number;
    menu_id: number;
    current_status: string;
  }>("SELECT id, menu_id, current_status FROM orders WHERE id = $1", [orderId]);
  if (!order) return { status: "error", message: "Commande introuvable." };

  // Transitions interdites refusées côté serveur.
  if (
    !isOrderStatus(order.current_status) ||
    !canTransition(order.current_status, newStatus)
  ) {
    return {
      status: "error",
      message: `Transition impossible depuis « ${order.current_status} ».`,
    };
  }

  // Annulation/modification après contact client : mode + motif obligatoires.
  if (requiresContactAndReason(newStatus) && (!contactMode || !reason)) {
    return {
      status: "error",
      message:
        "Le mode de contact et le motif sont obligatoires pour une annulation.",
    };
  }

  await withTransaction(async (client) => {
    await client.query("UPDATE orders SET current_status = $1 WHERE id = $2", [
      newStatus,
      orderId,
    ]);
    await client.query(
      `INSERT INTO order_status_history
         (order_id, status, changed_by, contact_mode, reason)
       VALUES ($1, $2, $3, $4, $5)`,
      [orderId, newStatus, employee.id, contactMode || null, reason || null],
    );
    if (newStatus === "cancelled") {
      await client.query("UPDATE menus SET stock = stock + 1 WHERE id = $1", [
        order.menu_id,
      ]);
    }
  });

  try {
    const stats = await getOrderStatsCollection();
    await stats.updateOne({ orderId }, { $set: { status: newStatus } });
  } catch (error) {
    console.error("Mise à jour des statistiques MongoDB impossible :", error);
  }

  revalidatePath(`/employe/commandes/${orderId}`);
  revalidatePath("/employe");
  return { status: "success", message: "Statut mis à jour." };
};

// ---------- Modération des avis ----------

export const moderateReview = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  const employee = await requireRole("employee");

  const reviewId = Number(formData.get("review_id"));
  const decision = String(formData.get("decision") ?? "");
  if (
    !Number.isInteger(reviewId) ||
    reviewId <= 0 ||
    !["approved", "rejected"].includes(decision)
  ) {
    return { status: "error", message: "Requête invalide." };
  }

  const updated = await query(
    `UPDATE reviews SET status = $1, moderated_by = $2
      WHERE id = $3 AND status = 'pending'
      RETURNING id`,
    [decision, employee.id, reviewId],
  );
  if (updated.length === 0) {
    return { status: "error", message: "Avis introuvable ou déjà modéré." };
  }

  revalidatePath("/employe/avis");
  revalidatePath("/");
  return {
    status: "success",
    message: decision === "approved" ? "Avis publié." : "Avis refusé.",
  };
};

// ---------- CRUD menus ----------

const parseMenuForm = (formData: FormData) =>
  menuSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    theme_id: formData.get("theme_id"),
    diet_id: formData.get("diet_id"),
    min_people: formData.get("min_people"),
    price_per_person: formData.get("price_per_person"),
    conditions: formData.get("conditions"),
    stock: formData.get("stock"),
    dish_ids: formData.getAll("dish_ids"),
    images: formData.get("images"),
  });

// "url | texte alternatif", une image par ligne.
const parseImages = (raw: string): { url: string; alt: string }[] =>
  raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [url, ...altParts] = line.split("|");
      return {
        url: url.trim(),
        alt: altParts.join("|").trim() || "Visuel du menu",
      };
    })
    .filter(
      (image) => image.url.startsWith("/") || image.url.startsWith("https://"),
    );

export const createMenu = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  await requireRole("employee");

  const parsed = parseMenuForm(formData);
  if (!parsed.success) {
    return { status: "error", errors: flattenIssues(parsed.error.issues) };
  }
  const d = parsed.data;

  await withTransaction(async (client) => {
    const inserted = await client.query(
      `INSERT INTO menus
         (title, description, theme_id, diet_id, min_people,
          price_per_person, conditions, stock)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [
        d.title,
        d.description,
        d.theme_id,
        d.diet_id,
        d.min_people,
        d.price_per_person,
        d.conditions || null,
        d.stock,
      ],
    );
    const menuId: number = inserted.rows[0].id;
    for (const dishId of d.dish_ids) {
      await client.query(
        "INSERT INTO menu_dishes (menu_id, dish_id) VALUES ($1, $2)",
        [menuId, dishId],
      );
    }
    const images = parseImages(d.images ?? "");
    for (const [position, image] of images.entries()) {
      await client.query(
        "INSERT INTO menu_images (menu_id, url, alt, position) VALUES ($1,$2,$3,$4)",
        [menuId, image.url, image.alt, position],
      );
    }
  });

  revalidatePath("/menus");
  revalidatePath("/employe/menus");
  return { status: "success", message: "Menu créé." };
};

export const updateMenu = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  await requireRole("employee");

  const menuId = Number(formData.get("menu_id"));
  if (!Number.isInteger(menuId) || menuId <= 0) {
    return { status: "error", message: "Menu invalide." };
  }

  const parsed = parseMenuForm(formData);
  if (!parsed.success) {
    return { status: "error", errors: flattenIssues(parsed.error.issues) };
  }
  const d = parsed.data;

  await withTransaction(async (client) => {
    const updated = await client.query(
      `UPDATE menus
          SET title = $1, description = $2, theme_id = $3, diet_id = $4,
              min_people = $5, price_per_person = $6, conditions = $7,
              stock = $8
        WHERE id = $9 RETURNING id`,
      [
        d.title,
        d.description,
        d.theme_id,
        d.diet_id,
        d.min_people,
        d.price_per_person,
        d.conditions || null,
        d.stock,
        menuId,
      ],
    );
    if (updated.rowCount === 0) throw new Error("MENU_INTROUVABLE");

    await client.query("DELETE FROM menu_dishes WHERE menu_id = $1", [menuId]);
    for (const dishId of d.dish_ids) {
      await client.query(
        "INSERT INTO menu_dishes (menu_id, dish_id) VALUES ($1, $2)",
        [menuId, dishId],
      );
    }
    await client.query("DELETE FROM menu_images WHERE menu_id = $1", [menuId]);
    const images = parseImages(d.images ?? "");
    for (const [position, image] of images.entries()) {
      await client.query(
        "INSERT INTO menu_images (menu_id, url, alt, position) VALUES ($1,$2,$3,$4)",
        [menuId, image.url, image.alt, position],
      );
    }
  });

  revalidatePath("/menus");
  revalidatePath(`/menus/${menuId}`);
  revalidatePath("/employe/menus");
  return { status: "success", message: "Menu mis à jour." };
};

export const toggleMenuActive = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  await requireRole("employee");

  const menuId = Number(formData.get("menu_id"));
  if (!Number.isInteger(menuId) || menuId <= 0) {
    return { status: "error", message: "Menu invalide." };
  }

  await query("UPDATE menus SET is_active = NOT is_active WHERE id = $1", [
    menuId,
  ]);
  revalidatePath("/menus");
  revalidatePath("/employe/menus");
  return { status: "success", message: "Visibilité du menu modifiée." };
};

// ---------- CRUD plats ----------

export const saveDish = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  await requireRole("employee");

  const dishIdRaw = formData.get("dish_id");
  const dishId = dishIdRaw ? Number(dishIdRaw) : null;

  const parsed = dishSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    allergen_ids: formData.getAll("allergen_ids"),
  });
  if (!parsed.success) {
    return { status: "error", errors: flattenIssues(parsed.error.issues) };
  }
  const d = parsed.data;

  await withTransaction(async (client) => {
    let id: number;
    if (dishId) {
      const updated = await client.query(
        "UPDATE dishes SET name = $1, description = $2 WHERE id = $3 RETURNING id",
        [d.name, d.description || null, dishId],
      );
      if (updated.rowCount === 0) throw new Error("PLAT_INTROUVABLE");
      id = dishId;
      await client.query("DELETE FROM dish_allergens WHERE dish_id = $1", [id]);
    } else {
      const inserted = await client.query(
        "INSERT INTO dishes (name, description) VALUES ($1, $2) RETURNING id",
        [d.name, d.description || null],
      );
      id = inserted.rows[0].id;
    }
    for (const allergenId of d.allergen_ids) {
      await client.query(
        "INSERT INTO dish_allergens (dish_id, allergen_id) VALUES ($1, $2)",
        [id, allergenId],
      );
    }
  });

  revalidatePath("/employe/plats");
  revalidatePath("/menus");
  return {
    status: "success",
    message: dishId ? "Plat mis à jour." : "Plat créé.",
  };
};

export const deleteDish = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  await requireRole("employee");

  const dishId = Number(formData.get("dish_id"));
  if (!Number.isInteger(dishId) || dishId <= 0) {
    return { status: "error", message: "Plat invalide." };
  }

  const used = await queryOne<{ n: number }>(
    "SELECT count(*)::int AS n FROM menu_dishes WHERE dish_id = $1",
    [dishId],
  );
  if (used && used.n > 0) {
    return {
      status: "error",
      message: `Ce plat est utilisé par ${used.n} menu(s) : retirez-le des menus avant de le supprimer.`,
    };
  }

  await query("DELETE FROM dishes WHERE id = $1", [dishId]);
  revalidatePath("/employe/plats");
  return { status: "success", message: "Plat supprimé." };
};

// ---------- Horaires ----------

export const updateOpeningHours = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  await requireRole("employee");

  const days: {
    day: number;
    is_closed: boolean;
    open_time: string;
    close_time: string;
  }[] = [];
  for (let day = 0; day <= 6; day++) {
    days.push({
      day,
      is_closed: formData.get(`closed_${day}`) === "on",
      open_time: String(formData.get(`open_${day}`) ?? ""),
      close_time: String(formData.get(`close_${day}`) ?? ""),
    });
  }

  const parsed = openingHoursSchema.safeParse({ days });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Horaires invalides.",
    };
  }

  await withTransaction(async (client) => {
    for (const entry of parsed.data.days) {
      await client.query(
        `UPDATE opening_hours
            SET is_closed = $1,
                open_time = $2,
                close_time = $3
          WHERE day_of_week = $4`,
        [
          entry.is_closed,
          entry.is_closed ? null : entry.open_time,
          entry.is_closed ? null : entry.close_time,
          entry.day,
        ],
      );
    }
  });

  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/employe/horaires");
  return { status: "success", message: "Horaires mis à jour." };
};
