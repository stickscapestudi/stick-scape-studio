import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/error.middleware.js';
import { LoginInput } from '../validators/auth.validator.js';
import { AdminRole } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  role: AdminRole;
}

export const authService = {
  /**
   * Generates a signed JWT token containing sub and role claims.
   */
  generateToken(adminId: string, role: AdminRole): string {
    const payload: JwtPayload = {
      sub: adminId,
      role,
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  },

  /**
   * Verifies and decodes a JWT token.
   */
  verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      return decoded;
    } catch {
      throw new AppError('Invalid or expired authentication token', 401);
    }
  },

  /**
   * Authenticates an admin user by email & password.
   */
  async login(input: LoginInput) {
    const rawIdentifier = (input.email || '').toLowerCase().trim();

    // Look up by exact email, id, or if user entered "admin" / "adminid"
    let admin = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { email: { equals: rawIdentifier, mode: 'insensitive' } },
          { id: { equals: rawIdentifier, mode: 'insensitive' } },
          { name: { contains: rawIdentifier, mode: 'insensitive' } },
        ],
      },
    });

    // If identifier is "admin" or similar default admin alias, fall back to master admin user
    if (!admin && (rawIdentifier === 'admin' || rawIdentifier === 'adminid' || rawIdentifier === 'admin_id')) {
      admin = await prisma.adminUser.findFirst({
        where: { role: 'ADMIN', isActive: true },
      });
    }

    // Generic 401 Error message for timing attack / credential enumeration safety
    if (!admin || !admin.isActive) {
      throw new AppError('Invalid Admin ID or password', 401);
    }


    const isMatch = await bcrypt.compare(input.password, admin.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken(admin.id, admin.role);

    return {
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  },

  /**
   * Fetches an active admin user by ID.
   */
  async getAdminById(id: string) {
    const admin = await prisma.adminUser.findFirst({
      where: { id, isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!admin) {
      throw new AppError('Authenticated admin user not found or inactive', 401);
    }

    return admin;
  },
};
