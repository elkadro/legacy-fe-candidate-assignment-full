import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// In production, consider using Redis for distributed systems
const rateLimitStore = new Map<string, RateLimitEntry>();

// Export store for testing purposes
export const getRateLimitStore = () => rateLimitStore;
export const clearRateLimitStore = () => rateLimitStore.clear();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limiting middleware
 * Limits requests to 1 per 5 seconds per IP address
 */
export const rateLimit = (windowMs: number = 5000, maxRequests: number = 1) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Get client IP address
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      'unknown';

    const now = Date.now();
    const entry = rateLimitStore.get(clientIp);

    if (!entry || entry.resetTime < now) {
      // First request or window expired, create new entry
      rateLimitStore.set(clientIp, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (entry.count >= maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${retryAfter} second(s).`,
        retryAfter,
      });
    }

    // Increment count
    entry.count += 1;
    rateLimitStore.set(clientIp, entry);
    next();
  };
};

/**
 * Rate limiter for auth endpoints: 1 request per 5 seconds
 */
export const authRateLimit = rateLimit(5000, 1);

