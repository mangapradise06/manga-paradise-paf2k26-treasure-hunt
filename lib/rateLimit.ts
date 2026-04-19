/**
 * Rate limit in-memory simplissime (best-effort).
 * 20 req / minute / clé par défaut. Sur Vercel, la mémoire n'est pas partagée
 * entre instances — ce limiteur reste utile localement et pour mitiger les
 * abus les plus évidents. Pour un vrai rate limit distribué, passer sur Upstash/Redis.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

export function checkRateLimit(
  key: string,
  limit = MAX_PER_WINDOW,
  windowMs = WINDOW_MS
): RateLimitResult {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetInMs: windowMs };
  }
  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: current.resetAt - now,
    };
  }
  current.count += 1;
  return {
    allowed: true,
    remaining: limit - current.count,
    resetInMs: current.resetAt - now,
  };
}

/**
 * Extrait une IP best-effort depuis les headers Next.
 */
export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
