const ChatbotApp = () => {
  const root = document.getElementById('chatbot-root');
  const role = root?.dataset?.role || 'public';

  const themes = {
    public: {
      title: 'Help Desk',
      subtitle: 'Public Assistant',
      avatar: 'P',
      primary: '#0ea5e9',
      primaryDark: '#0369a1',
      userBubble: '#0ea5e9',
      botBubble: '#e8f7ff',
      greeting: 'Welcome to our platform! How can I help you?',
      suggestions: ['About company', 'How to login', 'Features of platform']
    },
    employee: {
      title: 'Employee Help',
      subtitle: 'HR Assistant',
      avatar: 'E',
      primary: '#10b981',
      primaryDark: '#047857',
      userBubble: '#10b981',
      botBubble: '#ecfdf3',
      greeting: 'Hi Employee \uD83D\uDC4B, how can I assist you today?',
      suggestions: []
    },
    manager: {
      title: 'Manager Help',
      subtitle: 'Team Assistant',
      avatar: 'M',
      primary: '#2563eb',
      primaryDark: '#1d4ed8',
      userBubble: '#2563eb',
      botBubble: '#eef2ff',
      greeting: 'Hello Manager \uD83D\uDC68\u200D\uD83D\uDCBC, how can I help you?',
      suggestions: []
    },
    admin: {
      title: 'Admin Console',
      subtitle: 'System Assistant',
      avatar: 'A',
      primary: '#f97316',
      primaryDark: '#c2410c',
      userBubble: '#f97316',
      botBubble: '#fff7ed',
      greeting: 'Welcome Admin \u2699\uFE0F, how can I assist you?',
      suggestions: []
    }
  };

  const theme = themes[role] || themes.public;

  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([]);
  const [historyItems, setHistoryItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('chat');
  const [notificationReceived, setNotificationReceived] = React.useState(0);

  React.useEffect(() => {
    if (!root) return;
    root.style.setProperty('--cb-primary', theme.primary);
    root.style.setProperty('--cb-primary-dark', theme.primaryDark);
    root.style.setProperty('--cb-user', theme.userBubble);
    root.style.setProperty('--cb-bot', theme.botBubble);
  }, [role]);

  const getUserId = () => {
    if (role === 'public') {
      const existing = localStorage.getItem('cb_public_id');
      if (existing) return existing;
      const newId = `public-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem('cb_public_id', newId);
      return newId;
    }
    const email = sessionStorage.getItem('shnoor_admin_email') || sessionStorage.getItem('shnoor_email');
    return email || `${role}-user`;
  };

  const seedGreeting = () => {
    setMessages([{ role: 'bot', text: theme.greeting }]);
  };

  const fetchHistory = async () => {
    if (role === 'admin') return; // Don't show history for admin chatbot
    const userId = getUserId();
    const token = sessionStorage.getItem('shnoor_token');
    const headers = {};
    if (role !== 'public' && token) headers['Authorization'] = `Bearer ${token}`;
    try {
      const res = await fetch(`/api/chat/history/${encodeURIComponent(userId)}?role=${encodeURIComponent(role)}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load history');
      setHistoryItems(data.data || []);
      if (!data.data || data.data.length === 0) {
        seedGreeting();
        return;
      }
      const built = [];
      data.data.forEach((item) => {
        if (item.sender_type === 'Admin') {
          // If admin sent the message, it belongs on the 'bot' side for the user
          built.push({ role: 'bot', text: item.message, fileUrl: item.fileUrl, fileType: item.fileType, senderName: 'Admin' });
        } else {
          // Normal user message
          built.push({ role: 'user', text: item.message, fileUrl: item.fileUrl, fileType: item.fileType });
          // If there's an AI or Admin response attached to this record
          if (item.response) {
            built.push({ role: 'bot', text: item.response, senderName: 'Assistant' });
          }
        }
      });
      setMessages(built);
    } catch (e) {
      if (messages.length === 0) seedGreeting();
    }
  };

  React.useEffect(() => { 
    fetchHistory();
    const poll = setInterval(fetchHistory, 10000);
    return () => clearInterval(poll);
  }, [role]);

  React.useEffect(() => {
    if (!open) return;
    fetchHistory();
    const t = setInterval(fetchHistory, 15000);
    return () => clearInterval(t);
  }, [open, role]);

  const sendMessage = async (text, file = null) => {
    const userMessage = { 
      role: 'user', 
      text, 
      fileUrl: file ? URL.createObjectURL(file) : null,
      fileType: file ? file.type : null
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const token = sessionStorage.getItem('shnoor_token');
      const formData = new FormData();
      formData.append('message', text);
      formData.append('role', role);
      formData.append('userId', getUserId());
      if (file) formData.append('file', file);

      const headers = {};
      if (role !== 'public' && token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat failed');

      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: data.response,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        senderName: 'Assistant'
      }]);
      fetchHistory();
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: `Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (text) => {
    sendMessage(text);
  };

  const suggestions = role === 'public' && messages.length === 1 ? theme.suggestions : [];
  const token = sessionStorage.getItem('shnoor_token');
  const handleClear = () => seedGreeting();
  const historyPanel = role === 'admin'
    ? null
    : <UserHistoryPanel items={historyItems} onRefresh={fetchHistory} />;

  return (
    <>
      <ChatNotificationListener 
        role={role} 
        userId={getUserId()} 
        onNewMessage={(data) => {
          console.log('🔔 [ChatApp] New chat notification received, refreshing...');
          setNotificationReceived(prev => prev + 1);
          fetchHistory(); // Refresh chat history when notification arrives
        }} 
      />
      <ChatbotIcon onClick={() => setOpen(o => !o)} />
      <ChatWindow
        open={open}
        roleConfig={theme}
        messages={messages}
        onSend={sendMessage}
        loading={loading}
        suggestions={suggestions}
        onSuggestionClick={handleSuggestion}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        historyPanel={historyPanel}
        onClear={handleClear}
      />
    </>
  );
};

const rootEl = document.getElementById('chatbot-root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<ChatbotApp />);
}
