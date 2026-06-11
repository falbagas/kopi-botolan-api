const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ── BAHAN HPP ─────────────────────────────────────────

const getAllBahanHpp = async (req, res) => {
  try {
    const data = await prisma.bahanHpp.findMany({
      where: { isActive: true },
      orderBy: { nama: 'asc' }
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const createBahanHpp = async (req, res) => {
  const { nama, satuan, hargaPerUnit, beratPerUnit } = req.body
  if (!nama || !satuan || !hargaPerUnit || !beratPerUnit) {
    return res.status(400).json({ message: 'Semua field wajib diisi' })
  }
  try {
    const hargaPerGram = Number(hargaPerUnit) / Number(beratPerUnit)
    const data = await prisma.bahanHpp.create({
      data: {
        nama, satuan,
        hargaPerUnit: Number(hargaPerUnit),
        beratPerUnit: Number(beratPerUnit),
        hargaPerGram,
      }
    })
    res.status(201).json({ message: 'Bahan HPP berhasil ditambahkan', data })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const updateBahanHpp = async (req, res) => {
  const { id } = req.params
  const { nama, satuan, hargaPerUnit, beratPerUnit } = req.body
  try {
    const hargaPerGram = Number(hargaPerUnit) / Number(beratPerUnit)
    const data = await prisma.bahanHpp.update({
      where: { id },
      data: { nama, satuan, hargaPerUnit: Number(hargaPerUnit), beratPerUnit: Number(beratPerUnit), hargaPerGram }
    })
    res.json({ message: 'Bahan HPP berhasil diupdate', data })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const deleteBahanHpp = async (req, res) => {
  const { id } = req.params
  try {
    await prisma.bahanHpp.update({ where: { id }, data: { isActive: false } })
    res.json({ message: 'Bahan HPP berhasil dihapus' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── RESEP HPP ─────────────────────────────────────────

const getAllResep = async (req, res) => {
  try {
    const data = await prisma.resepHpp.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        rasaKopi: true,
        createdBy: { select: { name: true } },
        detail: { include: { bahanHpp: true } }
      }
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const createResep = async (req, res) => {
  const { rasaKopiId, catatan, detail } = req.body
  if (!rasaKopiId || !detail || detail.length === 0) {
    return res.status(400).json({ message: 'Rasa dan detail resep wajib diisi' })
  }
  try {
    // Ambil harga per gram tiap bahan
    const bahanIds = detail.map(d => d.bahanHppId)
    const bahanList = await prisma.bahanHpp.findMany({ where: { id: { in: bahanIds } } })

    const detailWithSubtotal = detail.map(d => {
      const bahan = bahanList.find(b => b.id === d.bahanHppId)
      const subtotal = Number(bahan.hargaPerGram) * Number(d.jumlahPakai)
      return {
        bahanHppId: d.bahanHppId,
        jumlahPakai: Number(d.jumlahPakai),
        subtotal
      }
    })

    const totalHpp = detailWithSubtotal.reduce((s, d) => s + d.subtotal, 0)

    const resep = await prisma.resepHpp.create({
      data: {
        rasaKopiId,
        totalHpp,
        catatan,
        createdById: req.user.id,
        detail: { create: detailWithSubtotal }
      },
      include: {
        rasaKopi: true,
        detail: { include: { bahanHpp: true } }
      }
    })

    res.status(201).json({ message: 'Resep HPP berhasil disimpan', data: resep })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const aktivasiResep = async (req, res) => {
  const { id } = req.params
  try {
    const resep = await prisma.resepHpp.findUnique({ where: { id } })
    if (!resep) return res.status(404).json({ message: 'Resep tidak ditemukan' })

    // Non-aktifkan resep lain untuk rasa yang sama
    await prisma.resepHpp.updateMany({
      where: { rasaKopiId: resep.rasaKopiId },
      data: { isAktif: false }
    })

    // Aktifkan resep ini
    await prisma.resepHpp.update({ where: { id }, data: { isAktif: true } })

    res.json({ message: 'Resep berhasil diaktifkan' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const deleteResep = async (req, res) => {
  const { id } = req.params
  try {
    await prisma.resepHpp.delete({ where: { id } })
    res.json({ message: 'Resep berhasil dihapus' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = {
  getAllBahanHpp, createBahanHpp, updateBahanHpp, deleteBahanHpp,
  getAllResep, createResep, aktivasiResep, deleteResep
}