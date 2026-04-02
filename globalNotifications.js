class GlobalNotificationClient {
    constructor() {
        this.socket = null;
        this.userEmail = null;
        this.userRole = null;
        this.isConnected = false;
        this.notificationQueue = [];
        this.hasPermission = false;
        
        // Request notification permission on initialization
        this.requestNotificationPermission();
    }

    // Request browser notification permission
    async requestNotificationPermission() {
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                this.hasPermission = permission === 'granted';
            } else {
                this.hasPermission = Notification.permission === 'granted';
            }
        } else {
            console.warn('This browser does not support desktop notifications');
        }
    }

    // Connect to global notification service
    connect() {
        try {
            // Get user info from session storage
            this.userEmail = sessionStorage.getItem('shnoor_admin_email') || 
                           sessionStorage.getItem('shnoor_email') || 
                           localStorage.getItem('shnoor_admin_email') ||
                           localStorage.getItem('shnoor_email') ||
                           'anonymous@user.com';

            const persistedRole = sessionStorage.getItem('shnoor_role') || localStorage.getItem('shnoor_role');
            this.userRole = (persistedRole || this.inferRoleFromEmail(this.userEmail) || 'employee').toString().toLowerCase();
            this.userEmail = String(this.userEmail || '').trim().toLowerCase();

            // Connect to socket.io
            this.socket = io('/', {
                transports: ['websocket', 'polling']
            });

            this.socket.on('connect', () => {
                console.log('Connected to global notification service');
                this.isConnected = true;
                this.registerForNotifications();
            });

            this.socket.on('disconnect', () => {
                console.log('Disconnected from global notification service');
                this.isConnected = false;
            });

            this.socket.on('global-notification', (data) => {
                this.handleGlobalNotification(data);
            });

            this.socket.on('connect_error', (error) => {
                console.error('Global notification connection error:', error);
            });

        } catch (error) {
            console.error('Error connecting to global notification service:', error);
        }
    }

    // Register user for global notifications
    registerForNotifications() {
        if (this.socket && this.isConnected) {
            this.socket.emit('join_room', this.userEmail);
            this.socket.emit('register-global-notifications', {
                email: this.userEmail,
                role: this.userRole,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Handle incoming global notification
    handleGlobalNotification(data) {
        console.log('Received global notification:', data);

        const recipients = Array.isArray(data?.recipientEmails) ? data.recipientEmails : [];
        if (recipients.length > 0) {
            const me = String(this.userEmail || '').toLowerCase();
            const sender = String(data?.senderEmail || '').toLowerCase();
            const isRecipient = recipients.some(email => String(email || '').toLowerCase() === me);
            const isSender = me && sender && me === sender;
            if (!isRecipient && !isSender) {
                console.log('Skipping notification - not intended for this user');
                return;
            }
        }

        // Store in queue for later if user is not logged in
        if (!this.isUserLoggedIn()) {
            this.notificationQueue.push(data);
        }

        // Explicitly show both notifications: system desktop + in-app popup.
        this.showDesktopNotification(data);
        this.showToast(data);

        // Also store in local storage for persistence
        this.storeNotification(data);
    }

    // Show desktop notification
    showDesktopNotification(data) {
        if (Notification.permission === 'default') {
            this.requestNotificationPermission();
        }

        if (!this.hasPermission || Notification.permission !== 'granted') {
            console.warn('Notification permission not granted');
            return false;
        }

        const { id, senderRole, senderEmail, preview, type, timestamp, redirectUrl } = data;
        const fromEmail = senderEmail || '';
        const toEmail = data?.recipientEmail || data?.recipientEmails?.[0] || this.userEmail || '';

        const title = `HRM Portal - Message for ${toEmail || this.userEmail || 'user'}`;
        const body = `From: ${data?.senderRole || 'admin'} (${fromEmail})\n${preview || ''}`.trim();
        const notification = new Notification(title, {
            body: body,
            icon: '/favicon.ico', // Add your favicon path
            badge: '/favicon.ico',
            tag: `hrm-global-${id}`,
            requireInteraction: true,
            silent: false
        });

        // Handle notification click
        notification.onclick = () => {
            console.log('Desktop notification clicked');
            this.handleNotificationClick(data);
            notification.close();
        };

        // Auto-close after 10 seconds
        setTimeout(() => {
            notification.close();
        }, 10000);

        return true;
    }

    // Handle notification click - redirect to login with pre-filled email
    handleNotificationClick(data) {
        const { senderRole, type, redirectUrl } = data;
        
        // Build login URL with pre-filled email and redirect info
        const loginUrl = this.buildLoginRedirectUrl(data);
        
        // Redirect to login page
        window.location.href = loginUrl;
    }

    // Show in-app toast notification
    showToast(data) {
        const toastId = `toast-${Date.now()}`;
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = 'global-toast';
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: var(--card-bg, #f6f8fb); border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            padding: 16px; border-left: 4px solid var(--primary);
            z-index: 9999; display: flex; align-items: start;
            gap: 12px; min-width: 300px; animation: slideIn 0.3s ease forwards;
        `;

        toast.innerHTML = `
            <div style="font-size: 1.5rem; color: var(--primary);">
                <i class="fas fa-bell"></i>
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 4px;">New Notification</div>
                <div style="font-size: 0.85rem; color: var(--text, #334155);">${data.preview || data.fullMessage || data.message}</div>
                <div style="margin-top: 8px; font-size: 0.75rem; color: #9ca3af;">Click to view</div>
            </div>
            <button data-close="1" style="background:none; border:none; cursor:pointer; color: #9ca3af; font-size: 1.2rem;">&times;</button>
        `;

        if (!document.getElementById('global-toast-styles')) {
            const style = document.createElement('style');
            style.id = 'global-toast-styles';
            style.innerHTML = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        toast.addEventListener('click', (e) => {
            const target = e.target;
            if (target && target.getAttribute && target.getAttribute('data-close') === '1') {
                toast.remove();
                return;
            }
            this.handleNotificationClick(data);
            toast.remove();
        });

        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, 12000);
    }

    // Build login redirect URL with email pre-fill
    buildLoginRedirectUrl(data) {
        const baseUrl = window.location.origin;
        const loginPath = '/index.html#login';
        
        const redirectInfo = {
            email: this.userEmail,
            from: data.senderRole,
            type: data.type,
            notificationId: data.id,
            timestamp: data.timestamp
        };

        const params = new URLSearchParams({
            email: this.userEmail,
            redirect: JSON.stringify(redirectInfo)
        });

        return `${baseUrl}${loginPath}?${params.toString()}`;
    }

    // Store notification in local storage
    storeNotification(data) {
        try {
            const storedNotifications = JSON.parse(localStorage.getItem('hrm_global_notifications') || '[]');
            storedNotifications.unshift({
                ...data,
                receivedAt: new Date().toISOString(),
                read: false
            });

            // Keep only last 50 notifications
            const limitedNotifications = storedNotifications.slice(0, 50);
            localStorage.setItem('hrm_global_notifications', JSON.stringify(limitedNotifications));
        } catch (error) {
            console.error('Error storing notification:', error);
        }
    }

    // Get stored notifications
    getStoredNotifications() {
        try {
            return JSON.parse(localStorage.getItem('hrm_global_notifications') || '[]');
        } catch (error) {
            console.error('Error retrieving stored notifications:', error);
            return [];
        }
    }

    // Clear stored notifications
    clearStoredNotifications() {
        localStorage.removeItem('hrm_global_notifications');
        this.notificationQueue = [];
    }

    // Check if user is logged in
    isUserLoggedIn() {
        return !!sessionStorage.getItem('shnoor_token');
    }

    // Infer role from email
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

    // Disconnect from service
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.isConnected = false;
    }

    // Get connection status
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            userEmail: this.userEmail,
            userRole: this.userRole,
            hasPermission: this.hasPermission,
            queuedNotifications: this.notificationQueue.length
        };
    }
}

// Create global instance
window.globalNotificationClient = new GlobalNotificationClient();

// Auto-connect when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.globalNotificationClient.connect();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, keep connection alive for notifications
        console.log('Page hidden, keeping notification connection alive');
    } else {
        // Page is visible, ensure connection is active
        if (!window.globalNotificationClient.isConnected) {
            window.globalNotificationClient.connect();
        }
    }
});
