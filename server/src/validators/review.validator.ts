import { z } from 'zod';

export const createReviewSchema = z.object({
  customerName: z.string().min(1, 'Customer Name is required'),
  email: z.string().min(1, 'Email / Mail ID is required'),
  mobile: z.string().min(1, 'Mobile Number is required'),
  productName: z.string().min(1, 'Product Name is required'),
  rating: z.coerce.number().min(1).max(5).default(5),
  feedback: z.string().min(1, 'Feedback is required'),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
