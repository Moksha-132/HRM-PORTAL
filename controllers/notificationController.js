const { Notification } = require('../models');

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

        console.log('MarkAllAsRead hit:', { userId, role });

        const result = await Notification.update(
            { isRead: true },
            { where: { userId, role, isRead: false } }
        );

        console.log('Update result:', result);

        res.status(200).json({ success: true, message: 'All notifications marked as read', count: result[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
