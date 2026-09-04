import { z } from 'zod';

export const createPaymentOrderSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
});

export const verifyPaymentSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
  paymentOrderId: z.string().min(1, 'Payment order ID is required'),
  paymentId: z.string().min(1, 'Payment ID is required'),
  signature: z.string().min(1, 'Signature is required'),
});

export const verifyUpiPaymentSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
  utrNumber: z.string().optional(),
  upiId: z.string().optional(),
});

export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type VerifyUpiPaymentInput = z.infer<typeof verifyUpiPaymentSchema>;
