import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Admin ID or Email is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
