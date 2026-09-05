import { Router } from 'express';
import { productRoutes } from './product.routes.js';
import { orderRoutes } from './order.routes.js';
import { authRoutes } from './auth.routes.js';
import { adminRoutes } from './admin.routes.js';
import { paymentRoutes } from './payment.routes.js';
import { customerAuthRoutes } from './customer-auth.routes.js';
import { reviewRoutes } from './review.routes.js';
import { prisma } from '../config/prisma.js';

const router = Router();

// Health Check Endpoint with Live PostgreSQL Connectivity test
router.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      message: 'Stick Scape API is running 🚀',
      database: 'connected',
    });
  } catch (err: any) {
    res.status(503).json({
      success: false,
      message: 'Stick Scape API running, database unavailable',
      database: 'disconnected',
      error: err.message,
    });
  }
});

router.use('/auth', authRoutes);
router.use('/customer/auth', customerAuthRoutes);
router.use('/admin', adminRoutes);
router.use('/payments', paymentRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);

export const apiRoutes = router;

