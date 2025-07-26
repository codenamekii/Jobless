// apps/api/src/routes/auth/index.ts
import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth';
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema
} from '../../schemas/auth.schema';
import { AuthService } from '../../services/auth.service';

export async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService(fastify.prisma);

  // Register endpoint
  fastify.post('/register', {
    schema: {
      body: registerSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    fullName: { type: 'string' },
                    profilePicture: { type: ['string', 'null'] },
                    emailVerified: { type: 'boolean' }
                  }
                },
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const result = await authService.register(request.body as any);

      reply.code(201).send({
        success: true,
        data: result
      });
    } catch (error: any) {
      if (error.message === 'User already exists') {
        return reply.code(409).send({
          success: false,
          error: 'User already exists'
        });
      }

      fastify.log.error('Register error:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to register user'
      });
    }
  });

  // Login endpoint
  fastify.post('/login', {
    schema: {
      body: loginSchema
    }
  }, async (request, reply) => {
    try {
      const result = await authService.login(request.body as any);

      reply.send({
        success: true,
        data: result
      });
    } catch (error: any) {
      if (error.message === 'Invalid credentials' ||
        error.message === 'Account is deactivated') {
        return reply.code(401).send({
          success: false,
          error: error.message
        });
      }

      fastify.log.error('Login error:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to login'
      });
    }
  });

  // Refresh token endpoint
  fastify.post('/refresh', {
    schema: {
      body: refreshTokenSchema
    }
  }, async (request, reply) => {
    try {
      const { refreshToken } = request.body as any;
      const result = await authService.refreshToken(refreshToken);

      reply.send({
        success: true,
        data: result
      });
    } catch (error: any) {
      return reply.code(401).send({
        success: false,
        error: 'Invalid refresh token'
      });
    }
  });

  // Logout endpoint
  fastify.post('/logout', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const refreshToken = (request.body as any)?.refreshToken;
      await authService.logout(request.user!.userId, refreshToken);

      reply.send({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      fastify.log.error('Logout error:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to logout'
      });
    }
  });

  // Get current user endpoint
  fastify.get('/me', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const user = await authService.getUser(request.user!.userId);

      reply.send({
        success: true,
        data: user
      });
    } catch (error: any) {
      if (error.message === 'User not found') {
        return reply.code(404).send({
          success: false,
          error: 'User not found'
        });
      }

      fastify.log.error('Get user error:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to get user'
      });
    }
  });
}