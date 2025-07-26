import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import { addDays } from 'date-fns';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { comparePassword, hashPassword } from '../utils/password';

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  constructor(private prisma: PrismaClient) { }

  async register(data: RegisterData) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName
      }
    });

    // Generate tokens
    const refreshTokenId = randomBytes(32).toString('hex');
    const { accessToken, refreshToken } = generateTokens(user, refreshTokenId);

    // Save refresh token
    await this.prisma.refreshToken.create({
      data: {
        id: refreshTokenId,
        token: refreshToken,
        userId: user.id,
        expiresAt: addDays(new Date(), 7)
      }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        emailVerified: user.emailVerified
      },
      accessToken,
      refreshToken
    };
  }

  async login(data: LoginData) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Generate tokens
    const refreshTokenId = randomBytes(32).toString('hex');
    const { accessToken, refreshToken } = generateTokens(user, refreshTokenId);

    // Save refresh token
    await this.prisma.refreshToken.create({
      data: {
        id: refreshTokenId,
        token: refreshToken,
        userId: user.id,
        expiresAt: addDays(new Date(), 7)
      }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        emailVerified: user.emailVerified
      },
      accessToken,
      refreshToken
    };
  }

  async refreshToken(token: string) {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(token);

      // Find refresh token in database
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { id: payload.tokenId },
        include: { user: true }
      });

      if (!storedToken || storedToken.token !== token) {
        throw new Error('Invalid refresh token');
      }

      // Check if token is expired
      if (storedToken.expiresAt < new Date()) {
        throw new Error('Refresh token expired');
      }

      // Check if user is active
      if (!storedToken.user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Delete old refresh token
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id }
      });

      // Generate new tokens
      const newRefreshTokenId = randomBytes(32).toString('hex');
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(
        storedToken.user,
        newRefreshTokenId
      );

      // Save new refresh token
      await this.prisma.refreshToken.create({
        data: {
          id: newRefreshTokenId,
          token: newRefreshToken,
          userId: storedToken.user.id,
          expiresAt: addDays(new Date(), 7)
        }
      });

      return {
        user: {
          id: storedToken.user.id,
          email: storedToken.user.email,
          fullName: storedToken.user.fullName,
          profilePicture: storedToken.user.profilePicture,
          emailVerified: storedToken.user.emailVerified
        },
        accessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken);
        await this.prisma.refreshToken.delete({
          where: { id: payload.tokenId }
        });
      } catch (error) {
        // Ignore error, token might be invalid
      }
    } else {
      // Logout from all devices
      await this.prisma.refreshToken.deleteMany({
        where: { userId }
      });
    }
  }

  async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      profilePicture: user.profilePicture,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt
    };
  }
}