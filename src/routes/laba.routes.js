const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth.middleware')
const role = require('../middleware/role.middleware')
const {
  getAllPemilik, updatePemilik,
  getPembagianLaba, bagikanLaba,
  tambahMutasi, previewLaba
} = require('../controllers/laba.controller')

router.get('/pemilik', auth, getAllPemilik)
router.put('/pemilik/:id', auth, role('ADMIN'), updatePemilik)

router.get('/pembagian', auth, getPembagianLaba)
router.post('/pembagian', auth, role('ADMIN'), bagikanLaba)
router.get('/preview', auth, previewLaba)

router.post('/mutasi', auth, role('ADMIN'), tambahMutasi)

module.exports = router