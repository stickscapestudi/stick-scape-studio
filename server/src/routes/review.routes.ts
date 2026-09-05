import { Router } from 'express';
import { reviewController } from '../controllers/review.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { createReviewSchema } from '../validators/review.validator.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Public: Get all reviews
router.get('/', reviewController.getReviews);

// Public: Submit a review
router.post('/', validateBody(createReviewSchema), reviewController.createReview);

// Admin: Delete a review
router.delete('/:id', requireAuth, requireRole('ADMIN'), reviewController.deleteReview);

export const reviewRoutes = router;
