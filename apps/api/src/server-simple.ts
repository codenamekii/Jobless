import cors from '@fastify/cors';
import { PrismaClient } from '@jobless/database';
import 'dotenv/config';
import Fastify from 'fastify';

// Initialize Fastify with simple logger
const fastify = Fastify({
  logger: true // Simple logger tanpa pino-pretty
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
      database: 'Connected'
    };
  });

  // Basic applications route
  fastify.get('/api/applications', async (request, reply) => {
    try {
      const applications = await fastify.prisma.application.findMany({
        include: {
          user: {
            select: { id: true, fullName: true, email: true }
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

  // Create application
  fastify.post('/api/applications', async (request, reply) => {
    try {
      const { userId, companyName, position, ...otherData } = request.body as any;

      const application = await fastify.prisma.application.create({
        data: {
          userId,
          companyName,
          position,
          ...otherData
        },
        include: {
          user: {
            select: { id: true, fullName: true, email: true }
          }
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

  // Users route
  fastify.get('/api/users', async (request, reply) => {
    try {
      const users = await fastify.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          fullName: true,
          profilePicture: true,
          isActive: true,
          createdAt: true
        }
      });

      return {
        success: true,
        data: users,
        total: users.length
      };
    } catch (error) {
      fastify.log.error('Error fetching users:', error);
      reply.code(500);
      return {
        success: false,
        error: 'Failed to fetch users'
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
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

// Initialize the server
start();

export default fastify;