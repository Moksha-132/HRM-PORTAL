import React from 'react';
import api from '../../services/api';
import socket from '../../services/socket';
import { requestDesktopNotificationPermission, showDesktopNotification } from '../../utils/browserNotifications';

const toRoleParam = (role) => (role || '').toString().trim().toLowerCase();

const formatStamp = (value) => {
  try {
    const date = new Date(value);
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
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
  const userEmail =
    sessionStorage.getItem('shnoor_email') ||
    localStorage.getItem('shnoor_email') ||
    sessionStorage.getItem('shnoor_admin_email') ||
    localStorage.getItem('shnoor_admin_email') ||
    '';

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
      const newUnread = items.filter((notification) => !notification?.isRead);
      newUnread.forEach((notification) => prevUnreadIdsRef.current.add(notification.id));
      setUnread(newUnread);
    } catch (e) {
      setError(e?.message || 'Failed to load notifications');
    } finally {
      if (isFirst) setLoading(false);
    }
  }, [roleParam]);

  React.useEffect(() => {
    if (!roleParam || !userEmail) return;

    requestDesktopNotificationPermission();

    const handleConnect = () => {
      socket.emit('register-global-notifications', { email: userEmail, role: roleParam });
      socket.emit('join_room', userEmail.toLowerCase());
    };

    const handleGlobalNotification = (data) => {
      if (
        !data.recipientEmails?.length ||
        data.recipientEmails.some((email) => email.toLowerCase() === userEmail.toLowerCase())
      ) {
        if (!prevUnreadIdsRef.current.has(data.id)) {
          prevUnreadIdsRef.current.add(data.id);
          setUnread((prev) => [data, ...prev]);
          showDesktopNotification(data.message, data.type ? `HRM: ${data.type}` : 'New Notification');
        }
      }
    };

    socket.connect();
    socket.on('connect', handleConnect);
    socket.on('global-notification', handleGlobalNotification);

    if (socket.connected) {
      handleConnect();
    }

    fetchNotifications(true);
    const timer = setInterval(() => fetchNotifications(false), 30000);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('global-notification', handleGlobalNotification);
      clearInterval(timer);
    };
  }, [fetchNotifications, roleParam, userEmail]);

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
            {loading ? <div className="notif-empty">Loading...</div> : null}
            {!loading && error ? <div className="notif-empty notif-error">{error}</div> : null}
            {!loading && !error && unread.length === 0 ? <div className="notif-empty">No new messages</div> : null}
            {!loading && !error
              ? unread.slice(0, 15).map((notification) => (
                  <div key={notification.id} className="notif-item">
                    <div className="notif-meta">
                      <span className="notif-type">
                        {(notification?.type || 'notification').toString().replaceAll('_', ' ')}
                      </span>
                      <span className="notif-time">{formatStamp(notification?.timestamp)}</span>
                    </div>
                    <div className="notif-msg">{notification?.message || ''}</div>
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
