const { Notification } = require('../models');

exports.getNotifications = async (req, res) => {
    try {
        const { userId, role } = req.query;
        if (!userId || !role) {
            return res.status(400).json({ success: false, error: 'userId and role are required' });
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
        const { userId, role } = req.body;
        if (!userId || !role) {
            return res.status(400).json({ success: false, error: 'userId and role are required' });
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
