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
  PORT: z
    .union([z.string(), z.number()])
    .optional()
    .default(5000)
    .transform((val) => (typeof val === 'number' ? val : parseInt(val, 10) || 5000)),
  DATABASE_URL: z
    .string()
    .optional()
    .default(
      process.env.DATABASE_URL ||
        'postgresql://postgres:postgres@localhost:5432/stickscapestudio?schema=public'
    ),
  FRONTEND_URL: z.string().optional().default('http://localhost:5173'),
  NODE_ENV: z
    .string()
    .optional()
    .default('development')
    .transform((val) => (val === 'production' || val === 'test' ? val : 'development')),
  JWT_SECRET: z
    .string()
    .optional()
    .default('stick_scape_studio_jwt_secret_key_super_secret_2026')
    .transform((val) => (val && val.length >= 8 ? val : 'stick_scape_studio_jwt_secret_key_super_secret_2026')),
  JWT_EXPIRES_IN: z.string().optional().default('7d'),
  ADMIN_EMAIL: z.string().optional().default('admin@stickscape.com'),
  ADMIN_PASSWORD: z.string().optional().default('Anish*2007'),
  PAYMENT_PROVIDER: z
    .string()
    .optional()
    .default('development')
    .transform((val) => (val === 'razorpay' ? 'razorpay' : 'development')),
  RAZORPAY_KEY_ID: z.string().optional().default(''),
  RAZORPAY_KEY_SECRET: z.string().optional().default(''),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(''),
  TELEGRAM_BOT_TOKEN: z.string().optional().default(''),
  TELEGRAM_CHAT_ID: z.string().optional().default(''),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.warn('⚠️ Environment validation notice:', _env.error.format());
}

export const env = _env.success
  ? _env.data
  : {
      PORT: parseInt(process.env.PORT || '5000', 10) || 5000,
      DATABASE_URL:
        process.env.DATABASE_URL ||
        'postgresql://postgres:postgres@localhost:5432/stickscapestudio?schema=public',
      FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
      NODE_ENV: ((process.env.NODE_ENV === 'production' ? 'production' : 'development') as 'development' | 'production' | 'test'),
      JWT_SECRET: process.env.JWT_SECRET || 'stick_scape_studio_jwt_secret_key_super_secret_2026',
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@stickscape.com',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Anish*2007',
      PAYMENT_PROVIDER: ((process.env.PAYMENT_PROVIDER === 'razorpay' ? 'razorpay' : 'development') as 'development' | 'razorpay'),
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
      RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
      TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || '',
    };


