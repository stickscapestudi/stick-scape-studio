import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/error.middleware.js';
import { CreateProductInput, UpdateProductInput } from '../validators/product.validator.js';

export const productService = {
  async getProducts(params?: { category?: string; search?: string }) {
    const where: any = { isActive: true };

    if (params?.category && params.category !== 'All') {
      where.category = { equals: params.category, mode: 'insensitive' };
    }

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    return prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  },

  async getProductById(id: string) {
    const product = await prisma.product.findFirst({
      where: { id, isActive: true },
    });

    if (!product) {
      throw new AppError(`Product with ID '${id}' not found`, 404);
    }

    return product;
  },

  async createProduct(input: CreateProductInput) {
    return prisma.product.create({
      data: {
        ...input,
        price: input.price,
      },
    });
  },

  async updateProduct(id: string, input: UpdateProductInput) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError(`Product with ID '${id}' not found`, 404);
    }

    return prisma.product.update({
      where: { id },
      data: input,
    });
  },

  async deleteProduct(id: string) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError(`Product with ID '${id}' not found`, 404);
    }

    // Soft Delete
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  },
};
