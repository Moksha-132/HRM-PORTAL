import React from 'react';
const AdminChatPanel = ({ token, onUpdated }) => {
  const [chats, setChats] = React.useState([]);
  const [selectedSessionKey, setSelectedSessionKey] = React.useState(null);
  const [editText, setEditText] = React.useState('');
  const [editingId, setEditingId] = React.useState(null);
  const [error, setError] = React.useState('');
  const [replyText, setReplyText] = React.useState('');
  const [replyFile, setReplyFile] = React.useState(null);
  const [sending, setSending] = React.useState(false);

  const fetchChats = async () => {
    try {
      const res = await fetch('/api/admin/chats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch chats');
      setChats(data.data || []);
    } catch (e) {
      setError(e.message);
    }
  };

  React.useEffect(() => { fetchChats(); }, []);

  const makeSessionKey = React.useCallback((userId, role) => `${userId}__${(role || 'public').toLowerCase()}`, []);

  // Group messages by (userId + role) like the upstream admin chat support
  const contacts = React.useMemo(() => {
    const groups = {};
    chats.forEach(c => {
      const role = (c.role || 'public').toLowerCase();
      const key = makeSessionKey(c.userId, role);
      if (!groups[key]) {
        groups[key] = {
          key,
          userId: c.userId,
          role,
          lastMsg: c.message,
          lastAt: c.timestamp,
          needsAction: false,
          messages: []
        };
      }
      groups[key].messages.push(c);
      if (c.status === 'NeedsAdmin') groups[key].needsAction = true;
      if (c.timestamp && new Date(c.timestamp) > new Date(groups[key].lastAt || 0)) {
        groups[key].lastAt = c.timestamp;
        groups[key].lastMsg = c.message;
      }
    });
    // Sort groups by most recent message in the group
    return Object.values(groups).sort((a,b) => {
        const lastA = new Date(a.lastAt || 0);
        const lastB = new Date(b.lastAt || 0);
        return lastB - lastA;
    });
  }, [chats, makeSessionKey]);

  const selectedSession = React.useMemo(() => {
    if (!selectedSessionKey) return null;
    return contacts.find((c) => c.key === selectedSessionKey) || null;
  }, [contacts, selectedSessionKey]);

  const selectedMessages = selectedSession
    ? chats
        .filter((c) => c.userId === selectedSession.userId && (c.role || 'public').toLowerCase() === selectedSession.role)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    : [];

  const startEdit = (chat) => {
    setEditingId(chat.id);
    setEditText(chat.response || '');
  };

  const saveEdit = async (id) => {
    try {
      const res = await fetch(`/api/admin/chat/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ response: editText })
      });
      if (!res.ok) throw new Error('Update failed');
      setEditingId(null);
      fetchChats();
      if (onUpdated) onUpdated();
    } catch (e) {
      setError(e.message);
    }
  };

  const sendReply = async () => {
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
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');

      setReplyText('');
      setReplyFile(null);
      await fetchChats();
      if (onUpdated) onUpdated();
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="cb-admin-inbox">
      {/* Sidebar: Users List */}
      <div className="cb-admin-contacts">
        <div className="cb-admin-contacts-head">
          <span>Users</span>
          <button className="refresh" onClick={fetchChats} style={{marginLeft:'10px', fontSize:'11px'}}>Refresh</button>
        </div>
        <div className="cb-admin-contacts-list">
          {contacts.map(c => (
            <div 
              key={c.key}
              className={`cb-contact-item ${selectedSessionKey === c.key ? 'active' : ''}`}
              onClick={() => setSelectedSessionKey(c.key)}
            >
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span className="cb-contact-name" style={{flex:1}}>{c.userId}</span>
                <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginLeft: '8px' }}>{c.role}</span>
                {c.needsAction && <span style={{background:'#ef4444', color:'#fff', fontSize:'9px', padding:'2px 6px', borderRadius:'4px', fontWeight:'700', marginLeft:'8px'}}>ACTION NEEDED</span>}
              </div>
              <span className="cb-contact-msg">{c.lastMsg}</span>
            </div>
          ))}
          {contacts.length === 0 && <p style={{padding:'20px', textAlign:'center', color:'#94a3b8', fontSize:'12px'}}>No active chats</p>}
        </div>
      </div>

      {/* Main: Conversation Window */}
      <div className="cb-admin-chat-area">
        {selectedSession ? (
          <>
            <div className="cb-admin-chat-header" style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <div>
                <strong>Conversation with {selectedSession.userId}</strong>
                <span style={{ marginLeft: 10, fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>{selectedSession.role}</span>
                {contacts.find(c => c.key === selectedSessionKey)?.needsAction && 
                  <span style={{background:'#ef4444', color:'#fff', fontSize:'10px', padding:'3px 8px', borderRadius:'4px', fontWeight:'700', marginLeft:'12px'}}>ACTION NEEDED</span>
                }
              </div>
              {error && <span style={{color:'red', fontSize:'11px'}}>{error}</span>}
            </div>
            <div className="cb-admin-messages">
              {selectedMessages.map(msg => {
                const isAdmin = msg.sender_type === 'Admin';
                
                return (
                  <div key={msg.id} style={{marginBottom:'20px'}}>
                    {/* The Message: could be User or Admin initiated */}
                    <div 
                      className={`cb-bubble ${isAdmin ? 'user' : 'bot'}`} 
                      style={{
                        maxWidth:'85%', 
                        marginLeft: isAdmin ? 'auto' : '0',
                        background: isAdmin ? 'var(--cb-primary)' : '#e2e8f0', 
                        color: isAdmin ? '#fff' : '#0f172a'
                      }}
                    >
                      <div style={{fontWeight:'600', fontSize:'11px', marginBottom:'4px'}}>
                        {isAdmin ? 'You (Admin)' : `${msg.userId} (${msg.role})`}
                      </div>
                      <div>{msg.message}</div>
                      {msg.fileUrl && (
                        <div style={{marginTop:'8px'}}>
                          {msg.fileType?.startsWith('image/') ? (
                            <img src={msg.fileUrl} style={{maxHeight:'100px', borderRadius:'6px', cursor:'pointer'}} onClick={() => window.open(msg.fileUrl, '_blank')} />
                          ) : (
                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" style={{color: isAdmin ? '#fff' : '#2563eb', fontSize:'11px', textDecoration:'underline'}}>📎 View Attachment</a>
                          )}
                        </div>
                      )}
                      <div style={{fontSize:'10px', color: isAdmin ? 'rgba(255,255,255,0.7)' : '#94a3b8', marginTop:'4px'}}>{new Date(msg.timestamp).toLocaleString()}</div>
                    </div>

                    {/* The Response: only if it's a User record and has a response attached */}
                    {!isAdmin && msg.response && (
                      <div className="cb-bubble user" style={{maxWidth:'85%', marginLeft:'auto', background:'var(--cb-primary)', color:'#fff', marginTop:'8px'}}>
                        <div style={{fontWeight:'600', fontSize:'11px', marginBottom:'4px'}}>Your Response (Admin/AI)</div>
                        {editingId === msg.id ? (
                          <div style={{marginTop:'4px'}}>
                            <textarea 
                              value={editText} 
                              onChange={(e) => setEditText(e.target.value)}
                              style={{width:'100%', minHeight:'60px', borderRadius:'6px', border:'1px solid #fff', padding:'6px', fontSize:'12px', background:'rgba(255,255,255,0.1)', color:'#fff'}}
                            />
                            <div style={{marginTop:'6px', display:'flex', gap:'8px'}}>
                              <button onClick={() => saveEdit(msg.id)} style={{background:'#fff', color:'var(--cb-primary)', border:'none', padding:'4px 10px', borderRadius:'4px', fontSize:'11px', fontWeight:'600', cursor:'pointer'}}>Save</button>
                              <button onClick={() => setEditingId(null)} style={{background:'none', color:'#fff', border:'1px solid #fff', padding:'4px 10px', borderRadius:'4px', fontSize:'11px', cursor:'pointer'}}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div>{msg.response}</div>
                            <button 
                              onClick={() => startEdit(msg)} 
                              style={{marginTop:'8px', background:'rgba(255,255,255,0.2)', color:'#fff', border:'none', padding:'4px 8px', borderRadius:'4px', fontSize:'10px', cursor:'pointer'}}
                            >
                              Edit Response
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ padding: 12, borderTop: '1px solid #e2e8f0', background: '#fff' }}>
              {replyFile && (
                <div style={{ fontSize: 12, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#334155' }}>
                  <span>Attachment: {replyFile.name}</span>
                  <button type="button" onClick={() => setReplyFile(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                    Remove
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      sendReply();
                    }
                  }}
                  placeholder="Type a message to the user..."
                  style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', fontSize: 13 }}
                  disabled={sending}
                />
                <label style={{ cursor: sending ? 'not-allowed' : 'pointer' }}>
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    disabled={sending}
                    onChange={(e) => setReplyFile(e.target.files?.[0] || null)}
                  />
                  <span style={{ display: 'inline-block', padding: '8px 10px', borderRadius: 10, border: '1px solid #e2e8f0', color: '#475569', fontSize: 12 }}>
                    Attach
                  </span>
                </label>
                <button
                  type="button"
                  onClick={sendReply}
                  disabled={sending || (!replyText.trim() && !replyFile)}
                  style={{
                    border: 'none',
                    background: 'var(--cb-primary)',
                    color: '#fff',
                    padding: '10px 14px',
                    borderRadius: 10,
                    cursor: sending ? 'not-allowed' : 'pointer',
                    opacity: sending ? 0.7 : 1,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8'}}>
            <p>Select a user to view conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

window.AdminChatPanel = AdminChatPanel;

export default AdminChatPanel;
