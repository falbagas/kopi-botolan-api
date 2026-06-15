const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getDashboard = async (req, res) => {
  const { periode = 'minggu', tanggal } = req.query

  const now = tanggal ? new Date(tanggal) : new Date()
  let start, end

  if (periode === 'hari') {
    start = new Date(now)
    start.setHours(0, 0, 0, 0)
    end = new Date(now)
    end.setHours(23, 59, 59, 999)
  } else if (periode === 'minggu') {
    const day = now.getDay()
    const diff = day === 0 ? -6 : 1 - day
    start = new Date(now)
    start.setDate(now.getDate() + diff)
    start.setHours(0, 0, 0, 0)
    end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
  } else if (periode === 'bulan') {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  }

  try {
    const hpp = await prisma.hppHistory.findFirst({
      orderBy: { berlakuDari: 'desc' }
    })
    const hppPerBotol = hpp ? Number(hpp.totalHpp) : 0

    // ── PRODUKSI ──────────────────────────────────────
    const produksi = await prisma.produksi.findMany({
      where: { tanggalProduksi: { gte: start, lte: end } },
      include: { botolan: { include: { rasaKopi: true } } }
    })
    const totalBotolProduksi = produksi.reduce((s, p) =>
      s + p.botolan.reduce((sb, b) => sb + b.jumlahBotol, 0), 0)

    // Rekap per rasa
    const rekapRasa = {}
    produksi.forEach(p => {
      p.botolan.forEach(b => {
        const key = b.rasaKopi.nama
        if (!rekapRasa[key]) rekapRasa[key] = 0
        rekapRasa[key] += b.jumlahBotol
      })
    })

    // ── KOPERASI ──────────────────────────────────────
    const koperasiList = await prisma.koperasi.findMany({
      where: { isActive: true },
      include: {
        pengiriman: {
          where: { tanggalKirim: { gte: start, lte: end } }
        },
        pembayaran: {
          where: { tanggalBayar: { gte: start, lte: end } }
        }
      }
    })

    const totalBotolKoperasi = koperasiList.reduce((s, k) =>
      s + k.pengiriman.reduce((sp, p) => sp + p.jumlahBotol, 0), 0)
    const totalBotolBayar = koperasiList.reduce((s, k) =>
      s + k.pembayaran.reduce((sp, p) => sp + p.jumlahBotol, 0), 0)
    const totalPembayaranMasuk = koperasiList.reduce((s, k) => {
      const bayar = k.pembayaran.reduce((sp, p) => sp + p.jumlahBotol, 0)
      const pendapatan = bayar * Number(k.hargaJualBotol)
      const potongan = pendapatan * (Number(k.potonganPersen) / 100)
      return s + (pendapatan - potongan)
    }, 0)

    const koperasiStok = koperasiList.map(k => {
      const masuk = k.pengiriman.reduce((s, p) => s + p.jumlahBotol, 0)
      const bayar = k.pembayaran.reduce((s, p) => s + p.jumlahBotol, 0)
      const sisa = masuk - bayar
      return {
        id: k.id,
        nama: k.name,
        botolMasuk: masuk,
        botolBayar: bayar,
        sisaBelumBayar: sisa,
        hargaJual: Number(k.hargaJualBotol),
        potongan: Number(k.potonganPersen),
        isRendah: sisa < k.minStockAlert
      }
    })

    // ── POS COFFEE ────────────────────────────────────
    const transaksiPos = await prisma.transaksi.findMany({
      where: { tanggal: { gte: start, lte: end } },
      include: { detail: true }
    })
    const totalPendapatanPos = transaksiPos.reduce((s, t) => s + Number(t.totalHarga), 0)
    const totalBotolPos = transaksiPos.reduce((s, t) =>
      s + t.detail.reduce((sd, d) => sd + d.jumlah, 0), 0)
    const totalCash = transaksiPos.filter(t => t.metodeBayar === 'CASH').reduce((s, t) => s + Number(t.totalHarga), 0)
    const totalQris = transaksiPos.filter(t => t.metodeBayar === 'QRIS').reduce((s, t) => s + Number(t.totalHarga), 0)

    // ── LABA ──────────────────────────────────────────
    const labaKoperasi = koperasiList.reduce((s, k) => {
      const bayar = k.pembayaran.reduce((sp, p) => sp + p.jumlahBotol, 0)
      const pendapatan = bayar * Number(k.hargaJualBotol)
      const potongan = pendapatan * (Number(k.potonganPersen) / 100)
      const hpp = bayar * hppPerBotol
      return s + (pendapatan - potongan - hpp)
    }, 0)
    const labaPos = totalPendapatanPos - (hppPerBotol * totalBotolPos)
    const totalLaba = labaKoperasi + labaPos

    // ── GRAFIK HARIAN ─────────────────────────────────
    const grafikData = []
    const days = periode === 'hari' ? 1 : periode === 'minggu' ? 7 : 30
    for (let i = 0; i < days; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const dEnd = new Date(d)
      dEnd.setHours(23, 59, 59, 999)

      const prodHari = await prisma.produksi.findMany({
        where: { tanggalProduksi: { gte: d, lte: dEnd } },
        include: { botolan: true }
      })
      const posHari = await prisma.transaksi.findMany({
        where: { tanggal: { gte: d, lte: dEnd } }
      })
      const bayarHari = await prisma.pembayaran.findMany({
        where: { tanggalBayar: { gte: d, lte: dEnd } },
        include: { koperasi: true }
      })

      const botolHari = prodHari.reduce((s, p) => s + p.botolan.reduce((sb, b) => sb + b.jumlahBotol, 0), 0)
      const posHariTotal = posHari.reduce((s, t) => s + Number(t.totalHarga), 0)
      const bayarHariTotal = bayarHari.reduce((s, p) => {
        const pendapatan = p.jumlahBotol * Number(p.koperasi.hargaJualBotol)
        const potongan = pendapatan * (Number(p.koperasi.potonganPersen) / 100)
        return s + (pendapatan - potongan)
      }, 0)

      grafikData.push({
        tanggal: d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
        produksi: botolHari,
        pendapatanPos: posHariTotal,
        pendapatanKoperasi: bayarHariTotal,
      })
    }

    res.json({
      periode: { start, end, tipe: periode },
      hppPerBotol,
      produksi: {
        totalBotol: totalBotolProduksi,
        jumlahSesi: produksi.length,
        rekapRasa: Object.entries(rekapRasa).map(([nama, jumlah]) => ({ nama, jumlah }))
      },
      koperasi: {
        totalBotolMasuk: totalBotolKoperasi,
        totalBotolBayar,
        totalPembayaranMasuk,
        list: koperasiStok
      },
      pos: {
        totalTransaksi: transaksiPos.length,
        totalPendapatan: totalPendapatanPos,
        totalBotol: totalBotolPos,
        totalCash,
        totalQris,
      },
      laba: {
        labaKoperasi,
        labaPos,
        totalLaba
      },
      grafik: grafikData
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { getDashboard }