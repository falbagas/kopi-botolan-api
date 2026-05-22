const express = require('express');
const router = express.Router();
const { getHppAktif, getAllHpp, createHpp } = require('../controllers/hpp.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

router.get('/aktif', authMiddleware, getHppAktif);
router.get('/', authMiddleware, getAllHpp);
router.post('/', authMiddleware, roleMiddleware('ADMIN'), createHpp);

module.exports = router;