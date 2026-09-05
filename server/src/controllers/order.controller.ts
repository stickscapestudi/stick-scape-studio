import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service.js';
import { OrderStatus } from '@prisma/client';

export const orderController = {
  async getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const search = req.query.search ? (req.query.search as string) : undefined;
      const status = req.query.status ? (req.query.status as OrderStatus) : undefined;

      const result = await orderService.getOrders({ page, limit, search, status });
      res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  },

  async trackOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderNumber } = req.params;
      const mobile = req.query.mobile as string;
      const result = await orderService.trackOrder(orderNumber, mobile);
      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id);
      res.json({
        success: true,
        data: order,
      });
    } catch (err) {
      next(err);
    }
  },

  async getOrderByNumber(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderNumber } = req.params;
      const order = await orderService.getOrderByNumber(orderNumber);
      res.json({
        success: true,
        data: order,
      });
    } catch (err) {
      next(err);
    }
  },

  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.createOrder(req.body, req.customer?.id);
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await orderService.updateOrderStatus(id, status);
      res.json({
        success: true,
        message: `Order status updated to '${status}'`,
        data: order,
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await orderService.deleteOrder(id);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  },

  async clearAllOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await orderService.clearAllOrders();
      res.json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};

