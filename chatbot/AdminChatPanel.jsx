const AdminChatPanel = ({ token, onUpdated }) => {
  const [chats, setChats] = React.useState([]);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [editText, setEditText] = React.useState('');
  const [editingId, setEditingId] = React.useState(null);
  const [error, setError] = React.useState('');

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

  // Group messages by userId
  const contacts = React.useMemo(() => {
    const groups = {};
    chats.forEach(c => {
      if (!groups[c.userId]) {
        groups[c.userId] = { 
          userId: c.userId, 
          role: c.role, 
          lastMsg: c.message, 
          messages: [] 
        };
      }
      groups[c.userId].messages.push(c);
    });
    // Sort groups by most recent message in the group
    return Object.values(groups).sort((a,b) => {
        const lastA = new Date(a.messages[0].timestamp);
        const lastB = new Date(b.messages[0].timestamp);
        return lastB - lastA;
    });
  }, [chats]);

  const selectedMessages = selectedUser 
    ? chats.filter(c => c.userId === selectedUser).sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp))
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
              key={c.userId} 
              className={`cb-contact-item ${selectedUser === c.userId ? 'active' : ''}`}
              onClick={() => setSelectedUser(c.userId)}
            >
              <span className="cb-contact-name">{c.userId}</span>
              <span className="cb-contact-msg">{c.lastMsg}</span>
            </div>
          ))}
          {contacts.length === 0 && <p style={{padding:'20px', textAlign:'center', color:'#94a3b8', fontSize:'12px'}}>No active chats</p>}
        </div>
      </div>

      {/* Main: Conversation Window */}
      <div className="cb-admin-chat-area">
        {selectedUser ? (
          <>
            <div className="cb-admin-chat-header">
              <strong>Conversation with {selectedUser}</strong>
              {error && <span style={{color:'red', fontSize:'11px'}}>{error}</span>}
            </div>
            <div className="cb-admin-messages">
              {selectedMessages.map(msg => (
                <div key={msg.id} style={{marginBottom:'20px'}}>
                  {/* User Question */}
                  <div className="cb-bubble bot" style={{maxWidth:'85%', background:'#e2e8f0', color:'#0f172a'}}>
                    <div style={{fontWeight:'600', fontSize:'11px', marginBottom:'4px'}}>{msg.userId} ({msg.role})</div>
                    <div>{msg.message}</div>
                    {msg.fileUrl && (
                        <div style={{marginTop:'8px'}}>
                            {msg.fileType?.startsWith('image/') ? (
                                <img src={msg.fileUrl} style={{maxHeight:'100px', borderRadius:'6px', cursor:'pointer'}} onClick={() => window.open(msg.fileUrl, '_blank')} />
                            ) : (
                                <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" style={{color:'#2563eb', fontSize:'11px'}}>📎 View Attachment</a>
                            )}
                        </div>
                    )}
                    <div style={{fontSize:'10px', color:'#94a3b8', marginTop:'4px'}}>{new Date(msg.timestamp).toLocaleString()}</div>
                  </div>

                  {/* Admin/AI Response */}
                  <div className="cb-bubble user" style={{maxWidth:'85%', marginLeft:'auto', background:'var(--cb-primary)', color:'#fff'}}>
                    <div style={{fontWeight:'600', fontSize:'11px', marginBottom:'4px'}}>Response (AI/Admin)</div>
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
                </div>
              ))}
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
