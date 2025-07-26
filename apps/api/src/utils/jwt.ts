import type { User } from '@prisma/client';
import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  fullName: string;
}

interface RefreshTokenPayload extends TokenPayload {
  tokenId: string;
}

const JWT_SECRET = process.env.JWT_SECRET as jwt.Secret;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as jwt.Secret;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export const generateTokens = (user: User, refreshTokenId: string) => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    fullName: user.fullName
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });

  const refreshPayload: RefreshTokenPayload = {
    ...payload,
    tokenId: refreshTokenId
  };

  const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN
  });

  return {
    accessToken,
    refreshToken
  };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
};

export const decodeToken = (token: string) => {
  return jwt.decode(token);
};