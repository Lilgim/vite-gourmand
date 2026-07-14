import "server-only";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { query, queryOne } from "@/lib/db";

const SESSION_COOKIE = "vg_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

export type Role = "client" | "employee" | "admin";

export type SessionUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  role: Role;
};

// ---------- Mots de passe ----------

export const hashPassword = (plain: string): Promise<string> =>
  bcrypt.hash(plain, 12);

export const verifyPassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);

// ---------- Sessions (stockées en base : révocation immédiate possible) ----------

export const createSession = async (userId: number): Promise<void> => {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const row = await queryOne<{ id: string }>(
    "INSERT INTO sessions (user_id, expires_at) VALUES ($1, $2) RETURNING id",
    [userId, expiresAt],
  );
  if (!row) throw new Error("Création de session impossible");

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, row.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
};

export const destroySession = async (): Promise<void> => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await query("DELETE FROM sessions WHERE id = $1", [sessionId]);
  }
  cookieStore.delete(SESSION_COOKIE);
};

// ---------- DAL : vérification côté serveur, mémoïsée par requête ----------

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  // Un UUID invalide ferait échouer le cast : on filtre en amont.
  if (!/^[0-9a-f-]{36}$/i.test(sessionId)) return null;

  return queryOne<SessionUser>(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.phone,
            u.address, u.postal_code, u.city, u.role
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.id = $1 AND s.expires_at > now() AND u.is_active`,
    [sessionId],
  );
});

export const requireUser = async (): Promise<SessionUser> => {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  return user;
};

// L'admin possède toutes les capacités employé (exigence du sujet).
export const requireRole = async (role: Role): Promise<SessionUser> => {
  const user = await requireUser();
  const allowed =
    user.role === role || (role === "employee" && user.role === "admin");
  if (!allowed) redirect("/");
  return user;
};
