import { api } from './api';
import type {
  OrderConfirmationData,
  CreateOrderRequest,
  OrderStatus,
  OrderResponse,
} from '../types';

export interface TrackOrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface TrackOrderData {
  orderNumber: string;
  status: string;
  createdAt: string;
  items: TrackOrderItem[];
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
}

export interface GetOrdersOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface PaginatedOrdersResult {
  orders: OrderConfirmationData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Normalizes raw order payload from backend API into complete OrderConfirmationData object.
 */
function normalizeOrder(raw: any): OrderConfirmationData {
  const orderId = raw.orderNumber || raw.orderId || raw.id || `SSC-${Date.now().toString().slice(-6)}`;
  const orderDate = raw.orderDate || (raw.createdAt ? new Date(raw.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
  const status: OrderStatus = raw.status || 'Pending';
  const paymentMethod = raw.paymentMethod || 'card';
  const estimatedDelivery = raw.estimatedDelivery || '3–5 Business Days';

  const subtotal = Number(raw.subtotal || raw.amountPaid || 0);
  const shippingCost = Number(raw.shippingAmount ?? raw.shippingCost ?? 0);
  const total = Number(raw.totalAmount ?? raw.total ?? (subtotal + shippingCost));

  const customer = raw.customer
    ? {
        firstName: raw.customer.firstName || (raw.customerName ? raw.customerName.split(' ')[0] : 'Valued'),
        lastName: raw.customer.lastName || (raw.customerName ? raw.customerName.split(' ').slice(1).join(' ') || 'Customer' : 'Customer'),
        email: raw.customer.email || raw.email || 'customer@example.com',
        phone: raw.customer.phone || raw.mobile || '',
        address: raw.customer.address || raw.address || '',
        city: raw.customer.city || raw.city || '',
        state: raw.customer.state || raw.state || '',
        postalCode: raw.customer.postalCode || raw.postalCode || '',
        country: raw.customer.country || 'India',
      }
    : {
        firstName: raw.customerName ? raw.customerName.split(' ')[0] : 'Valued',
        lastName: raw.customerName ? raw.customerName.split(' ').slice(1).join(' ') || 'Customer' : 'Customer',
        email: raw.email || 'customer@example.com',
        phone: raw.mobile || '',
        address: raw.address || '',
        city: raw.city || '',
        state: raw.state || '',
        postalCode: raw.postalCode || '',
        country: 'India',
      };

  const items = Array.isArray(raw.items)
    ? raw.items.map((item: any) => {
        let uploadedPhotos: string[] = [];
        let customCaption: string | undefined = undefined;
        let customCaptions: string[] | undefined = undefined;
        let songUrl: string | undefined = undefined;
        let songUrls: string[] | undefined = undefined;

        // Try extracting from product description or item fields
        if (Array.isArray(item.uploadedPhotos) && item.uploadedPhotos.length > 0) {
          uploadedPhotos = item.uploadedPhotos;
        } else if (Array.isArray(item.images) && item.images.length > 0) {
          uploadedPhotos = item.images;
        }

        if (Array.isArray(item.customCaptions)) {
          customCaptions = item.customCaptions;
        }
        if (Array.isArray(item.songUrls)) {
          songUrls = item.songUrls;
        }

        if (item.product?.description && typeof item.product.description === 'string' && item.product.description.startsWith('{')) {
          try {
            const parsed = JSON.parse(item.product.description);
            if (Array.isArray(parsed.photos)) {
              uploadedPhotos = parsed.photos;
            }
            if (parsed.caption) {
              customCaption = parsed.caption;
            } else if (parsed.title) {
              customCaption = `${parsed.title}${parsed.subtitle ? ' — ' + parsed.subtitle : ''}`;
            }
            if (Array.isArray(parsed.captions)) {
              customCaptions = parsed.captions;
            }
            if (parsed.songUrl) songUrl = parsed.songUrl;
            if (Array.isArray(parsed.songUrls)) {
              songUrls = parsed.songUrls;
            }
          } catch {}
        }

        if (uploadedPhotos.length === 0) {
          const fallbackImg = item.image || item.imageUrl || item.product?.imageUrl || '/logo.jpeg';
          uploadedPhotos = [fallbackImg];
        }

        return {
          cartItemId: item.cartItemId || item.id || `${item.productId || 'item'}_sz`,
          id: item.productId || item.id || 'prod-01',
          name: item.productName || item.name || 'Art Print',
          category: item.category || item.product?.category || 'posters',
          basePrice: Number(item.unitPrice || item.basePrice || 0),
          unitPrice: Number(item.unitPrice || 0),
          image: uploadedPhotos[0] || item.image || item.imageUrl || item.product?.imageUrl || '/logo.jpeg',
          images: uploadedPhotos,
          uploadedPhotos: uploadedPhotos,
          customCaption: customCaption || item.customCaption,
          customCaptions: customCaptions || item.customCaptions,
          songUrl: songUrl || item.songUrl,
          songUrls: songUrls || item.songUrls,
          selectedSize: item.selectedSize || { id: 'sz-default', name: 'Standard Scale', dimensions: '11x17 in', priceMultiplier: 1.0, inStock: true },
          quantity: Number(item.quantity || 1),
        };
      })
    : [];

  return {
    orderId,
    orderDate,
    items,
    subtotal,
    discount: Number(raw.discount || 0),
    discountCode: raw.discountCode,
    shippingCost,
    shippingMethod: raw.shippingMethod || (shippingCost === 0 ? 'Express Free Courier Dispatch' : 'Standard Eco Shipping'),
    tax: Number(raw.tax || 0),
    total,
    customer,
    paymentMethod,
    paymentStatus: raw.paymentStatus || 'Pending',
    paymentProvider: raw.paymentProvider || paymentMethod,
    estimatedDelivery,
    status,
  };
}

export const orderService = {
  /**
   * Public Customer Order Tracking endpoint.
   * Verifies orderNumber AND customer mobile number. PUBLIC call (no JWT).
   */
  async trackOrder(orderNumber: string, mobile: string): Promise<TrackOrderData> {
    const query = new URLSearchParams({ mobile }).toString();
    const res = await api.get<{ success: boolean; data: TrackOrderData }>(
      `/orders/track/${encodeURIComponent(orderNumber)}?${query}`
    );

    if (res && res.success && res.data) {
      return res.data;
    }

    throw new Error('Order not found');
  },

  /**
   * Fetches orders from backend database with optional search, status filter, and pagination.
   * Requires Admin Authentication.
   */
  async getOrders(options: GetOrdersOptions = {}): Promise<PaginatedOrdersResult> {
    const queryParams = new URLSearchParams();
    if (options.page) queryParams.append('page', options.page.toString());
    if (options.limit) queryParams.append('limit', options.limit.toString());
    if (options.search) queryParams.append('search', options.search);
    if (options.status && options.status !== 'All') queryParams.append('status', options.status);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/orders?${queryString}` : '/orders';

    const res = await api.get<any>(endpoint, { authenticated: true, adminAuth: true });

    let rawOrders: any[] = [];
    let pagination = {
      page: options.page || 1,
      limit: options.limit || 20,
      total: 0,
      totalPages: 1,
    };

    if (res && res.success && Array.isArray(res.data)) {
      rawOrders = res.data;
      if (res.pagination) {
        pagination = res.pagination;
      } else {
        pagination.total = rawOrders.length;
      }
    } else if (Array.isArray(res)) {
      rawOrders = res;
      pagination.total = rawOrders.length;
    }

    return {
      orders: rawOrders.map(normalizeOrder),
      pagination,
    };
  },

  /**
   * Fetches a specific order by ID or orderNumber.
   */
  async getOrderById(orderId: string): Promise<OrderConfirmationData> {
    const res = await api.get<OrderResponse | OrderConfirmationData>(`/orders/${orderId}`, {
      authenticated: true,
      adminAuth: true,
    });
    if (res && (res as OrderResponse).success && (res as OrderResponse).data) {
      return normalizeOrder((res as OrderResponse).data);
    }
    return normalizeOrder(res);
  },

  /**
   * Sends order creation request to backend.
   * The BACKEND validates items, calculates server-side price & shipping, and generates orderNumber.
   * Public Customer Endpoint.
   */
  async createOrder(payload: CreateOrderRequest): Promise<OrderConfirmationData> {
    const apiPayload = {
      customer: payload.customer,
      customerName: `${payload.customer.firstName} ${payload.customer.lastName}`.trim(),
      email: payload.customer.email,
      mobile: payload.customer.phone,
      address: payload.customer.address,
      city: payload.customer.city,
      state: payload.customer.state,
      postalCode: payload.customer.postalCode,
      paymentMethod: payload.paymentMethod || 'COD',
      items: payload.items.map((i) => ({
        productId: i.id || (i as any).productId || 'prod-01',
        quantity: i.quantity || 1,
        productName: i.name || (i as any).productName,
        unitPrice: i.unitPrice ?? i.basePrice,
        imageUrl: i.image || (i as any).imageUrl,
        images: i.images || (i as any).uploadedPhotos,
        uploadedPhotos: i.uploadedPhotos || i.images,
        customCaption: i.customCaption,
        customCaptions: i.customCaptions,
        songUrl: i.songUrl,
        songUrls: i.songUrls,
        description: i.customDescription || (i as any).description,
      })),
    };

    const res = await api.post<OrderResponse | OrderConfirmationData>('/orders', apiPayload, {
      authenticated: true,
      customerAuth: true,
    });
    if (res && (res as OrderResponse).success && (res as OrderResponse).data) {
      return normalizeOrder((res as OrderResponse).data);
    }
    return normalizeOrder(res);
  },

  /**
   * Updates an order's status on the backend.
   * Requires Admin Authentication.
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<OrderConfirmationData> {
    const res = await api.patch<OrderResponse | OrderConfirmationData>(
      `/orders/${orderId}/status`,
      { status },
      { authenticated: true }
    );
    if (res && (res as OrderResponse).success && (res as OrderResponse).data) {
      return normalizeOrder((res as OrderResponse).data);
    }
    return normalizeOrder(res);
  },

  /**
   * Deletes a single order by ID or orderNumber.
   * Requires Admin Authentication.
   */
  async deleteOrder(orderId: string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete<{ success: boolean; message: string }>(`/orders/${orderId}`, {
      authenticated: true,
      adminAuth: true,
    });
    return res;
  },

  /**
   * Clears all orders from the database.
   * Requires Admin Authentication.
   */
  async clearAllOrders(): Promise<{ success: boolean; message: string; data?: any }> {
    const res = await api.delete<{ success: boolean; message: string; data?: any }>('/orders/clear-all', {
      authenticated: true,
      adminAuth: true,
    });
    return res;
  },
};

