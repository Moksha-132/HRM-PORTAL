const express = require('express');
const { getNotifications, markAsRead, markAllAsRead, createGlobalNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();


router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);

// Global notification endpoint
router.post('/create-global', protect, createGlobalNotification);

module.exports = router;
