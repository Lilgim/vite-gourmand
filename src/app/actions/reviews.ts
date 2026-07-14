"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { type FormState, reviewSchema } from "@/lib/validation";

export const submitReview = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  const user = await requireUser();

  const orderId = Number(formData.get("order_id"));
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return { status: "error", message: "Commande invalide." };
  }

  const parsed = reviewSchema.safeParse({
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] = [...(errors[key] ?? []), issue.message];
    }
    return { status: "error", errors };
  }

  // Règle du sujet : un avis ne peut être déposé que par le client de la
  // commande, une fois celle-ci terminée, et une seule fois (UNIQUE en base).
  const order = await queryOne<{ id: number; current_status: string }>(
    "SELECT id, current_status FROM orders WHERE id = $1 AND user_id = $2",
    [orderId, user.id],
  );
  if (!order) return { status: "error", message: "Commande introuvable." };
  if (order.current_status !== "completed") {
    return {
      status: "error",
      message: "Vous pourrez déposer un avis une fois la commande terminée.",
    };
  }

  const existing = await queryOne<{ id: number }>(
    "SELECT id FROM reviews WHERE order_id = $1",
    [orderId],
  );
  if (existing) {
    return {
      status: "error",
      message: "Un avis a déjà été déposé pour cette commande.",
    };
  }

  await query(
    `INSERT INTO reviews (order_id, user_id, rating, comment, status)
     VALUES ($1, $2, $3, $4, 'pending')`,
    [orderId, user.id, parsed.data.rating, parsed.data.comment],
  );

  revalidatePath(`/compte/commandes/${orderId}`);
  return {
    status: "success",
    message:
      "Merci pour votre avis ! Il sera publié après validation par notre équipe.",
  };
};
