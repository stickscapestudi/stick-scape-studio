import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Attempt loading .env from current directory, server directory, and project root
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const isProduction = process.env.NODE_ENV === 'production';

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL environment variable is required'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().min(8).default('stick_scape_studio_jwt_secret_key_super_secret_2026'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ADMIN_EMAIL: z.string().email().default('admin@stickscape.com'),
  ADMIN_PASSWORD: z.string().min(6).default('AdminPass123!'),
  PAYMENT_PROVIDER: z.enum(['development', 'razorpay']).default('development'),
  RAZORPAY_KEY_ID: z.string().optional().default(''),
  RAZORPAY_KEY_SECRET: z.string().optional().default(''),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(''),
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
