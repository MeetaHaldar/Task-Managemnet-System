import 'dotenv/config';
import { PrismaClient } from '.prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPw = await bcrypt.hash('Password1!', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@taskflow.dev' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@taskflow.dev',
      password: hashedPw,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: 'Design the new landing page',
        description: 'Create wireframes and mockups for the Q4 redesign',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        userId: user.id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Write API documentation',
        description: 'Document all endpoints using OpenAPI spec',
        status: 'PENDING',
        priority: 'MEDIUM',
        userId: user.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment',
        status: 'PENDING',
        priority: 'HIGH',
        userId: user.id,
      },
      {
        title: 'Quarterly review presentation',
        description: 'Prepare slides for the Q3 performance review',
        status: 'COMPLETED',
        priority: 'HIGH',
        userId: user.id,
      },
      {
        title: 'Update dependencies',
        description: 'Run npm audit and update outdated packages',
        status: 'PENDING',
        priority: 'LOW',
        userId: user.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seeding complete!');
  console.log('   Demo login → demo@taskflow.dev / Password1!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
