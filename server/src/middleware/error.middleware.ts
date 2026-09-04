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
  // Always log server errors for debugging in production and development
  console.error('💥 [Server Error]:', err?.message || err);
  if (err?.stack) {
    console.error(err.stack);
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

  // Prisma Database Connection / Initialization Error
  if (
    err instanceof Prisma.PrismaClientInitializationError ||
    (typeof err?.message === 'string' && err.message.includes("Can't reach database server"))
  ) {
    res.status(503).json({
      success: false,
      message: 'Database connection failed. Please verify that your DATABASE_URL environment variable is set and PostgreSQL is running.',
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
    if (err.code === 'P2021') {
      res.status(500).json({
        success: false,
        message: 'Database tables not found. Please run "npx prisma db push" or seed database.',
      });
      return;
    }
  }

  // Fallback 500 Internal Server Error
  const statusCode = err.statusCode || 500;
  const message =
    err.message || (env.NODE_ENV === 'production' ? 'An internal server error occurred' : 'Internal Server Error');

  res.status(statusCode).json({
    success: false,
    message,
  });
}
