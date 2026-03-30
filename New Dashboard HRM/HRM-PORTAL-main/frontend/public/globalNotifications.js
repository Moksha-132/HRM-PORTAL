class GlobalNotificationClient {
  constructor() {
    this.socket = null;
    this.userEmail = null;
    this.userRole = null;
    this.isConnected = false;
    this.notificationQueue = [];
    this.hasPermission = false;

    this.requestNotificationPermission();
  }

  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return;
    }

    try {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        this.hasPermission = permission === 'granted';
      } else {
        this.hasPermission = Notification.permission === 'granted';
      }
    } catch {
      this.hasPermission = false;
    }
  }

  getStored(key) {
    try {
      return sessionStorage.getItem(key) || localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  connect() {
    try {
      this.userEmail =
        this.getStored('shnoor_admin_email') ||
        this.getStored('shnoor_email') ||
        this.getStored('hrm_last_email') ||
        'anonymous@user.com';

      this.userEmail = String(this.userEmail || 'anonymous@user.com').toLowerCase();

      const storedRole = this.getStored('shnoor_role');
      this.userRole = storedRole ? String(storedRole).toLowerCase() : this.inferRoleFromEmail(this.userEmail);

      // Ensure a single active connection
      if (this.socket) {
        try {
          this.socket.disconnect();
        } catch {
          // ignore
        }
        this.socket = null;
        this.isConnected = false;
      }

      this.socket = io('/', { transports: ['websocket', 'polling'] });

      this.socket.on('connect', () => {
        this.isConnected = true;
        this.registerForNotifications();
      });

      this.socket.on('disconnect', () => {
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

  registerForNotifications() {
    if (this.socket && this.isConnected) {
      this.socket.emit('register-global-notifications', {
        email: this.userEmail,
        role: this.userRole,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });

      // Back-compat: join explicit room if server supports it.
      this.socket.emit('join_room', this.userEmail);
    }
  }

  handleGlobalNotification(data) {
    if (!this.isUserLoggedIn()) {
      this.notificationQueue.push(data);
    }

    this.showDesktopNotification(data);
    this.showToast(data);
    this.storeNotification(data);
  }

  showDesktopNotification(data) {
    if (!this.hasPermission) return;

    const fromEmail = data?.senderEmail || '';
    const toEmail = data?.recipientEmail || data?.recipientEmails?.[0] || this.userEmail || '';
    const preview = data?.preview || data?.fullMessage || data?.message || '';
    const id = data?.id || Date.now();

    const title = 'HRM Portal - New message';
    const body = `From: ${fromEmail}\nTo: ${toEmail}\n${preview}`.trim();

    const notification = new Notification(title, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: `hrm-global-${id}`,
      requireInteraction: true,
      silent: false,
    });

    notification.onclick = () => {
      this.handleNotificationClick(data);
      notification.close();
    };

    setTimeout(() => notification.close(), 30000);
  }

  showToast(data) {
    const toast = document.createElement('div');
    toast.className = 'global-toast';
    toast.style.cssText = `
      position: fixed; top: 20px; right: 20px;
      background: white; border-radius: 12px;
      box-shadow: 0 18px 60px rgba(15,23,42,0.18);
      padding: 14px 14px; border-left: 4px solid var(--primary, #6366f1);
      z-index: 99999; display: flex; align-items: start;
      gap: 12px; min-width: 320px; max-width: 380px;
      animation: slideIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) both;
      cursor: pointer;
    `;

    const fromEmail = data?.senderEmail || '';
    const toEmail = data?.recipientEmail || data?.recipientEmails?.[0] || this.userEmail || '';
    const msg = data?.preview || data?.fullMessage || data?.message || '';

    toast.innerHTML = `
      <div style="font-size: 1.35rem; color: var(--primary, #6366f1); line-height: 1;">
        <i class="fas fa-bell"></i>
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 800; font-size: 0.9rem; margin-bottom: 4px; color: #0f172a;">New message</div>
        <div style="font-size: 0.8rem; color: #334155; margin-bottom: 4px;">From: <b>${fromEmail}</b></div>
        <div style="font-size: 0.8rem; color: #334155; margin-bottom: 8px;">To: <b>${toEmail}</b></div>
        <div style="font-size: 0.85rem; color: #475569;">${msg}</div>
        <div style="margin-top: 10px; font-size: 0.75rem; color: #94a3b8;">Click to open</div>
      </div>
      <button data-close="1" style="background:none; border:none; cursor:pointer; color: #94a3b8; font-size: 1.2rem; line-height: 1;">&times;</button>
    `;

    if (!document.getElementById('global-toast-styles')) {
      const style = document.createElement('style');
      style.id = 'global-toast-styles';
      style.innerHTML = `
        @keyframes slideIn {
          from { transform: translateX(16px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    toast.addEventListener('click', (e) => {
      const t = e.target;
      if (t && t.getAttribute && t.getAttribute('data-close') === '1') {
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

  handleNotificationClick(data) {
    const loginUrl = this.buildLoginRedirectUrl(data);
    window.location.href = loginUrl;
  }

  buildLoginRedirectUrl(data) {
    const baseUrl = window.location.origin;
    const loginPath = '/login';

    const toEmail = data?.recipientEmail || data?.recipientEmails?.[0] || this.userEmail || '';
    const redirectInfo = {
      email: toEmail,
      from: data?.senderRole,
      fromEmail: data?.senderEmail,
      type: data?.type,
      notificationId: data?.id,
      timestamp: data?.timestamp,
    };

    const params = new URLSearchParams({
      email: toEmail,
      redirect: JSON.stringify(redirectInfo),
    });

    return `${baseUrl}${loginPath}?${params.toString()}`;
  }

  storeNotification(data) {
    try {
      const stored = JSON.parse(localStorage.getItem('hrm_global_notifications') || '[]');
      stored.unshift({
        ...data,
        receivedAt: new Date().toISOString(),
        read: false,
      });
      localStorage.setItem('hrm_global_notifications', JSON.stringify(stored.slice(0, 50)));
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  isUserLoggedIn() {
    return !!this.getStored('shnoor_token');
  }

  inferRoleFromEmail(email) {
    if (!email) return 'employee';
    const lowerEmail = String(email).toLowerCase();
    if (lowerEmail.includes('admin') || lowerEmail.includes('administrator')) return 'admin';
    if (lowerEmail.includes('manager') || lowerEmail.includes('mgr')) return 'manager';
    return 'employee';
  }

  disconnect() {
    if (this.socket) {
      try {
        this.socket.disconnect();
      } catch {
        // ignore
      }
      this.socket = null;
    }
    this.isConnected = false;
  }
}

window.globalNotificationClient = new GlobalNotificationClient();

document.addEventListener('DOMContentLoaded', () => {
  window.globalNotificationClient.connect();
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !window.globalNotificationClient.isConnected) {
    window.globalNotificationClient.connect();
  }
});

