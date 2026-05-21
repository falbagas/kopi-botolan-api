const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@kopibotolan.com' },
    update: {},
    create: {
      name: 'Admin Pusat',
      email: 'admin@kopibotolan.com',
      passwordHash: hash,
      role: 'ADMIN',
    }
  });
  console.log('Admin berhasil dibuat:', user.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());