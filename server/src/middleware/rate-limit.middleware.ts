import rateLimit from 'express-rate-limit';

/**
 * Public Customer Checkout Rate Limiter (Max 30 order creations per 15 mins per IP).
 * Prevents automated order spamming while allowing reasonable customer usage.
 */
export const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many order requests from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Public Customer Tracking Rate Limiter (Max 60 order lookups per 15 mins per IP).
 */
export const trackingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: {
    success: false,
    message: 'Too many order tracking requests. Please try again in a few minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
