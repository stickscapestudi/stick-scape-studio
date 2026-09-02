import { z } from 'zod';

export const orderItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const customerDetailsSchema = z.object({
  customerName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email('Valid email address is required'),
  mobile: z.string().min(5, 'Mobile phone number is required'),
  phone: z.string().optional(),
  address: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
});

export const createOrderSchema = z.object({
  customer: customerDetailsSchema.optional(),
  customerName: z.string().optional(),
  email: z.string().email().optional(),
  mobile: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  items: z.array(orderItemInputSchema).min(1, 'Order must contain at least one item'),
  paymentMethod: z.string().default('COD'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], {
    errorMap: () => ({ message: 'Status must be one of: Pending, Processing, Shipped, Delivered, Cancelled' }),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
