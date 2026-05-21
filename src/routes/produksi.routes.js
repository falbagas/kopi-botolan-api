const express = require('express');
const router = express.Router();
const { createProduksi, getAllProduksi } = require('../controllers/produksi.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

router.get('/', authMiddleware, getAllProduksi);
router.post('/', authMiddleware, roleMiddleware('ADMIN'), createProduksi);

module.exports = router;