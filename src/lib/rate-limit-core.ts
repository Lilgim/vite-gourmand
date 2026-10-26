type Bucket = { count: number; resetAt: number };

export type RateLimitEnv = Readonly<Record<string, string | undefined>>;

// Facteur appliqué aux quotas uniquement quand E2E_TEST_MODE=1 : les
// campagnes Playwright enchaînent des dizaines de connexions depuis la même
// IP. Le limiteur reste actif (quotas relevés, jamais désactivés) et la
// production, qui ne définit pas ce drapeau, garde les quotas d'origine.
export const E2E_LIMIT_FACTOR = 100;

export const resolveLimit = (limit: number, env: RateLimitEnv): number =>
  env.E2E_TEST_MODE === "1" ? limit * E2E_LIMIT_FACTOR : limit;

// Fenêtre fixe par clé. Renvoie true si l'action est autorisée.
export const createLimiter = (maxBuckets = 5000) => {
  const buckets = new Map<string, Bucket>();

  return (
    key: string,
    limit: number,
    windowMs: number,
    now: number,
  ): boolean => {
    // Purge opportuniste des fenêtres expirées pour borner la taille du Map.
    if (buckets.size > maxBuckets) {
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
};
