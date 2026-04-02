const { Notification, WebsiteSetting } = require('../models');

class GlobalNotificationService {
    constructor(io) {
        this.io = io;
        this.connectedUsers = new Map();
    }

    registerUser(socketId, userData) {
        this.connectedUsers.set(socketId, {
            email: userData.email,
            role: userData.role,
            userAgent: userData.userAgent,
            registeredAt: new Date()
        });
        console.log(`User ${userData.email} registered for global notifications`);
    }

    unregisterUser(socketId) {
        const userData = this.connectedUsers.get(socketId);
        if (userData) {
            console.log(`User ${userData.email} unregistered from global notifications`);
            this.connectedUsers.delete(socketId);
        }
    }

    buildPartialPreview(message, percentage = 0.4) {
        const text = String(message || '');
        if (!text) return '';

        const minLength = 20;
        const maxLength = 100;
        let targetLength = Math.max(minLength, Math.floor(text.length * percentage));
        targetLength = Math.min(targetLength, maxLength);

        const preview = text.slice(0, targetLength);
        return targetLength < text.length ? `${preview}...` : preview;
    }

    async sendGlobalNotification(notificationData) {
        try {
            console.log('📨 GlobalNotificationService.sendGlobalNotification called with:', notificationData);
            const {
                senderRole,
                senderEmail,
                message,
                type,
                recipientEmails,
                recipientRole,
                recipientRolesByEmail = {}
            } = notificationData;

            const normalizedRecipientEmails = Array.isArray(recipientEmails)
                ? [...new Set(recipientEmails
                    .map((email) => String(email || '').trim().toLowerCase())
                    .filter(Boolean))]
                : [];
            
            // Fetch company logo
            let logo = '/logo.avif';
            try {
                const settings = await WebsiteSetting.findOne();
                if (settings && settings.logoUrl) {
                    logo = settings.logoUrl;
                }
            } catch (err) {
                console.warn('⚠️ Failed to fetch logo for notification:', err.message);
            }

            // Store in database for all relevant users
            const notifications = [];

            if (normalizedRecipientEmails.length > 0) {
                for (const email of normalizedRecipientEmails) {
                    const resolvedRole =
                        recipientRolesByEmail?.[email] ||
                        recipientRolesByEmail?.[String(email || '').trim()] ||
                        recipientRole ||
                        this.inferRoleFromEmail(email);

                    const notification = await Notification.create({
                        userId: email,
                        role: String(resolvedRole || 'employee').toLowerCase(),
                        message,
                        type: type || 'global_message',
                        senderRole,
                        senderEmail,
                        isRead: false
                    });
                    notifications.push(notification);
                }
            } else {
                const allRoles = ['admin', 'employee', 'manager'];
                for (const role of allRoles) {
                    const notification = await Notification.create({
                        userId: 'global',
                        role,
                        message,
                        type: type || 'global_message',
                        senderRole,
                        senderEmail,
                        isRead: false
                    });
                    notifications.push(notification);
                }
            }

            const notificationPayload = {
                id: notifications[0]?.id,
                senderRole,
                senderEmail,
                recipientEmails: normalizedRecipientEmails,
                preview: this.buildPartialPreview(message),
                fullMessage: message,
                message,
                type: type || 'global_message',
                logo,
                timestamp: new Date(),
                redirectUrl: this.buildRedirectUrl(senderRole, type, normalizedRecipientEmails)
            };

            this.io.to('global-notifications').emit('global-notification', notificationPayload);
            console.log('[GlobalNotificationService] emitted to global-notifications room');
            console.log('[GlobalNotificationService] sockets in global-notifications room:', this.io.sockets.adapter.rooms.get('global-notifications')?.size || 0);

            for (const email of normalizedRecipientEmails) {
                this.io.to(email).emit('global-notification', notificationPayload);
                console.log(`[GlobalNotificationService] emitted to recipient room ${email}`);
            }

            return { success: true, notificationsSent: notifications.length };
        } catch (error) {
            console.error('[GlobalNotificationService] Error sending global notification:', error);
            return { success: false, error: error.message };
        }
    }

    inferRoleFromEmail(email) {
        if (!email) return 'employee';

        const lowerEmail = email.toLowerCase();
        if (lowerEmail.includes('admin') || lowerEmail.includes('administrator')) {
            return 'admin';
        }
        if (lowerEmail.includes('manager') || lowerEmail.includes('mgr')) {
            return 'manager';
        }
        return 'employee';
    }

    buildRedirectUrl(senderRole, type, recipientEmails) {
        // Server-side URL building
        const baseUrl = `http://localhost:${process.env.PORT || 5000}`;
        const loginUrl = `${baseUrl}/index.html#login`;

        const redirectInfo = {
            from: senderRole,
            type: type || 'global_message',
            timestamp: Date.now(),
            recipientEmails: recipientEmails || []
        };

        return `${loginUrl}?redirect=${encodeURIComponent(JSON.stringify(redirectInfo))}`;
    }

    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }

    getConnectedUsers() {
        return Array.from(this.connectedUsers.entries()).map(([socketId, data]) => ({
            socketId,
            ...data
        }));
    }
}

module.exports = GlobalNotificationService;
