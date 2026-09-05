import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/review.service.js';

export const reviewController = {
  async getReviews(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviews = await reviewService.getReviews();
      res.json({
        success: true,
        data: reviews,
      });
    } catch (err) {
      next(err);
    }
  },

  async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await reviewService.createReview(req.body);
      res.status(201).json({
        success: true,
        message: 'Thank you! Your review has been submitted successfully.',
        data: review,
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await reviewService.deleteReview(id);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  },
};
