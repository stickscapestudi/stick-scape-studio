import { API_BASE_URL } from '../config/env';

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  success?: boolean;
}

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export interface ApiFetchOptions extends RequestInit {
  authenticated?: boolean;
  adminAuth?: boolean;
  customerAuth?: boolean;
}

/**
 * Reusable HTTP fetch wrapper for API communication.
 * Automatically injects Bearer token if available and dispatches 401 events.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  // Normalize endpoint URL
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  // Inject Bearer token
  try {
    const adminToken = localStorage.getItem('stick_scape_admin_token');
    const customerToken = localStorage.getItem('stick_scape_customer_token');
    
    // Explicit admin endpoint or options.adminAuth -> prioritize adminToken
    const isAdminEndpoint = 
      options.adminAuth || 
      cleanEndpoint.startsWith('/admin') || 
      (cleanEndpoint.startsWith('/orders') && !cleanEndpoint.startsWith('/orders/track') && (options.method === 'GET' || options.method === 'PATCH'));

    if (isAdminEndpoint && adminToken) {
      defaultHeaders['Authorization'] = `Bearer ${adminToken}`;
    } else if ((options.customerAuth || cleanEndpoint.startsWith('/auth/customer') || cleanEndpoint.startsWith('/users')) && customerToken) {
      defaultHeaders['Authorization'] = `Bearer ${customerToken}`;
    } else if (adminToken && !customerToken) {
      defaultHeaders['Authorization'] = `Bearer ${adminToken}`;
    } else if (customerToken) {
      defaultHeaders['Authorization'] = `Bearer ${customerToken}`;
    } else if (adminToken) {
      defaultHeaders['Authorization'] = `Bearer ${adminToken}`;
    }
  } catch {
    // Storage access fallback
  }

  // Merge headers
  const headers = {
    ...defaultHeaders,
    ...(options.headers as Record<string, string> || {}),
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (err: any) {
    throw new ApiError(
      err.message || 'Network error: Unable to connect to backend server.',
      0
    );
  }

  let responseData: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    try {
      responseData = await response.text();
    } catch {
      responseData = null;
    }
  }

  if (!response.ok) {
    // Dispatch custom event if 401 Unauthorized for token expiration handling
    if (response.status === 401 && typeof window !== 'undefined') {
      const isAdminEndpoint = cleanEndpoint.startsWith('/admin') || (cleanEndpoint.startsWith('/orders') && options.method === 'GET');
      if (isAdminEndpoint) {
        window.dispatchEvent(new CustomEvent('stick_scape_admin_unauthorized'));
      } else {
        window.dispatchEvent(new CustomEvent('stick_scape_customer_unauthorized'));
      }
    }

    const errorMessage =
      (typeof responseData === 'object' && responseData !== null
        ? responseData.message || responseData.error
        : typeof responseData === 'string'
        ? responseData
        : '') || `API Request failed with status ${response.status}`;

    throw new ApiError(errorMessage, response.status, responseData);
  }

  return responseData as T;
}

export const api = {
  get: <T>(endpoint: string, options?: ApiFetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: any, options?: ApiFetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: any, options?: ApiFetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: any, options?: ApiFetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: ApiFetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
