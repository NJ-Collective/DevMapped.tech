# rateLimiter.js Rewrite Plan

## Purpose

    - Prevent the user from making too many requests at one time so we arent losing money or running into errors.

## Dependencies

    - rateLimit from express

## Functions / Hooks Needed

    - rateLimiter() -> Default rate limiter for all API endpoints
    - roadmapRateLimiter() -> Rate limiter for generating new roadmaps

## Tasks:

    - [ ] Write rateLimiter
    - [ ] Write tests for rateLimiter
    - [ ] Write roadmapRateLimiter
    - [ ] Write tests for roadmapRateLimiter
