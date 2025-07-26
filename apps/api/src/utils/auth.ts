import { FastifyRequest } from 'fastify';
import { verifyAccessToken } from './jwt';

export const extractToken = (request: FastifyRequest): string | null => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return null;
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    return null;
  }

  return token;
};

export const getUserFromToken = (request: FastifyRequest) => {
  const token = extractToken(request);

  if (!token) {
    return null;
  }

  try {
    return verifyAccessToken(token);
  } catch (error) {
    return null;
  }
};