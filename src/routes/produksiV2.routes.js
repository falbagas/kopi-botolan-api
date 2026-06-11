const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth.middleware')
const role = require('../middleware/role.middleware')
const {
  getAllRasa, createRasa, deleteRasa,
  getAllBahan, createBahan, updateBahan, deleteBahan,
  getAllProduksi, createProduksi, deleteProduksi
} = require('../controllers/produksiV2.controller')

// Rasa kopi
router.get('/rasa', auth, getAllRasa)
router.post('/rasa', auth, role('ADMIN'), createRasa)
router.delete('/rasa/:id', auth, role('ADMIN'), deleteRasa)

// Bahan baku
router.get('/bahan', auth, getAllBahan)
router.post('/bahan', auth, role('ADMIN'), createBahan)
router.put('/bahan/:id', auth, role('ADMIN'), updateBahan)
router.delete('/bahan/:id', auth, role('ADMIN'), deleteBahan)

// Produksi
router.get('/', auth, getAllProduksi)
router.post('/', auth, role('ADMIN'), createProduksi)
router.delete('/:id', auth, role('ADMIN'), deleteProduksi)

module.exports = router