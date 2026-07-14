"use server";

import { redirect } from "next/navigation";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { type FormState, loginSchema, registerSchema } from "@/lib/validation";

export const register = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      errors: z_flatten(parsed.error),
    };
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

  // Rôle 'client' imposé : aucun compte employé/admin ne peut être créé
  // depuis l'interface publique (exigence du sujet).
  const user = await queryOne<{ id: number }>(
    `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
     VALUES ($1, $2, $3, $4, $5, 'client') RETURNING id`,
    [email.toLowerCase(), passwordHash, first_name, last_name, phone || null],
  );
  if (!user) {
    return { status: "error", message: "Création du compte impossible." };
  }

  await createSession(user.id);
  redirect("/");
};

export const login = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { status: "error", errors: z_flatten(parsed.error) };
  }

  const user = await queryOne<{ id: number; password_hash: string }>(
    "SELECT id, password_hash FROM users WHERE email = $1 AND is_active",
    [parsed.data.email.toLowerCase()],
  );

  // Message identique que l'email existe ou non : pas d'énumération de comptes.
  const invalid = {
    status: "error" as const,
    message: "Identifiants incorrects.",
  };
  if (!user) return invalid;

  const ok = await verifyPassword(parsed.data.password, user.password_hash);
  if (!ok) return invalid;

  await createSession(user.id);
  redirect("/");
};

export const logout = async (): Promise<void> => {
  await destroySession();
  redirect("/");
};

// Zod v4 : mise à plat des erreurs par champ.
const z_flatten = (error: {
  issues: { path: PropertyKey[]; message: string }[];
}): Record<string, string[]> => {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] = [...(out[key] ?? []), issue.message];
  }
  return out;
};
