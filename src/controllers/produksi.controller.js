const { PrismaClient } = require('@prisma/client');
const generateBatchCode = require('../utils/generateBatchCode');

const prisma = new PrismaClient();

const createProduksi = async (req, res) => {
  const { tanggalProduksi, expiredDate, jumlahBotol, hppId, catatan } = req.body;

  if (!tanggalProduksi || !expiredDate || !jumlahBotol || !hppId) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  try {
    const batchCode = generateBatchCode();

    const result = await prisma.$transaction(async (tx) => {
      const batch = await tx.produksiBatch.create({
        data: {
          batchCode,
          tanggalProduksi: new Date(tanggalProduksi),
          expiredDate: new Date(expiredDate),
          jumlahBotol: Number(jumlahBotol),
          hppId,
          catatan,
          createdById: req.user.id,
        }
      });

      await tx.stokFreezer.create({
        data: {
          batchId: batch.id,
          jumlahMasuk: Number(jumlahBotol),
          jumlahKeluar: 0,
          stokAkhir: Number(jumlahBotol),
        }
      });

      return batch;
    });

    res.status(201).json({ message: 'Produksi berhasil dicatat', data: result });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllProduksi = async (req, res) => {
  try {
    const data = await prisma.produksiBatch.findMany({
      orderBy: { createdAt: 'desc' },
      include: { hpp: true, stokFreezer: true, createdBy: { select: { name: true } } }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createProduksi, getAllProduksi };