import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const envSchema = z
  .object({
    PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL environment variable is required'),
    FRONTEND_URL: z
      .string()
      .url('FRONTEND_URL must be a valid URL (e.g. https://stickscapes.com)')
      .default('http://localhost:5173'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    JWT_SECRET: z
      .string()
      .min(isProduction ? 32 : 8, isProduction ? 'JWT_SECRET must be at least 32 characters in production' : 'JWT_SECRET must be at least 8 characters long')
      .default(isProduction ? (undefined as any) : 'stick_scape_studio_jwt_secret_key_super_secret_2026'),
    JWT_EXPIRES_IN: z.string().default('1h'),
    ADMIN_EMAIL: z.string().email().default('admin@stickscape.com'),
    ADMIN_PASSWORD: z.string().min(6).default('AdminPass123!'),
    PAYMENT_PROVIDER: z.enum(['development', 'razorpay']).default('development'),
    RAZORPAY_KEY_ID: z.string().min(1, 'RAZORPAY_KEY_ID is required'),
    RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required'),
    RAZORPAY_WEBHOOK_SECRET: z.string().min(1, 'RAZORPAY_WEBHOOK_SECRET is required'),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production') {
      if (!data.JWT_SECRET || data.JWT_SECRET.includes('super_secret_2026')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A strong 32+ character JWT_SECRET must be provided in production',
          path: ['JWT_SECRET'],
        });
      }
      if (!process.env.RAZORPAY_KEY_ID) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'RAZORPAY_KEY_ID environment variable is required in production',
          path: ['RAZORPAY_KEY_ID'],
        });
      }
      if (!process.env.RAZORPAY_KEY_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'RAZORPAY_KEY_SECRET environment variable is required in production',
          path: ['RAZORPAY_KEY_SECRET'],
        });
      }
      if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'RAZORPAY_WEBHOOK_SECRET environment variable is required in production',
          path: ['RAZORPAY_WEBHOOK_SECRET'],
        });
      }
      if (!process.env.FRONTEND_URL || process.env.FRONTEND_URL.includes('localhost')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Production FRONTEND_URL must be explicitly configured to your live production domain',
          path: ['FRONTEND_URL'],
        });
      }
    }
  });

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Environment Configuration Validation Failed:');
  const formatted = _env.error.format();
  Object.keys(formatted).forEach((key) => {
    if (key !== '_errors') {
      const fieldError = (formatted as any)[key]?._errors?.join(', ');
      if (fieldError) {
        console.error(`   - ${key}: ${fieldError}`);
      }
    }
  });
  throw new Error('Invalid environment configuration for ' + (process.env.NODE_ENV || 'development') + ' mode.');
}

export const env = _env.data;
