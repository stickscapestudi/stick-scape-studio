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
          items: {
            include: {
              product: true,
            },
          },
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
  /**
   * Public Customer Order Tracking: Verifies orderNumber AND mobile number.
   * Returns generic 404 on any mismatch to prevent information leakage.
   */
  async trackOrder(orderNumber: string, inputMobile: string) {
    if (!orderNumber || !inputMobile) {
      throw new AppError('Order number and mobile number are required', 400);
    }

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: {
          equals: orderNumber.trim(),
          mode: 'insensitive',
        },
      },
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
        OR: [
          { id: idOrNumber },
          { orderNumber: idOrNumber },
          { orderNumber: { equals: idOrNumber, mode: 'insensitive' } },
        ],
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
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
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: {
          equals: orderNumber.trim(),
          mode: 'insensitive',
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
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
  async createOrder(input: CreateOrderInput, userId?: string) {
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
      input.customerName ||
      'Valued Customer';
    const email = customer.email || input.email || 'customer@example.com';
    const mobile = customer.mobile || (customer as any).phone || input.mobile || input.phone || '';
    const address = customer.address || input.address || 'Address on file';
    const city = customer.city || input.city || 'City';
    const state = customer.state || input.state || 'State';
    const postalCode = customer.postalCode || input.postalCode || '000000';

    // Validate COD eligibility: COD is strictly restricted to Puducherry / Pondicherry
    if (input.paymentMethod === 'COD') {
      const s = (state || '').trim().toLowerCase();
      const c = (city || '').trim().toLowerCase();
      const isPuducherry = 
        s.includes('puducherry') || 
        s.includes('pondicherry') || 
        s === 'py' || 
        c.includes('puducherry') || 
        c.includes('pondicherry');

      if (!isPuducherry) {
        throw new AppError(
          'Cash on Delivery (COD) is only available for deliveries within Puducherry / Pondicherry. Please use Direct UPI QR payment.',
          400
        );
      }
    }

    // 2. Fetch and Validate Products from PostgreSQL (Supports Lookup by ID, Slug, or Custom Packs)
    const itemCalculations: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }> = [];

    let subtotal = 0;

    for (const item of input.items) {
      let product = await prisma.product.findFirst({
        where: {
          OR: [{ id: item.productId }, { slug: item.productId }],
        },
      });

      // If product does not exist in DB, handle custom / dynamic products (e.g., custom Polaroid packs)
      if (!product && (item.productId.startsWith('custom-') || item.productName?.toLowerCase().includes('custom') || item.productId.includes('polaroid') || item.productId.includes('poster') || item.productId.includes('pack-'))) {
        const isPoster = item.productId.includes('poster') || item.productName?.toLowerCase().includes('poster');
        const customName = item.productName || (isPoster ? 'Custom Wall Poster' : 'Custom Polaroid Pack');
        const customPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : (isPoster ? 60.00 : 50.00);
        const customImage = item.imageUrl || (isPoster ? '/varanam ayiram.jpeg' : '/vtv-polaroid.jpg');
        const photosList = item.uploadedPhotos || item.images || (item.imageUrl ? [item.imageUrl] : [customImage]);
        
        let descriptionPayload: string;
        if (typeof item.description === 'string' && item.description.startsWith('{')) {
          descriptionPayload = item.description;
        } else if (typeof (item as any).customDescription === 'string' && (item as any).customDescription.startsWith('{')) {
          descriptionPayload = (item as any).customDescription;
        } else {
          descriptionPayload = JSON.stringify({
            customType: isPoster ? 'wall-poster' : 'polaroid',
            caption: item.customCaption,
            captions: item.customCaptions,
            songUrl: item.songUrl,
            songUrls: item.songUrls,
            photos: photosList,
            photoCount: photosList.length,
          });
        }

        product = await prisma.product.upsert({
          where: { id: item.productId },
          update: {
            name: customName,
            price: new Prisma.Decimal(customPrice),
            description: descriptionPayload,
            imageUrl: photosList[0] || customImage,
            stock: 9999,
            isActive: true,
          },
          create: {
            id: item.productId,
            name: customName,
            slug: item.productId,
            description: descriptionPayload,
            category: isPoster ? 'posters' : 'polaroids',
            price: new Prisma.Decimal(customPrice),
            imageUrl: photosList[0] || customImage,
            stock: 9999,
            isActive: true,
          },
        });
      }

      if (!product || !product.isActive) {
        throw new AppError(`Product with ID '${item.productId}' is not available`, 400);
      }

      if (item.quantity > product.stock) {
        throw new AppError(`Insufficient stock for ${product.name}`, 409);
      }

      const unitPrice = item.unitPrice !== undefined && Number(item.unitPrice) > 0
        ? Number(item.unitPrice)
        : Number(product.price);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      itemCalculations.push({
        productId: product.id,
        productName: item.productName || product.name,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      });
    }

    // 3. Shipping Calculation Rule
    // Free Shipping for Puducherry / Pondicherry OR orders >= ₹999; otherwise ₹80
    const s = (state || '').trim().toLowerCase();
    const c = (city || '').trim().toLowerCase();
    const isPondicherry = 
      s.includes('puducherry') || 
      s.includes('pondicherry') || 
      s === 'py' || 
      c.includes('puducherry') || 
      c.includes('pondicherry');
    const shippingAmount = isPondicherry || subtotal >= 999 ? 0 : 80;
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
              userId: userId || null,
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
        OR: [
          { id },
          { orderNumber: id },
          { orderNumber: { equals: id, mode: 'insensitive' } },
        ],
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

  /**
   * Deletes a single order by ID or orderNumber (Admin only).
   */
  async deleteOrder(id: string) {
    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [
          { id },
          { orderNumber: id },
          { orderNumber: { equals: id, mode: 'insensitive' } },
        ],
      },
    });

    if (!existingOrder) {
      throw new AppError(`Order '${id}' not found`, 404);
    }

    // Delete associated items first then the order in a transaction
    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { orderId: existingOrder.id } }),
      prisma.order.delete({ where: { id: existingOrder.id } }),
    ]);

    return { message: `Order #${existingOrder.orderNumber} successfully deleted` };
  },

  /**
   * Clears/deletes all orders from the database (Admin only).
   */
  async clearAllOrders() {
    const [deletedItems, deletedOrders] = await prisma.$transaction([
      prisma.orderItem.deleteMany({}),
      prisma.order.deleteMany({}),
    ]);

    return {
      message: 'All orders successfully cleared',
      deletedOrdersCount: deletedOrders.count,
      deletedItemsCount: deletedItems.count,
    };
  },
};

