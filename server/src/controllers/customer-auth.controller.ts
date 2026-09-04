import { Request, Response, NextFunction } from 'express';
import { customerAuthService } from '../services/customer-auth.service.js';

export const customerAuthController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await customerAuthService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to Stick Scape Studio.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await customerAuthService.login(req.body);
      res.json({
        success: true,
        message: 'Welcome back!',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await customerAuthService.googleLogin(req.body);
      res.json({
        success: true,
        message: 'Signed in with Google successfully!',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await customerAuthService.getProfile(req.customer!.id);
      res.json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await customerAuthService.updateProfile(req.customer!.id, req.body);
      res.json({
        success: true,
        message: 'Profile and address updated successfully!',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  async getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await customerAuthService.getCustomerOrders(
        req.customer!.id,
        req.customer!.email
      );
      res.json({
        success: true,
        count: orders.length,
        data: orders,
      });
    } catch (err) {
      next(err);
    }
  },
};
