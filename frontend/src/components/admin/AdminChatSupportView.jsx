import React from 'react';

const ADMIN_THEME = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  userBubble: '#6366f1',
  botBubble: 'rgba(99, 102, 241, 0.14)',
};

const ROLE_TABS = [
  { id: 'all', label: 'All' },
  { id: 'public', label: 'Portal' },
  { id: 'employee', label: 'Employee' },
  { id: 'manager', label: 'Manager' },
];

const normalizeRole = (role) => (role || 'public').toString().trim().toLowerCase();

const toUserName = (chat) => {
  const name = chat?.user?.name || chat?.user?.employee_name;
  if (name) return name;
  const email = chat?.user?.email || chat?.userId;
  if (email && typeof email === 'string' && email.includes('@')) return email.split('@')[0];
  return chat?.userId || 'User';
};

const AdminChatSupportView = () => {
  const token = sessionStorage.getItem('shnoor_token') || localStorage.getItem('shnoor_token');
  const role = sessionStorage.getItem('shnoor_role') || localStorage.getItem('shnoor_role') || '';
  const isAdmin = role === 'Admin' || role === 'Super Admin';
  const [allChats, setAllChats] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [activeRole, setActiveRole] = React.useState('all');
  const [selectedSessionKey, setSelectedSessionKey] = React.useState(null);
  const [replyText, setReplyText] = React.useState('');
  const [replyFile, setReplyFile] = React.useState(null);
  const [sending, setSending] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const [editText, setEditText] = React.useState('');
  const [closing, setClosing] = React.useState(false);

  React.useEffect(() => {
    const rootTarget = document.documentElement;
    rootTarget.style.setProperty('--cb-primary', ADMIN_THEME.primary);
    rootTarget.style.setProperty('--cb-primary-dark', ADMIN_THEME.primaryDark);
    rootTarget.style.setProperty('--cb-user', ADMIN_THEME.userBubble);
    rootTarget.style.setProperty('--cb-bot', ADMIN_THEME.botBubble);
  }, []);

  const fetchChats = React.useCallback(async () => {
    if (!token || !isAdmin) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/chats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load chats');
      setAllChats(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      setError(e.message || 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  }, [token, isAdmin]);

  React.useEffect(() => {
    if (!token || !isAdmin) return undefined;
    fetchChats();
    const t = setInterval(fetchChats, 10000);
    return () => clearInterval(t);
  }, [fetchChats]);

  const sessions = React.useMemo(() => {
    const filtered = activeRole === 'all' ? allChats : allChats.filter((c) => normalizeRole(c.role) === activeRole);

    const map = new Map();
    filtered.forEach((c) => {
      const role = normalizeRole(c.role);
      const key = `${c.userId}__${role}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          userId: c.userId,
          role,
          userName: toUserName(c),
          userEmail: c?.user?.email || c.userId,
          lastAt: c.timestamp,
          lastMsg: c.message,
          count: 0,
          needsAction: false,
        });
      }
      const s = map.get(key);
      s.count += 1;
      if (c.status === 'NeedsAdmin') s.needsAction = true;
      if (c.timestamp && new Date(c.timestamp) > new Date(s.lastAt || 0)) {
        s.lastAt = c.timestamp;
        s.lastMsg = c.message;
      }
    });

    return Array.from(map.values()).sort((a, b) => new Date(b.lastAt || 0) - new Date(a.lastAt || 0));
  }, [allChats, activeRole]);

  const selectedSession = React.useMemo(() => {
    if (!selectedSessionKey) return null;
    return sessions.find((s) => s.key === selectedSessionKey) || null;
  }, [sessions, selectedSessionKey]);

  React.useEffect(() => {
    if (!selectedSessionKey) return;
    const stillExists = sessions.some((s) => s.key === selectedSessionKey);
    if (!stillExists) setSelectedSessionKey(null);
  }, [sessions, selectedSessionKey]);

  const thread = React.useMemo(() => {
    if (!selectedSession) return [];
    return allChats
      .filter((c) => c.userId === selectedSession.userId && normalizeRole(c.role) === selectedSession.role)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [allChats, selectedSession]);

  if (!token) {
    return (
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Chat Support</div>
        </div>
        <div className="panel-body" style={{ padding: 16 }}>
          <p style={{ margin: 0, color: '#64748b' }}>Please login again to access chat support.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Chat Support</div>
        </div>
        <div className="panel-body" style={{ padding: 16 }}>
          <p style={{ margin: 0, color: '#64748b' }}>Admin access required.</p>
        </div>
      </div>
    );
  }

  const sendAdminMessage = async () => {
    if (!selectedSession) return;
    const trimmed = replyText.trim();
    if (!trimmed && !replyFile) return;

    setSending(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('session_id', selectedSession.userId);
      formData.append('target_role', selectedSession.role);
      formData.append('content', trimmed || '(attachment)');
      if (replyFile) formData.append('file', replyFile);

      const res = await fetch('/api/v1/chat/message', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');

      setReplyText('');
      setReplyFile(null);
      await fetchChats();
    } catch (e) {
      setError(e.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const saveEditedResponse = async (chatId) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    setError('');
    try {
      const res = await fetch(`/api/admin/chat/${chatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ response: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setEditingId(null);
      setEditText('');
      await fetchChats();
    } catch (e) {
      setError(e.message || 'Update failed');
    }
  };

  const closeSession = async () => {
    if (!selectedSession) return;
    setClosing(true);
    setError('');
    try {
      const res = await fetch(`/api/v1/chat/session/${encodeURIComponent(selectedSession.userId)}/close`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to close session');
      setSelectedSessionKey(null);
      await fetchChats();
    } catch (e) {
      setError(e.message || 'Failed to close session');
    } finally {
      setClosing(false);
    }
  };

  return (
    <div style={{ padding: 0 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {ROLE_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveRole(t.id)}
            style={{
              padding: '6px 16px',
              borderRadius: 999,
              border: `1px solid ${activeRole === t.id ? 'var(--primary, #4f6ef7)' : 'var(--border, #e2e8f0)'}`,
              background: activeRole === t.id ? 'var(--primary, #4f6ef7)' : '#fff',
              color: activeRole === t.id ? '#fff' : 'var(--text, #0f172a)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: activeRole === t.id ? 600 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
        <button
          type="button"
          onClick={fetchChats}
          style={{
            marginLeft: 'auto',
            padding: '6px 12px',
            borderRadius: 10,
            border: '1px solid var(--border, #e2e8f0)',
            background: '#fff',
            color: '#334155',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 12, color: '#b91c1c', fontSize: 13 }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: 20, minHeight: 600 }}>
        <div className="panel" style={{ width: 320, minWidth: 280, display: 'flex', flexDirection: 'column' }}>
          <div className="panel-head">
            <div className="panel-title">Users</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {loading && sessions.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: 20 }}>Loading...</p>
            ) : sessions.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: 20 }}>No conversations found</p>
            ) : (
              sessions.map((s) => (
                <div
                  key={s.key}
                  onClick={() => setSelectedSessionKey(s.key)}
                  style={{
                    padding: '12px 10px',
                    cursor: 'pointer',
                    borderRadius: 8,
                    marginBottom: 4,
                    background: selectedSessionKey === s.key ? 'rgba(79,110,247,0.08)' : 'transparent',
                    borderLeft: `3px solid ${selectedSessionKey === s.key ? 'var(--primary, #4f6ef7)' : 'transparent'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <strong style={{ fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>
                      {s.userName}
                    </strong>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {s.needsAction && (
                        <span style={{ background: '#ef4444', color: '#fff', fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                          ACTION
                        </span>
                      )}
                      <span style={{ background: '#f1f5f9', color: '#334155', fontSize: 10, padding: '2px 8px', borderRadius: 999, fontWeight: 700, textTransform: 'uppercase' }}>
                        {s.role}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{s.count} messages • {s.lastAt ? new Date(s.lastAt).toLocaleDateString() : ''}</div>
                  <div style={{ fontSize: 12, color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 4 }}>
                    {s.lastMsg}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="panel-title">
                {selectedSession ? `${selectedSession.userName} (${selectedSession.userEmail})` : 'Select a user'}
              </div>
              {selectedSession && (
                <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, fontWeight: 800, background: '#f1f5f9', color: '#334155', textTransform: 'uppercase' }}>
                  {selectedSession.role}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={closeSession}
              disabled={!selectedSession || closing}
              className="btn btn-outline"
              style={{ display: selectedSession ? 'inline-flex' : 'none', color: 'var(--danger, #ef4444)', borderColor: 'var(--danger, #ef4444)' }}
            >
              {closing ? 'Closing...' : 'Close Session'}
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16, background: '#f8fafc' }}>
            {!selectedSession ? (
              <p style={{ textAlign: 'center', color: '#64748b', marginTop: 60 }}>
                Select a user from the left panel to view their chat history
              </p>
            ) : thread.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', marginTop: 60 }}>No messages yet.</p>
            ) : (
              thread.map((msg) => {
                const isAdmin = msg.sender_type === 'Admin';
                return (
                  <div key={msg.id}>
                    <div
                      className={`cb-bubble ${isAdmin ? 'user' : 'bot'}`}
                      style={{
                        maxWidth: '85%',
                        marginLeft: isAdmin ? 'auto' : 0,
                        background: isAdmin ? 'var(--cb-primary)' : '#e2e8f0',
                        color: isAdmin ? '#fff' : '#0f172a',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4 }}>
                        {isAdmin ? 'You (Admin)' : `${msg.userId} (${normalizeRole(msg.role)})`}
                      </div>
                      <div>{msg.message}</div>
                      {msg.fileUrl && (
                        <div style={{ marginTop: 8 }}>
                          {msg.fileType?.startsWith('image/') ? (
                            <img
                              src={msg.fileUrl}
                              alt="Attachment"
                              style={{ maxHeight: 120, borderRadius: 8, cursor: 'pointer' }}
                              onClick={() => window.open(msg.fileUrl, '_blank')}
                            />
                          ) : (
                            <a
                              href={msg.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: isAdmin ? '#fff' : '#2563eb', fontSize: 11, textDecoration: 'underline' }}
                            >
                              View Attachment
                            </a>
                          )}
                        </div>
                      )}
                      <div style={{ fontSize: 10, opacity: 0.75, marginTop: 6 }}>{new Date(msg.timestamp).toLocaleString()}</div>
                    </div>

                    {!isAdmin && msg.response && (
                      <div className="cb-bubble user" style={{ maxWidth: '85%', marginLeft: 'auto', background: 'var(--cb-primary)', color: '#fff', marginTop: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4 }}>Bot/Admin Response</div>
                        {editingId === msg.id ? (
                          <div>
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              style={{
                                width: '100%',
                                minHeight: 70,
                                borderRadius: 8,
                                border: '1px solid rgba(255,255,255,0.6)',
                                padding: 10,
                                fontSize: 12,
                                background: 'rgba(255,255,255,0.1)',
                                color: '#fff',
                              }}
                            />
                            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                              <button
                                type="button"
                                onClick={() => saveEditedResponse(msg.id)}
                                style={{ background: '#fff', color: 'var(--cb-primary)', border: 'none', padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(null);
                                  setEditText('');
                                }}
                                style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.8)', padding: '6px 10px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div>{msg.response}</div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(msg.id);
                                setEditText(msg.response || '');
                              }}
                              style={{ marginTop: 8, background: 'rgba(255,255,255,0.18)', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}
                            >
                              Edit Response
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {selectedSession && (
            <div style={{ padding: 14, background: '#fff', borderTop: '1px solid var(--border, #e2e8f0)' }}>
              {replyFile && (
                <div style={{ fontSize: 12, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#334155' }}>
                  <span>Attachment: {replyFile.name}</span>
                  <button type="button" onClick={() => setReplyFile(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                    Remove
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      sendAdminMessage();
                    }
                  }}
                  placeholder="Type a reply to the user..."
                  className="input"
                  style={{ flex: 1, borderRadius: 30, padding: '10px 18px' }}
                  disabled={sending}
                />
                <label style={{ cursor: sending ? 'not-allowed' : 'pointer' }}>
                  <input type="file" style={{ display: 'none' }} disabled={sending} onChange={(e) => setReplyFile(e.target.files?.[0] || null)} />
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '10px 12px', borderRadius: 12, border: '1px solid var(--border, #e2e8f0)', fontSize: 12, color: '#475569' }}>
                    Attach
                  </span>
                </label>
                <button
                  type="button"
                  onClick={sendAdminMessage}
                  disabled={sending || (!replyText.trim() && !replyFile)}
                  className="btn btn-solid"
                  style={{ borderRadius: 999, padding: '10px 18px' }}
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChatSupportView;
