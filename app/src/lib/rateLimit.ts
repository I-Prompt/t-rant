const WINDOW_MS = 60 * 60 * 1000;
export const MAX_REQUESTS_PER_WINDOW = 10;
// Separate, more generous allowance for the House Rules classifier demo —
// it's a cheap classify-only call (no generation), and shouldn't compete
// with someone's real rant budget.
export const DEMO_MAX_REQUESTS_PER_WINDOW = 20;

// Minimum gap between two requests from the same key, regardless of how far
// under the hourly cap they are — blunts a script blasting through an
// entire hourly allowance in under a second. No real person submits, reads
// a response, and resubmits that fast, so this never affects normal use.
const BURST_MIN_INTERVAL_MS = 1000;

// In-memory only — resets on cold start and isn't shared across serverless
// instances. Good enough for local dev / a low-traffic v1 prototype; swap
// for durable storage (Vercel KV / Upstash) before real production traffic.
const requestLog = new Map<string, number[]>();

export interface RateLimitCheck {
  limited: boolean;
  // Requests left in the current window after this check. When limited,
  // this is 0. Surfaced to the user on every response — see
  // t-rant-phase2-brief.md section 1 ("rate-limit counter").
  remaining: number;
}

// `key` lets callers keep separate buckets on the same Map — e.g. the House
// Rules classifier demo uses a `demo:${ip}` key so poking at the sandbox
// doesn't eat into someone's real rant allowance.
export function checkRateLimit(key: string, maxRequests: number = MAX_REQUESTS_PER_WINDOW): RateLimitCheck {
  const now = Date.now();
  const timestamps = (requestLog.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  const last = timestamps[timestamps.length - 1];
  if (last !== undefined && now - last < BURST_MIN_INTERVAL_MS) {
    requestLog.set(key, timestamps);
    return { limited: true, remaining: Math.max(0, maxRequests - timestamps.length) };
  }

  if (timestamps.length >= maxRequests) {
    requestLog.set(key, timestamps);
    return { limited: true, remaining: 0 };
  }

  timestamps.push(now);
  requestLog.set(key, timestamps);
  return { limited: false, remaining: maxRequests - timestamps.length };
}
