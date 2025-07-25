import cors from '@fastify/cors';
import { PrismaClient } from '@jobless/database';
import Fastify from 'fastify';

// Initialize Fastify
const fastify = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  }
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

  // ================================
  // USER ROUTES
  // ================================

  // Get all users
  fastify.get('/api/users', async (request, reply) => {
    try {
      const users = await fastify.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          fullName: true,
          profilePicture: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          _count: {
            select: { applications: true }
          }
        },
        orderBy: { createdAt: 'desc' }
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

  // Create new user
  fastify.post('/api/users', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password', 'fullName'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          fullName: { type: 'string' },
          profilePicture: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { email, password, fullName, profilePicture } = request.body as any;

      // Check if user already exists
      const existingUser = await fastify.prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        reply.code(400);
        return {
          success: false,
          error: 'User with this email already exists'
        };
      }

      const user = await fastify.prisma.user.create({
        data: {
          email,
          password, // In production, hash this password!
          fullName,
          profilePicture
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          profilePicture: true,
          isActive: true,
          emailVerified: true,
          createdAt: true
        }
      });

      reply.code(201);
      return {
        success: true,
        data: user
      };
    } catch (error) {
      fastify.log.error('Error creating user:', error);
      reply.code(500);
      return {
        success: false,
        error: 'Failed to create user'
      };
    }
  });

  // ================================
  // APPLICATION ROUTES
  // ================================

  // Get all applications
  fastify.get('/api/applications', async (request, reply) => {
    try {
      const { userId, status, priority } = request.query as any;

      const whereClause: any = {};
      if (userId) whereClause.userId = userId;
      if (status) whereClause.status = status;
      if (priority) whereClause.priority = parseInt(priority);

      const applications = await fastify.prisma.application.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, fullName: true, email: true }
          },
          documents: true,
          statusHistory: {
            orderBy: { changedAt: 'desc' },
            take: 1
          },
          reminders: {
            where: { isCompleted: false },
            orderBy: { reminderDate: 'asc' }
          },
          _count: {
            select: {
              documents: true,
              statusHistory: true,
              reminders: true
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

  // Create new application
  fastify.post('/api/applications', {
    schema: {
      body: {
        type: 'object',
        required: ['userId', 'companyName', 'position'],
        properties: {
          userId: { type: 'string' },
          companyName: { type: 'string' },
          position: { type: 'string' },
          jobType: {
            type: 'string',
            enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP', 'REMOTE', 'HYBRID']
          },
          location: { type: 'string' },
          salaryRange: { type: 'string' },
          jobDescription: { type: 'string' },
          applicationMethod: {
            type: 'string',
            enum: ['WEBSITE', 'EMAIL', 'LINKEDIN', 'JOBSTREET', 'INDEED', 'REFERRAL', 'DIRECT', 'OTHER']
          },
          applicationUrl: { type: 'string' },
          contactPerson: { type: 'string' },
          contactEmail: { type: 'string' },
          contactPhone: { type: 'string' },
          priority: { type: 'integer', minimum: 1, maximum: 5 },
          interviewDate: { type: 'string', format: 'date-time' },
          deadlineDate: { type: 'string', format: 'date-time' },
          notes: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const data = request.body as any;

      const application = await fastify.prisma.application.create({
        data: {
          ...data,
          interviewDate: data.interviewDate ? new Date(data.interviewDate) : null,
          deadlineDate: data.deadlineDate ? new Date(data.deadlineDate) : null,
          tags: data.tags || []
        },
        include: {
          user: {
            select: { id: true, fullName: true, email: true }
          }
        }
      });

      // Create initial status history
      await fastify.prisma.applicationStatusHistory.create({
        data: {
          applicationId: application.id,
          toStatus: 'APPLIED',
          reason: 'Application created'
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

  // Get single application
  fastify.get('/api/applications/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const application = await fastify.prisma.application.findUnique({
        where: { id },
        include: {
          user: {
            select: { id: true, fullName: true, email: true }
          },
          documents: true,
          statusHistory: {
            orderBy: { changedAt: 'desc' }
          },
          reminders: {
            orderBy: { reminderDate: 'asc' }
          }
        }
      });

      if (!application) {
        reply.code(404);
        return {
          success: false,
          error: 'Application not found'
        };
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

  // Update application
  fastify.patch('/api/applications/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          companyName: { type: 'string' },
          position: { type: 'string' },
          jobType: {
            type: 'string',
            enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP', 'REMOTE', 'HYBRID']
          },
          location: { type: 'string' },
          salaryRange: { type: 'string' },
          jobDescription: { type: 'string' },
          applicationMethod: {
            type: 'string',
            enum: ['WEBSITE', 'EMAIL', 'LINKEDIN', 'JOBSTREET', 'INDEED', 'REFERRAL', 'DIRECT', 'OTHER']
          },
          applicationUrl: { type: 'string' },
          contactPerson: { type: 'string' },
          contactEmail: { type: 'string' },
          contactPhone: { type: 'string' },
          status: {
            type: 'string',
            enum: ['DRAFT', 'APPLIED', 'REVIEWING', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'TECHNICAL_TEST', 'REFERENCE_CHECK', 'OFFER_RECEIVED', 'NEGOTIATING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'ON_HOLD']
          },
          priority: { type: 'integer', minimum: 1, maximum: 5 },
          interviewDate: { type: 'string', format: 'date-time' },
          deadlineDate: { type: 'string', format: 'date-time' },
          notes: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const updateData = request.body as any;

      // Get current application to track status changes
      const currentApp = await fastify.prisma.application.findUnique({
        where: { id }
      });

      if (!currentApp) {
        reply.code(404);
        return {
          success: false,
          error: 'Application not found'
        };
      }

      // Prepare update data
      const data: any = { ...updateData };
      if (data.interviewDate) data.interviewDate = new Date(data.interviewDate);
      if (data.deadlineDate) data.deadlineDate = new Date(data.deadlineDate);

      const application = await fastify.prisma.application.update({
        where: { id },
        data,
        include: {
          user: {
            select: { id: true, fullName: true, email: true }
          }
        }
      });

      // Track status change
      if (updateData.status && updateData.status !== currentApp.status) {
        await fastify.prisma.applicationStatusHistory.create({
          data: {
            applicationId: id,
            fromStatus: currentApp.status,
            toStatus: updateData.status,
            reason: 'Status updated via API'
          }
        });
      }

      return {
        success: true,
        data: application
      };
    } catch (error) {
      fastify.log.error('Error updating application:', error);
      reply.code(500);
      return {
        success: false,
        error: 'Failed to update application'
      };
    }
  });

  // Delete application
  fastify.delete('/api/applications/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      await fastify.prisma.application.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Application deleted successfully'
      };
    } catch (error) {
      fastify.log.error('Error deleting application:', error);
      reply.code(500);
      return {
        success: false,
        error: 'Failed to delete application'
      };
    }
  });

  // ================================
  // REMINDER ROUTES
  // ================================

  // Get reminders for user
  fastify.get('/api/reminders', async (request, reply) => {
    try {
      const { userId, isCompleted } = request.query as any;

      const whereClause: any = {};
      if (userId) {
        whereClause.application = { userId };
      }
      if (isCompleted !== undefined) {
        whereClause.isCompleted = isCompleted === 'true';
      }

      const reminders = await fastify.prisma.reminder.findMany({
        where: whereClause,
        include: {
          application: {
            select: {
              id: true,
              companyName: true,
              position: true,
              status: true
            }
          }
        },
        orderBy: { reminderDate: 'asc' }
      });

      return {
        success: true,
        data: reminders,
        total: reminders.length
      };
    } catch (error) {
      fastify.log.error('Error fetching reminders:', error);
      reply.code(500);
      return {
        success: false,
        error: 'Failed to fetch reminders'
      };
    }
  });

  // Create reminder
  fastify.post('/api/reminders', {
    schema: {
      body: {
        type: 'object',
        required: ['applicationId', 'title', 'reminderDate'],
        properties: {
          applicationId: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          reminderDate: { type: 'string', format: 'date-time' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { applicationId, title, description, reminderDate } = request.body as any;

      const reminder = await fastify.prisma.reminder.create({
        data: {
          applicationId,
          title,
          description,
          reminderDate: new Date(reminderDate)
        },
        include: {
          application: {
            select: {
              id: true,
              companyName: true,
              position: true
            }
          }
        }
      });

      reply.code(201);
      return {
        success: true,
        data: reminder
      };
    } catch (error) {
      fastify.log.error('Error creating reminder:', error);
      reply.code(500);
      return {
        success: false,
        error: 'Failed to create reminder'
      };
    }
  });

  // ================================
  // ANALYTICS ROUTES
  // ================================

  // Dashboard stats
  fastify.get('/api/dashboard/stats/:userId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string' }
        },
        required: ['userId']
      }
    }
  }, async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };

      const [
        totalApplications,
        applicationsByStatus,
        recentApplications,
        upcomingReminders
      ] = await Promise.all([
        // Total applications count
        fastify.prisma.application.count({
          where: { userId }
        }),

        // Applications by status
        fastify.prisma.application.groupBy({
          by: ['status'],
          where: { userId },
          _count: { status: true }
        }),

        // Recent applications (last 7 days)
        fastify.prisma.application.count({
          where: {
            userId,
            applicationDate: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),

        // Upcoming reminders
        fastify.prisma.reminder.count({
          where: {
            application: { userId },
            isCompleted: false,
            reminderDate: {
              gte: new Date(),
              lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      return {
        success: true,
        data: {
          totalApplications,
          applicationsByStatus: applicationsByStatus.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
          }, {} as Record<string, number>),
          recentApplications,
          upcomingReminders
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
  fastify.log.info('Shutting down server...');
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

    fastify.log.info(`🚀 Server running on http://localhost:${PORT}`);
    fastify.log.info(`📊 Health check: http://localhost:${PORT}/health`);
  } catch (err) {
    fastify.log.error('Error starting server:', err);
    process.exit(1);
  }
}

// Initialize the server
start();

export default fastify;