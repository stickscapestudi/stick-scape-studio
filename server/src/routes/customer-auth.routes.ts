import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { customerAuthController } from '../controllers/customer-auth.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { requireCustomerAuth } from '../middleware/customer-auth.middleware.js';
import {
  customerRegisterSchema,
  customerLoginSchema,
  googleAuthSchema,
  updateCustomerProfileSchema,
} from '../validators/customer-auth.validator.js';

const router = Router();

// Rate limiter for customer auth endpoints (Max 30 requests per 15 minutes per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 1. PUBLIC Authentication Endpoints
router.post('/register', authLimiter, validateBody(customerRegisterSchema), customerAuthController.register);
router.post('/login', authLimiter, validateBody(customerLoginSchema), customerAuthController.login);
router.post('/google', authLimiter, validateBody(googleAuthSchema), customerAuthController.googleAuth);

// 2. PROTECTED Customer Profile & Orders Endpoints
router.get('/me', requireCustomerAuth, customerAuthController.getProfile);
router.patch('/profile', requireCustomerAuth, validateBody(updateCustomerProfileSchema), customerAuthController.updateProfile);
router.put('/profile', requireCustomerAuth, validateBody(updateCustomerProfileSchema), customerAuthController.updateProfile);
router.get('/orders', requireCustomerAuth, customerAuthController.getOrders);

export const customerAuthRoutes = router;
