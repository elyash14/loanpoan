const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists');
    return;
  }

  await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      gender: 'MAN',
      password: bcrypt.hashSync(
        process.env.ADMIN_PASSWORD || 'admin123',
        10
      ),
      role: 'ADMIN',
      createdAt: new Date(),
    },
  });

  console.log('🚀 Admin user seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
