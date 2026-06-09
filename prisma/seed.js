const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // 1. Buat admin
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

  // 2. Buat jenis kopi
  const jenisKopiList = [
    'Kopi Gula Aren',
    'Kopi Hazelnut',
    'Kopi Vanila',
    'Kopi Salted Caramel',
    'Kopi Americano',
    'Kopi Matcha',
    'Kopi Taro',
    'Kopi Coklat',
  ]
  for (const nama of jenisKopiList) {
    await prisma.jenisKopi.upsert({
      where: { nama },
      update: {},
      create: { nama }
    })
  }
  console.log('Jenis kopi berhasil dibuat')
}

main().catch(console.error).finally(() => prisma.$disconnect());