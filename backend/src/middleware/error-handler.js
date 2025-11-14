/**
 * @fileoverview Gracefully handles errors
 */

/**
 * @description Global error handler middleware
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */

export const errorHandler = (err, res) => {
    console.error("Error:", err);

    // Default error response
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let details = null;

    // Handle specific error types
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation Error";
        details = err.details;
    } else if (err.name === "UnauthorizedError") {
        statusCode = 401;
        message = "Unauthorized";
    } else if (err.name === "ForbiddenError") {
        statusCode = 403;
        message = "Forbidden";
    } else if (err.name === "NotFoundError") {
        statusCode = 404;
        message = "Not Found";
    } else if (err.name === "RateLimitError") {
        statusCode = 429;
        message = "Too Many Requests";
    }

    // Don't expose internal errors in production
    if (process.env.NODE_ENV === "production" && statusCode === 500) {
        message = "Internal Server Error";
        details = null;
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            statusCode,
            ...(details && { details }),
            ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
        },
        timestamp: new Date().toISOString(),
    });
};

/**
 * @description Wraps async route handlers to catch errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function
 */

export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
