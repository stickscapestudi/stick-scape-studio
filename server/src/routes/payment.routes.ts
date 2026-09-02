import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { createPaymentOrderSchema, verifyPaymentSchema } from '../validators/payment.validator.js';

const router = Router();

// PUBLIC Payment Endpoints
router.post('/create-order', validateBody(createPaymentOrderSchema), paymentController.createPaymentOrder);
router.post('/verify', validateBody(verifyPaymentSchema), paymentController.verifyPayment);
router.post('/webhook', paymentController.handleWebhook);

export const paymentRoutes = router;
