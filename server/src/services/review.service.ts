import { prisma } from '../config/prisma.js';
import { CreateReviewInput } from '../validators/review.validator.js';
import { AppError } from '../middleware/error.middleware.js';

export const reviewService = {
  /**
   * Retrieves all reviews sorted newest-first.
   */
  async getReviews() {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return reviews;
  },

  /**
   * Submits a new customer review.
   */
  async createReview(data: CreateReviewInput) {
    const review = await prisma.review.create({
      data: {
        customerName: data.customerName.trim(),
        email: data.email.trim(),
        mobile: data.mobile.trim(),
        productName: data.productName.trim(),
        rating: Number(data.rating) || 5,
        feedback: data.feedback.trim(),
        isVerified: true,
      },
    });
    return review;
  },

  /**
   * Deletes a review (Admin).
   */
  async deleteReview(id: string) {
    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Review not found', 404);
    }
    await prisma.review.delete({ where: { id } });
    return { message: 'Review successfully deleted' };
  },
};
