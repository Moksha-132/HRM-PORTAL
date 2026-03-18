const AdminChatPanel = ({ token, onUpdated }) => {
  const [chats, setChats] = React.useState([]);
  const [editingId, setEditingId] = React.useState(null);
  const [editText, setEditText] = React.useState('');
  const [error, setError] = React.useState('');

  const fetchChats = async () => {
    try {
      setError('');
      const res = await fetch('/api/admin/chats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch chats');
      setChats(data.data || []);
    } catch (e) {
      setError(e.message);
    }
  };

  React.useEffect(() => { fetchChats(); }, []);

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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setEditingId(null);
      setEditText('');
      fetchChats();
      if (onUpdated) onUpdated();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="cb-admin-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <strong>All Chats</strong>
        <button className="refresh" onClick={fetchChats}>Refresh</button>
      </div>
      {error && <div style={{ color: '#b91c1c', fontSize: '12px', marginBottom: '6px' }}>{error}</div>}
      {chats.map(chat => (
        <div key={chat.id} className="cb-admin-item">
          <div><strong>{chat.role}</strong> | {chat.userId}</div>
          <div style={{ color: '#475569', marginTop: '4px' }}>Q: {chat.message}</div>
          <div style={{ color: '#0f172a', marginTop: '4px' }}>A: {chat.response}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{new Date(chat.timestamp).toLocaleString()}</div>
          {editingId === chat.id ? (
            <>
              <textarea value={editText} onChange={(e) => setEditText(e.target.value)} />
              <div className="cb-admin-actions">
                <button className="save" onClick={() => saveEdit(chat.id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </>
          ) : (
            <div className="cb-admin-actions">
              <button className="save" onClick={() => startEdit(chat)}>Edit Response</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

window.AdminChatPanel = AdminChatPanel;
