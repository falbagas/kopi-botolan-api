const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth.middleware')
const { getLaporanMingguan } = require('../controllers/laporan.controller')

router.get('/mingguan', auth, getLaporanMingguan)

module.exports = router