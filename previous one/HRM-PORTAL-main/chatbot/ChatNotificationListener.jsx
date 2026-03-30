const ChatNotificationListener = ({ role, userId, onNewMessage }) => {
  React.useEffect(() => {
    // Request desktop notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  React.useEffect(() => {
    if (!userId) return;

    // Connect to Socket.io for real-time chat notifications
    const token = sessionStorage.getItem('shnoor_token');
    const socket = io('/', {
      transports: ['websocket', 'polling'],
      auth: token ? { token } : {}
    });

    console.log('🔌 [Chat] Connecting to Socket.IO for chat notifications');
    console.log('🔌 [Chat] User ID:', userId);
    console.log('🔌 [Chat] Role:', role);

    socket.on('connect', () => {
      console.log('🔌✅ [Chat] Connected to Socket.IO');
      
      // Join personal notification room
      socket.emit('join_room', userId);
      console.log('🔌✅ [Chat] Joined notification room:', userId);
      
      // Register for chat notifications
      socket.emit('register-chat-notifications', {
        email: userId,
        role: role,
        timestamp: new Date().toISOString()
      });
      console.log('🔌✅ [Chat] Registered for chat notifications');
    });

    // Listen for new admin messages
    socket.on('new_notification', (data) => {
      console.log('💬📨 [Chat] Received notification:', data);
      
      showChatNotification(data);
      if (onNewMessage) {
        onNewMessage(data);
      }
    });

    // Listen for global chat notifications (alternative channel)
    socket.on('chat-message', (data) => {
      console.log('💬📨 [Chat] Received chat message:', data);
      
      showChatNotification(data);
      if (onNewMessage) {
        onNewMessage(data);
      }
    });

    socket.on('chat_update', (data) => {
      console.log('💬📨 [Chat] Received chat update:', data);
      
      showChatNotification({
        title: data.title || 'Chat Update',
        message: data.message || 'Your chat has been updated',
        type: 'chat_update'
      });
      if (onNewMessage) {
        onNewMessage(data);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('🔌❌ [Chat] Connection error:', error);
    });

    socket.on('disconnect', () => {
      console.log('🔌❌ [Chat] Disconnected from Socket.IO');
    });

    socket.on('error', (error) => {
      console.error('🔌❌ [Chat] Socket error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, role, onNewMessage]);

  const showChatNotification = (data) => {
    try {
      // Show desktop notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted' && !document.hidden) {
        const title = data.title || 'New Chat Message';
        const options = {
          body: data.message || data.content || 'You have a new message',
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: `chat-${Date.now()}`,
          requireInteraction: false,
          silent: false
        };

        try {
          const notification = new Notification(title, options);
          notification.onclick = () => {
            window.focus();
            notification.close();
          };

          // Auto-close after 10 seconds
          setTimeout(() => notification.close(), 10000);

          console.log('💬📬 [Chat] Desktop notification shown');
        } catch (err) {
          console.error('💬❌ [Chat] Failed to show desktop notification:', err);
        }
      }

      // Also show in-app toast if window is focused
      if (document.hasFocus && document.hasFocus()) {
        showChatToast(data);
      }
    } catch (err) {
      console.error('💬❌ [Chat] Error showing notification:', err);
    }
  };

  const showChatToast = (data) => {
    const toast = document.createElement('div');
    toast.className = 'cb-toast-notification';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 99999;
      min-width: 300px;
      max-width: 400px;
      font-size: 14px;
      line-height: 1.5;
      animation: slideInRight 0.3s ease-out;
      cursor: pointer;
    `;

    const title = document.createElement('div');
    title.style.cssText = 'font-weight: 600; margin-bottom: 4px;';
    title.textContent = data.title || 'New Chat Message';

    const message = document.createElement('div');
    message.style.cssText = 'opacity: 0.95; font-size: 13px;';
    message.textContent = (data.message || data.content || 'You have a new message').substring(0, 100);

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: opacity 0.2s;
    `;

    closeBtn.onmouseover = () => closeBtn.style.opacity = '1';
    closeBtn.onmouseout = () => closeBtn.style.opacity = '0.7';
    closeBtn.onclick = () => toast.remove();

    toast.appendChild(title);
    toast.appendChild(message);
    toast.appendChild(closeBtn);
    document.body.appendChild(toast);

    // Add animation keyframes if not already present
    if (!document.getElementById('cb-toast-animations')) {
      const style = document.createElement('style');
      style.id = 'cb-toast-animations';
      style.textContent = `
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
      }
    }, 8000);

    console.log('💬📬 [Chat] In-app toast shown');
  };

  return null; // This is a listener component, no visual output
};

window.ChatNotificationListener = ChatNotificationListener;
