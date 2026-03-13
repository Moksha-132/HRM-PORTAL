const express = require('express');
const { login, register, getUsers, deleteUser } = require('../controllers/superAdminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
// Protecting register so only Super Admins can add other admins
router.post('/register', protect, authorize('Super Admin'), register);
router.get('/users', protect, authorize('Super Admin'), getUsers);
router.delete('/users/:id', protect, authorize('Super Admin'), deleteUser);

module.exports = router;
