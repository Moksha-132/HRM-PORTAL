const { Notification, WebsiteSetting } = require('../models');

class GlobalNotificationService {
    constructor(io) {
        this.io = io;
        this.connectedUsers = new Map(); // socketId -> userData
    }

    // Register user for global notifications
    registerUser(socketId, userData) {
        this.connectedUsers.set(socketId, {
            email: userData.email,
            role: userData.role,
            userAgent: userData.userAgent,
            registeredAt: new Date()
        });
        console.log(`User ${userData.email} registered for global notifications`);
    }

    // Unregister user
    unregisterUser(socketId) {
        const userData = this.connectedUsers.get(socketId);
        if (userData) {
            console.log(`User ${userData.email} unregistered from global notifications`);
            this.connectedUsers.delete(socketId);
        }
    }

    // Build partial preview for security (30-50% of content)
    buildPartialPreview(message, percentage = 0.4) {
        const text = String(message || '');
        if (!text) return '';
        
        const minLength = 20;
        const maxLength = 100;
        let targetLength = Math.max(minLength, Math.floor(text.length * percentage));
        targetLength = Math.min(targetLength, maxLength);
        
        const preview = text.slice(0, targetLength);
        return targetLength < text.length ? preview + '…' : preview;
    }

    // Send global desktop notification
    async sendGlobalNotification(notificationData) {
        try {
            console.log('📨 GlobalNotificationService.sendGlobalNotification called with:', notificationData);
            const { senderRole, senderEmail, message, type, recipientEmails } = notificationData;
            
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
            
            // If specific recipients provided, notify only them
            if (recipientEmails && recipientEmails.length > 0) {
                for (const email of recipientEmails) {
                    const notification = await Notification.create({
                        userId: email.toLowerCase(),
                        role: this.inferRoleFromEmail(email),
                        message,
                        type: type || 'global_message',
                        senderRole,
                        senderEmail,
                        isRead: false
                    });
                    notifications.push(notification);
                }
            } else {
                // Send to ALL users across all roles
                const allRoles = ['admin', 'employee', 'manager'];
                for (const role of allRoles) {
                    const notification = await Notification.create({
                        userId: 'global', // Special identifier for global messages
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

            // Emit real-time notification to all connected users
            const partialPreview = this.buildPartialPreview(message);
            console.log('📡 Emitting Socket.IO notification to room "global-notifications"');
            console.log('📡 Connected clients in io:', this.io.sockets.sockets.size);
            console.log('📡 Preview:', partialPreview);
            
            const notificationPayload = {
                id: notifications[0]?.id,
                senderRole,
                senderEmail,
                recipientEmails: recipientEmails || [], // Include recipient emails
                preview: partialPreview,
                fullMessage: message, // Only sent after login
                message: message,
                type: type || 'global_message',
                logo, // ✅ INCLUDE LOGO
                timestamp: new Date(),
                redirectUrl: this.buildRedirectUrl(senderRole, type, recipientEmails)
            };
            
            console.log('📡 Notification payload:', JSON.stringify(notificationPayload, null, 2));
            
            // Emit to all clients in global-notifications room
            const emitResult = this.io.to('global-notifications').emit('global-notification', notificationPayload);
            console.log('📡 Emit completed for room "global-notifications"');
            console.log('📡 Sockets in global-notifications room:', this.io.sockets.adapter.rooms.get('global-notifications')?.size || 0);

            console.log(`🔔 Global notification sent from ${senderRole} to ${notifications.length} users:`, message.substring(0, 50) + '...');
            return { success: true, notificationsSent: notifications.length };

        } catch (error) {
            console.error('❌ Error sending global notification:', error);
            return { success: false, error: error.message };
        }
    }

    // Infer role from email pattern (customize based on your email conventions)
    inferRoleFromEmail(email) {
        if (!email) return 'employee';
        
        const lowerEmail = email.toLowerCase();
        if (lowerEmail.includes('admin') || lowerEmail.includes('administrator')) {
            return 'admin';
        } else if (lowerEmail.includes('manager') || lowerEmail.includes('mgr')) {
            return 'manager';
        } else {
            return 'employee';
        }
    }

    // Build redirect URL for notification click
    buildRedirectUrl(senderRole, type, recipientEmails) {
        // Server-side URL building
        const baseUrl = 'http://localhost:5001';
        const loginUrl = `${baseUrl}/index.html#login`;
        
        // Add role-specific redirect info
        const redirectInfo = {
            from: senderRole,
            type: type || 'global_message',
            timestamp: Date.now(),
            recipientEmails: recipientEmails || [] // Include recipient emails
        };
        
        return `${loginUrl}?redirect=${encodeURIComponent(JSON.stringify(redirectInfo))}`;
    }

    // Get connected users count
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }

    // Get all connected users
    getConnectedUsers() {
        return Array.from(this.connectedUsers.entries()).map(([socketId, data]) => ({
            socketId,
            ...data
        }));
    }
}

module.exports = GlobalNotificationService;
