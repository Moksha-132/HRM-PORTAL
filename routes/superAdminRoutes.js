const express = require('express');
const { login, register, registerPublic, getUsers, deleteUser, getMe, updateDetails, updatePassword, forgotPassword, resetPassword } = require('../controllers/superAdminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
// Public self-registration endpoint
router.post('/register/public', registerPublic);
// Protecting register so only Super Admins can add other admins
router.post('/register', protect, authorize('Super Admin'), register);
router.get('/users', protect, authorize('Super Admin'), getUsers);
router.delete('/users/:id', protect, authorize('Super Admin'), deleteUser);

router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;
