"use server";

import { revalidatePath } from "next/cache";
import { hashPassword, requireRole } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { employeeAccountMail, sendMail } from "@/lib/mailer";
import { employeeAccountSchema, type FormState } from "@/lib/validation";

// La création de comptes employés est réservée à l'administrateur :
// aucun compte employé/admin ne peut naître de l'interface publique.
export const createEmployee = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  await requireRole("admin");

  const parsed = employeeAccountSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] = [...(errors[key] ?? []), issue.message];
    }
    return { status: "error", errors };
  }

  const { email, password, first_name, last_name, phone } = parsed.data;
  const existing = await queryOne<{ id: number }>(
    "SELECT id FROM users WHERE email = $1",
    [email.toLowerCase()],
  );
  if (existing) {
    return {
      status: "error",
      message: "Un compte existe déjà avec cette adresse email.",
    };
  }

  const passwordHash = await hashPassword(password);
  await query(
    `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
     VALUES ($1, $2, $3, $4, $5, 'employee')`,
    [email.toLowerCase(), passwordHash, first_name, last_name, phone || null],
  );

  await sendMail(employeeAccountMail(email, first_name));

  revalidatePath("/admin/employes");
  return { status: "success", message: "Compte employé créé." };
};

export const toggleEmployeeActive = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  await requireRole("admin");

  const employeeId = Number(formData.get("employee_id"));
  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    return { status: "error", message: "Compte invalide." };
  }

  // Seuls les comptes employés sont concernés : impossible de désactiver
  // un client ou un administrateur par cette action.
  const updated = await query<{ is_active: boolean }>(
    `UPDATE users SET is_active = NOT is_active
      WHERE id = $1 AND role = 'employee'
      RETURNING is_active`,
    [employeeId],
  );
  if (updated.length === 0) {
    return { status: "error", message: "Compte employé introuvable." };
  }

  // Désactivation = sessions révoquées immédiatement.
  if (!updated[0].is_active) {
    await query("DELETE FROM sessions WHERE user_id = $1", [employeeId]);
  }

  revalidatePath("/admin/employes");
  return {
    status: "success",
    message: updated[0].is_active ? "Compte réactivé." : "Compte désactivé.",
  };
};
