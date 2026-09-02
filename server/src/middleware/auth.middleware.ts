import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { AppError } from './error.middleware.js';
import { AdminRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authorization header missing or malformed', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Authentication token missing', 401);
    }

    const decoded = authService.verifyToken(token);
    const admin = await authService.getAdminById(decoded.sub);

    req.user = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };

    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(allowedRole: AdminRole) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    if (req.user.role !== allowedRole) {
      return next(new AppError(`Access denied. Role '${allowedRole}' required.`, 403));
    }

    next();
  };
}
