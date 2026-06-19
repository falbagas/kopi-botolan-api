const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth.middleware')
const role = require('../middleware/role.middleware')
const {
  getAllFreezer, createFreezer, updateFreezer, deleteFreezer,
  masukkanKeFreezer, keluarKeFreezer, pindahFreezer, getMutasi
} = require('../controllers/freezer.controller')

router.get('/', auth, getAllFreezer)
router.post('/', auth, role('ADMIN'), createFreezer)
router.put('/:id', auth, role('ADMIN'), updateFreezer)
router.delete('/:id', auth, role('ADMIN'), deleteFreezer)

router.post('/masuk', auth, role('ADMIN'), masukkanKeFreezer)
router.post('/keluar', auth, role('ADMIN'), keluarKeFreezer)
router.post('/pindah', auth, role('ADMIN'), pindahFreezer)
router.get('/mutasi', auth, getMutasi)

module.exports = router