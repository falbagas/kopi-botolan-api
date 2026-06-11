const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ── RASA KOPI ─────────────────────────────────────────

const getAllRasa = async (req, res) => {
  try {
    const data = await prisma.rasaKopi.findMany({
      where: { isActive: true },
      orderBy: { nama: 'asc' }
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const createRasa = async (req, res) => {
  const { nama } = req.body
  if (!nama) return res.status(400).json({ message: 'Nama rasa wajib diisi' })
  try {
    const data = await prisma.rasaKopi.create({ data: { nama } })
    res.status(201).json({ message: 'Rasa berhasil ditambahkan', data })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const deleteRasa = async (req, res) => {
  const { id } = req.params
  try {
    await prisma.rasaKopi.update({ where: { id }, data: { isActive: false } })
    res.json({ message: 'Rasa berhasil dihapus' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── BAHAN BAKU ────────────────────────────────────────

const getAllBahan = async (req, res) => {
  try {
    const data = await prisma.bahanBaku.findMany({
      where: { isActive: true },
      orderBy: { nama: 'asc' }
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const createBahan = async (req, res) => {
  const { nama, satuan, stokAwal } = req.body
  if (!nama || !satuan) return res.status(400).json({ message: 'Nama dan satuan wajib diisi' })
  try {
    const data = await prisma.bahanBaku.create({
      data: {
        nama,
        satuan,
        stokAwal: Number(stokAwal || 0),
        stokSaat: Number(stokAwal || 0)
      }
    })
    res.status(201).json({ message: 'Bahan baku berhasil ditambahkan', data })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const updateBahan = async (req, res) => {
  const { id } = req.params
  const { nama, satuan, stokSaat } = req.body
  try {
    const data = await prisma.bahanBaku.update({
      where: { id },
      data: { nama, satuan, stokSaat: Number(stokSaat) }
    })
    res.json({ message: 'Bahan baku berhasil diupdate', data })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const deleteBahan = async (req, res) => {
  const { id } = req.params
  try {
    await prisma.bahanBaku.update({ where: { id }, data: { isActive: false } })
    res.json({ message: 'Bahan baku berhasil dihapus' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── PRODUKSI ──────────────────────────────────────────

const getAllProduksi = async (req, res) => {
  try {
    const data = await prisma.produksi.findMany({
      orderBy: { tanggalProduksi: 'desc' },
      include: {
        createdBy: { select: { name: true } },
        botolan: { include: { rasaKopi: true } },
        bahanTerpakai: { include: { bahanBaku: true } }
      }
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const createProduksi = async (req, res) => {
  const { tanggalProduksi, jamMulai, jamSelesai, durasiJam, durasiMenit, catatan, botolan, bahanTerpakai } = req.body

  if (!tanggalProduksi || !jamMulai || !jamSelesai || !botolan || botolan.length === 0) {
    return res.status(400).json({ message: 'Data produksi tidak lengkap' })
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Buat record produksi
      const produksi = await tx.produksi.create({
        data: {
          tanggalProduksi: new Date(tanggalProduksi),
          jamMulai: new Date(jamMulai),
          jamSelesai: new Date(jamSelesai),
          durasiJam: Number(durasiJam || 0),
          durasiMenit: Number(durasiMenit || 0),
          catatan,
          createdById: req.user.id,
          botolan: {
            create: botolan.map(b => ({
              rasaKopiId: b.rasaKopiId,
              jumlahBotol: Number(b.jumlahBotol)
            }))
          },
          bahanTerpakai: {
            create: bahanTerpakai.map(b => ({
              bahanBakuId: b.bahanBakuId,
              jumlahPakai: Number(b.jumlahPakai)
            }))
          }
        },
        include: {
          botolan: { include: { rasaKopi: true } },
          bahanTerpakai: { include: { bahanBaku: true } }
        }
      })

      // Kurangi stok bahan baku otomatis
      for (const bahan of bahanTerpakai) {
        await tx.bahanBaku.update({
          where: { id: bahan.bahanBakuId },
          data: {
            stokSaat: { decrement: Number(bahan.jumlahPakai) }
          }
        })
      }

      return produksi
    })

    res.status(201).json({ message: 'Produksi berhasil dicatat', data: result })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const deleteProduksi = async (req, res) => {
  const { id } = req.params
  try {
    // Kembalikan stok bahan baku
    const produksi = await prisma.produksi.findUnique({
      where: { id },
      include: { bahanTerpakai: true }
    })

    await prisma.$transaction(async (tx) => {
      for (const bahan of produksi.bahanTerpakai) {
        await tx.bahanBaku.update({
          where: { id: bahan.bahanBakuId },
          data: { stokSaat: { increment: Number(bahan.jumlahPakai) } }
        })
      }
      await tx.produksi.delete({ where: { id } })
    })

    res.json({ message: 'Produksi berhasil dihapus dan stok dikembalikan' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = {
  getAllRasa, createRasa, deleteRasa,
  getAllBahan, createBahan, updateBahan, deleteBahan,
  getAllProduksi, createProduksi, deleteProduksi
}