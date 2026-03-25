import React from 'react';
import ChatbotIcon from './ChatbotIcon.jsx';
import ChatWindow from './ChatWindow.jsx';
import UserHistoryPanel from './UserHistoryPanel.jsx';
import { useLocation } from 'react-router-dom';
import './chatbot.css';

const ChatbotApp = () => {
  const location = useLocation();
  const getDynamicRole = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/admin')) return 'admin';
    if (path.includes('/employee')) return 'employee';
    if (path.includes('/manager')) return 'manager';
    return 'public';
  };
  const role = getDynamicRole();
  const isAdmin = role === 'admin';

  const getStored = (key) => {
    try {
      return sessionStorage.getItem(key) || localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const themes = {
    public: { title: 'Help Desk', subtitle: 'Public Assistant', avatar: 'P', primary: '#0ea5e9', primaryDark: '#0369a1', userBubble: '#0ea5e9', botBubble: '#e8f7ff', greeting: 'Welcome to our platform! How can I help you?', suggestions: ['About company', 'How to login', 'Features of platform'] },
    employee: { title: 'Employee Help', subtitle: 'HR Assistant', avatar: 'E', primary: '#10b981', primaryDark: '#047857', userBubble: '#10b981', botBubble: '#ecfdf3', greeting: 'Hi Employee 👋, how can I assist you today?', suggestions: [] },
    manager: { title: 'Manager Help', subtitle: 'Team Assistant', avatar: 'M', primary: '#2563eb', primaryDark: '#1d4ed8', userBubble: '#2563eb', botBubble: '#eef2ff', greeting: 'Hello Manager 👨‍💼, how can I help you?', suggestions: [] },
    admin: { title: 'Admin Console', subtitle: 'System Assistant', avatar: 'A', primary: '#f97316', primaryDark: '#c2410c', userBubble: '#f97316', botBubble: '#fff7ed', greeting: 'Welcome Admin ⚙️, how can I assist you?', suggestions: [] }
  };

  const theme = themes[role] || themes.public;

  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([]);
  const [historyItems, setHistoryItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('chat');

  React.useEffect(() => {
    const rootTarget = document.documentElement;
    const host = document.querySelector('.dashboard-mode') || document.querySelector('.site-mode') || document.documentElement;
    const styles = getComputedStyle(host);
    const primary = styles.getPropertyValue('--primary').trim() || '#6366f1';
    const primaryDark = styles.getPropertyValue('--primary-dark').trim() || '#4f46e5';

    rootTarget.style.setProperty('--cb-primary', primary);
    rootTarget.style.setProperty('--cb-primary-dark', primaryDark);
    rootTarget.style.setProperty('--cb-user', primary);
    rootTarget.style.setProperty('--cb-bot', 'rgba(99, 102, 241, 0.14)');
  }, [role]);

  const getUserId = () => {
    if (role === 'public') {
      const existing = localStorage.getItem('cb_public_id');
      if (existing) return existing;
      const newId = `public-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem('cb_public_id', newId);
      return newId;
    }
    const email = getStored('shnoor_admin_email') || getStored('shnoor_email');
    return email || `${role}-user`;
  };

  const seedGreeting = () => {
    setMessages([{ role: 'bot', text: theme.greeting }]);
  };

  const fetchHistory = async () => {
    if (isAdmin) return;
    const userId = getUserId();
    const token = getStored('shnoor_token');
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
          built.push({ role: 'bot', text: item.message, fileUrl: item.fileUrl, fileType: item.fileType, senderName: 'Admin' });
        } else {
          built.push({ role: 'user', text: item.message, fileUrl: item.fileUrl, fileType: item.fileType });
          if (item.response) {
            built.push({ role: 'bot', text: item.response, senderName: 'Assistant' });
          }
        }
      });
      setMessages(built);
    } catch {
      if (messages.length === 0) seedGreeting();
    }
  };

  React.useEffect(() => { 
    if (isAdmin) return;
    fetchHistory();
    const poll = setInterval(fetchHistory, 10000);
    return () => clearInterval(poll);
  }, [role, isAdmin]);

  React.useEffect(() => {
    if (isAdmin) return;
    if (!open) return;
    fetchHistory();
    const t = setInterval(fetchHistory, 15000);
    return () => clearInterval(t);
  }, [open, role, isAdmin]);

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
      const token = getStored('shnoor_token');
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
  const handleClear = () => seedGreeting();
  const historyPanel = isAdmin
    ? null
    : <UserHistoryPanel items={historyItems} onRefresh={fetchHistory} />;

  if (isAdmin) return null;

  return (
    <div id="chatbot-root">
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
    </div>
  );
};

export default ChatbotApp;
