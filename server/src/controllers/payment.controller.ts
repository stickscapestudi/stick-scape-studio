import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { paymentService } from '../services/payment.service.js';
import { notificationService } from '../services/notification.service.js';
import { AppError } from '../middleware/error.middleware.js';

export const paymentController = {
  /**
   * Creates a payment order for an existing backend order.
   * Calculates payable amount in paise strictly from PostgreSQL database.
   */
  async createPaymentOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderNumber } = req.body;

      const order = await prisma.order.findUnique({
        where: { orderNumber: orderNumber.trim() },
      });

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      if (order.status === 'Cancelled') {
        throw new AppError('Cannot initiate payment for a cancelled order', 400);
      }

      if (order.paymentStatus === 'Paid') {
        res.json({
          success: true,
          message: 'Order is already paid',
          data: {
            alreadyPaid: true,
            orderNumber: order.orderNumber,
          },
        });
        return;
      }

      const totalAmountRupees = Number(order.totalAmount);
      const payResult = await paymentService.provider.createPaymentOrder(order.orderNumber, totalAmountRupees);

      // Save paymentOrderId & provider to PostgreSQL
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentProvider: payResult.provider,
          paymentOrderId: payResult.paymentOrderId,
          paymentStatus: 'Pending',
        },
      });

      res.json({
        success: true,
        data: {
          keyId: payResult.keyId,
          paymentOrderId: payResult.paymentOrderId,
          amount: payResult.amount, // In paise
          currency: payResult.currency,
          orderNumber: order.orderNumber,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Cryptographically verifies payment signature.
   * Idempotently sets paymentStatus = 'Paid' and advances status to 'Processing'.
   */
  async verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderNumber, paymentOrderId, paymentId, signature } = req.body;

      const order = await prisma.order.findUnique({
        where: { orderNumber: orderNumber.trim() },
        include: { items: true },
      });

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      // Idempotency check: If already paid, return success without duplicate side-effects
      if (order.paymentStatus === 'Paid') {
        res.json({
          success: true,
          message: 'Payment already verified',
          data: order,
        });
        return;
      }

      // Cryptographic HMAC-SHA256 signature verification
      const isValid = await paymentService.provider.verifyPayment(paymentOrderId, paymentId, signature);

      if (!isValid) {
        // Mark payment as Failed on signature mismatch
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'Failed' },
        });

        throw new AppError('Payment verification failed. Invalid signature.', 400);
      }

      // Update Order to Paid and advance fulfillment status to Processing if currently Pending
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'Paid',
          paymentId: paymentId,
          paidAt: new Date(),
          status: order.status === 'Pending' ? 'Processing' : order.status,
        },
        include: { items: true },
      });

      // Safely emit status change notification
      if (order.status === 'Pending') {
        notificationService.sendOrderStatusNotification(order, 'Pending', 'Processing').catch(() => {});
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: updatedOrder,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Asynchronous Razorpay Webhook Handler.
   * Cryptographically verifies webhook signature and processes events idempotently.
   */
  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

      const isValid = await paymentService.provider.verifyWebhookSignature(rawBody, signature);

      if (!isValid) {
        throw new AppError('Invalid webhook signature', 400);
      }

      const eventData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const eventType = eventData.event;
      const payload = eventData.payload?.payment?.entity;

      if (payload) {
        const paymentOrderId = payload.order_id;
        const paymentId = payload.id;

        if (paymentOrderId) {
          const order = await prisma.order.findFirst({
            where: { paymentOrderId },
          });

          if (order) {
            if (eventType === 'payment.captured' || eventType === 'payment.authorized') {
              if (order.paymentStatus !== 'Paid') {
                await prisma.order.update({
                  where: { id: order.id },
                  data: {
                    paymentStatus: 'Paid',
                    paymentId: paymentId || order.paymentId,
                    paidAt: new Date(),
                    status: order.status === 'Pending' ? 'Processing' : order.status,
                  },
                });
              }
            } else if (eventType === 'payment.failed') {
              if (order.paymentStatus !== 'Paid') {
                await prisma.order.update({
                  where: { id: order.id },
                  data: { paymentStatus: 'Failed' },
                });
              }
            } else if (eventType === 'refund.created') {
              await prisma.order.update({
                where: { id: order.id },
                data: { paymentStatus: 'Refunded' },
              });
            }
          }
        }
      }

      res.json({ success: true, received: true });
    } catch (err) {
      next(err);
    }
  },
};
