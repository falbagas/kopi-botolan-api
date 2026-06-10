const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ── MENU ──────────────────────────────────────────────

const getAllMenu = async (req, res) => {
  try {
    const data = await prisma.menu.findMany({
      where: { isActive: true },
      orderBy: [{ kategori: 'asc' }, { nama: 'asc' }]
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const createMenu = async (req, res) => {
  const { nama, harga, kategori } = req.body
  if (!nama || !harga || !kategori) {
    return res.status(400).json({ message: 'Nama, harga, dan kategori wajib diisi' })
  }
  try {
    const data = await prisma.menu.create({
      data: { nama, harga: Number(harga), kategori }
    })
    res.status(201).json({ message: 'Menu berhasil ditambahkan', data })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const updateMenu = async (req, res) => {
  const { id } = req.params
  const { nama, harga, kategori } = req.body
  try {
    const data = await prisma.menu.update({
      where: { id },
      data: { nama, harga: Number(harga), kategori }
    })
    res.json({ message: 'Menu berhasil diupdate', data })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const deleteMenu = async (req, res) => {
  const { id } = req.params
  try {
    await prisma.menu.update({ where: { id }, data: { isActive: false } })
    res.json({ message: 'Menu berhasil dihapus' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── TRANSAKSI ─────────────────────────────────────────

const getTransaksiHarian = async (req, res) => {
  const { tanggal } = req.query
  const date = tanggal ? new Date(tanggal) : new Date()
  const start = new Date(date.setHours(0, 0, 0, 0))
  const end = new Date(date.setHours(23, 59, 59, 999))

  try {
    const data = await prisma.transaksi.findMany({
      where: { tanggal: { gte: start, lte: end } },
      orderBy: { createdAt: 'desc' },
      include: {
        detail: { include: { menu: true } },
        createdBy: { select: { name: true } }
      }
    })

    const totalCash = data
      .filter(t => t.metodeBayar === 'CASH')
      .reduce((sum, t) => sum + Number(t.totalHarga), 0)
    const totalQris = data
      .filter(t => t.metodeBayar === 'QRIS')
      .reduce((sum, t) => sum + Number(t.totalHarga), 0)

    res.json({
      transaksi: data,
      ringkasan: {
        totalTransaksi: data.length,
        totalCash,
        totalQris,
        grandTotal: totalCash + totalQris
      }
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const createTransaksi = async (req, res) => {
  const { metodeBayar, namaPembeli, detail } = req.body

  if (!metodeBayar || !detail || detail.length === 0) {
    return res.status(400).json({ message: 'Metode bayar dan detail pesanan wajib diisi' })
  }

  try {
    const menuIds = detail.map(d => d.menuId)
    const menuList = await prisma.menu.findMany({ where: { id: { in: menuIds } } })

    const detailWithPrice = detail.map(d => {
      const menu = menuList.find(m => m.id === d.menuId)
      const hargaSatuan = Number(menu.harga)
      const subtotal = hargaSatuan * Number(d.jumlah)
      return { menuId: d.menuId, jumlah: Number(d.jumlah), hargaSatuan, subtotal }
    })

    const totalHarga = detailWithPrice.reduce((sum, d) => sum + d.subtotal, 0)

    const transaksi = await prisma.transaksi.create({
      data: {
        metodeBayar,
        namaPembeli,
        totalHarga,
        createdById: req.user.id,
        detail: { create: detailWithPrice }
      },
      include: { detail: { include: { menu: true } } }
    })

    res.status(201).json({ message: 'Transaksi berhasil dicatat', data: transaksi })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const deleteTransaksi = async (req, res) => {
  const { id } = req.params
  try {
    await prisma.transaksi.delete({ where: { id } })
    res.json({ message: 'Transaksi berhasil dihapus' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Rekap per menu untuk PDF
const getRekap = async (req, res) => {
  const { tanggal } = req.query
  const date = tanggal ? new Date(tanggal) : new Date()
  const start = new Date(date.setHours(0, 0, 0, 0))
  const end = new Date(date.setHours(23, 59, 59, 999))

  try {
    const detail = await prisma.transaksiDetail.findMany({
      where: { transaksi: { tanggal: { gte: start, lte: end } } },
      include: { menu: true, transaksi: { select: { metodeBayar: true } } }
    })

    const rekapMenu = {}
    detail.forEach(d => {
      const key = d.menu.nama
      if (!rekapMenu[key]) {
        rekapMenu[key] = { nama: d.menu.nama, kategori: d.menu.kategori, jumlah: 0, total: 0 }
      }
      rekapMenu[key].jumlah += d.jumlah
      rekapMenu[key].total += Number(d.subtotal)
    })

    const transaksi = await prisma.transaksi.findMany({
      where: { tanggal: { gte: start, lte: end } }
    })
    const totalCash = transaksi.filter(t => t.metodeBayar === 'CASH').reduce((s, t) => s + Number(t.totalHarga), 0)
    const totalQris = transaksi.filter(t => t.metodeBayar === 'QRIS').reduce((s, t) => s + Number(t.totalHarga), 0)

    res.json({
      tanggal: start,
      rekapMenu: Object.values(rekapMenu),
      ringkasan: {
        totalTransaksi: transaksi.length,
        totalCash,
        totalQris,
        grandTotal: totalCash + totalQris
      }
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = {
  getAllMenu, createMenu, updateMenu, deleteMenu,
  getTransaksiHarian, createTransaksi, deleteTransaksi, getRekap
}