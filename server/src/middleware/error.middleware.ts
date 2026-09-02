import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { env } from '../config/env.js';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorMiddleware(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (env.NODE_ENV === 'development') {
    console.error('💥 Server Error Handler caught:', err);
  }

  // Zod Validation Error
  if (err instanceof ZodError) {
    const issueMessages = err.errors.map((e) => e.message).join(', ');
    res.status(400).json({
      success: false,
      message: `Validation Error: ${issueMessages}`,
      errors: err.errors,
    });
    return;
  }

  // Custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      res.status(409).json({
        success: false,
        message: `Unique constraint failed on ${target}`,
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Record not found',
      });
      return;
    }
  }

  // Fallback 500 Internal Server Error
  const statusCode = err.statusCode || 500;
  const message =
    env.NODE_ENV === 'production'
      ? 'An internal server error occurred'
      : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
  });
}
