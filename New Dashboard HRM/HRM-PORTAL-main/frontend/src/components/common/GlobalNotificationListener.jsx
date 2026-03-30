import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSiteLogo } from '../../hooks/useSiteLogo';

const GlobalNotificationListener = () => {
  const [toasts, setToasts] = useState([]);
  const [authVersion, setAuthVersion] = useState(0);
  const logoUrl = useSiteLogo();

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
    
    console.log('Notification listener initialized for:', userEmail);

    socket.on('connect', () => {
      const storedRole = sessionStorage.getItem('shnoor_role') || localStorage.getItem('shnoor_role') || 'employee';
      console.log('Connected to global notification service (React) as', userEmail, 'with role', storedRole);
      socket.emit('register-global-notifications', {
        email: userEmail,
        role: storedRole,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('global-notification', (data) => {
      console.log('Received global notification (React):', data);
      
      // Filter by recipient if specified
      if (data.recipientEmails && data.recipientEmails.length > 0) {
        const isRecipient = data.recipientEmails.some(e => 
          e.toLowerCase() === userEmail.toLowerCase()
        );
        if (!isRecipient) return;
      }

      const id = Date.now();
      const messageText = data.preview || data.fullMessage || data.message;
      const newToast = {
        id,
        message: messageText,
        sender: data.senderRole
      };

      setToasts(prev => [...prev, newToast]);

      // SHOW NATIVE DESKTOP NOTIFICATION
      if (Notification.permission === 'granted') {
          try {
              new Notification('HRM Portal Alert', {
                  body: messageText,
                  icon: logoUrl.startsWith('http') ? logoUrl : window.location.origin + logoUrl,
                  requireInteraction: true // Keep it until the user clicks/dismisses
              });
          } catch (err) {
              console.error('Desktop notification failed:', err);
          }
      }

      // Auto-remove after 8 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 8000);
    });

    // Request desktop notification permissions on mount
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
