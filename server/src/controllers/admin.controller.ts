import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service.js';

export const adminController = {
  async getDashboardStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await adminService.getDashboardStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  },
};
