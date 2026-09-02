import { Router } from 'express';
import { productController } from '../controllers/product.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { createProductSchema, updateProductSchema } from '../validators/product.validator.js';

const router = Router();

// Public endpoints
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Admin-only management endpoints (Requires AUTH + ADMIN role)
router.post('/', requireAuth, requireRole('ADMIN'), validateBody(createProductSchema), productController.createProduct);
router.patch('/:id', requireAuth, requireRole('ADMIN'), validateBody(updateProductSchema), productController.updateProduct);
router.delete('/:id', requireAuth, requireRole('ADMIN'), productController.deleteProduct);

export const productRoutes = router;
