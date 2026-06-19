const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ── FREEZER CRUD ──────────────────────────────────────

const getAllFreezer = async (req, res) => {
  try {
    const data = await prisma.freezer.findMany({
      where: { isActive: true },
      orderBy: { nama: 'asc' },
      include: {
        stokFreezer: {
          include: { rasaKopi: true }
        }
      }
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const createFreezer = async (req, res) => {
  const { nama, lokasi } = req.body
  if (!nama) return res.status(400).json({ message: 'Nama freezer wajib diisi' })
  try {
    const data = await prisma.freezer.create({ data: { nama, lokasi } })
    res.status(201).json({ message: 'Freezer berhasil ditambahkan', data })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const updateFreezer = async (req, res) => {
  const { id } = req.params
  const { nama, lokasi } = req.body
  try {
    const data = await prisma.freezer.update({ where: { id }, data: { nama, lokasi } })
    res.json({ message: 'Freezer berhasil diupdate', data })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const deleteFreezer = async (req, res) => {
  const { id } = req.params
  try {
    await prisma.freezer.update({ where: { id }, data: { isActive: false } })
    res.json({ message: 'Freezer berhasil dihapus' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── MASUKKAN BOTOL KE FREEZER (dari produksi) ─────────

const masukkanKeFreezer = async (req, res) => {
  const { freezerId, rasaKopiId, jumlah, produksiId, keterangan } = req.body
  if (!freezerId || !rasaKopiId || !jumlah) {
    return res.status(400).json({ message: 'Freezer, rasa, dan jumlah wajib diisi' })
  }
  try {
    await prisma.$transaction(async (tx) => {
      // Update atau buat stok freezer
      await tx.stokFreezerV2.upsert({
        where: { freezerId_rasaKopiId: { freezerId, rasaKopiId } },
        update: { jumlah: { increment: Number(jumlah) } },
        create: { freezerId, rasaKopiId, jumlah: Number(jumlah) }
      })

      // Catat mutasi
      await tx.mutasiFreezer.create({
        data: {
          freezerId,
          rasaKopiId,
          jenis: 'MASUK_PRODUKSI',
          jumlah: Number(jumlah),
          keterangan,
          produksiId: produksiId || null,
          createdById: req.user.id
        }
      })
    })

    res.status(201).json({ message: 'Botol berhasil dimasukkan ke freezer' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── KIRIM KE KOPERASI (stok freezer berkurang) ────────

const keluarKeFreezer = async (req, res) => {
  const { freezerId, rasaKopiId, jumlah, keterangan } = req.body
  if (!freezerId || !rasaKopiId || !jumlah) {
    return res.status(400).json({ message: 'Freezer, rasa, dan jumlah wajib diisi' })
  }
  try {
    const stok = await prisma.stokFreezerV2.findUnique({
      where: { freezerId_rasaKopiId: { freezerId, rasaKopiId } }
    })

    if (!stok || stok.jumlah < Number(jumlah)) {
      return res.status(400).json({ message: 'Stok tidak cukup di freezer ini' })
    }

    await prisma.$transaction(async (tx) => {
      await tx.stokFreezerV2.update({
        where: { freezerId_rasaKopiId: { freezerId, rasaKopiId } },
        data: { jumlah: { decrement: Number(jumlah) } }
      })

      await tx.mutasiFreezer.create({
        data: {
          freezerId,
          rasaKopiId,
          jenis: 'KELUAR_KOPERASI',
          jumlah: Number(jumlah),
          keterangan,
          createdById: req.user.id
        }
      })
    })

    res.json({ message: 'Botol berhasil dikeluarkan dari freezer' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── PINDAH ANTAR FREEZER ──────────────────────────────

const pindahFreezer = async (req, res) => {
  const { freezerDariId, freezerTujuanId, rasaKopiId, jumlah, keterangan } = req.body
  if (!freezerDariId || !freezerTujuanId || !rasaKopiId || !jumlah) {
    return res.status(400).json({ message: 'Semua field wajib diisi' })
  }
  if (freezerDariId === freezerTujuanId) {
    return res.status(400).json({ message: 'Freezer asal dan tujuan tidak boleh sama' })
  }

  try {
    const stok = await prisma.stokFreezerV2.findUnique({
      where: { freezerId_rasaKopiId: { freezerId: freezerDariId, rasaKopiId } }
    })

    if (!stok || stok.jumlah < Number(jumlah)) {
      return res.status(400).json({ message: 'Stok tidak cukup di freezer asal' })
    }

    await prisma.$transaction(async (tx) => {
      // Kurangi stok freezer asal
      await tx.stokFreezerV2.update({
        where: { freezerId_rasaKopiId: { freezerId: freezerDariId, rasaKopiId } },
        data: { jumlah: { decrement: Number(jumlah) } }
      })

      // Tambah stok freezer tujuan
      await tx.stokFreezerV2.upsert({
        where: { freezerId_rasaKopiId: { freezerId: freezerTujuanId, rasaKopiId } },
        update: { jumlah: { increment: Number(jumlah) } },
        create: { freezerId: freezerTujuanId, rasaKopiId, jumlah: Number(jumlah) }
      })

      // Catat mutasi keluar
      await tx.mutasiFreezer.create({
        data: {
          freezerId: freezerDariId,
          freezerTujuanId,
          rasaKopiId,
          jenis: 'PINDAH_KELUAR',
          jumlah: Number(jumlah),
          keterangan,
          createdById: req.user.id
        }
      })

      // Catat mutasi masuk
      await tx.mutasiFreezer.create({
        data: {
          freezerId: freezerTujuanId,
          freezerTujuanId: freezerDariId,
          rasaKopiId,
          jenis: 'PINDAH_MASUK',
          jumlah: Number(jumlah),
          keterangan,
          createdById: req.user.id
        }
      })
    })

    res.json({ message: 'Botol berhasil dipindahkan' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── RIWAYAT MUTASI ────────────────────────────────────

const getMutasi = async (req, res) => {
  const { freezerId } = req.query
  try {
    const data = await prisma.mutasiFreezer.findMany({
      where: freezerId ? { freezerId } : {},
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        freezer: true,
        freezerTujuan: true,
        rasaKopi: true,
        createdBy: { select: { name: true } }
      }
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = {
  getAllFreezer, createFreezer, updateFreezer, deleteFreezer,
  masukkanKeFreezer, keluarKeFreezer, pindahFreezer, getMutasi
}