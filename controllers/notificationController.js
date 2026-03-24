const { Notification } = require('../models');

const buildPreview = (message) => {
    const text = String(message || '');
    if (!text) return '';
    const len = text.length;
    const cut = Math.min(len, Math.max(20, Math.floor(len * 0.4), 60));
    const preview = text.slice(0, cut);
    return cut < len ? preview + '…' : preview;
};

// Helper function to send global notifications
const sendGlobalNotification = async (notificationData) => {
    try {
        const globalNotificationService = global.globalNotificationService;
        if (globalNotificationService) {
            await globalNotificationService.sendGlobalNotification(notificationData);
        }
    } catch (error) {
        console.error('Error sending global notification:', error);
    }
};

exports.getPublicNotifications = async (req, res) => {
    try {
        const { role } = req.query;
        const userId = (req.query.userId || '').toLowerCase();
        if (!role || !userId) {
            return res.status(400).json({ success: false, error: 'userId and role are required' });
        }

        const notifications = await Notification.findAll({
            where: { userId, role, isRead: false },
            order: [['timestamp', 'DESC']],
            limit: 20
        });

        const data = notifications.map(n => ({
            id: n.id,
            role: n.role,
            preview: buildPreview(n.message),
            timestamp: n.timestamp
        }));

        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const { role } = req.query;
        const userId = (req.query.userId || req.user.email || '').toLowerCase();
        
        if (!role) {
            return res.status(400).json({ success: false, error: 'role is required' });
        }

        const notifications = await Notification.findAll({
            where: { userId, role },
            order: [['timestamp', 'DESC']],
            limit: 50
        });

        res.status(200).json({ success: true, data: notifications });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByPk(id);
        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }

        await notification.update({ isRead: true });
        res.status(200).json({ success: true, data: notification });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const userId = (req.body.userId || req.user.email || '').toLowerCase();
        const role = req.body.role || req.query.role;

        if (!role) {
            return res.status(400).json({ success: false, error: 'role is required' });
        }

        await Notification.update(
            { isRead: true },
            { where: { userId, role, isRead: false } }
        );

        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Create global notification when message is sent
exports.createGlobalNotification = async (req, res) => {
    try {
        const { message, senderRole, senderEmail, type, recipientEmails } = req.body;
        
        if (!message || !senderRole || !senderEmail) {
            return res.status(400).json({ 
                success: false, 
                error: 'message, senderRole, and senderEmail are required' 
            });
        }

        // Send global notification
        await sendGlobalNotification({
            senderRole,
            senderEmail,
            message,
            type: type || 'message',
            recipientEmails
        });

        res.status(200).json({ 
            success: true, 
            message: 'Global notification sent successfully' 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
