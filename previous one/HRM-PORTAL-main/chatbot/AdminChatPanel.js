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

  React.useEffect(() => { 
    fetchChats(); 
    // Continuous polling for new messages every 10s
    const interval = setInterval(fetchChats, 10000);
    return () => clearInterval(interval);
  }, []);

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

  const el = React.createElement;

  return el('div', { id: 'admin-chat-inbox-root', className: 'cb-admin-inbox' },
    // Sidebar
    el('div', { className: 'cb-admin-contacts' },
      el('div', { className: 'cb-admin-contacts-head' },
        el('span', null, 'Active Conversations'),
        el('button', { className: 'cb-btn-refresh', onClick: fetchChats }, '↻')
      ),
      el('div', { className: 'cb-admin-contacts-list' },
        contacts.length === 0 ? el('p', { className: 'cb-no-chats' }, 'No active chats found.')
        : contacts.map(c => el('div', {
            key: c.userId,
            className: `cb-contact-item ${selectedUser === c.userId ? 'active' : ''}`,
            onClick: () => setSelectedUser(c.userId)
          },
          el('div', { className: 'cb-contact-info' }, 
            el('span', { className: 'cb-contact-name' }, c.userId),
            el('span', { className: 'cb-contact-role' }, c.role)
          ),
          el('span', { className: 'cb-contact-msg' }, c.lastMsg.length > 40 ? c.lastMsg.substring(0, 37) + '...' : c.lastMsg)
        ))
      )
    ),
    // Main Chat Area
    el('div', { className: 'cb-admin-chat-area' },
      !selectedUser ? el('div', { className: 'cb-placeholder-view' },
        el('div', { className: 'cb-placeholder-icon' }, '💬'),
        el('p', null, 'Select a conversation from the list to start responding.')
      ) : el(window.React.Fragment, null,
        el('div', { className: 'cb-admin-chat-header' },
          el('div', null, 
            el('strong', null, selectedUser),
            el('span', { style: { marginLeft: '8px', fontSize: '0.8rem', color: '#64748b' } }, `(User ID: ${selectedUser})`)
          ),
          error && el('span', { className: 'cb-error' }, error)
        ),
        el('div', { className: 'cb-admin-messages' },
          selectedMessages.map(msg => el('div', { key: msg.id, className: 'cb-msg-group' },
            // User Message
            el('div', { className: 'cb-bubble bot' },
              el('div', null, msg.message),
              msg.fileUrl && el('div', { className: 'cb-file-attach' },
                msg.fileType?.startsWith('image/') ? el('img', { 
                  src: msg.fileUrl, 
                  className: 'cb-file-img',
                  onClick: () => window.open(msg.fileUrl, '_blank')
                }) : el('a', { href: msg.fileUrl, target: '_blank', rel: 'noopener noreferrer' }, '📎 View Attachment')
              ),
              el('div', { className: 'cb-bubble-time' }, new Date(msg.timestamp).toLocaleString())
            ),
            // Admin Response Message
            el('div', { className: 'cb-bubble user' },
              el('div', { className: 'cb-bubble-info' }, 'Official Response'),
              editingId === msg.id ? el('div', { className: 'cb-edit-container' },
                el('textarea', {
                  className: 'cb-edit-textarea',
                  value: editText,
                  onChange: (e) => setEditText(e.target.value),
                  placeholder: 'Type your official response here...'
                }),
                el('div', { className: 'cb-edit-actions' },
                  el('button', { className: 'cb-btn-save', onClick: () => saveEdit(msg.id) }, 'Send Response'),
                  el('button', { className: 'cb-btn-cancel', onClick: () => setEditingId(null) }, 'Cancel')
                )
              ) : el(window.React.Fragment, null,
                el('div', { className: 'cb-response-text' }, msg.response || el('em', { style: { color: '#94a3b8' } }, 'No response sent yet.')),
                el('button', {
                  className: 'cb-btn-edit',
                  onClick: () => startEdit(msg)
                }, msg.response ? 'Edit Response' : 'Reply Now')
              )
            )
          ))
        )
      )
    )
  );
};

window.AdminChatPanel = AdminChatPanel;
