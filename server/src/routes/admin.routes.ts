import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Protect all admin endpoints with requireAuth + requireRole('ADMIN')
router.use(requireAuth, requireRole('ADMIN'));

router.get('/dashboard/stats', adminController.getDashboardStats);

export const adminRoutes = router;
