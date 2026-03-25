import React from 'react';
import api from '../../services/api';

const toRoleParam = (role) => (role || '').toString().trim().toLowerCase();

const formatStamp = (value) => {
  try {
    const date = new Date(value);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${dateStr}, ${timeStr}`;
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

  const fetchNotifications = React.useCallback(async () => {
    if (!roleParam) return;
    const token = sessionStorage.getItem('shnoor_token') || localStorage.getItem('shnoor_token');
    if (!token) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/notifications', { params: { role: roleParam } });
      const payload = res?.data;
      if (!payload?.success) throw new Error(payload?.error || 'Failed to load notifications');
      const items = Array.isArray(payload.data) ? payload.data : [];
      setUnread(items.filter((n) => !n?.isRead));
    } catch (e) {
      setError(e?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [roleParam]);

  React.useEffect(() => {
    fetchNotifications();
    const t = setInterval(fetchNotifications, 10000);
    return () => clearInterval(t);
  }, [fetchNotifications]);

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
