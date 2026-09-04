import rateLimit from 'express-rate-limit'

/**
 * Lightweight in-process login rate limiter.
 * Limits login attempts to prevent brute-force attacks.
 *
 * Uses in-memory store — no Redis required.
 * Acceptable for hackathon / single-instance deployments.
 * For production multi-instance, use a shared store (Redis, Memcached).
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,                   // max 15 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts. Please try again later.',
    },
  },
})

/**
 * General API rate limiter — protect against abuse on all endpoints.
 * More generous limits than login-specific limiter.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                  // 200 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
    },
  },
})
