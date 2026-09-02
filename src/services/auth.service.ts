import { api } from './api';

export interface AdminUserProfile {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN';
}

export interface LoginResponseData {
  token: string;
  admin: AdminUserProfile;
}

export interface AuthApiResponse {
  success: boolean;
  message?: string;
  data?: LoginResponseData;
  error?: string;
}

const TOKEN_KEY = 'stick_scape_admin_token';
const USER_KEY = 'stick_scape_admin_user';

export const authService = {
  /**
   * Performs admin login request.
   */
  async login(email: string, password: string): Promise<{ token: string; admin: AdminUserProfile }> {
    const response = await api.post<AuthApiResponse>('/auth/login', {
      email,
      password,
    });

    if (response && response.success && response.data) {
      const { token, admin } = response.data;
      this.saveAuth(token, admin);
      return { token, admin };
    }

    throw new Error(response.error || response.message || 'Login failed');
  },

  /**
   * Saves token and admin profile into localStorage.
   */
  saveAuth(token: string, admin: AdminUserProfile): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(admin));
    } catch {
      // Storage fallback
    }
  },

  /**
   * Clears authentication token and admin profile.
   */
  logout(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // Storage fallback
    }
  },

  /**
   * Retrieves current stored JWT token.
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  /**
   * Retrieves current stored admin profile.
   */
  getStoredAdmin(): AdminUserProfile | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Checks if an admin session token exists.
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
