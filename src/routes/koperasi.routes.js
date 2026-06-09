const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth.middleware')
const role = require('../middleware/role.middleware')
const {
  getAllKoperasi, createKoperasi, updateKoperasi, deleteKoperasi,
  getAllJenisKopi, createJenisKopi, deleteJenisKopi,
  getPengirimanByKoperasi, createPengirimanKoperasi, deletePengiriman,
  getPembayaranByKoperasi, createPembayaran,
} = require('../controllers/koperasi.controller')

// Koperasi CRUD
router.get('/', auth, getAllKoperasi)
router.post('/', auth, role('ADMIN'), createKoperasi)
router.put('/:id', auth, role('ADMIN'), updateKoperasi)
router.delete('/:id', auth, role('ADMIN'), deleteKoperasi)

// Jenis kopi
router.get('/jenis-kopi', auth, getAllJenisKopi)
router.post('/jenis-kopi', auth, role('ADMIN'), createJenisKopi)
router.delete('/jenis-kopi/:id', auth, role('ADMIN'), deleteJenisKopi)

// Pengiriman per koperasi
router.get('/:id/pengiriman', auth, getPengirimanByKoperasi)
router.post('/:id/pengiriman', auth, role('ADMIN'), createPengirimanKoperasi)
router.delete('/:id/pengiriman/:pengirimanId', auth, role('ADMIN'), deletePengiriman)

// Pembayaran per koperasi
router.get('/:id/pembayaran', auth, getPembayaranByKoperasi)
router.post('/:id/pembayaran', auth, role('ADMIN'), createPembayaran)

module.exports = router