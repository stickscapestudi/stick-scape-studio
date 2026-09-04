import { api } from './api';

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  apartment?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  avatarUrl?: string | null;
  authProvider?: 'LOCAL' | 'GOOGLE';
}

export interface CustomerAuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    user: CustomerUser;
  };
  error?: string;
}

const CUSTOMER_TOKEN_KEY = 'stick_scape_customer_token';
const CUSTOMER_USER_KEY = 'stick_scape_customer_user';

export const customerAuthService = {
  /**
   * Registers a new customer.
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  }): Promise<{ token: string; user: CustomerUser }> {
    const res = await api.post<CustomerAuthResponse>('/customer/auth/register', data);
    if (res && res.success && res.data) {
      this.saveAuth(res.data.token, res.data.user);
      return res.data;
    }
    throw new Error(res.error || res.message || 'Registration failed');
  },

  /**
   * Logs in an existing customer with email & password.
   */
  async login(email: string, password: string): Promise<{ token: string; user: CustomerUser }> {
    const res = await api.post<CustomerAuthResponse>('/customer/auth/login', { email, password });
    if (res && res.success && res.data) {
      this.saveAuth(res.data.token, res.data.user);
      return res.data;
    }
    throw new Error(res.error || res.message || 'Login failed');
  },

  /**
   * Logs in or registers via Google SSO.
   */
  async googleAuth(data: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }): Promise<{ token: string; user: CustomerUser }> {
    const res = await api.post<CustomerAuthResponse>('/customer/auth/google', data);
    if (res && res.success && res.data) {
      this.saveAuth(res.data.token, res.data.user);
      return res.data;
    }
    throw new Error(res.error || res.message || 'Google authentication failed');
  },

  /**
   * Fetches the current customer's profile from the backend.
   */
  async getProfile(): Promise<CustomerUser> {
    const res = await api.get<{ success: boolean; data: CustomerUser }>('/customer/auth/me', {
      authenticated: true,
    });
    if (res && res.success && res.data) {
      this.saveUserOnly(res.data);
      return res.data;
    }
    throw new Error('Failed to fetch profile');
  },

  /**
   * Updates the customer's profile and shipping address.
   */
  async updateProfile(data: Partial<CustomerUser>): Promise<CustomerUser> {
    const res = await api.patch<{ success: boolean; data: CustomerUser }>('/customer/auth/profile', data, {
      authenticated: true,
    });
    if (res && res.success && res.data) {
      this.saveUserOnly(res.data);
      return res.data;
    }
    throw new Error('Failed to update profile');
  },

  /**
   * Fetches customer's past orders.
   */
  async getCustomerOrders(): Promise<any[]> {
    const res = await api.get<{ success: boolean; data: any[] }>('/customer/auth/orders', {
      authenticated: true,
    });
    if (res && res.success && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  },

  /**
   * Persists token & user profile in localStorage.
   */
  saveAuth(token: string, user: CustomerUser): void {
    try {
      localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(user));
    } catch {
      // Storage fallback
    }
  },

  /**
   * Updates only user profile in localStorage.
   */
  saveUserOnly(user: CustomerUser): void {
    try {
      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(user));
    } catch {
      // Storage fallback
    }
  },

  /**
   * Clears customer authentication.
   */
  logout(): void {
    try {
      localStorage.removeItem(CUSTOMER_TOKEN_KEY);
      localStorage.removeItem(CUSTOMER_USER_KEY);
    } catch {
      // Storage fallback
    }
  },

  /**
   * Gets stored customer token.
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(CUSTOMER_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  /**
   * Gets stored customer profile.
   */
  getStoredUser(): CustomerUser | null {
    try {
      const raw = localStorage.getItem(CUSTOMER_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
};
