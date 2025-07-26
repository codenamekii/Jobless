import { FastifyReply, FastifyRequest } from 'fastify';
import { getUserFromToken } from '../utils/auth';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      email: string;
      fullName: string;
    };
  }
}

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const user = getUserFromToken(request);

    if (!user) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized'
      });
    }

    // Attach user to request
    request.user = user;
  } catch (error) {
    return reply.code(401).send({
      success: false,
      error: 'Invalid token'
    });
  }
};

export const optionalAuth = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const user = getUserFromToken(request);
    if (user) {
      request.user = user;
    }
  } catch (error) {
    // Ignore error, user is optional
  }
};