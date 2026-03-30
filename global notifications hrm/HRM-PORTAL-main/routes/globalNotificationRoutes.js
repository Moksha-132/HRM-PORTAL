const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Send global notification (for admin/manager use)
router.post('/send-global', protect, async (req, res) => {
    try {
        const { message, type, recipientEmails } = req.body;
        const senderEmail = req.user.email;
        const senderRole = req.user.role || 'admin';

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Message content is required' 
            });
        }

        const globalNotificationService = global.globalNotificationService;
        if (!globalNotificationService) {
            return res.status(500).json({ 
                success: false, 
                error: 'Global notification service not available' 
            });
        }

        const result = await globalNotificationService.sendGlobalNotification({
            senderRole,
            senderEmail,
            message: message.trim(),
            type: type || 'global_message',
            recipientEmails
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in send-global notification:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get connected users info (admin only)
router.get('/connected-users', protect, async (req, res) => {
    try {
        const userRole = req.user.role || 'employee';
        if (userRole !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                error: 'Admin access required' 
            });
        }

        const globalNotificationService = global.globalNotificationService;
        if (!globalNotificationService) {
            return res.status(500).json({ 
                success: false, 
                error: 'Global notification service not available' 
            });
        }

        const connectedUsers = globalNotificationService.getConnectedUsers();
        const userCount = globalNotificationService.getConnectedUsersCount();

        res.status(200).json({ 
            success: true, 
            data: { 
                connectedUsers, 
                userCount 
            } 
        });
    } catch (error) {
        console.error('Error getting connected users:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Test endpoint for desktop notifications
router.post('/test-desktop', async (req, res) => {
    try {
        const { message = 'Test desktop notification from HRM Portal' } = req.body;
        
        const globalNotificationService = global.globalNotificationService;
        if (!globalNotificationService) {
            return res.status(500).json({ 
                success: false, 
                error: 'Global notification service not available' 
            });
        }

        const result = await globalNotificationService.sendGlobalNotification({
            senderRole: 'system',
            senderEmail: 'system@hrmportal.com',
            message,
            type: 'test_notification'
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in test-desktop notification:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;
