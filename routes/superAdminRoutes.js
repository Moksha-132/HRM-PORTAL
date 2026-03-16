const express = require('express');
const { login, register, getUsers, deleteUser, getMe, updateDetails } = require('../controllers/superAdminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
// Protecting register so only Super Admins can add other admins
router.post('/register', protect, authorize('Super Admin'), register);
router.get('/users', protect, authorize('Super Admin'), getUsers);
router.delete('/users/:id', protect, authorize('Super Admin'), deleteUser);

router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);

module.exports = router;
