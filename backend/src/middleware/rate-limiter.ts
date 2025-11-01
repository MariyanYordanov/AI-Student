/**
 * Simple in-memory rate limiter for email endpoints
 * Tracks requests per email address
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 3; // Max 3 requests per 15 minutes

export function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry) {
    // First request
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (now > entry.resetTime) {
    // Window has expired, reset
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  // Still in window
  if (entry.count < MAX_REQUESTS) {
    entry.count++;
    return true;
  }

  return false;
}

export function getRateLimitInfo(identifier: string) {
  const entry = rateLimitStore.get(identifier);
  if (!entry) {
    return {
      remaining: MAX_REQUESTS,
      resetTime: null,
    };
  }

  const now = Date.now();
  if (now > entry.resetTime) {
    return {
      remaining: MAX_REQUESTS,
      resetTime: null,
    };
  }

  return {
    remaining: Math.max(0, MAX_REQUESTS - entry.count),
    resetTime: new Date(entry.resetTime),
  };
}
