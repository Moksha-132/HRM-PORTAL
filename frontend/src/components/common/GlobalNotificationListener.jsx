import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const GlobalNotificationListener = () => {
  const [toasts, setToasts] = useState([]);
  const [authVersion, setAuthVersion] = useState(0);

  useEffect(() => {
    const onAuthChanged = () => setAuthVersion((v) => v + 1);
    window.addEventListener('auth-changed', onAuthChanged);
    window.addEventListener('storage', onAuthChanged);
    return () => {
      window.removeEventListener('auth-changed', onAuthChanged);
      window.removeEventListener('storage', onAuthChanged);
    };
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem('shnoor_token') || localStorage.getItem('shnoor_token');
    if (!token) return;

    // Use absolute URL or proxy
    const socket = io('/', {
      transports: ['websocket', 'polling'],
      auth: { token }
    });

    const userEmail = sessionStorage.getItem('shnoor_admin_email') || 
             sessionStorage.getItem('shnoor_email') || 
             localStorage.getItem('shnoor_admin_email') ||
             localStorage.getItem('shnoor_email') ||
                     'anonymous@user.com';
    
    // Simple role inference
    const inferRole = (email) => {
      const lower = email.toLowerCase();
      if (lower.includes('admin')) return 'admin';
      if (lower.includes('manager')) return 'manager';
      return 'employee';
    };

    socket.on('connect', () => {
      console.log('🔌✅ [React] Connected to Socket.IO');
      console.log('🔌✅ [React] Socket ID:', socket.id);
      console.log('🔌✅ [React] User Email:', userEmail);
      console.log('🔌✅ [React] Registering for global notifications...');
      socket.emit('register-global-notifications', {
        email: userEmail,
        role: inferRole(userEmail),
        timestamp: new Date().toISOString()
      });
    });

    socket.on('registration-confirmed', (data) => {
      console.log('🔌✅ [React] Registration confirmed:', data);
    });

    socket.on('connect_error', (error) => {
      console.error('🔌❌ [React] Connection error:', error);
    });

    socket.on('disconnect', () => {
      console.log('🔌❌ [React] Disconnected from Socket.IO');
    });

    socket.on('error', (error) => {
      console.error('🔌❌ [React] Socket error:', error);
    });

    socket.on('global-notification', (data) => {
      console.log('🔔📨 [React] Received global notification:', data);
      
      // Filter by recipient if specified
      if (data.recipientEmails && data.recipientEmails.length > 0) {
        const userEmailLower = userEmail.toLowerCase();
        const isRecipient = data.recipientEmails.some(e => e.toLowerCase() === userEmailLower);
        if (!isRecipient) return;
      }

      console.log('🔔📨 [React] Showing notification to user');
      const id = Date.now();
      const message = data.preview || data.fullMessage || data.message;
      
      const newToast = { id, message, sender: data.senderRole };
      setToasts(prev => [...prev, newToast]);

      // BROWSER DESKTOP NOTIFICATION
      if (Notification.permission === 'granted') {
        new Notification("Shnoor HRM", {
          body: message,
          icon: '/favicon.ico' // Or a specific icon
        });
      }

      // Auto-remove after 8 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 8000);
    });

    // Request permission on mount
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      socket.disconnect();
    };
  }, [authVersion]);

  return (
    <div 
      className="global-toast-container" 
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none'
      }}
    >
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className="global-toast"
          style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            padding: '16px 20px',
            borderLeft: '4px solid #4f46e5',
            minWidth: '300px',
            maxWidth: '400px',
            display: 'flex',
            alignItems: 'start',
            gap: '12px',
            pointerEvents: 'auto',
            animation: 'toastSlideIn 0.3s ease-out'
          }}
        >
          <div style={{ color: '#4f46e5', fontSize: '1.2rem', marginTop: '2px' }}>
            <i className="fas fa-bell"></i>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px', color: '#111827' }}>
              New Notification
            </div>
            <div style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.4' }}>
              {toast.message}
            </div>
          </div>
          <button 
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9ca3af',
              fontSize: '1.2rem',
              padding: '0 4px',
              marginTop: '-4px'
            }}
          >
            &times;
          </button>
        </div>
      ))}
      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default GlobalNotificationListener;
