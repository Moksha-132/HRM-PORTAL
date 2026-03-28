const express = require('express');
const { getAllChats, updateChatResponse } = require('../controllers/chatController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/chats', protect, authorize('Super Admin', 'Admin'), getAllChats);
router.put('/chat/:id', protect, authorize('Super Admin', 'Admin'), updateChatResponse);

module.exports = router;
