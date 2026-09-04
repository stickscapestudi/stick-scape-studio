import { api } from './api';
import type { OrderConfirmationData } from '../types';

export interface CreatePaymentOrderResponseData {
  keyId: string;
  paymentOrderId: string;
  provider: string;
  amount: number; // In paise
  currency: string;
  orderNumber: string;
}

export interface VerifyPaymentPayload {
  orderNumber: string;
  paymentOrderId: string;
  paymentId: string;
  signature: string;
}

export const paymentService = {
  /**
   * Initializes a payment order for an existing backend order.
   */
  async createPaymentOrder(orderNumber: string): Promise<CreatePaymentOrderResponseData> {
    const response = await api.post<{ success: boolean; data: CreatePaymentOrderResponseData }>(
      '/payments/create-order',
      { orderNumber }
    );

    if (response && response.success && response.data) {
      return response.data;
    }

    throw new Error('Failed to initialize online payment order.');
  },

  /**
   * Cryptographically verifies payment signature on the backend.
   */
  async verifyPayment(payload: VerifyPaymentPayload): Promise<OrderConfirmationData> {
    const response = await api.post<{ success: boolean; data: OrderConfirmationData; message?: string }>(
      '/payments/verify',
      payload
    );

    if (response && response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Payment verification failed.');
  },

  /**
   * Submits direct UPI QR payment confirmation with optional UTR number.
   */
  async submitUpiPayment(payload: {
    orderNumber: string;
    utrNumber?: string;
    upiId?: string;
  }): Promise<OrderConfirmationData> {
    const response = await api.post<{ success: boolean; data: OrderConfirmationData; message?: string }>(
      '/payments/verify-upi',
      payload
    );

    if (response && response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'UPI Payment confirmation failed.');
  },

  /**
   * Dynamically loads the Razorpay Checkout SDK script into document head.
   */
  loadRazorpaySdk(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if ((window as any).Razorpay) return resolve(true);

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },
};
