import { prisma } from '../config/prisma.js';

export const adminService = {
  /**
   * Calculates live dashboard statistics directly from PostgreSQL.
   */
  async getDashboardStats() {
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      revenueAggregate,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'Pending' } }),
      prisma.order.count({ where: { status: 'Processing' } }),
      prisma.order.count({ where: { status: 'Shipped' } }),
      prisma.order.count({ where: { status: 'Delivered' } }),
      prisma.order.count({ where: { status: 'Cancelled' } }),
      prisma.order.aggregate({
        where: {
          status: {
            not: 'Cancelled',
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    const totalRevenue = revenueAggregate._sum.totalAmount
      ? Number(revenueAggregate._sum.totalAmount)
      : 0;

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
    };
  },
};
