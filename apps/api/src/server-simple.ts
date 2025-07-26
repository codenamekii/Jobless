import cors from '@fastify/cors';
import { PrismaClient } from '@jobless/database';
import 'dotenv/config';
import Fastify from 'fastify';
import { authenticate } from './middleware/auth';
import { authRoutes } from './routes/auth';

// Initialize Fastify
const fastify = Fastify({
  logger: true
});

// Initialize Prisma
const prisma = new PrismaClient();

const PORT = Number(process.env.PORT) || 3001;

// Register plugins
async function registerPlugins() {
  // CORS plugin
  await fastify.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  });

  // Add Prisma to Fastify context
  fastify.decorate('prisma', prisma);
}

// Declare the Prisma instance on Fastify
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

// Routes
async function registerRoutes() {
  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'Connected',
      environment: process.env.NODE_ENV || 'development'
    };
  });

  // Auth routes
  await fastify.register(authRoutes, { prefix: '/api/auth' });

  // Protected applications route
  fastify.get('/api/applications', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const applications = await fastify.prisma.application.findMany({
        where: {
          userId: request.user!.userId
        },
        include: {
          documents: true,
          reminders: {
            where: {
              isCompleted: false,
              reminderDate: {
                gte: new Date()
              }
            },
            orderBy: {
              reminderDate: 'asc'
            },
            take: 1
          },
          _count: {
            select: {
              statusHistory: true
            }
          }
        },
        orderBy: { applicationDate: 'desc' }
      });

      return {
        success: true,
        data: applications,
        total: applications.length
      };
    } catch (error) {
      fastify.log.error('Error fetching applications:', error);
      reply.code(500);
      return {
        success: false,
        error: 'Failed to fetch applications'
      };
    }
  });

  // Create application (protected)
  fastify.post('/api/applications', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const { companyName, position, ...otherData } = request.body as any;

      const application = await fastify.prisma.application.create({
        data: {
          userId: request.user!.userId,
          companyName,
          position,
          ...otherData
        },
        include: {
          documents: true,
          reminders: true
        }
      });

      // Create initial status history
      await fastify.prisma.applicationStatusHistory.create({
        data: {
          applicationId: application.id,
          toStatus: application.status,
          reason: 'Initial application'
        }
      });

      reply.code(201);
      return {
        success: true,
        data: application
      };
    } catch (error) {
      fastify.log.error('Error creating application:', error);
      reply.code(500);
      return {
        success: false,
        error: 'Failed to create application'
      };
    }
  });

  // Get single application (protected)
  fastify.get('/api/applications/:id', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const { id } = request.params as any;

      const application = await fastify.prisma.application.findFirst({
        where: {
          id,
          userId: request.user!.userId
        },
        include: {
          documents: true,
          statusHistory: {
            orderBy: {
              changedAt: 'desc'
            }
          },
          reminders: {
            orderBy: {
              reminderDate: 'asc'
            }
          }
        }
      });

      if (!application) {
        return reply.code(404).send({
          success: false,
          error: 'Application not found'
        });
      }

      return {
        success: true,
        data: application
      };
    } catch (error) {
      fastify.log.error('Error fetching application:', error);
      reply.code(500);
      return {
        success: false,
        error: 'Failed to fetch application'
      };
    }
  });

  // Dashboard stats (protected)
  fastify.get('/api/dashboard/stats', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user!.userId;

      const [totalApplications, statusCounts, recentApplications] = await Promise.all([
        // Total applications
        fastify.prisma.application.count({
          where: { userId }
        }),
        // Applications by status
        fastify.prisma.application.groupBy({
          by: ['status'],
          where: { userId },
          _count: true
        }),
        // Recent applications
        fastify.prisma.application.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            companyName: true,
            position: true,
            status: true,
            applicationDate: true
          }
        })
      ]);

      return {
        success: true,
        data: {
          totalApplications,
          statusCounts: statusCounts.map(item => ({
            status: item.status,
            count: item._count
          })),
          recentApplications
        }
      };
    } catch (error) {
      fastify.log.error('Error fetching dashboard stats:', error);
      reply.code(500);
      return {
        success: false,
        error: 'Failed to fetch dashboard stats'
      };
    }
  });

  // 404 handler
  fastify.setNotFoundHandler(async (request, reply) => {
    reply.code(404);
    return {
      success: false,
      error: 'Route not found'
    };
  });
}

// Error handler
fastify.setErrorHandler(async (error, request, reply) => {
  fastify.log.error('Unhandled error:', error);
  reply.code(500);
  return {
    success: false,
    error: 'Internal server error'
  };
});

// Graceful shutdown
async function gracefulShutdown() {
  console.log('Shutting down server...');
  await fastify.prisma.$disconnect();
  await fastify.close();
  process.exit(0);
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Start server
async function start() {
  try {
    // Check required environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET'
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    // Register plugins and routes
    await registerPlugins();
    await registerRoutes();

    // Start the server
    await fastify.listen({
      port: PORT,
      host: '0.0.0.0'
    });

    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth endpoints ready at: http://localhost:${PORT}/api/auth`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

// Initialize the server
start();

export default fastify;