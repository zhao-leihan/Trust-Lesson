/**
 * Sliding Window In-Memory Rate Limiter
 * Protects login and authentication endpoints from brute force and credential stuffing.
 */

const attemptsMap = new Map();

// Periodic cleanup of expired entries (every 10 minutes)
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of attemptsMap.entries()) {
    const valid = timestamps.filter((t) => now - t < 30 * 60 * 1000);
    if (valid.length === 0) {
      attemptsMap.delete(key);
    } else {
      attemptsMap.set(key, valid);
    }
  }
}, 10 * 60 * 1000);

if (cleanupTimer && typeof cleanupTimer.unref === "function") {
  cleanupTimer.unref();
}

/**
 * Check if an action is allowed under the rate limit
 * @param {string} key - Identifier (e.g. `ip:127.0.0.1` or `email:user@example.com`)
 * @param {number} maxAttempts - Maximum allowed failed attempts (default 5)
 * @param {number} windowMs - Sliding window in milliseconds (default 15 minutes)
 * @returns {{ allowed: boolean, remaining: number, retryAfterSeconds: number }}
 */
export function checkRateLimit(key, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const timestamps = attemptsMap.get(key) || [];
  const recent = timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= maxAttempts) {
    const oldest = recent[0];
    const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
    };
  }

  return {
    allowed: true,
    remaining: maxAttempts - recent.length,
    retryAfterSeconds: 0,
  };
}

/**
 * Record a failed attempt
 * @param {string} key - Identifier
 * @param {number} windowMs - Window duration
 */
export function recordFailedAttempt(key, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const timestamps = attemptsMap.get(key) || [];
  const recent = timestamps.filter((t) => now - t < windowMs);
  recent.push(now);
  attemptsMap.set(key, recent);
}

/**
 * Reset rate limit counter on successful action
 * @param {string} key - Identifier
 */
export function resetRateLimit(key) {
  attemptsMap.delete(key);
}
