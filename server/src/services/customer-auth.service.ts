import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/error.middleware.js';
import {
  CustomerRegisterInput,
  CustomerLoginInput,
  GoogleAuthInput,
  UpdateCustomerProfileInput,
} from '../validators/customer-auth.validator.js';

export const customerAuthService = {
  /**
   * Generates a signed JWT token for a customer user.
   */
  generateToken(userId: string): string {
    return jwt.sign({ sub: userId, type: 'CUSTOMER' }, env.JWT_SECRET, {
      expiresIn: '7d',
    });
  },

  /**
   * Registers a new customer with Email and Password.
   */
  async register(input: CustomerRegisterInput) {
    const email = input.email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new AppError('An account with this email already exists. Please log in.', 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email,
        passwordHash,
        phone: input.phone?.trim() || null,
        address: input.address?.trim() || null,
        apartment: input.apartment?.trim() || null,
        city: input.city?.trim() || null,
        state: input.state?.trim() || null,
        postalCode: input.postalCode?.trim() || null,
        authProvider: 'LOCAL',
      },
    });

    const token = this.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        apartment: user.apartment,
        city: user.city,
        state: user.state,
        postalCode: user.postalCode,
        avatarUrl: user.avatarUrl,
        authProvider: user.authProvider,
      },
    };
  },

  /**
   * Authenticates a customer with Email and Password.
   */
  async login(input: CustomerLoginInput) {
    const email = input.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      if (user && user.authProvider === 'GOOGLE') {
        throw new AppError('This account is registered via Google. Please use Google Sign-In.', 400);
      }
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        apartment: user.apartment,
        city: user.city,
        state: user.state,
        postalCode: user.postalCode,
        avatarUrl: user.avatarUrl,
        authProvider: user.authProvider,
      },
    };
  },

  /**
   * Authenticates / registers a customer using Google Sign-In.
   */
  async googleLogin(input: GoogleAuthInput) {
    const email = input.email.toLowerCase().trim();

    // Check if user exists by googleId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: input.googleId }, { email }],
      },
    });

    if (user) {
      // Update existing user with Google ID and latest avatar if missing
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: input.googleId,
          avatarUrl: user.avatarUrl || input.avatarUrl || null,
          authProvider: user.passwordHash ? user.authProvider : 'GOOGLE',
          // Preserve existing shipping info or fill if empty
          phone: user.phone || input.phone || null,
          address: user.address || input.address || null,
          city: user.city || input.city || null,
          state: user.state || input.state || null,
          postalCode: user.postalCode || input.postalCode || null,
        },
      });
    } else {
      // Create new Google customer user
      user = await prisma.user.create({
        data: {
          email,
          name: input.name.trim(),
          googleId: input.googleId,
          avatarUrl: input.avatarUrl || null,
          phone: input.phone || null,
          address: input.address || null,
          city: input.city || null,
          state: input.state || null,
          postalCode: input.postalCode || null,
          authProvider: 'GOOGLE',
        },
      });
    }

    const token = this.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        apartment: user.apartment,
        city: user.city,
        state: user.state,
        postalCode: user.postalCode,
        avatarUrl: user.avatarUrl,
        authProvider: user.authProvider,
      },
    };
  },

  /**
   * Retrieves profile of authenticated customer user.
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        apartment: true,
        city: true,
        state: true,
        postalCode: true,
        avatarUrl: true,
        authProvider: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('Customer profile not found', 404);
    }

    return user;
  },

  /**
   * Updates customer profile and saved shipping information.
   */
  async updateProfile(userId: string, input: UpdateCustomerProfileInput) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined && { name: input.name.trim() }),
        ...(input.phone !== undefined && { phone: input.phone.trim() || null }),
        ...(input.address !== undefined && { address: input.address.trim() || null }),
        ...(input.apartment !== undefined && { apartment: input.apartment.trim() || null }),
        ...(input.city !== undefined && { city: input.city.trim() || null }),
        ...(input.state !== undefined && { state: input.state.trim() || null }),
        ...(input.postalCode !== undefined && { postalCode: input.postalCode.trim() || null }),
        ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl.trim() || null }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        apartment: true,
        city: true,
        state: true,
        postalCode: true,
        avatarUrl: true,
        authProvider: true,
        updatedAt: true,
      },
    });

    return updated;
  },

  /**
   * Retrieves orders belonging to a customer (matched by userId or email).
   */
  async getCustomerOrders(userId: string, email: string) {
    return prisma.order.findMany({
      where: {
        OR: [
          { userId },
          { email: { equals: email, mode: 'insensitive' } },
        ],
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },
};
