const express = require('express');
const { 
    getAdminSessions, 
    getSessionMessages, 
    sendAdminReply, 
    closeSession 
} = require('../controllers/chatController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Admin endpoints
router.get('/admin/sessions', protect, authorize('Super Admin', 'Admin'), getAdminSessions);
router.get('/session', getSessionMessages); // Used by loadChatMessages (public/auth mixed)
router.get('/session/:session_id', protect, authorize('Super Admin', 'Admin'), getSessionMessages); // Used by selectChatSession for role/color
router.post('/message', protect, authorize('Super Admin', 'Admin'), upload.single('file'), sendAdminReply);
router.put('/session/:id/close', protect, authorize('Super Admin', 'Admin'), closeSession);

module.exports = router;
