const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth.middleware')
const role = require('../middleware/role.middleware')
const {
  getAllMenu, createMenu, updateMenu, deleteMenu,
  getTransaksiHarian, createTransaksi, deleteTransaksi, getRekap
} = require('../controllers/pos.controller')

// Menu
router.get('/menu', auth, getAllMenu)
router.post('/menu', auth, role('ADMIN'), createMenu)
router.put('/menu/:id', auth, role('ADMIN'), updateMenu)
router.delete('/menu/:id', auth, role('ADMIN'), deleteMenu)

// Transaksi
router.get('/transaksi', auth, getTransaksiHarian)
router.post('/transaksi', auth, createTransaksi)
router.delete('/transaksi/:id', auth, role('ADMIN'), deleteTransaksi)

// Rekap untuk PDF
router.get('/rekap', auth, getRekap)

module.exports = router