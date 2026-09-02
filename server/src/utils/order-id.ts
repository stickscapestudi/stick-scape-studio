import crypto from 'crypto';

/**
 * Generates a readable unique order number format: SSC-YYYYMMDD-XXXXXX
 * e.g., SSC-20260902-AB12CD
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const randomBytes = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SSC-${dateStr}-${randomBytes}`;
}
