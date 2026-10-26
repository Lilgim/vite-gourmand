import "server-only";
import { headers } from "next/headers";
import { createLimiter, resolveLimit } from "@/lib/rate-limit-core";

// Limiteur en mémoire (portée : instance du serveur). Suffisant pour le
// déploiement mono-conteneur de la démo ; pour une montée en charge
// horizontale, remplacer le Map par un store partagé (Redis).
const limiter = createLimiter();

const clientIp = async (): Promise<string> => {
  const store = await headers();
  const forwarded = store.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
};

// Renvoie true si l'action est autorisée, false si le quota est dépassé.
export const rateLimit = async (
  action: string,
  limit: number,
  windowMs: number,
): Promise<boolean> => {
  const ip = await clientIp();
  return limiter(
    `${action}:${ip}`,
    resolveLimit(limit, process.env),
    windowMs,
    Date.now(),
  );
};
