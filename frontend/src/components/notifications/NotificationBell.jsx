import React from 'react';
import api from '../../services/api';
import socket from '../../services/socket';

const toRoleParam = (role) => (role || '').toString().trim().toLowerCase();
const userEmail = sessionStorage.getItem('shnoor_email') || localStorage.getItem('shnoor_email') || '';

const formatStamp = (value) => {
  try {
    const date = new Date(value);
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
};

const showDesktopNotification = (message, title = 'HRM Portal') => {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body: message, icon: '/favicon.ico' });
  }
};

const NotificationBell = ({ role }) => {
  const roleParam = toRoleParam(role);
  const wrapRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const [unread, setUnread] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const prevUnreadIdsRef = React.useRef(new Set());

  const fetchNotifications = React.useCallback(async (isFirst = false) => {
    if (!roleParam) return;
    const token = sessionStorage.getItem('shnoor_token') || localStorage.getItem('shnoor_token');
    if (!token) return;

    if (isFirst) setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/notifications', { params: { role: roleParam } });
      const payload = res?.data;
      if (!payload?.success) throw new Error(payload?.error || 'Failed to load notifications');
      const items = Array.isArray(payload.data) ? payload.data : [];
      const newUnread = items.filter((n) => !n?.isRead);
      
      // Update the set of seen IDs to prevent duplicate popups from polling
      newUnread.forEach(n => prevUnreadIdsRef.current.add(n.id));
      setUnread(newUnread);
    } catch (e) {
      setError(e?.message || 'Failed to load notifications');
    } finally {
      if (isFirst) setLoading(false);
    }
  }, [roleParam]);

  // Socket.io Real-time setup
  React.useEffect(() => {
    if (!roleParam || !userEmail) return;

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Connect socket and register
    socket.connect();
    
    socket.on('connect', () => {
      socket.emit('register-global-notifications', { email: userEmail, role: roleParam });
      socket.emit('join_room', userEmail.toLowerCase());
    });

    socket.on('global-notification', (data) => {
      console.log('⚡️ Instant Notification Received:', data);
      // Check if intended for this user
      if (!data.recipientEmails?.length || data.recipientEmails.some(e => e.toLowerCase() === userEmail.toLowerCase())) {
         if (!prevUnreadIdsRef.current.has(data.id)) {
            prevUnreadIdsRef.current.add(data.id);
            setUnread(prev => [data, ...prev]);
            showDesktopNotification(data.message, data.type ? `HRM: ${data.type}` : 'New Notification');
         }
      }
    });

    // Fallback polling (less frequent now)
    fetchNotifications(true);
    const t = setInterval(() => fetchNotifications(false), 30000); 

    return () => {
      socket.off('global-notification');
      clearInterval(t);
    };
  }, [roleParam, userEmail, fetchNotifications]);

  React.useEffect(() => {
    const onDocClick = (e) => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      if (!wrap.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const markAllRead = async () => {
    if (!roleParam) return;
    const token = sessionStorage.getItem('shnoor_token') || localStorage.getItem('shnoor_token');
    if (!token) return;

    setError('');
    setUnread([]);
    try {
      const res = await api.put('/api/notifications/read-all', {}, { params: { role: roleParam } });
      const payload = res?.data;
      if (!payload?.success) throw new Error(payload?.error || 'Failed to mark as read');
      await fetchNotifications();
    } catch (e) {
      setError(e?.message || 'Failed to mark as read');
      await fetchNotifications();
    }
  };

  return (
    <div className="notif-wrap" ref={wrapRef}>
      <button
        type="button"
        className="notif-btn"
        aria-label="Notifications"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <i className="fa-solid fa-bell" aria-hidden="true" />
        {unread.length > 0 ? <span className="notif-badge">{unread.length > 99 ? '99+' : unread.length}</span> : null}
      </button>

      {open ? (
        <div className="notif-dropdown" role="dialog" aria-label="Notifications">
          <div className="notif-head">
            <div className="notif-title">Notifications</div>
            <button type="button" className="notif-clear" onClick={markAllRead} disabled={unread.length === 0}>
              Mark all read
            </button>
          </div>

          <div className="notif-body">
            {loading ? <div className="notif-empty">Loading…</div> : null}
            {!loading && error ? <div className="notif-empty notif-error">{error}</div> : null}
            {!loading && !error && unread.length === 0 ? <div className="notif-empty">No new messages</div> : null}
            {!loading && !error
              ? unread.slice(0, 15).map((n) => (
                  <div key={n.id} className="notif-item">
                    <div className="notif-meta">
                      <span className="notif-type">{(n?.type || 'notification').toString().replaceAll('_', ' ')}</span>
                      <span className="notif-time">{formatStamp(n?.timestamp)}</span>
                    </div>
                    <div className="notif-msg">{n?.message || ''}</div>
                  </div>
                ))
              : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default NotificationBell;
