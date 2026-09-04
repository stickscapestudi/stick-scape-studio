export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string) || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

export const ADMIN_MOBILE: string =
  (import.meta.env.VITE_ADMIN_MOBILE as string) || '8754132491';
