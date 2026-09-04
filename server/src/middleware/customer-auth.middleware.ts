import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { AppError } from './error.middleware.js';

export interface AuthenticatedCustomer {
  id: string;
  name: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      customer?: AuthenticatedCustomer;
    }
  }
}

export async function requireCustomerAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Customer authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Customer authentication token missing', 401);
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch {
      throw new AppError('Invalid or expired customer session. Please log in again.', 401);
    }

    if (!decoded || !decoded.sub) {
      throw new AppError('Invalid authentication token claims', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user) {
      throw new AppError('User account not found', 401);
    }

    req.customer = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (err) {
    next(err);
  }
}

// Optional customer auth (extracts customer if token exists, but doesn't block unauthenticated shoppers)
export async function optionalCustomerAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded: any = jwt.verify(token, env.JWT_SECRET);
          if (decoded && decoded.sub) {
            const user = await prisma.user.findUnique({
              where: { id: decoded.sub },
            });
            if (user) {
              req.customer = {
                id: user.id,
                name: user.name,
                email: user.email,
              };
            }
          }
        } catch {
          // Ignore invalid token in optional middleware
        }
      }
    }
    next();
  } catch {
    next();
  }
}
