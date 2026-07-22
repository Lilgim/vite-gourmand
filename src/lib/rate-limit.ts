import "server-only";
import { headers } from "next/headers";

type Bucket = { count: number; resetAt: number };

// Limiteur en mémoire (portée : instance du serveur). Suffisant pour le
// déploiement mono-conteneur de la démo ; pour une montée en charge
// horizontale, remplacer le Map par un store partagé (Redis).
const buckets = new Map<string, Bucket>();

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
  const key = `${action}:${ip}`;
  const now = Date.now();

  // Purge opportuniste des fenêtres expirées pour borner la taille du Map.
  if (buckets.size > 5000) {
    for (const [existingKey, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(existingKey);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;

  bucket.count += 1;
  return true;
};
