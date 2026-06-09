const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ── KOPERASI ──────────────────────────────────────────

const getAllKoperasi = async (req, res) => {
  try {
    const data = await prisma.koperasi.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const createKoperasi = async (req, res) => {
  const { name, address, contactPerson, phone, minStockAlert } = req.body
  if (!name) return res.status(400).json({ message: 'Nama koperasi wajib diisi' })
  try {
    const data = await prisma.koperasi.create({
      data: { name, address, contactPerson, phone, minStockAlert: Number(minStockAlert || 20) }
    })
    res.status(201).json({ message: 'Koperasi berhasil dibuat', data })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const updateKoperasi = async (req, res) => {
  const { id } = req.params
  const { name, address, contactPerson, phone, minStockAlert } = req.body
  try {
    const data = await prisma.koperasi.update({
      where: { id },
      data: { name, address, contactPerson, phone, minStockAlert: Number(minStockAlert || 20) }
    })
    res.json({ message: 'Koperasi berhasil diupdate', data })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const deleteKoperasi = async (req, res) => {
  const { id } = req.params
  try {
    await prisma.koperasi.update({ where: { id }, data: { isActive: false } })
    res.json({ message: 'Koperasi berhasil dihapus' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── JENIS KOPI ────────────────────────────────────────

const getAllJenisKopi = async (req, res) => {
  try {
    const data = await prisma.jenisKopi.findMany({
      where: { isActive: true },
      orderBy: { nama: 'asc' }
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const createJenisKopi = async (req, res) => {
  const { nama } = req.body
  if (!nama) return res.status(400).json({ message: 'Nama jenis kopi wajib diisi' })
  try {
    const data = await prisma.jenisKopi.create({ data: { nama } })
    res.status(201).json({ message: 'Jenis kopi berhasil ditambahkan', data })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const deleteJenisKopi = async (req, res) => {
  const { id } = req.params
  try {
    await prisma.jenisKopi.update({ where: { id }, data: { isActive: false } })
    res.json({ message: 'Jenis kopi berhasil dihapus' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── PENGIRIMAN KE KOPERASI ────────────────────────────

const getPengirimanByKoperasi = async (req, res) => {
  const { id } = req.params
  try {
    const data = await prisma.pengiriman.findMany({
      where: { koperasiId: id },
      orderBy: { tanggalKirim: 'desc' },
      include: {
        detail: { include: { jenisKopi: true } },
        dikirimOleh: { select: { name: true } }
      }
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const createPengirimanKoperasi = async (req, res) => {
  const { id } = req.params
  const { tanggalKirim, catatan, detail } = req.body

  if (!tanggalKirim || !detail || detail.length === 0) {
    return res.status(400).json({ message: 'Tanggal kirim dan detail kopi wajib diisi' })
  }

  try {
    const totalBotol = detail.reduce((sum, d) => sum + Number(d.jumlahBotol), 0)

    const pengiriman = await prisma.pengiriman.create({
      data: {
        koperasiId: id,
        batchId: null,
        jumlahBotol: totalBotol,
        tanggalKirim: new Date(tanggalKirim),
        status: 'TERKIRIM',
        catatan,
        dikirimOlehId: req.user.id,
        detail: {
          create: detail.map((d) => ({
            jenisKopiId: d.jenisKopiId,
            jumlahBotol: Number(d.jumlahBotol),
            keterangan: d.keterangan || null,
          }))
        }
      },
      include: { detail: { include: { jenisKopi: true } } }
    })

    res.status(201).json({ message: 'Pengiriman berhasil dicatat', data: pengiriman })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const deletePengiriman = async (req, res) => {
  const { pengirimanId } = req.params
  try {
    await prisma.pengiriman.delete({ where: { id: pengirimanId } })
    res.json({ message: 'Pengiriman berhasil dihapus' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── PEMBAYARAN ────────────────────────────────────────

const getPembayaranByKoperasi = async (req, res) => {
  const { id } = req.params
  try {
    const data = await prisma.pembayaran.findMany({
      where: { koperasiId: id },
      orderBy: { tanggalBayar: 'desc' },
      include: { dicatatOleh: { select: { name: true } } }
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const createPembayaran = async (req, res) => {
  const { id } = req.params
  const { jumlahBotol, tanggalBayar, keterangan } = req.body
  if (!jumlahBotol || !tanggalBayar) {
    return res.status(400).json({ message: 'Jumlah botol dan tanggal bayar wajib diisi' })
  }
  try {
    const data = await prisma.pembayaran.create({
      data: {
        koperasiId: id,
        jumlahBotol: Number(jumlahBotol),
        tanggalBayar: new Date(tanggalBayar),
        keterangan,
        dicatatOlehId: req.user.id,
      }
    })
    res.status(201).json({ message: 'Pembayaran berhasil dicatat', data })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = {
  getAllKoperasi, createKoperasi, updateKoperasi, deleteKoperasi,
  getAllJenisKopi, createJenisKopi, deleteJenisKopi,
  getPengirimanByKoperasi, createPengirimanKoperasi, deletePengiriman,
  getPembayaranByKoperasi, createPembayaran,
}