import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 1. Admin
  const hash = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@kopibotolan.com' },
    update: {},
    create: { name: 'Admin Pusat', email: 'admin@kopibotolan.com', passwordHash: hash, role: 'ADMIN' }
  })
  console.log('Admin berhasil dibuat')

  // 2. Joandi
  const hashJoandi = await bcrypt.hash('123456', 10)
  await prisma.user.upsert({
    where: { email: 'joandizakaria@gmail.com' },
    update: {},
    create: { name: 'Joandi Zakaria', email: 'joandizakaria@gmail.com', passwordHash: hashJoandi, role: 'ADMIN' }
  })
  console.log('Joandi berhasil dibuat')

  // 3. King
  const hashKing = await bcrypt.hash('123456', 10)
  await prisma.user.upsert({
    where: { email: 'kinghasbi898@gmail.com' },
    update: {},
    create: { name: 'Muhammad King Hasbi Adiwangsa', email: 'kinghasbi898@gmail.com', passwordHash: hashKing, role: 'ADMIN' }
  })
  console.log('King berhasil dibuat')

  // 4. Dinda
  const hashDinda = await bcrypt.hash('123456', 10)
  await prisma.user.upsert({
    where: { email: 'dindanurikhwani@gmail.com' },
    update: {},
    create: { name: 'Dinda Nur Ikhwani', email: 'dindanurikhwani@gmail.com', passwordHash: hashDinda, role: 'ADMIN' }
  })
  console.log('Dinda berhasil dibuat')

  // 5. Manajer
  const hashManajer = await bcrypt.hash('123456', 10)
  await prisma.user.upsert({
    where: { email: 'manajemenbns@gmail.com' },
    update: {},
    create: { name: 'Manajemen', email: 'manajemenbns@gmail.com', passwordHash: hashManajer, role: 'MANAJER' }
  })
  console.log('Manajer berhasil dibuat')

  // 6. Jenis kopi
  const jenisKopiList = [
    'Kopi Gula Aren', 'Kopi Hazelnut', 'Kopi Vanila',
    'Kopi Salted Caramel', 'Kopi Americano', 'Kopi Matcha',
    'Kopi Taro', 'Kopi Coklat',
  ]
  for (const nama of jenisKopiList) {
    await prisma.jenisKopi.upsert({ where: { nama }, update: {}, create: { nama } })
  }
  console.log('Jenis kopi berhasil dibuat')

  // 7. Freezer
  const freezerList = ['Freezer 1', 'Freezer 2', 'Freezer 3']
  for (const nama of freezerList) {
    await prisma.freezer.upsert({ where: { nama }, update: {}, create: { nama } })
  }
  console.log('Freezer berhasil dibuat')

  // 8. Pemilik
  const pemilikList = [
  { nama: 'Pemilik 1', persentase: 40, persentaseKoperasi: 40, persentasePos: 33.4 },
  { nama: 'Pemilik 2', persentase: 40, persentaseKoperasi: 40, persentasePos: 33.3 },
  { nama: 'Pemilik 3', persentase: 20, persentaseKoperasi: 20, persentasePos: 33.3 },
]
for (const p of pemilikList) {
  const exist = await prisma.pemilik.findFirst({ where: { nama: p.nama } })
  if (!exist) {
    await prisma.pemilik.create({
      data: {
        nama: p.nama,
        persentase: p.persentase,
        persentaseKoperasi: p.persentaseKoperasi,
        persentasePos: p.persentasePos
      }
    })
  } else {
    await prisma.pemilik.update({
      where: { id: exist.id },
      data: {
        persentaseKoperasi: p.persentaseKoperasi,
        persentasePos: p.persentasePos
      }
    })
  }
}
}

main().catch(console.error).finally(() => prisma.$disconnect())