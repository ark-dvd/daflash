// lib/rate-limit.ts

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (resets on server restart, which is fine for basic protection)
const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  windowMs?: number;   // Time window in milliseconds
  maxRequests?: number; // Max requests per window
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number; // seconds until reset
}

/**
 * Simple in-memory rate limiter
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param options - Rate limit configuration
 * @returns Result indicating if request is allowed
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const { windowMs = 60000, maxRequests = 10 } = options;
  const now = Date.now();

  // Clean up expired entries periodically (every 100th call)
  if (Math.random() < 0.01) {
    cleanupExpiredEntries(now);
  }

  const entry = rateLimitStore.get(identifier);

  // No existing entry or expired
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });

    return {
      success: true,
      remaining: maxRequests - 1,
      resetIn: Math.ceil(windowMs / 1000),
    };
  }

  // Entry exists and is valid
  const remaining = maxRequests - entry.count - 1;
  const resetIn = Math.ceil((entry.resetTime - now) / 1000);

  if (entry.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn,
    };
  }

  // Increment count
  entry.count++;

  return {
    success: true,
    remaining: Math.max(0, remaining),
    resetIn,
  };
}

/**
 * Clean up expired entries to prevent memory leaks
 */
function cleanupExpiredEntries(now: number): void {
  const keysToDelete: string[] = [];

  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetTime) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key) => {
    rateLimitStore.delete(key);
  });
}

/**
 * Get client IP from request headers
 * Works with Netlify, Vercel, and other proxies
 */
export function getClientIP(request: Request): string {
  // Check various headers that proxies set
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Netlify-specific header
  const netlifyIP = request.headers.get('x-nf-client-connection-ip');
  if (netlifyIP) {
    return netlifyIP;
  }

  // Fallback
  return 'unknown';
}
