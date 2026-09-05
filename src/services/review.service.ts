import { api } from './api';
import type { CustomerReview, CreateReviewData } from '../types';

export const reviewService = {
  /**
   * Fetches all customer reviews from the backend.
   */
  async getReviews(): Promise<CustomerReview[]> {
    try {
      const res = await api.get<{ success: boolean; data: CustomerReview[] }>('/reviews');
      if (res && res.success && Array.isArray(res.data)) {
        return res.data;
      }
      if (Array.isArray(res)) {
        return res;
      }
      return [];
    } catch (err) {
      console.warn('Falling back to local cache for reviews:', err);
      return [];
    }
  },

  /**
   * Submits a new customer review.
   */
  async submitReview(data: CreateReviewData): Promise<CustomerReview> {
    const res = await api.post<{ success: boolean; data: CustomerReview }>('/reviews', data);
    if (res && res.success && res.data) {
      return res.data;
    }
    return res as any;
  },

  /**
   * Deletes a customer review (Admin only).
   */
  async deleteReview(id: string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete<{ success: boolean; message: string }>(`/reviews/${id}`, {
      authenticated: true,
      adminAuth: true,
    });
    return res;
  },
};
