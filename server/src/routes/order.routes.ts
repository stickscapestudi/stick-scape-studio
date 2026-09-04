import { Router } from 'express';
import { orderController } from '../controllers/order.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { checkoutLimiter, trackingLimiter } from '../middleware/rate-limit.middleware.js';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.validator.js';

import { optionalCustomerAuth } from '../middleware/customer-auth.middleware.js';

const router = Router();

// 1. PUBLIC Customer Endpoints (Rate Limited, Optional Customer Auth)
router.post('/', checkoutLimiter, optionalCustomerAuth, validateBody(createOrderSchema), orderController.createOrder);

// PUBLIC Customer Order Tracking (Rate Limited, Requires orderNumber param AND ?mobile=... query)
router.get('/track/:orderNumber', trackingLimiter, orderController.trackOrder);

// 2. PROTECTED Admin Order Management Endpoints (Requires AUTH + ADMIN Role)
router.use(requireAuth, requireRole('ADMIN'));

router.get('/', orderController.getOrders);
// IMPORTANT ROUTE ORDER: /number/:orderNumber registered before /:id
router.get('/number/:orderNumber', orderController.getOrderByNumber);
router.get('/:id', orderController.getOrderById);

router.patch('/:id/status', validateBody(updateOrderStatusSchema), orderController.updateOrderStatus);

export const orderRoutes = router;
