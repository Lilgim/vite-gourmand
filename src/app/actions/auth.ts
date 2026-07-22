"use server";

import { redirect } from "next/navigation";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { passwordResetMail, sendMail, welcomeMail } from "@/lib/mailer";
import {
  createPasswordResetToken,
  verifyPasswordResetToken,
} from "@/lib/password-reset";
import { rateLimit } from "@/lib/rate-limit";
import {
  emailSchema,
  type FormState,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validation";

// Message unique en cas de dépassement de quota (anti brute-force / spam).
const tooManyRequests: FormState = {
  status: "error",
  message: "Trop de tentatives. Merci de réessayer dans quelques minutes.",
};

export const register = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  if (!(await rateLimit("register", 5, 60 * 60 * 1000))) return tooManyRequests;

  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    postal_code: formData.get("postal_code"),
    city: formData.get("city"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      errors: z_flatten(parsed.error),
    };
  }

  const {
    email,
    password,
    first_name,
    last_name,
    phone,
    address,
    postal_code,
    city,
  } = parsed.data;

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
    `INSERT INTO users
       (email, password_hash, first_name, last_name, phone, address, postal_code, city, role)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'client') RETURNING id`,
    [
      email.toLowerCase(),
      passwordHash,
      first_name,
      last_name,
      phone,
      address,
      postal_code,
      city,
    ],
  );
  if (!user) {
    return { status: "error", message: "Création du compte impossible." };
  }

  await sendMail(welcomeMail(email, first_name));
  await createSession(user.id);
  redirect("/");
};

export const requestPasswordReset = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  if (!(await rateLimit("password-reset", 5, 15 * 60 * 1000)))
    return tooManyRequests;

  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success)
    return { status: "error", errors: z_flatten(parsed.error) };

  const email = parsed.data.email.toLowerCase();
  const user = await queryOne<{ id: number }>(
    "SELECT id FROM users WHERE email = $1 AND is_active",
    [email],
  );
  if (user) {
    const token = createPasswordResetToken(email);
    const baseUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(
      /\/$/,
      "",
    );
    await sendMail(
      passwordResetMail(
        email,
        `${baseUrl}/reinitialiser-mot-de-passe?token=${encodeURIComponent(token)}`,
      ),
    );
  }

  return {
    status: "success",
    message: "Si ce compte existe, un lien de réinitialisation a été envoyé.",
  };
};

export const resetPassword = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success)
    return { status: "error", errors: z_flatten(parsed.error) };

  const email = verifyPasswordResetToken(parsed.data.token);
  if (!email) {
    return { status: "error", message: "Ce lien est invalide ou a expiré." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const updated = await queryOne<{ id: number }>(
    `UPDATE users SET password_hash = $1
      WHERE email = $2 AND is_active
      RETURNING id`,
    [passwordHash, email],
  );
  if (!updated) return { status: "error", message: "Compte introuvable." };

  await queryOne("DELETE FROM sessions WHERE user_id = $1 RETURNING id", [
    updated.id,
  ]);
  return {
    status: "success",
    message: "Mot de passe modifié. Vous pouvez vous connecter.",
  };
};

export const login = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  if (!(await rateLimit("login", 10, 15 * 60 * 1000))) return tooManyRequests;

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
