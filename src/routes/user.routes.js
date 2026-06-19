const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth.middleware')
const role = require('../middleware/role.middleware')
const { getAllUser, createUser, updateUser, toggleAktif, resetPassword } = require('../controllers/user.controller')

router.get('/', auth, role('ADMIN'), getAllUser)
router.post('/', auth, role('ADMIN'), createUser)
router.put('/:id', auth, role('ADMIN'), updateUser)
router.patch('/:id/toggle', auth, role('ADMIN'), toggleAktif)
router.patch('/:id/reset-password', auth, role('ADMIN'), resetPassword)

module.exports = router