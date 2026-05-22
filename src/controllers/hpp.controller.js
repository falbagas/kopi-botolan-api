const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/hpp/aktif — ambil HPP yang berlaku sekarang
const getHppAktif = async (req, res) => {
  try {
    const hpp = await prisma.hppHistory.findFirst({
      orderBy: { berlakuDari: 'desc' },
      include: { createdBy: { select: { name: true } } }
    });

    if (!hpp) {
      return res.status(404).json({ message: 'Belum ada HPP yang diset' });
    }

    res.json(hpp);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/hpp — ambil semua riwayat HPP
const getAllHpp = async (req, res) => {
  try {
    const data = await prisma.hppHistory.findMany({
      orderBy: { berlakuDari: 'desc' },
      include: { createdBy: { select: { name: true } } }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/hpp — buat HPP baru
const createHpp = async (req, res) => {
  const { biayaBahan, biayaProduksi, biayaLain, berlakuDari, keterangan } = req.body;

  if (!biayaBahan || !biayaProduksi || !berlakuDari) {
    return res.status(400).json({ message: 'Biaya bahan, biaya produksi, dan tanggal berlaku wajib diisi' });
  }

  try {
    const totalHpp =
      Number(biayaBahan) + Number(biayaProduksi) + Number(biayaLain || 0);

    const hpp = await prisma.hppHistory.create({
      data: {
        biayaBahan: Number(biayaBahan),
        biayaProduksi: Number(biayaProduksi),
        biayaLain: Number(biayaLain || 0),
        totalHpp,
        berlakuDari: new Date(berlakuDari),
        keterangan,
        createdById: req.user.id,
      }
    });

    res.status(201).json({ message: 'HPP berhasil disimpan', data: hpp });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getHppAktif, getAllHpp, createHpp };