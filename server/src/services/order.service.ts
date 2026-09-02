import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/error.middleware.js';
import { generateOrderNumber } from '../utils/order-id.js';
import { CreateOrderInput } from '../validators/order.validator.js';
import { notificationService } from './notification.service.js';

/**
 * Valid order status transition state machine.
 */
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Pending: ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: [],
  Cancelled: [],
};

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
}

export const orderService = {
  /**
   * Returns paginated and filtered orders newest-first with line items.
   * Protected for Admin users.
   */
  async getOrders(params: GetOrdersParams = {}) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.search && params.search.trim() !== '') {
      const query = params.search.trim();
      where.OR = [
        { orderNumber: { contains: query, mode: 'insensitive' } },
        { customerName: { contains: query, mode: 'insensitive' } },
        { mobile: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  /**
   * Public Customer Order Tracking: Verifies orderNumber AND mobile number.
   * Returns generic 404 on any mismatch to prevent information leakage.
   */
  async trackOrder(orderNumber: string, inputMobile: string) {
    if (!orderNumber || !inputMobile) {
      throw new AppError('Order number and mobile number are required', 400);
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: orderNumber.trim() },
      include: { items: true },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Helper to normalize phone numbers (strip spaces, dashes, leading +91 or 0)
    const cleanPhone = (str: string) => str.replace(/\D/g, '').replace(/^(91|0)/, '');
    const normCustomerMobile = cleanPhone(order.mobile);
    const normInputMobile = cleanPhone(inputMobile);

    if (!normCustomerMobile || normCustomerMobile !== normInputMobile) {
      throw new AppError('Order not found', 404);
    }

    // Safe Response Payload (Includes paymentStatus & paymentMethod, excludes private UUIDs/full address)
    return {
      orderNumber: order.orderNumber,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
      })),
      subtotal: Number(order.subtotal),
      shippingAmount: Number(order.shippingAmount),
      totalAmount: Number(order.totalAmount),
    };
  },

  /**
   * Retrieves a single order by database ID or orderNumber.
   */
  async getOrderById(idOrNumber: string) {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }],
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new AppError(`Order '${idOrNumber}' not found`, 404);
    }

    return order;
  },

  /**
   * Retrieves a single order specifically by orderNumber.
   */
  async getOrderByNumber(orderNumber: string) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new AppError(`Order number '${orderNumber}' not found`, 404);
    }

    return order;
  },

  /**
   * Server-side order creation with price calculation, stock verification,
   * unique order number generation, and transactional stock decrement.
   */
  async createOrder(input: CreateOrderInput) {
    // 1. Normalize Customer Details
    const customer = input.customer || {
      customerName: input.customerName || `${input.customerName || 'Valued Customer'}`,
      email: input.email || 'customer@example.com',
      mobile: input.mobile || input.phone || '',
      address: input.address || '',
      city: input.city || '',
      state: input.state || '',
      postalCode: input.postalCode || '',
    };

    const customerName =
      customer.customerName ||
      `${(customer as any).firstName || ''} ${(customer as any).lastName || ''}`.trim() ||
      'Valued Customer';
    const email = customer.email;
    const mobile = customer.mobile || (customer as any).phone || '';
    const address = customer.address;
    const city = customer.city;
    const state = customer.state;
    const postalCode = customer.postalCode;

    // 2. Fetch and Validate Products from PostgreSQL
    const itemCalculations: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }> = [];

    let subtotal = 0;

    for (const item of input.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || !product.isActive) {
        throw new AppError(`Product with ID '${item.productId}' is not available`, 400);
      }

      if (item.quantity > product.stock) {
        throw new AppError(`Insufficient stock for ${product.name}`, 409);
      }

      const unitPrice = Number(product.price);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      itemCalculations.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      });
    }

    // 3. Shipping Calculation Rule
    // Orders >= ₹999 -> Free Shipping; otherwise ₹80
    const shippingAmount = subtotal >= 999 ? 0 : 80;
    const totalAmount = subtotal + shippingAmount;

    // 4. Generate Order Number & Transactional Execution with Retry
    let attempts = 0;
    const maxAttempts = 3;

    let createdOrder: any = null;

    while (attempts < maxAttempts) {
      attempts++;
      const orderNumber = generateOrderNumber();

      try {
        createdOrder = await prisma.$transaction(async (tx) => {
          // Decrement Stock for Each Product
          for (const calc of itemCalculations) {
            await tx.product.update({
              where: { id: calc.productId },
              data: {
                stock: { decrement: calc.quantity },
              },
            });
          }

          // Create Order with Items (Defaults paymentStatus = Pending, paymentProvider = COD/input)
          return tx.order.create({
            data: {
              orderNumber,
              customerName,
              email,
              mobile,
              address,
              city,
              state,
              postalCode,
              paymentMethod: input.paymentMethod || 'COD',
              paymentStatus: 'Pending',
              paymentProvider: input.paymentMethod || 'COD',
              status: 'Pending',
              subtotal,
              shippingAmount,
              totalAmount,
              items: {
                create: itemCalculations.map((calc) => ({
                  productId: calc.productId,
                  productName: calc.productName,
                  quantity: calc.quantity,
                  unitPrice: calc.unitPrice,
                  lineTotal: calc.lineTotal,
                })),
              },
            },
            include: {
              items: true,
            },
          });
        });

        break;
      } catch (err: any) {
        // If unique constraint error on orderNumber, retry
        if (err.code === 'P2002' && attempts < maxAttempts) {
          continue;
        }
        throw err;
      }
    }

    if (!createdOrder) {
      throw new AppError('Failed to generate a unique order number. Please try again.', 500);
    }

    // 5. Trigger Notification Asynchronously Outside DB Transaction (Fail-Safe)
    notificationService.sendOrderCreatedNotification(createdOrder).catch(() => {});

    return createdOrder;
  },

  /**
   * Updates order status enforcing strict status transition rules.
   */
  async updateOrderStatus(id: string, newStatus: OrderStatus) {
    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
    });

    if (!existingOrder) {
      throw new AppError(`Order '${id}' not found`, 404);
    }

    const currentStatus = existingOrder.status;

    // If same status, return unchanged
    if (currentStatus === newStatus) {
      return prisma.order.findUnique({
        where: { id: existingOrder.id },
        include: { items: true },
      });
    }

    // Validate Transition Rules
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new AppError(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed: ${
          allowed.length > 0 ? allowed.join(', ') : 'none'
        }`,
        400
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: existingOrder.id },
      data: { status: newStatus },
      include: { items: true },
    });

    // Trigger Notification Asynchronously Outside DB Transaction (Fail-Safe)
    notificationService.sendOrderStatusNotification(existingOrder, currentStatus, newStatus).catch(() => {});

    return updatedOrder;
  },
};
