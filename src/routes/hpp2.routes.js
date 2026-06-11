const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth.middleware')
const role = require('../middleware/role.middleware')
const {
  getAllBahanHpp, createBahanHpp, updateBahanHpp, deleteBahanHpp,
  getAllResep, createResep, aktivasiResep, deleteResep
} = require('../controllers/hpp2.controller')

// Bahan HPP
router.get('/bahan', auth, getAllBahanHpp)
router.post('/bahan', auth, role('ADMIN'), createBahanHpp)
router.put('/bahan/:id', auth, role('ADMIN'), updateBahanHpp)
router.delete('/bahan/:id', auth, role('ADMIN'), deleteBahanHpp)

// Resep HPP
router.get('/resep', auth, getAllResep)
router.post('/resep', auth, role('ADMIN'), createResep)
router.patch('/resep/:id/aktifkan', auth, role('ADMIN'), aktivasiResep)
router.delete('/resep/:id', auth, role('ADMIN'), deleteResep)

module.exports = router