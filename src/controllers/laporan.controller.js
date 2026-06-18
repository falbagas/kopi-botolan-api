const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getLaporanMingguan = async (req, res) => {
  const { minggu } = req.query

  // Default: minggu ini
  const now = minggu ? new Date(minggu) : new Date()
  const dayOfWeek = now.getDay()
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek)
  const senin = new Date(now)
  senin.setDate(now.getDate() + diffToMonday)
  senin.setHours(0, 0, 0, 0)
  const mingguDepan = new Date(senin)
  mingguDepan.setDate(senin.getDate() + 7)

  try {
    // ── MENGGUNAKAN HPP BARU (RESEP AKTIF DARI HPP2) ──
    const hpp = await prisma.resepHpp.findFirst({
      where: { isAktif: true },
      orderBy: { createdAt: 'desc' }
    })
    const hppPerBotol = hpp ? Number(hpp.totalHpp) : 0

    // ── LAPORAN KOPERASI ──────────────────────────────
    const koperasiList = await prisma.koperasi.findMany({
      where: { isActive: true },
      include: {
        pembayaran: {
          where: {
            tanggalBayar: { gte: senin, lt: mingguDepan }
          }
        },
        pengiriman: {
          where: {
            tanggalKirim: { gte: senin, lt: mingguDepan }
          }
        ,
          include: {
            detail: { include: { jenisKopi: true } }
          }
        }
      }
    })

    const laporanKoperasi = koperasiList.map(kop => {
      const totalBotolMasuk = kop.pengiriman.reduce((s, p) => s + p.jumlahBotol, 0)
      const totalBotolBayar = kop.pembayaran.reduce((s, p) => s + p.jumlahBotol, 0)
      const hargaJual = Number(kop.hargaJualBotol)
      const potongan = Number(kop.potonganPersen)

      const pendapatanKotor = hargaJual * totalBotolBayar
      const potonganNominal = pendapatanKotor * (potongan / 100)
      const pendapatanBersih = pendapatanKotor - potonganNominal
      const totalHpp = hppPerBotol * totalBotolBayar
      const laba = pendapatanBersih - totalHpp

      return {
        id: kop.id,
        nama: kop.name,
        hargaJualBotol: hargaJual,
        potonganPersen: potongan,
        totalBotolMasuk,
        totalBotolBayar,
        pendapatanKotor,
        potonganNominal,
        pendapatanBersih,
        totalHpp,
        laba,
        pengiriman: kop.pengiriman,
        pembayaran: kop.pembayaran,
      }
    })

    // ── LAPORAN POS ───────────────────────────────────
    const transaksiPos = await prisma.transaksi.findMany({
      where: { tanggal: { gte: senin, lt: mingguDepan } },
      include: { detail: { include: { menu: true } } }
    })

    const totalPendapatanPos = transaksiPos.reduce((s, t) => s + Number(t.totalHarga), 0)
    const totalBotolPos = transaksiPos.reduce((s, t) =>
      s + t.detail.reduce((sd, d) => sd + d.jumlah, 0), 0)
    const totalHppPos = hppPerBotol * totalBotolPos
    const labaPos = totalPendapatanPos - totalHppPos

    const totalCashPos = transaksiPos.filter(t => t.metodeBayar === 'CASH').reduce((s, t) => s + Number(t.totalHarga), 0)
    const totalQrisPos = transaksiPos.filter(t => t.metodeBayar === 'QRIS').reduce((s, t) => s + Number(t.totalHarga), 0)

    // Rekap per menu POS
    const rekapMenuPos = {}
    transaksiPos.forEach(t => {
      t.detail.forEach(d => {
        const key = d.menu.nama
        if (!rekapMenuPos[key]) rekapMenuPos[key] = { nama: d.menu.nama, jumlah: 0, total: 0 }
        rekapMenuPos[key].jumlah += d.jumlah
        rekapMenuPos[key].total += Number(d.subtotal)
      })
    })

    // ── TOTAL GABUNGAN ────────────────────────────────
    const totalLabaKoperasi = laporanKoperasi.reduce((s, k) => s + k.laba, 0)
    const grandTotal = {
      totalLabaKoperasi,
      labaPos,
      totalLaba: totalLabaKoperasi + labaPos,
      hppPerBotol,
    }

    res.json({
      periode: { senin, minggu: mingguDepan },
      grandTotal,
      koperasi: laporanKoperasi,
      pos: {
        totalTransaksi: transaksiPos.length,
        totalPendapatan: totalPendapatanPos,
        totalBotol: totalBotolPos,
        totalHpp: totalHppPos,
        laba: labaPos,
        totalCash: totalCashPos,
        totalQris: totalQrisPos,
        rekapMenu: Object.values(rekapMenuPos),
      }
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { getLaporanMingguan }