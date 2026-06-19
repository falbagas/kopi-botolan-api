const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

const getAllUser = async (req, res) => {
  try {
    const data = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { koperasi: { select: { name: true } } },
      select: {
        id: true, name: true, email: true,
        role: true, isActive: true, createdAt: true,
        koperasiId: true, koperasi: true
      }
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const createUser = async (req, res) => {
  const { name, email, password, role, koperasiId } = req.body
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Nama, email, password, dan role wajib diisi' })
  }
  try {
    const exist = await prisma.user.findUnique({ where: { email } })
    if (exist) return res.status(400).json({ message: 'Email sudah digunakan' })

    const passwordHash = await bcrypt.hash(password, 10)
    const data = await prisma.user.create({
      data: {
        name, email, passwordHash, role,
        koperasiId: koperasiId || null
      }
    })
    res.status(201).json({
      message: 'User berhasil dibuat',
      data: { id: data.id, name: data.name, email: data.email, role: data.role }
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const updateUser = async (req, res) => {
  const { id } = req.params
  const { name, email, role, koperasiId, password } = req.body
  try {
    const updateData = { name, email, role, koperasiId: koperasiId || null }
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10)
    }
    const data = await prisma.user.update({ where: { id }, data: updateData })
    res.json({
      message: 'User berhasil diupdate',
      data: { id: data.id, name: data.name, email: data.email, role: data.role }
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const toggleAktif = async (req, res) => {
  const { id } = req.params
  try {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' })
    const data = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive }
    })
    res.json({ message: `User berhasil ${data.isActive ? 'diaktifkan' : 'dinonaktifkan'}`, data })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const resetPassword = async (req, res) => {
  const { id } = req.params
  const { password } = req.body
  if (!password) return res.status(400).json({ message: 'Password baru wajib diisi' })
  try {
    const passwordHash = await bcrypt.hash(password, 10)
    await prisma.user.update({ where: { id }, data: { passwordHash } })
    res.json({ message: 'Password berhasil direset' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { getAllUser, createUser, updateUser, toggleAktif, resetPassword }