import rateLimit from 'express-rate-limit';

/**
 * Rate limiting middleware for security
 */

// Login/Register rate limiter - 5 attempts per 15 minutes
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many attempts',
            message: 'Please try again after 15 minutes',
            retryAfter: 15 * 60
        });
    }
});

// Friend request limiter - 10 requests per hour
export const friendRequestLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: 'Too many friend requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Rate limit exceeded',
            message: 'You can send up to 10 friend requests per hour',
            retryAfter: 60 * 60
        });
    }
});

// General API limiter - 100 requests per 15 minutes
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please slow down',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for health check
        return req.path === '/health';
    }
});

// Strict limiter for sensitive operations - 3 attempts per hour
export const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'Too many attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});
