const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const formatRp = (val) => 'Rp ' + Number(val).toLocaleString('id-ID')

// ── PEMILIK ───────────────────────────────────────────

const getAllPemilik = async (req, res) => {
  try {
    const data = await prisma.pemilik.findMany({
      where: { isActive: true },
      orderBy: { persentase: 'desc' },
      include: {
        mutasi: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { createdBy: { select: { name: true } } }
        }
      }
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const updatePemilik = async (req, res) => {
  const { id } = req.params
  const { nama, persentaseKoperasi, persentasePos } = req.body
  try {
    const data = await prisma.pemilik.update({
      where: { id },
      data: {
        nama,
        persentaseKoperasi: Number(persentaseKoperasi),
        persentasePos: Number(persentasePos),
      }
    })
    res.json({ message: 'Pemilik berhasil diupdate', data })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── PEMBAGIAN LABA ────────────────────────────────────

const getPembagianLaba = async (req, res) => {
  try {
    const data = await prisma.pembagianLaba.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { name: true } },
        mutasi: {
          include: { pemilik: true }
        }
      }
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const bagikanLaba = async (req, res) => {
  const { periodeAwal, periodeAkhir, keterangan } = req.body
  if (!periodeAwal || !periodeAkhir) {
    return res.status(400).json({ message: 'Periode wajib diisi' })
  }

  try {
    const start = new Date(periodeAwal)
    start.setHours(0, 0, 0, 0)
    const end = new Date(periodeAkhir)
    end.setHours(23, 59, 59, 999)

    // Hitung laba dari koperasi
    const hpp = await prisma.hppHistory.findFirst({
      orderBy: { berlakuDari: 'desc' }
    })
    const hppPerBotol = hpp ? Number(hpp.totalHpp) : 0

    const koperasiList = await prisma.koperasi.findMany({
      where: { isActive: true },
      include: {
        pembayaran: {
          where: { tanggalBayar: { gte: start, lte: end } }
        }
      }
    })

    const labaKoperasi = koperasiList.reduce((s, k) => {
      const botolBayar = k.pembayaran.reduce((sp, p) => sp + p.jumlahBotol, 0)
      const pendapatan = botolBayar * Number(k.hargaJualBotol)
      const potongan = pendapatan * (Number(k.potonganPersen) / 100)
      const hpp = botolBayar * hppPerBotol
      return s + (pendapatan - potongan - hpp)
    }, 0)

    // Hitung laba dari POS
    const transaksiPos = await prisma.transaksi.findMany({
      where: { tanggal: { gte: start, lte: end } },
      include: { detail: true }
    })
    const totalPendapatanPos = transaksiPos.reduce((s, t) => s + Number(t.totalHarga), 0)
    const totalBotolPos = transaksiPos.reduce((s, t) =>
      s + t.detail.reduce((sd, d) => sd + d.jumlah, 0), 0)
    const labaPos = totalPendapatanPos - (hppPerBotol * totalBotolPos)

    const totalLaba = labaKoperasi + labaPos

    if (totalLaba <= 0) {
      return res.status(400).json({ message: `Total laba periode ini adalah ${totalLaba} — tidak ada yang dibagikan` })
    }

    // Ambil semua pemilik
    const pemilikList = await prisma.pemilik.findMany({
      where: { isActive: true }
    })

    // Cek total persentase
    const totalPersen = pemilikList.reduce((s, p) => s + Number(p.persentase), 0)
    if (totalPersen !== 100) {
      return res.status(400).json({ message: `Total persentase pemilik harus 100%, saat ini ${totalPersen}%` })
    }

    // Buat pembagian & mutasi dalam transaksi
    const result = await prisma.$transaction(async (tx) => {
      const pembagian = await tx.pembagianLaba.create({
        data: {
          periodeAwal: start,
          periodeAkhir: end,
          totalLaba,
          keterangan,
          createdById: req.user.id,
        }
      })

      for (const pemilik of pemilikList) {
        const bagianKoperasi = labaKoperasi * (Number(pemilik.persentaseKoperasi) / 100)
        const bagianPos = labaPos * (Number(pemilik.persentasePos) / 100)
        const bagian = bagianKoperasi + bagianPos
        const saldoSebelum = Number(pemilik.saldo)
        const saldoSesudah = saldoSebelum + bagian

        await tx.pemilik.update({
          where: { id: pemilik.id },
          data: { saldo: saldoSesudah }
        })

        await tx.mutasiLaba.create({
          data: {
            pemilikId: pemilik.id,
            pembagianLabaId: pembagian.id,
            jenis: 'LABA_MASUK',
            jumlah: bagian,
            saldoSebelum,
            saldoSesudah,
            keterangan: `Laba koperasi ${formatRp(bagianKoperasi)} + POS ${formatRp(bagianPos)}`,
            createdById: req.user.id
          }
        })
      }

      return pembagian
    })

    res.status(201).json({
      message: 'Laba berhasil dibagikan!',
      data: result,
      detail: {
        totalLaba,
        labaKoperasi,
        labaPos,
        pemilikList: pemilikList.map(p => ({
          nama: p.nama,
          persentase: p.persentase,
          bagian: totalLaba * (Number(p.persentase) / 100)
        }))
      }
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── MUTASI MANUAL (penarikan/koreksi) ─────────────────

const tambahMutasi = async (req, res) => {
  const { pemilikId, jenis, jumlah, keterangan } = req.body
  if (!pemilikId || !jenis || !jumlah) {
    return res.status(400).json({ message: 'Pemilik, jenis, dan jumlah wajib diisi' })
  }

  try {
    const pemilik = await prisma.pemilik.findUnique({ where: { id: pemilikId } })
    if (!pemilik) return res.status(404).json({ message: 'Pemilik tidak ditemukan' })

    const saldoSebelum = Number(pemilik.saldo)
    let saldoSesudah

    if (jenis === 'PENARIKAN') {
      if (saldoSebelum < Number(jumlah)) {
        return res.status(400).json({ message: 'Saldo tidak cukup untuk penarikan' })
      }
      saldoSesudah = saldoSebelum - Number(jumlah)
    } else {
      saldoSesudah = saldoSebelum + Number(jumlah)
    }

    await prisma.$transaction(async (tx) => {
      await tx.pemilik.update({
        where: { id: pemilikId },
        data: { saldo: saldoSesudah }
      })

      await tx.mutasiLaba.create({
        data: {
          pemilikId,
          jenis,
          jumlah: Number(jumlah),
          saldoSebelum,
          saldoSesudah,
          keterangan,
          createdById: req.user.id
        }
      })
    })

    res.status(201).json({ message: 'Mutasi berhasil dicatat' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Preview laba sebelum dibagikan
const previewLaba = async (req, res) => {
  const { periodeAwal, periodeAkhir } = req.query
  if (!periodeAwal || !periodeAkhir) {
    return res.status(400).json({ message: 'Periode wajib diisi' })
  }

  try {
    const start = new Date(periodeAwal)
    start.setHours(0, 0, 0, 0)
    const end = new Date(periodeAkhir)
    end.setHours(23, 59, 59, 999)

    const hpp = await prisma.hppHistory.findFirst({ orderBy: { berlakuDari: 'desc' } })
    const hppPerBotol = hpp ? Number(hpp.totalHpp) : 0

    const koperasiList = await prisma.koperasi.findMany({
      where: { isActive: true },
      include: { pembayaran: { where: { tanggalBayar: { gte: start, lte: end } } } }
    })

    const labaKoperasi = koperasiList.reduce((s, k) => {
      const botolBayar = k.pembayaran.reduce((sp, p) => sp + p.jumlahBotol, 0)
      const pendapatan = botolBayar * Number(k.hargaJualBotol)
      const potongan = pendapatan * (Number(k.potonganPersen) / 100)
      return s + (pendapatan - potongan - (botolBayar * hppPerBotol))
    }, 0)

    const transaksiPos = await prisma.transaksi.findMany({
      where: { tanggal: { gte: start, lte: end } },
      include: { detail: true }
    })
    const totalPendapatanPos = transaksiPos.reduce((s, t) => s + Number(t.totalHarga), 0)
    const totalBotolPos = transaksiPos.reduce((s, t) => s + t.detail.reduce((sd, d) => sd + d.jumlah, 0), 0)
    const labaPos = totalPendapatanPos - (hppPerBotol * totalBotolPos)
    const totalLaba = labaKoperasi + labaPos

    const pemilikList = await prisma.pemilik.findMany({ where: { isActive: true } })

    res.json({
      totalLaba,
      labaKoperasi,
      labaPos,
      hppPerBotol,
      pembagian: pemilikList.map(p => ({
        id: p.id,
        nama: p.nama,
        persentaseKoperasi: Number(p.persentaseKoperasi),
        persentasePos: Number(p.persentasePos),
        bagianKoperasi: labaKoperasi * (Number(p.persentaseKoperasi) / 100),
        bagianPos: labaPos * (Number(p.persentasePos) / 100),
        bagian: (labaKoperasi * (Number(p.persentaseKoperasi) / 100)) + (labaPos * (Number(p.persentasePos) / 100)),
        saldoSaatIni: Number(p.saldo)
      }))
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = {
  getAllPemilik, updatePemilik,
  getPembagianLaba, bagikanLaba,
  tambahMutasi, previewLaba
}