/**
 * @fileoverview Rate Limiting Middleware. Implements rate limiting to prevent API abuse
 * @module rate-limiter
 */

import rateLimit from "express-rate-limit";

/**
 * @description General rate limiter for all API endpoints
 */
export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: {
            message: "Too many requests from this IP, please try again later.",
            statusCode: 429,
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * @description Roadmap generation rate limiter
 */
export const roadmapRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // Limit each IP to 3 roadmap generations per 5 minutes
    message: {
        success: false,
        error: {
            message:
                "Too many roadmap generation requests, please wait before trying again.",
            statusCode: 429,
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});
