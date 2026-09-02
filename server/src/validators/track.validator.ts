import { z } from 'zod';

export const trackOrderSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
  mobile: z.string().min(5, 'Valid mobile number is required'),
});

export type TrackOrderQuery = z.infer<typeof trackOrderSchema>;
