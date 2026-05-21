require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/auth.routes');
const produksiRoutes = require('./src/routes/produksi.routes');
const stokRoutes = require('./src/routes/stok.routes');
const pengirimanRoutes = require('./src/routes/pengiriman.routes');
const koperasiRoutes = require('./src/routes/koperasi.routes');
const hppRoutes = require('./src/routes/hpp.routes');
const penjualanRoutes = require('./src/routes/penjualan.routes');
const laporanRoutes = require('./src/routes/laporan.routes');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'KopiBotolan API aktif' }));

app.use('/api/auth', authRoutes);
app.use('/api/produksi', produksiRoutes);
app.use('/api/stok', stokRoutes);
app.use('/api/pengiriman', pengirimanRoutes);
app.use('/api/koperasi', koperasiRoutes);
app.use('/api/hpp', hppRoutes);
app.use('/api/penjualan', penjualanRoutes);
app.use('/api/laporan', laporanRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route tidak ditemukan' }));

module.exports = app;