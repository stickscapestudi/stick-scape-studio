import { z } from 'zod';

export const orderItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  productName: z.string().optional(),
  unitPrice: z.number().optional(),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).optional(),
  uploadedPhotos: z.array(z.string()).optional(),
  customCaption: z.string().optional(),
  customCaptions: z.array(z.string()).optional(),
  songUrl: z.string().optional(),
  songUrls: z.array(z.string()).optional(),
  description: z.string().optional(),
  customDescription: z.string().optional(),
});

export const customerDetailsSchema = z.object({
  customerName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  mobile: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  apartment: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  orderNotes: z.string().optional(),
});

export const createOrderSchema = z.object({
  customer: customerDetailsSchema.optional(),
  customerName: z.string().optional(),
  email: z.string().optional(),
  mobile: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  apartment: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  orderNotes: z.string().optional(),
  items: z.array(orderItemInputSchema).min(1, 'Order must contain at least one item'),
  paymentMethod: z.string().default('COD'),
  subtotal: z.number().optional(),
  discount: z.number().optional(),
  discountCode: z.string().optional(),
  shippingCost: z.number().optional(),
  shippingMethod: z.string().optional(),
  tax: z.number().optional(),
  total: z.number().optional(),
  estimatedDelivery: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], {
    errorMap: () => ({ message: 'Status must be one of: Pending, Processing, Shipped, Delivered, Cancelled' }),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
