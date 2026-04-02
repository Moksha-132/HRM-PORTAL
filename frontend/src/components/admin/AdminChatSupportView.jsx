import React from 'react';
import FullEmojiPicker from '../shared/FullEmojiPicker.jsx';
import AudioAttachment from '../shared/AudioAttachment.jsx';
import useVoiceRecorder from '../../hooks/useVoiceRecorder.js';

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

const HEADER_ACTIONS = {
  feed: { label: 'Feed', iconClass: 'fas fa-search', buttonClass: 'admin-chat-action-btn-feed' },
  export: { label: 'Export', iconClass: 'fas fa-file-export', buttonClass: 'admin-chat-action-btn-export' },
  archive: { label: 'Archive', iconClass: 'fas fa-box-archive', buttonClass: 'admin-chat-action-btn-archive' },
  lock: { label: 'Lock', iconClass: 'fas fa-lock', buttonClass: 'admin-chat-action-btn-lock' },
  clear: { label: 'Clear', iconClass: 'fas fa-trash', buttonClass: 'admin-chat-action-btn-clear' },
  refresh: { label: 'Refresh', iconClass: 'fas fa-rotate-right', buttonClass: 'admin-chat-action-btn-refresh' },
};

const ARCHIVED_KEY = 'hrm_admin_archived_chats';
const LOCKED_KEY = 'hrm_admin_locked_chats';

const normalizeRole = (role) => (role || 'public').toString().trim().toLowerCase();

const readStoredSessionMap = (key) => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const toUserName = (chat) => {
  const name = chat?.user?.name || chat?.user?.employee_name;
  if (name) return name;
  const email = chat?.user?.email || chat?.userId;
  if (email && typeof email === 'string' && email.includes('@')) return email.split('@')[0];
  return chat?.userId || 'User';
};

const getInitials = (value) =>
  (value || 'U')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';

const formatRelativeTime = (value) => {
  if (!value) return 'No activity';
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
};

const getStatusLabel = (session) => {
  if (session.unreadCount > 0) return 'Needs attention';
  if (session.isOnline) return 'Online';
  return 'Offline';
};

const getMessageMeta = (message) => {
  if (message.sender_type === 'Admin') return 'Sent';
  if (message.status === 'HandledByAdmin') return 'Seen';
  if (message.status === 'NeedsAdmin') return 'New';
  return 'Delivered';
};

const EmptyStateIcon = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true" className="admin-chat-empty-icon">
    <defs>
      <linearGradient id="adminChatEmptyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#34d399" />
      </linearGradient>
    </defs>
    <path
      d="M32 10c-12.7 0-23 8.5-23 19 0 5.6 3 10.6 7.8 14.1V54l11.1-6.3c1.3.2 2.7.3 4.1.3 12.7 0 23-8.5 23-19S44.7 10 32 10Z"
      fill="url(#adminChatEmptyGradient)"
      opacity="0.18"
    />
    <path
      d="M20 23.5h24M20 32h16"
      fill="none"
      stroke="url(#adminChatEmptyGradient)"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M32 10c-12.7 0-23 8.5-23 19 0 5.6 3 10.6 7.8 14.1V54l11.1-6.3c1.3.2 2.7.3 4.1.3 12.7 0 23-8.5 23-19S44.7 10 32 10Z"
      fill="none"
      stroke="#0f172a"
      strokeOpacity="0.12"
      strokeWidth="2"
    />
  </svg>
);

const AdminChatSupportView = () => {
  const token = sessionStorage.getItem('shnoor_token') || localStorage.getItem('shnoor_token');
  const role = sessionStorage.getItem('shnoor_role') || localStorage.getItem('shnoor_role') || '';
  const isAdmin = role === 'Admin' || role === 'Super Admin';

  const [allChats, setAllChats] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [activeRole, setActiveRole] = React.useState('all');
  const [selectedSessionKey, setSelectedSessionKey] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showArchived, setShowArchived] = React.useState(false);
  const [replyText, setReplyText] = React.useState('');
  const [replyFile, setReplyFile] = React.useState(null);
  const [sending, setSending] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const [editText, setEditText] = React.useState('');
  const [closing, setClosing] = React.useState(false);
  const [archivedSessions, setArchivedSessions] = React.useState(() => readStoredSessionMap(ARCHIVED_KEY));
  const [lockedSessions, setLockedSessions] = React.useState(() => readStoredSessionMap(LOCKED_KEY));
  const [openMenuId, setOpenMenuId] = React.useState(null);
  const [selectedMessages, setSelectedMessages] = React.useState({});
  const [deletedForMe, setDeletedForMe] = React.useState({});
  const [deletedForEveryone, setDeletedForEveryone] = React.useState({});
  const [editedMessages, setEditedMessages] = React.useState({});
  const [messageReactions, setMessageReactions] = React.useState({});
  const [infoMessageId, setInfoMessageId] = React.useState(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = React.useState(false);
  const [reactionPickerMessageId, setReactionPickerMessageId] = React.useState(null);
  const {
    isRecording,
    recordingError,
    recordedFile,
    recordedUrl,
    setRecordingError,
    startRecording,
    stopRecording,
    clearRecordedAudio,
  } = useVoiceRecorder();

  const latestChatsRef = React.useRef([]);
  const messagesViewportRef = React.useRef(null);
  const searchInputRef = React.useRef(null);
  const messageMenuRef = React.useRef(null);
  const emojiPickerRef = React.useRef(null);
  const reactionPickerRef = React.useRef(null);

  React.useEffect(() => {
    const rootTarget = document.documentElement;
    rootTarget.style.setProperty('--cb-primary', ADMIN_THEME.primary);
    rootTarget.style.setProperty('--cb-primary-dark', ADMIN_THEME.primaryDark);
    rootTarget.style.setProperty('--cb-user', ADMIN_THEME.userBubble);
    rootTarget.style.setProperty('--cb-bot', ADMIN_THEME.botBubble);
  }, []);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ARCHIVED_KEY, JSON.stringify(archivedSessions));
    }
  }, [archivedSessions]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCKED_KEY, JSON.stringify(lockedSessions));
    }
  }, [lockedSessions]);

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
      const nextChats = Array.isArray(data.data) ? data.data : [];
      latestChatsRef.current = nextChats;
      setAllChats(nextChats);
    } catch (e) {
      setError(e.message || 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  }, [token, isAdmin]);

  React.useEffect(() => {
    if (!token || !isAdmin) return undefined;
    fetchChats();
    const timer = setInterval(fetchChats, 10000);
    return () => clearInterval(timer);
  }, [fetchChats, token, isAdmin]);

  React.useEffect(() => {
    const handleDeleted = () => fetchChats();
    window.addEventListener('chat-message-deleted', handleDeleted);
    return () => window.removeEventListener('chat-message-deleted', handleDeleted);
  }, [fetchChats]);

  const sessions = React.useMemo(() => {
    const filteredByRole = activeRole === 'all'
      ? allChats
      : allChats.filter((chat) => normalizeRole(chat.role) === activeRole);

    const grouped = new Map();
    filteredByRole.forEach((chat) => {
      const roleKey = normalizeRole(chat.role);
      const key = `${chat.userId}__${roleKey}`;
      if (!grouped.has(key)) {
          grouped.set(key, {
            key,
            userId: chat.userId,
            role: roleKey,
            userName: toUserName(chat),
            userEmail: chat?.user?.email || chat.userId,
            lastAt: chat.timestamp,
            lastMsg: chat.deleted ? 'This message was deleted' : chat.message,
            count: 0,
            unreadCount: 0,
            needsAction: false,
            lastSenderType: chat.sender_type || 'User',
          });
      }

      const session = grouped.get(key);
      session.count += 1;
      if (chat.status === 'NeedsAdmin') {
        session.needsAction = true;
        session.unreadCount += 1;
      }
      if (chat.timestamp && new Date(chat.timestamp) >= new Date(session.lastAt || 0)) {
        session.lastAt = chat.timestamp;
        session.lastMsg = chat.deleted ? 'This message was deleted' : chat.message;
        session.lastSenderType = chat.sender_type || 'User';
      }
    });

    return Array.from(grouped.values())
      .map((session) => ({
        ...session,
        isOnline: session.lastAt ? Date.now() - new Date(session.lastAt).getTime() < 5 * 60 * 1000 : false,
        archived: Boolean(archivedSessions[session.key]),
        locked: Boolean(lockedSessions[session.key]),
      }))
      .filter((session) => (showArchived ? session.archived : !session.archived))
      .filter((session) => {
        if (!searchQuery.trim()) return true;
        const haystack = `${session.userName} ${session.userEmail} ${session.lastMsg || ''}`.toLowerCase();
        return haystack.includes(searchQuery.trim().toLowerCase());
      })
      .sort((a, b) => new Date(b.lastAt || 0) - new Date(a.lastAt || 0));
  }, [allChats, activeRole, archivedSessions, lockedSessions, searchQuery, showArchived]);

  const selectedSession = React.useMemo(
    () => sessions.find((session) => session.key === selectedSessionKey) || null,
    [sessions, selectedSessionKey]
  );

  React.useEffect(() => {
    if (!selectedSessionKey) return;
    const stillExists = sessions.some((session) => session.key === selectedSessionKey);
    if (!stillExists) {
      const fallback = sessions[0]?.key || null;
      setSelectedSessionKey(fallback);
    }
  }, [selectedSessionKey, sessions]);

  const thread = React.useMemo(() => {
    if (!selectedSession) return [];
    return allChats
      .filter((chat) => chat.userId === selectedSession.userId && normalizeRole(chat.role) === selectedSession.role)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [allChats, selectedSession]);

  React.useEffect(() => {
    if (!selectedSession || thread.length === 0) return;
    messagesViewportRef.current?.scrollTo({
      top: messagesViewportRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [thread, selectedSession]);

  React.useEffect(() => {
    const handleOutsideClick = (event) => {
      if (messageMenuRef.current && !messageMenuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
      if (reactionPickerRef.current && !reactionPickerRef.current.contains(event.target)) {
        setReactionPickerMessageId(null);
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  React.useEffect(() => {
    if (recordedFile) setReplyFile(recordedFile);
  }, [recordedFile]);

  const selectedSessionIsLocked = Boolean(selectedSession && lockedSessions[selectedSession.key]);

  const typingState = React.useMemo(() => {
    if (!selectedSession || thread.length === 0) return '';
    const lastMessage = thread[thread.length - 1];
    const isRecent = Date.now() - new Date(lastMessage.timestamp).getTime() < 2 * 60 * 1000;
    if (!isRecent) return '';
    if (lastMessage.sender_type === 'Admin') return 'Reply sent recently';
    return `${selectedSession.userName} is waiting for a reply`;
  }, [selectedSession, thread]);

  const exportThread = React.useCallback((format = 'txt') => {
    if (!selectedSession) return;
    const normalizedFormat = format === 'json' ? 'json' : 'txt';
    const safeName = `${selectedSession.userName || 'chat'}-${selectedSession.role}-chat-export`
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-');

    const payload = normalizedFormat === 'json'
      ? JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          userName: selectedSession.userName,
          userEmail: selectedSession.userEmail,
          role: selectedSession.role,
          status: getStatusLabel(selectedSession),
          messages: thread,
        },
        null,
        2
      )
      : [
        `Chat export for ${selectedSession.userName}`,
        `User: ${selectedSession.userEmail}`,
        `Role: ${selectedSession.role}`,
        `Status: ${getStatusLabel(selectedSession)}`,
        `Exported at: ${new Date().toLocaleString()}`,
        '',
        ...(thread.length === 0
          ? ['No messages in this conversation yet.']
          : thread.flatMap((message) => {
            const author = message.sender_type === 'Admin' ? 'Admin' : selectedSession.userName;
            const lines = [`[${new Date(message.timestamp).toLocaleString()}] ${author}: ${message.message || ''}`];
            if (message.response) lines.push(`[${new Date(message.timestamp).toLocaleString()}] Response: ${message.response}`);
            if (message.fileUrl) lines.push(`Attachment: ${window.location.origin}${message.fileUrl}`);
            lines.push('');
            return lines;
          })),
      ].join('\n');

    const blob = new Blob([payload], {
      type: normalizedFormat === 'json' ? 'application/json;charset=utf-8' : 'text/plain;charset=utf-8',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeName}.${normalizedFormat}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }, [selectedSession, thread]);

  const handleFeedSearch = React.useCallback(async () => {
    searchInputRef.current?.focus();
    await fetchChats();
  }, [fetchChats]);

  const refreshSelectedThread = React.useCallback(async () => {
    await fetchChats();
    window.requestAnimationFrame(() => {
      messagesViewportRef.current?.scrollTo({
        top: messagesViewportRef.current?.scrollHeight || 0,
        behavior: 'smooth',
      });
    });
  }, [fetchChats]);

  const toggleSessionFlag = (setter, currentState, key) => {
    setter({
      ...currentState,
      [key]: !currentState[key],
    });
  };

  const clearSelectedChat = async () => {
    if (!selectedSession) return;
    const confirmed = window.confirm(`Clear all messages for ${selectedSession.userName}? This cannot be undone.`);
    if (!confirmed) return;
    setClosing(true);
    setError('');
    try {
      const res = await fetch(`/api/v1/chat/session/${encodeURIComponent(selectedSession.userId)}/close`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to clear chat');
      setSelectedSessionKey(null);
      setReplyText('');
      setReplyFile(null);
      clearRecordedAudio();
      await fetchChats();
    } catch (e) {
      setError(e.message || 'Failed to clear chat');
    } finally {
      setClosing(false);
    }
  };

  const sendAdminMessage = async () => {
    if (!selectedSession || selectedSessionIsLocked) return;
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
      clearRecordedAudio();
      setRecordingError('');
      await fetchChats();
    } catch (e) {
      setError(e.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const actionLabel = (actionKey) => {
    if (actionKey === 'archive' && selectedSession) {
      return archivedSessions[selectedSession.key] ? 'Unarchive' : HEADER_ACTIONS.archive.label;
    }
    if (actionKey === 'lock' && selectedSession) {
      return selectedSessionIsLocked ? 'Unlock' : HEADER_ACTIONS.lock.label;
    }
    return HEADER_ACTIONS[actionKey].label;
  };

  const getMessageKey = (message, variant = 'message') => `${variant}-${message.id}`;
  const getDisplayText = (messageKey, fallback) => editedMessages[messageKey] ?? fallback;
  const isHiddenForMe = (messageKey) => Boolean(deletedForMe[messageKey]);
  const isDeletedForEveryone = (messageKey) => Boolean(deletedForEveryone[messageKey]);
  const isSelectedMessage = (messageKey) => Boolean(selectedMessages[messageKey]);

  const toggleMessageSelection = (messageKey) => {
    setSelectedMessages((current) => ({
      ...current,
      [messageKey]: !current[messageKey],
    }));
    setOpenMenuId(null);
  };

  const handleDeleteForMe = (messageKey) => {
    setDeletedForMe((current) => ({ ...current, [messageKey]: true }));
    setOpenMenuId(null);
    if (infoMessageId === messageKey) setInfoMessageId(null);
  };

  const handleDeleteForEveryone = async (messageKey) => {
    const recordId = String(messageKey || '').split('-').slice(1).join('-');
    if (!recordId) return;

    setOpenMenuId(null);
    try {
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      const res = await fetch(`/api/messages/${encodeURIComponent(recordId)}/delete`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ deleted: true, userId: selectedSession?.userId, role: selectedSession?.role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete message');
      setDeletedForEveryone((current) => ({ ...current, [messageKey]: true }));
      setEditedMessages((current) => {
        const next = { ...current };
        delete next[messageKey];
        return next;
      });
      await fetchChats();
    } catch (err) {
      setError(err?.message || 'Failed to delete message');
    }
  };

  const startMessageEdit = (messageKey, text) => {
    setEditingId(messageKey);
    setEditText(text);
    setOpenMenuId(null);
  };

  const saveInlineMessageEdit = (messageKey) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    setEditedMessages((current) => ({ ...current, [messageKey]: trimmed }));
    setEditingId(null);
    setEditText('');
  };

  const addReaction = (messageKey, emoji) => {
    setMessageReactions((current) => {
      const existing = current[messageKey] || [];
      return {
        ...current,
        [messageKey]: existing.includes(emoji)
          ? existing.filter((item) => item !== emoji)
          : [...existing, emoji]
      };
    });
  };

  const toggleInputEmoji = (emoji) => {
    setReplyText((current) => {
      if (current.includes(emoji)) {
        return current.split(emoji).join('').replace(/\s{2,}/g, ' ').trim();
      }
      return `${current}${current ? ' ' : ''}${emoji}`.trim();
    });
  };

  const renderMessageMenu = ({ messageKey, originalText, timestamp, status, canEdit = true }) => (
    <div className="admin-chat-message-menu" ref={openMenuId === messageKey ? messageMenuRef : null}>
      <button
        type="button"
        className="admin-chat-message-menu-trigger"
        onClick={() => setOpenMenuId((current) => (current === messageKey ? null : messageKey))}
        aria-label="Message options"
      >
        <i className="fas fa-ellipsis-v" aria-hidden="true" />
      </button>
      {openMenuId === messageKey ? (
        <div className="admin-chat-message-menu-dropdown">
          <button type="button" onClick={() => { setInfoMessageId(messageKey); setOpenMenuId(null); }}>
            <i className="fas fa-circle-info" aria-hidden="true" />
            <span>Message Info</span>
          </button>
          <button type="button" onClick={() => toggleMessageSelection(messageKey)}>
            <i className="fas fa-check-double" aria-hidden="true" />
            <span>{isSelectedMessage(messageKey) ? 'Unselect Message' : 'Select Message'}</span>
          </button>
          <button type="button" onClick={() => handleDeleteForMe(messageKey)}>
            <i className="fas fa-eye-slash" aria-hidden="true" />
            <span>Delete for Me</span>
          </button>
          <button type="button" onClick={() => handleDeleteForEveryone(messageKey)}>
            <i className="fas fa-trash" aria-hidden="true" />
            <span>Delete for Everyone</span>
          </button>
          <button type="button" onClick={() => startMessageEdit(messageKey, originalText)} disabled={!canEdit || selectedSessionIsLocked}>
            <i className="fas fa-pen" aria-hidden="true" />
            <span>Edit Message</span>
          </button>
          <button type="button" onClick={() => setReactionPickerMessageId((current) => current === messageKey ? null : messageKey)}>
            <i className="far fa-face-smile" aria-hidden="true" />
            <span>Emoji Reaction</span>
          </button>
          {reactionPickerMessageId === messageKey ? (
            <div className="admin-chat-message-reaction-picker" ref={reactionPickerRef}>
              <FullEmojiPicker className="admin-chat-full-emoji-picker" onEmojiSelect={(emoji) => addReaction(messageKey, emoji)} />
            </div>
          ) : null}
        </div>
      ) : null}
      {infoMessageId === messageKey ? (
        <div className="admin-chat-message-info-card">
          <div><strong>Time:</strong> {new Date(timestamp).toLocaleString()}</div>
          <div><strong>Status:</strong> {status}</div>
          <button type="button" onClick={() => setInfoMessageId(null)}>Close</button>
        </div>
      ) : null}
    </div>
  );

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

  const isEmptyState = !selectedSession || thread.length === 0;

  return (
    <div className="admin-chat-workspace">
      <div className="admin-chat-toolbar">
        <div className="admin-chat-role-tabs">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveRole(tab.id)}
              className={`admin-chat-filter-pill ${activeRole === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="admin-chat-toolbar-actions">
          <button type="button" className="admin-chat-top-btn" onClick={() => setShowArchived((value) => !value)}>
            <i className="fas fa-inbox" aria-hidden="true" />
            <span>{showArchived ? 'Show Active' : 'Show Archived'}</span>
          </button>
          <button type="button" className="admin-chat-top-btn" onClick={fetchChats}>
            <i className="fas fa-rotate-right" aria-hidden="true" />
            <span>Refresh Inbox</span>
          </button>
        </div>
      </div>

      {error ? <div className="admin-chat-error-banner">{error}</div> : null}

      <div className="chat-layout admin-chat-support-layout admin-chat-three-panel-layout">
        <aside className="panel chat-sessions-panel admin-chat-sessions-panel">
          <div className="panel-head admin-chat-sidebar-head">
            <div>
              <div className="panel-title">Conversations</div>
              <p className="admin-chat-sidebar-subtitle">
                {showArchived ? 'Archived threads' : 'Active support inbox'}
              </p>
            </div>
            <span className="admin-chat-count-pill">{sessions.length}</span>
          </div>

          <div className="admin-chat-search-wrap">
            <div className="admin-chat-search-box">
              <i className="fas fa-search" aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users or chat history"
                className="admin-chat-search-input"
              />
            </div>
          </div>

          <div className="admin-chat-session-list">
            {loading && sessions.length === 0 ? (
              <p className="admin-chat-sidebar-placeholder">Loading conversations...</p>
            ) : sessions.length === 0 ? (
              <p className="admin-chat-sidebar-placeholder">No conversations found</p>
            ) : (
              sessions.map((session) => (
                <button
                  key={session.key}
                  type="button"
                  onClick={() => setSelectedSessionKey(session.key)}
                  className={`admin-chat-session-card ${selectedSessionKey === session.key ? 'active' : ''}`}
                >
                  <div className="admin-chat-session-avatar">{getInitials(session.userName)}</div>
                  <div className="admin-chat-session-content">
                    <div className="admin-chat-session-topline">
                      <strong>{session.userName}</strong>
                      <span>{formatRelativeTime(session.lastAt)}</span>
                    </div>
                    <div className="admin-chat-session-meta">
                      <span className={`admin-chat-presence-dot ${session.isOnline ? 'online' : 'offline'}`} />
                      <span>{session.isOnline ? 'Online' : 'Offline'}</span>
                      <span className="admin-chat-role-chip">{session.role}</span>
                    </div>
                    <div className="admin-chat-session-preview">
                      {session.lastSenderType === 'Admin' ? 'You: ' : ''}
                      {session.lastMsg || 'No messages yet'}
                    </div>
                  </div>
                  <div className="admin-chat-session-side">
                    {session.unreadCount > 0 ? <span className="admin-chat-unread-badge">{session.unreadCount}</span> : null}
                    {session.locked ? <i className="fas fa-lock admin-chat-session-flag" aria-hidden="true" /> : null}
                    {session.archived ? <i className="fas fa-box-archive admin-chat-session-flag" aria-hidden="true" /> : null}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="panel admin-chat-main-panel">
          <div className="panel-head admin-chat-panel-head">
            <div className="admin-chat-header-info">
              <div className="admin-chat-header-avatar">
                {selectedSession ? getInitials(selectedSession.userName) : 'CS'}
              </div>
              <div>
                <div className="panel-title">
                  {selectedSession ? selectedSession.userName : 'Select a conversation'}
                </div>
                <div className="admin-chat-header-subtext">
                  {selectedSession
                    ? `${selectedSession.userEmail} • ${getStatusLabel(selectedSession)}`
                    : 'Choose a user from the left panel to open the support thread.'}
                </div>
              </div>
            </div>

            {selectedSession ? (
              <div className="admin-chat-header-actions">
                <button type="button" onClick={handleFeedSearch} className={`admin-chat-action-btn ${HEADER_ACTIONS.feed.buttonClass}`}>
                  <i className={HEADER_ACTIONS.feed.iconClass} aria-hidden="true" />
                  <span>{HEADER_ACTIONS.feed.label}</span>
                </button>
                <button type="button" onClick={() => exportThread('txt')} className={`admin-chat-action-btn ${HEADER_ACTIONS.export.buttonClass}`}>
                  <i className={HEADER_ACTIONS.export.iconClass} aria-hidden="true" />
                  <span>{HEADER_ACTIONS.export.label}</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleSessionFlag(setArchivedSessions, archivedSessions, selectedSession.key)}
                  className={`admin-chat-action-btn ${HEADER_ACTIONS.archive.buttonClass}`}
                >
                  <i className={HEADER_ACTIONS.archive.iconClass} aria-hidden="true" />
                  <span>{actionLabel('archive')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleSessionFlag(setLockedSessions, lockedSessions, selectedSession.key)}
                  className={`admin-chat-action-btn ${HEADER_ACTIONS.lock.buttonClass}`}
                >
                  <i className={HEADER_ACTIONS.lock.iconClass} aria-hidden="true" />
                  <span>{actionLabel('lock')}</span>
                </button>
                <button
                  type="button"
                  onClick={clearSelectedChat}
                  disabled={closing}
                  className={`admin-chat-action-btn ${HEADER_ACTIONS.clear.buttonClass}`}
                >
                  <i className={HEADER_ACTIONS.clear.iconClass} aria-hidden="true" />
                  <span>{closing ? 'Clearing...' : HEADER_ACTIONS.clear.label}</span>
                </button>
                <button type="button" onClick={refreshSelectedThread} className={`admin-chat-action-btn ${HEADER_ACTIONS.refresh.buttonClass}`}>
                  <i className={HEADER_ACTIONS.refresh.iconClass} aria-hidden="true" />
                  <span>{HEADER_ACTIONS.refresh.label}</span>
                </button>
              </div>
            ) : null}
          </div>

          <div ref={messagesViewportRef} className="admin-chat-messages-shell">
            {isEmptyState ? (
              <div className="admin-chat-empty-state">
                <EmptyStateIcon />
                <h3>Select a conversation</h3>
                <p>Choose a user from the left panel to open the support thread.</p>
                <div className="admin-chat-empty-actions">
                  <button
                    type="button"
                    className="admin-chat-cta admin-chat-cta-export"
                    onClick={() => selectedSession && exportThread(thread.length > 0 ? 'txt' : 'json')}
                    disabled={!selectedSession}
                  >
                    Export Chat
                  </button>
                  <button
                    type="button"
                    className="admin-chat-cta admin-chat-cta-clear"
                    onClick={clearSelectedChat}
                    disabled={!selectedSession || closing}
                  >
                    {closing ? 'Clearing...' : 'Clear Chat'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="admin-chat-thread">
                {thread.map((message) => {
                  const isAdminMessage = message.sender_type === 'Admin';
                  const messageKey = getMessageKey(message);
                  const responseKey = getMessageKey(message, 'response');
                  const isServerDeleted = Boolean(message.deleted);
                  const messageText = (isServerDeleted || isDeletedForEveryone(messageKey))
                    ? 'This message was deleted'
                    : getDisplayText(messageKey, message.message);
                  const responseText = (isServerDeleted || isDeletedForEveryone(responseKey))
                    ? 'This message was deleted'
                    : getDisplayText(responseKey, message.response || '');

                  if (isHiddenForMe(messageKey)) {
                    return null;
                  }

                  return (
                    <div
                      key={message.id}
                      className={`admin-chat-message-row ${isAdminMessage ? 'is-admin' : 'is-user'} ${isSelectedMessage(messageKey) ? 'is-selected' : ''}`}
                    >
                      <div className={`admin-chat-bubble-card ${isAdminMessage ? 'is-admin' : 'is-user'} ${isDeletedForEveryone(messageKey) ? 'is-deleted' : ''}`}>
                        {isAdminMessage ? renderMessageMenu({
                          messageKey,
                          originalText: getDisplayText(messageKey, message.message),
                          timestamp: message.timestamp,
                          status: getMessageMeta(message),
                          canEdit: !(message.deleted || isDeletedForEveryone(messageKey)),
                        }) : null}
                        <div className="admin-chat-bubble-head">
                          <span>{isAdminMessage ? 'Admin' : selectedSession.userName}</span>
                          <span>{new Date(message.timestamp).toLocaleString()}</span>
                        </div>
                        {editingId === messageKey ? (
                          <div className="admin-chat-edit-wrap">
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className={`admin-chat-edit-textarea ${isAdminMessage ? '' : 'light'}`}
                            />
                            <div className="admin-chat-edit-actions">
                              <button type="button" className={`admin-chat-mini-btn ${isAdminMessage ? 'solid' : 'light-solid'}`} onClick={() => saveInlineMessageEdit(messageKey)}>
                                Save
                              </button>
                              <button
                                type="button"
                                className={`admin-chat-mini-btn ${isAdminMessage ? '' : 'light'}`}
                                onClick={() => {
                                  setEditingId(null);
                                  setEditText('');
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="admin-chat-bubble-text">{messageText}</div>
                        )}

                        {message.fileUrl && !message.deleted ? (
                          <div className="admin-chat-attachment-wrap">
                            {message.fileType?.startsWith('audio/') ? (
                              <AudioAttachment
                                src={message.fileUrl}
                                className="admin-chat-audio-wrap"
                                controlsClassName="admin-chat-audio-player"
                                metaClassName="admin-chat-audio-duration"
                              />
                            ) : message.fileType?.startsWith('image/') ? (
                              <img
                                src={message.fileUrl}
                                alt="Attachment"
                                className="admin-chat-attachment-image"
                                onClick={() => window.open(message.fileUrl, '_blank')}
                              />
                            ) : (
                              <a href={message.fileUrl} target="_blank" rel="noreferrer" className="admin-chat-attachment-link">
                                View attachment
                              </a>
                            )}
                          </div>
                        ) : null}

                        <div className="admin-chat-bubble-foot">
                          <span>{getMessageMeta(message)}</span>
                        </div>
                        {messageReactions[messageKey]?.length ? (
                          <div className="admin-chat-reaction-bar">
                            {messageReactions[messageKey].map((emoji) => (
                              <span key={`${messageKey}-${emoji}`} className="admin-chat-reaction-pill">{emoji}</span>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      {!isAdminMessage && message.response && !message.deleted && !isHiddenForMe(responseKey) ? (
                        <div className="admin-chat-inline-response">
                          <div className={`admin-chat-bubble-card is-admin ${isSelectedMessage(responseKey) ? 'is-selected' : ''} ${isDeletedForEveryone(responseKey) ? 'is-deleted' : ''}`}>
                            {renderMessageMenu({
                              messageKey: responseKey,
                              originalText: getDisplayText(responseKey, message.response || ''),
                              timestamp: message.timestamp,
                              status: 'Seen',
                              canEdit: !(message.deleted || isDeletedForEveryone(responseKey)),
                            })}
                            <div className="admin-chat-bubble-head">
                              <span>Admin Response</span>
                              <span>{new Date(message.timestamp).toLocaleString()}</span>
                            </div>
                            {editingId === responseKey ? (
                              <div className="admin-chat-edit-wrap">
                                <textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="admin-chat-edit-textarea"
                                />
                                <div className="admin-chat-edit-actions">
                                  <button type="button" className="admin-chat-mini-btn solid" onClick={() => saveInlineMessageEdit(responseKey)} disabled={selectedSessionIsLocked}>
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    className="admin-chat-mini-btn"
                                    onClick={() => {
                                      setEditingId(null);
                                      setEditText('');
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="admin-chat-bubble-text">{responseText}</div>
                                <div className="admin-chat-bubble-foot">
                                  <span>Seen</span>
                                  <button
                                    type="button"
                                    className="admin-chat-link-btn"
                                    onClick={() => {
                                      setEditingId(responseKey);
                                      setEditText(getDisplayText(responseKey, message.response || ''));
                                    }}
                                    disabled={selectedSessionIsLocked}
                                  >
                                    {selectedSessionIsLocked ? 'Locked' : 'Edit response'}
                                  </button>
                                </div>
                                {messageReactions[responseKey]?.length ? (
                                  <div className="admin-chat-reaction-bar">
                                    {messageReactions[responseKey].map((emoji) => (
                                      <span key={`${responseKey}-${emoji}`} className="admin-chat-reaction-pill">{emoji}</span>
                                    ))}
                                  </div>
                                ) : null}
                              </>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {selectedSession ? (
            <div className="admin-chat-composer">
              {typingState ? <div className="admin-chat-typing-chip">{typingState}</div> : null}
              {recordingError ? <div className="admin-chat-locked-note error">{recordingError}</div> : null}
              {isRecording ? (
                <div className="admin-chat-voice-indicator">
                  <span className="admin-chat-voice-dot" />
                  <span>Recording...</span>
                </div>
              ) : null}
              {replyFile ? (
                <div className="admin-chat-file-pill">
                  <div className="admin-chat-file-pill-content">
                    <span>Attachment: {replyFile.name}</span>
                    {replyFile.type?.startsWith('audio/') && recordedUrl ? (
                      <AudioAttachment
                        src={recordedUrl}
                        className="admin-chat-audio-wrap compact"
                        controlsClassName="admin-chat-audio-player"
                        metaClassName="admin-chat-audio-duration"
                      />
                    ) : null}
                  </div>
                  <button type="button" onClick={() => { setReplyFile(null); clearRecordedAudio(); }}>Remove</button>
                </div>
              ) : null}

              <div className="admin-chat-input-row">
                <div className="admin-chat-input-tools">
                  <div className="admin-chat-emoji-wrap" ref={emojiPickerRef}>
                    <button
                      type="button"
                      className={`admin-chat-emoji-btn ${emojiPickerOpen ? 'active' : ''}`}
                      onClick={() => setEmojiPickerOpen((current) => !current)}
                      disabled={sending || selectedSessionIsLocked}
                      aria-label="Open emoji picker"
                    >
                      <i className="far fa-face-smile" aria-hidden="true" />
                    </button>
                    {emojiPickerOpen ? (
                      <FullEmojiPicker className="admin-chat-emoji-picker" onEmojiSelect={toggleInputEmoji} />
                    ) : null}
                  </div>
                  <label className={`admin-chat-attach-btn ${sending || selectedSessionIsLocked ? 'disabled' : ''}`}>
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      disabled={sending || selectedSessionIsLocked}
                      onChange={(e) => {
                        clearRecordedAudio();
                        setRecordingError('');
                        setReplyFile(e.target.files?.[0] || null);
                      }}
                    />
                    <i className="fas fa-paperclip" aria-hidden="true" />
                  </label>
                  <button
                    type="button"
                    className={`admin-chat-attach-btn voice ${isRecording ? 'recording' : ''}`}
                    onClick={() => {
                      if (isRecording) stopRecording();
                      else startRecording();
                    }}
                    disabled={sending || selectedSessionIsLocked}
                  >
                    <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`} aria-hidden="true" />
                  </button>
                </div>
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
                  placeholder={selectedSessionIsLocked ? 'Chat is locked' : 'Type a reply to the user...'}
                  className="admin-chat-input"
                  disabled={sending || selectedSessionIsLocked}
                />
                <button
                  type="button"
                  onClick={sendAdminMessage}
                  disabled={sending || selectedSessionIsLocked || (!replyText.trim() && !replyFile)}
                  className="admin-chat-send-btn"
                >
                  <i className="fas fa-paper-plane" aria-hidden="true" />
                  <span>{selectedSessionIsLocked ? 'Locked' : sending ? 'Sending...' : 'Send'}</span>
                </button>
              </div>

              {selectedSessionIsLocked ? (
                <div className="admin-chat-locked-note">
                  This conversation is locked. Unlock it from the header to send messages or edit responses.
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        <aside className="panel admin-chat-details-panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">User Details</div>
              <p className="admin-chat-sidebar-subtitle">Quick support context</p>
            </div>
          </div>

          {selectedSession ? (
            <div className="admin-chat-details-body">
              <div className="admin-chat-profile-card">
                <div className="admin-chat-profile-avatar">{getInitials(selectedSession.userName)}</div>
                <div className="admin-chat-profile-name">{selectedSession.userName}</div>
                <div className="admin-chat-profile-email">{selectedSession.userEmail}</div>
                <div className="admin-chat-profile-status">
                  <span className={`admin-chat-presence-dot ${selectedSession.isOnline ? 'online' : 'offline'}`} />
                  <span>{selectedSession.isOnline ? 'Online now' : 'Offline'}</span>
                </div>
              </div>

              <div className="admin-chat-detail-grid">
                <div className="admin-chat-detail-card">
                  <span>Total messages</span>
                  <strong>{selectedSession.count}</strong>
                </div>
                <div className="admin-chat-detail-card">
                  <span>Unread</span>
                  <strong>{selectedSession.unreadCount}</strong>
                </div>
                <div className="admin-chat-detail-card">
                  <span>Last active</span>
                  <strong>{formatRelativeTime(selectedSession.lastAt)}</strong>
                </div>
                <div className="admin-chat-detail-card">
                  <span>Role</span>
                  <strong>{selectedSession.role}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-chat-details-empty">
              <EmptyStateIcon />
              <h3>Select a conversation</h3>
              <p>Pick a chat from the inbox to view user details and support context.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default AdminChatSupportView;
