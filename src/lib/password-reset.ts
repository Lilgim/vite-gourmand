import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

const sign = (payload: string): string =>
  createHmac("sha256", env.AUTH_SECRET).update(payload).digest("base64url");

export const createPasswordResetToken = (email: string): string => {
  const encodedEmail = Buffer.from(email.toLowerCase()).toString("base64url");
  const expiresAt = String(Date.now() + 30 * 60 * 1000);
  const payload = `${encodedEmail}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
};

export const verifyPasswordResetToken = (token: string): string | null => {
  const [encodedEmail, expiresAt, signature] = token.split(".");
  if (!encodedEmail || !expiresAt || !signature) return null;
  if (!/^\d+$/.test(expiresAt) || Number(expiresAt) < Date.now()) return null;

  const payload = `${encodedEmail}.${expiresAt}`;
  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return null;
  }

  try {
    const email = Buffer.from(encodedEmail, "base64url").toString("utf8");
    return email.includes("@") ? email : null;
  } catch {
    return null;
  }
};
