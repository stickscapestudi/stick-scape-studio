import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service.js';

export const productController = {
  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;
      const products = await productService.getProducts({ category, search });
      res.json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (err) {
      next(err);
    }
  },

  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);
      res.json({
        success: true,
        data: product,
      });
    } catch (err) {
      next(err);
    }
  },

  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productService.updateProduct(id, req.body);
      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await productService.deleteProduct(id);
      res.json({
        success: true,
        message: 'Product deleted (deactivated) successfully',
      });
    } catch (err) {
      next(err);
    }
  },
};
