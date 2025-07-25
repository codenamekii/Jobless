import { PrismaClient } from '@jobless/database';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create sample users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        password: 'password123', // In production, this should be hashed
        fullName: 'John Doe',
        profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        isActive: true,
        emailVerified: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        password: 'password123',
        fullName: 'Jane Smith',
        profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150',
        isActive: true,
        emailVerified: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'bob.wilson@example.com',
        password: 'password123',
        fullName: 'Bob Wilson',
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        isActive: true,
        emailVerified: false
      }
    })
  ]);

  console.log('✅ Created users:', users.length);

  // Create sample applications for John Doe
  const johnApplications = await Promise.all([
    prisma.application.create({
      data: {
        userId: users[0].id,
        companyName: 'TechCorp Indonesia',
        position: 'Senior Frontend Developer',
        jobType: 'FULL_TIME',
        location: 'Jakarta, Indonesia',
        salaryRange: 'Rp 15,000,000 - 25,000,000',
        jobDescription: 'We are looking for a Senior Frontend Developer to lead our React.js development team. You will be responsible for building scalable web applications and mentoring junior developers.',
        applicationMethod: 'LINKEDIN',
        applicationUrl: 'https://linkedin.com/jobs/techcorp-frontend',
        contactPerson: 'Sarah Johnson',
        contactEmail: 'sarah.johnson@techcorp.co.id',
        contactPhone: '+62-21-1234-5678',
        status: 'INTERVIEW_SCHEDULED',
        priority: 5,
        interviewDate: new Date('2025-07-30T10:00:00Z'),
        deadlineDate: new Date('2025-08-15T23:59:59Z'),
        notes: 'Great company culture, competitive salary. Technical interview scheduled with CTO.',
        tags: ['react', 'typescript', 'senior-level', 'high-priority']
      }
    }),
    prisma.application.create({
      data: {
        userId: users[0].id,
        companyName: 'StartupHub',
        position: 'Full Stack Developer',
        jobType: 'REMOTE',
        location: 'Remote',
        salaryRange: 'Rp 12,000,000 - 18,000,000',
        jobDescription: 'Join our fast-growing startup as a Full Stack Developer. Work with modern technologies like Next.js, Node.js, and PostgreSQL.',
        applicationMethod: 'WEBSITE',
        applicationUrl: 'https://startuphub.com/careers/fullstack',
        contactPerson: 'Mike Chen',
        contactEmail: 'mike@startuphub.com',
        status: 'APPLIED',
        priority: 4,
        deadlineDate: new Date('2025-08-10T23:59:59Z'),
        notes: 'Remote-first company, interesting product. Waiting for initial response.',
        tags: ['fullstack', 'startup', 'remote', 'nextjs']
      }
    }),
    prisma.application.create({
      data: {
        userId: users[0].id,
        companyName: 'Enterprise Solutions Ltd',
        position: 'Lead Developer',
        jobType: 'FULL_TIME',
        location: 'Surabaya, Indonesia',
        salaryRange: 'Rp 20,000,000 - 30,000,000',
        jobDescription: 'Lead a team of developers in building enterprise-grade applications using Java and Spring Boot.',
        applicationMethod: 'REFERRAL',
        contactPerson: 'David Kumar',
        contactEmail: 'david@enterprise-solutions.co.id',
        status: 'REJECTED',
        priority: 3,
        notes: 'Position required more Java experience than I have. Good feedback though.',
        tags: ['java', 'leadership', 'enterprise']
      }
    })
  ]);

  // Create sample applications for Jane Smith
  const janeApplications = await Promise.all([
    prisma.application.create({
      data: {
        userId: users[1].id,
        companyName: 'Creative Agency',
        position: 'UI/UX Designer',
        jobType: 'FULL_TIME',
        location: 'Bandung, Indonesia',
        salaryRange: 'Rp 8,000,000 - 15,000,000',
        jobDescription: 'We need a creative UI/UX Designer to design beautiful and intuitive user experiences for web and mobile applications.',
        applicationMethod: 'JOBSTREET',
        applicationUrl: 'https://jobstreet.com/creative-agency-uiux',
        contactPerson: 'Lisa Wong',
        contactEmail: 'lisa@creative-agency.com',
        status: 'OFFER_RECEIVED',
        priority: 5,
        notes: 'Great design team, offered competitive package. Considering the offer.',
        tags: ['design', 'ui/ux', 'creative', 'offer']
      }
    }),
    prisma.application.create({
      data: {
        userId: users[1].id,
        companyName: 'Digital Marketing Co',
        position: 'Product Designer',
        jobType: 'HYBRID',
        location: 'Jakarta, Indonesia',
        salaryRange: 'Rp 10,000,000 - 18,000,000',
        jobDescription: 'Product Designer role focusing on improving user experience for our digital marketing platform.',
        applicationMethod: 'INDEED',
        applicationUrl: 'https://indeed.com/digital-marketing-designer',
        status: 'INTERVIEWED',
        priority: 4,
        notes: 'Good interview, waiting for final decision. Team seems collaborative.',
        tags: ['product-design', 'saas', 'marketing']
      }
    })
  ]);

  // Create sample applications for Bob Wilson
  const bobApplications = await Promise.all([
    prisma.application.create({
      data: {
        userId: users[2].id,
        companyName: 'CloudTech Solutions',
        position: 'DevOps Engineer',
        jobType: 'FULL_TIME',
        location: 'Jakarta, Indonesia',
        salaryRange: 'Rp 18,000,000 - 28,000,000',
        jobDescription: 'Looking for a DevOps Engineer to manage cloud infrastructure and implement CI/CD pipelines.',
        applicationMethod: 'DIRECT',
        contactPerson: 'Alex Rahman',
        contactEmail: 'alex@cloudtech.co.id',
        status: 'TECHNICAL_TEST',
        priority: 5,
        notes: 'Technical test scheduled for next week. Focus on AWS and Kubernetes.',
        tags: ['devops', 'aws', 'kubernetes', 'technical-test']
      }
    })
  ]);

  const allApplications = [...johnApplications, ...janeApplications, ...bobApplications];
  console.log('✅ Created applications:', allApplications.length);

  // Create status history for applications
  const statusHistories = [];

  // John's TechCorp application history
  statusHistories.push(
    await prisma.applicationStatusHistory.create({
      data: {
        applicationId: johnApplications[0].id,
        toStatus: 'APPLIED',
        reason: 'Application submitted'
      }
    }),
    await prisma.applicationStatusHistory.create({
      data: {
        applicationId: johnApplications[0].id,
        fromStatus: 'APPLIED',
        toStatus: 'REVIEWING',
        reason: 'Application under review'
      }
    }),
    await prisma.applicationStatusHistory.create({
      data: {
        applicationId: johnApplications[0].id,
        fromStatus: 'REVIEWING',
        toStatus: 'INTERVIEW_SCHEDULED',
        reason: 'Interview scheduled with hiring manager'
      }
    })
  );

  // Jane's Creative Agency history
  statusHistories.push(
    await prisma.applicationStatusHistory.create({
      data: {
        applicationId: janeApplications[0].id,
        toStatus: 'APPLIED',
        reason: 'Application submitted'
      }
    }),
    await prisma.applicationStatusHistory.create({
      data: {
        applicationId: janeApplications[0].id,
        fromStatus: 'APPLIED',
        toStatus: 'INTERVIEWED',
        reason: 'Completed first round interview'
      }
    }),
    await prisma.applicationStatusHistory.create({
      data: {
        applicationId: janeApplications[0].id,
        fromStatus: 'INTERVIEWED',
        toStatus: 'OFFER_RECEIVED',
        reason: 'Job offer received'
      }
    })
  );

  console.log('✅ Created status histories:', statusHistories.length);

  // Create reminders
  const reminders = await Promise.all([
    prisma.reminder.create({
      data: {
        applicationId: johnApplications[0].id,
        title: 'Prepare for TechCorp Interview',
        description: 'Review React.js concepts and prepare portfolio demo',
        reminderDate: new Date('2025-07-29T09:00:00Z')
      }
    }),
    prisma.reminder.create({
      data: {
        applicationId: johnApplications[1].id,
        title: 'Follow up on StartupHub Application',
        description: 'Send follow-up email if no response by this date',
        reminderDate: new Date('2025-08-05T14:00:00Z')
      }
    }),
    prisma.reminder.create({
      data: {
        applicationId: janeApplications[0].id,
        title: 'Respond to Creative Agency Offer',
        description: 'Need to respond to job offer by deadline',
        reminderDate: new Date('2025-07-28T10:00:00Z')
      }
    }),
    prisma.reminder.create({
      data: {
        applicationId: bobApplications[0].id,
        title: 'CloudTech Technical Test',
        description: 'Complete DevOps technical assessment',
        reminderDate: new Date('2025-08-01T09:00:00Z')
      }
    })
  ]);

  console.log('✅ Created reminders:', reminders.length);

  // Create sample documents
  const documents = await Promise.all([
    prisma.document.create({
      data: {
        applicationId: johnApplications[0].id,
        documentType: 'RESUME',
        fileName: 'john_doe_resume_2025.pdf',
        originalName: 'John Doe - Senior Frontend Developer Resume.pdf',
        filePath: '/uploads/documents/john_doe_resume_2025.pdf',
        fileSize: 245760, // ~240KB
        mimeType: 'application/pdf'
      }
    }),
    prisma.document.create({
      data: {
        applicationId: johnApplications[0].id,
        documentType: 'COVER_LETTER',
        fileName: 'john_doe_cover_letter_techcorp.pdf',
        originalName: 'Cover Letter - TechCorp.pdf',
        filePath: '/uploads/documents/john_doe_cover_letter_techcorp.pdf',
        fileSize: 89120, // ~87KB
        mimeType: 'application/pdf'
      }
    }),
    prisma.document.create({
      data: {
        applicationId: johnApplications[0].id,
        documentType: 'PORTFOLIO',
        fileName: 'john_doe_portfolio_2025.pdf',
        originalName: 'John Doe - Portfolio 2025.pdf',
        filePath: '/uploads/documents/john_doe_portfolio_2025.pdf',
        fileSize: 1024000, // ~1MB
        mimeType: 'application/pdf'
      }
    }),
    prisma.document.create({
      data: {
        applicationId: janeApplications[0].id,
        documentType: 'RESUME',
        fileName: 'jane_smith_resume_2025.pdf',
        originalName: 'Jane Smith - UI UX Designer Resume.pdf',
        filePath: '/uploads/documents/jane_smith_resume_2025.pdf',
        fileSize: 189440, // ~185KB
        mimeType: 'application/pdf'
      }
    }),
    prisma.document.create({
      data: {
        applicationId: janeApplications[0].id,
        documentType: 'PORTFOLIO',
        fileName: 'jane_smith_portfolio.pdf',
        originalName: 'Jane Smith - Design Portfolio.pdf',
        filePath: '/uploads/documents/jane_smith_portfolio.pdf',
        fileSize: 2048000, // ~2MB
        mimeType: 'application/pdf'
      }
    }),
    prisma.document.create({
      data: {
        applicationId: bobApplications[0].id,
        documentType: 'RESUME',
        fileName: 'bob_wilson_resume_devops.pdf',
        originalName: 'Bob Wilson - DevOps Engineer Resume.pdf',
        filePath: '/uploads/documents/bob_wilson_resume_devops.pdf',
        fileSize: 156672, // ~153KB
        mimeType: 'application/pdf'
      }
    }),
    prisma.document.create({
      data: {
        applicationId: bobApplications[0].id,
        documentType: 'CERTIFICATE',
        fileName: 'bob_wilson_aws_cert.pdf',
        originalName: 'AWS Solutions Architect Certificate.pdf',
        filePath: '/uploads/documents/bob_wilson_aws_cert.pdf',
        fileSize: 512000, // ~500KB
        mimeType: 'application/pdf'
      }
    })
  ]);

  console.log('✅ Created documents:', documents.length);

  // Create some refresh tokens (for authentication testing)
  const refreshTokens = await Promise.all([
    prisma.refreshToken.create({
      data: {
        userId: users[0].id,
        token: 'refresh_token_john_doe_sample',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    }),
    prisma.refreshToken.create({
      data: {
        userId: users[1].id,
        token: 'refresh_token_jane_smith_sample',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    })
  ]);

  console.log('✅ Created refresh tokens:', refreshTokens.length);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Users: ${users.length}`);
  console.log(`- Applications: ${allApplications.length}`);
  console.log(`- Status Histories: ${statusHistories.length}`);
  console.log(`- Reminders: ${reminders.length}`);
  console.log(`- Documents: ${documents.length}`);
  console.log(`- Refresh Tokens: ${refreshTokens.length}`);

  console.log('\n👥 Sample Users:');
  users.forEach(user => {
    console.log(`- ${user.fullName} (${user.email}) - ${user.emailVerified ? 'Verified' : 'Unverified'}`);
  });

  console.log('\n📝 Sample Applications by Status:');
  const statusCount = allApplications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(statusCount).forEach(([status, count]) => {
    console.log(`- ${status}: ${count}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });