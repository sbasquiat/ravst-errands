/**
 * Simple in-memory rate limiter using sliding window.
 * Works per-instance — suitable for single-server or serverless with
 * short-lived invocations. For multi-instance, swap for Redis/Upstash.
 */

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of store) {
    if (now - entry.lastRefill > windowMs * 2) {
      store.delete(key);
    }
  }
}

interface RateLimitConfig {
  /** Max number of requests in the window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetMs: number;
}

/**
 * Check if a request should be rate-limited.
 * Uses token bucket algorithm with automatic refill.
 */
export function rateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const { maxRequests, windowMs } = config;
  const now = Date.now();

  cleanup(windowMs);

  let entry = store.get(key);

  if (!entry) {
    entry = { tokens: maxRequests - 1, lastRefill: now };
    store.set(key, entry);
    return { success: true, remaining: entry.tokens, resetMs: windowMs };
  }

  // Refill tokens based on elapsed time
  const elapsed = now - entry.lastRefill;
  const refillRate = maxRequests / windowMs;
  const refillTokens = elapsed * refillRate;
  entry.tokens = Math.min(maxRequests, entry.tokens + refillTokens);
  entry.lastRefill = now;

  if (entry.tokens < 1) {
    const resetMs = Math.ceil((1 - entry.tokens) / refillRate);
    return { success: false, remaining: 0, resetMs };
  }

  entry.tokens -= 1;
  return {
    success: true,
    remaining: Math.floor(entry.tokens),
    resetMs: windowMs,
  };
}

/**
 * Extract a rate-limit key from a request.
 * Uses X-Forwarded-For → X-Real-IP → "anonymous" fallback.
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "anonymous";
}

/** Pre-configured rate limiters for common use cases */
export const rateLimits = {
  /** Public API: 30 requests per minute */
  api: { maxRequests: 30, windowMs: 60_000 },
  /** Geocoding: 10 requests per minute (respects Nominatim limits) */
  geocode: { maxRequests: 10, windowMs: 60_000 },
  /** Contact form: 5 per 15 minutes */
  contact: { maxRequests: 5, windowMs: 15 * 60_000 },
  /** Auth actions: 10 per 15 minutes */
  auth: { maxRequests: 10, windowMs: 15 * 60_000 },
  /** Payment creation: 10 per minute */
  payment: { maxRequests: 10, windowMs: 60_000 },
} as const;

/**
 * Returns a 429 Response with Retry-After header.
 */
export function rateLimitResponse(resetMs: number): Response {
  return new Response(
    JSON.stringify({ error: "Too many requests. Please try again later." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.ceil(resetMs / 1000)),
      },
    }
  );
}
