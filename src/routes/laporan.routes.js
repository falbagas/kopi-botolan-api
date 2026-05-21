const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'Laporan routes ok' }));

module.exports = router;