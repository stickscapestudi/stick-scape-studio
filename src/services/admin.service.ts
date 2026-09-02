import { api } from './api';

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

export interface StatsApiResponse {
  success: boolean;
  data?: DashboardStats;
  message?: string;
}

export const adminService = {
  /**
   * Fetches live dashboard KPI statistics from backend PostgreSQL.
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<StatsApiResponse>('/admin/dashboard/stats', {
      authenticated: true,
    });

    if (response && response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch dashboard statistics.');
  },
};
