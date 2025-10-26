/**
 * Rate Limiting Middleware
 * Implements rate limiting to prevent API abuse
 */

import rateLimit from 'express-rate-limit';

/**
 * General rate limiter for all API endpoints
 */
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
      statusCode: 429
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for AI-powered endpoints
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per minute for AI endpoints
  message: {
    success: false,
    error: {
      message: 'Too many AI requests, please wait before trying again.',
      statusCode: 429
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Roadmap generation rate limiter
 */
export const roadmapRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Limit each IP to 3 roadmap generations per 5 minutes
  message: {
    success: false,
    error: {
      message: 'Too many roadmap generation requests, please wait before trying again.',
      statusCode: 429
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});
