import React from 'react';
import api from '../../services/api.js';
import FullEmojiPicker from '../shared/FullEmojiPicker.jsx';
import AudioAttachment from '../shared/AudioAttachment.jsx';
import useVoiceRecorder from '../../hooks/useVoiceRecorder.js';

const archiveKey = 'hrm_company_chat_archived';
const lockKey = 'hrm_company_chat_locked';
const emptyBootstrap = { company: null, currentUser: null, users: [], groups: [], directConversations: [] };
const emptyGroupForm = { mode: 'create', groupId: null, name: '', members: [], originalMembers: [] };
const emptyUserForm = { mode: 'create', id: null, name: '', email: '', status: 'online', avatar: '', avatarFileName: '' };

const readMap = (key) => {
  try {
    return JSON.parse(window.localStorage.getItem(key) || '{}');
  } catch {
    return {};
  }
};

const withCompanyChatFallback = async (requestFactory) => {
  try {
    return await requestFactory('/api/v1/company-chat');
  } catch (error) {
    if (error?.response?.status === 404) {
      return requestFactory('/api/company-chat');
    }
    throw error;
  }
};

const getInitials = (value) =>
  (value || 'U')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';

const formatTime = (value) => (value ? new Date(value).toLocaleString() : '');
const conversationKeyOf = (type, target) => `${type}:${target}`;

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Failed to read avatar file.'));
  reader.readAsDataURL(file);
});

const readStoredRole = () => {
  try {
    return (window.sessionStorage.getItem('shnoor_role') || window.localStorage.getItem('shnoor_role') || '').trim();
  } catch {
    return '';
  }
};

class CompanyChatErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    this.setState({ errorMessage: error?.message || '' });
    console.error('[CompanyChatWorkspace] render error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="company-chat-error" style={{ marginTop: 16 }}>
          Company chat could not load right now. Please refresh the page and try again.
          {this.state.errorMessage ? (
            <div style={{ marginTop: 8, fontSize: '0.85rem', opacity: 0.8 }}>
              {this.state.errorMessage}
            </div>
          ) : null}
        </div>
      );
    }

    return this.props.children;
  }
}

const CompanyChatWorkspace = () => {
  const [bootstrap, setBootstrap] = React.useState(emptyBootstrap);
  const [search, setSearch] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('users');
  const [selectedConversation, setSelectedConversation] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [composer, setComposer] = React.useState('');
  const [composerFile, setComposerFile] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [groupModalOpen, setGroupModalOpen] = React.useState(false);
  const [groupForm, setGroupForm] = React.useState(emptyGroupForm);
  const [userModalOpen, setUserModalOpen] = React.useState(false);
  const [userForm, setUserForm] = React.useState(emptyUserForm);
  const [messageInfo, setMessageInfo] = React.useState(null);
  const [memberSearch, setMemberSearch] = React.useState('');
  const [menuId, setMenuId] = React.useState(null);
  const [editingId, setEditingId] = React.useState(null);
  const [editText, setEditText] = React.useState('');
  const [selectedMessages, setSelectedMessages] = React.useState({});
  const [hiddenMessages, setHiddenMessages] = React.useState({});
  const [emojiPickerOpen, setEmojiPickerOpen] = React.useState(false);
  const [reactionPickerMessageId, setReactionPickerMessageId] = React.useState(null);
  const [messageReactions, setMessageReactions] = React.useState({});
  const [groupHeaderMenuOpen, setGroupHeaderMenuOpen] = React.useState(false);
  const [archivedConversations, setArchivedConversations] = React.useState(() => readMap(archiveKey));
  const [lockedConversations, setLockedConversations] = React.useState(() => readMap(lockKey));
  const [showArchived, setShowArchived] = React.useState(false);
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

  const menuRef = React.useRef(null);
  const emojiRef = React.useRef(null);
  const reactionPickerRef = React.useRef(null);
  const searchRef = React.useRef(null);
  const messageListRef = React.useRef(null);
  const groupHeaderMenuRef = React.useRef(null);
  const composerFileInputRef = React.useRef(null);
  const safeBootstrap = React.useMemo(() => ({
    company: bootstrap?.company || null,
    currentUser: bootstrap?.currentUser || null,
    users: Array.isArray(bootstrap?.users) ? bootstrap.users : [],
    groups: Array.isArray(bootstrap?.groups) ? bootstrap.groups : [],
    directConversations: Array.isArray(bootstrap?.directConversations) ? bootstrap.directConversations : [],
  }), [bootstrap]);
  const currentRole = React.useMemo(() => readStoredRole(), []);
  const currentUserRole = (safeBootstrap.currentUser?.role || currentRole || '').toString().trim().toLowerCase();
  const canManageWorkspace = currentUserRole === 'admin' || currentUserRole === 'super admin';

  const loadBootstrap = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await withCompanyChatFallback((base) => api.get(`${base}/bootstrap`));
      setBootstrap(data.data || emptyBootstrap);
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || 'Failed to load company chat.';
      setBootstrap(emptyBootstrap);
      setSelectedConversation(null);
      setMessages([]);
      setError(message.includes('Route') ? 'Company chat backend is not available yet. Restart the backend server and refresh this page.' : message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { loadBootstrap(); }, [loadBootstrap]);
  React.useEffect(() => { window.localStorage.setItem(archiveKey, JSON.stringify(archivedConversations)); }, [archivedConversations]);
  React.useEffect(() => { window.localStorage.setItem(lockKey, JSON.stringify(lockedConversations)); }, [lockedConversations]);

  React.useEffect(() => {
    const onClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuId(null);
      if (emojiRef.current && !emojiRef.current.contains(event.target)) setEmojiPickerOpen(false);
      if (reactionPickerRef.current && !reactionPickerRef.current.contains(event.target)) setReactionPickerMessageId(null);
      if (groupHeaderMenuRef.current && !groupHeaderMenuRef.current.contains(event.target)) setGroupHeaderMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  React.useEffect(() => {
    messageListRef.current?.scrollTo({ top: messageListRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  React.useEffect(() => {
    if (!successMessage) return undefined;
    const timer = window.setTimeout(() => setSuccessMessage(''), 2400);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  React.useEffect(() => {
    if (recordedFile) setComposerFile(recordedFile);
  }, [recordedFile]);

  const conversations = React.useMemo(() => {
    const groupItems = safeBootstrap.groups.map((group) => ({ ...group, type: 'group', target: String(group.id) }));
    const directItems = safeBootstrap.users.map((user) => {
      const direct = safeBootstrap.directConversations.find((item) =>
        Array.isArray(item?.members) && item.members.some((member) => member.email === user.email)
      );
      return {
        id: user.id || user.email,
        type: 'direct',
        target: user.email,
        name: user.name,
        email: user.email,
        source: user.source,
        role: user.role,
        avatar: user.avatar || '',
        lastMessage: direct?.lastMessage || null,
        members: [{ email: user.email, name: user.name, role: user.role }],
        status: user.status || 'offline',
        isOnline: ['active', 'online'].includes(String(user.status || '').toLowerCase()),
      };
    });
    return { groups: groupItems, users: directItems };
  }, [safeBootstrap]);

  const sidebarItems = React.useMemo(() => {
    const list = activeTab === 'groups' ? conversations.groups : conversations.users;
    return list.filter((item) => {
      const key = conversationKeyOf(item.type, item.target);
      const archived = archivedConversations[key] === true;
      if (showArchived && !archived) return false;
      if (!showArchived && archived) return false;
      const haystack = `${item.name || ''} ${item.lastMessage?.message || ''}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [activeTab, archivedConversations, conversations, search, showArchived]);

  const selectedKey = selectedConversation ? conversationKeyOf(selectedConversation.type, selectedConversation.target) : null;
  const isLocked = selectedKey ? Boolean(lockedConversations[selectedKey]) : false;
  const noCompanyAssigned = error.trim().toLowerCase() === 'no company assigned';
  const isSelectedGroup = selectedConversation?.type === 'group';
  const canManageSelectedGroup = Boolean(canManageWorkspace && (
    isSelectedGroup &&
    selectedConversation?.members?.some((member) => member.email === safeBootstrap.currentUser?.email && member.is_admin)
  ));
  const displayedGroupMembers = React.useMemo(() => (
    groupForm.members.map((email) => {
      const fromUsers = safeBootstrap.users.find((user) => user.email === email);
      const fromConversation = selectedConversation?.members?.find((member) => member.email === email);
      const baseMember = fromUsers || fromConversation || { email, name: email, role: 'Employee' };
      return {
        ...baseMember,
        isNew: !groupForm.originalMembers.includes(email),
      };
    })
  ), [safeBootstrap.users, groupForm.members, groupForm.originalMembers, selectedConversation?.members]);
  const filteredCompanyUsers = React.useMemo(() => (
    safeBootstrap.users.filter((user) => {
      const haystack = `${user.name || ''} ${user.role || ''} ${user.email || ''}`.toLowerCase();
      return haystack.includes(memberSearch.toLowerCase());
    })
  ), [safeBootstrap.users, memberSearch]);

  const showActiveChats = React.useCallback(() => {
    setShowArchived(false);
  }, []);

  const showArchivedChats = React.useCallback(() => {
    setShowArchived(true);
  }, []);

  const archiveConversation = React.useCallback((conversationKey) => {
    setArchivedConversations((current) => ({
      ...current,
      [conversationKey]: true,
    }));
  }, []);

  const unarchiveConversation = React.useCallback((conversationKey) => {
    setArchivedConversations((current) => {
      const next = { ...current };
      delete next[conversationKey];
      return next;
    });
  }, []);

  const resetGroupForm = React.useCallback(() => {
    setGroupModalOpen(false);
    setGroupForm(emptyGroupForm);
    setMemberSearch('');
  }, []);

  const resetUserForm = React.useCallback(() => {
    setUserModalOpen(false);
    setUserForm(emptyUserForm);
  }, []);

  const mergeUserIntoBootstrap = React.useCallback((user) => {
    setBootstrap((current) => {
      const nextUsers = [...(current.users || [])];
      const existingIndex = nextUsers.findIndex((item) => item.id === user.id || item.email === user.email);
      if (existingIndex >= 0) nextUsers[existingIndex] = { ...nextUsers[existingIndex], ...user };
      else nextUsers.unshift(user);
      return { ...current, users: nextUsers };
    });
  }, []);

  const loadConversation = React.useCallback(async (type, target, display = {}) => {
    setMenuId(null);
    setError('');
    const provisionalConversation = { type, target, ...display };
    setSelectedConversation(provisionalConversation);

    try {
      const { data } = await withCompanyChatFallback((base) =>
        api.get(`${base}/conversations/${type}/${encodeURIComponent(target)}/messages`)
      );

      const apiConversation = data?.data?.conversation;
      const resolvedConversation = apiConversation
        ? {
            ...provisionalConversation,
            ...apiConversation,
            type,
            target: type === 'group' ? String(apiConversation.id) : target,
          }
        : provisionalConversation;

      setSelectedConversation(resolvedConversation);
      setMessages(data?.data?.messages || []);
      return resolvedConversation;
    } catch (err) {
      setMessages([]);
      setError(err?.response?.data?.error || 'Failed to load messages.');
      return provisionalConversation;
    }
  }, []);

  const refreshBootstrapAndSelection = React.useCallback(async (conversationOverride = null) => {
    await loadBootstrap();
    const nextConversation = conversationOverride || selectedConversation;
    if (nextConversation) {
      await loadConversation(nextConversation.type, nextConversation.target, nextConversation);
    }
  }, [loadBootstrap, loadConversation, selectedConversation]);

  React.useEffect(() => {
    const onGroupsUpdated = (event) => {
      const eventCompanyId = event?.detail?.companyId ? String(event.detail.companyId) : null;
      const currentCompanyId = safeBootstrap.company?.id ? String(safeBootstrap.company.id) : null;
      if (eventCompanyId && currentCompanyId && eventCompanyId !== currentCompanyId) return;
      refreshBootstrapAndSelection(selectedConversation);
    };

    window.addEventListener('company-chat-groups-updated', onGroupsUpdated);
    return () => window.removeEventListener('company-chat-groups-updated', onGroupsUpdated);
  }, [safeBootstrap.company?.id, refreshBootstrapAndSelection, selectedConversation]);

  const clearSelectedConversation = React.useCallback(async () => {
    if (!selectedConversation) return;
    const confirmed = window.confirm(`Clear all messages in ${selectedConversation.name || 'this conversation'}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      const { data } = await withCompanyChatFallback((base) =>
        api.delete(`${base}/conversations/${selectedConversation.type}/${encodeURIComponent(selectedConversation.target)}/messages`)
      );
      setSuccessMessage(data?.message || 'Conversation cleared successfully.');
      await refreshBootstrapAndSelection(selectedConversation);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to clear conversation.');
    }
  }, [refreshBootstrapAndSelection, selectedConversation]);

  const handleSend = async () => {
    if (!selectedConversation || (!composer.trim() && !composerFile) || isLocked) return;
    try {
      const formData = new FormData();
      formData.append('type', selectedConversation.type);
      formData.append('target', selectedConversation.target);
      formData.append('message', composer.trim());
      if (composerFile) formData.append('file', composerFile);

      await withCompanyChatFallback((base) => api.post(`${base}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }));
      setComposer('');
      setComposerFile(null);
      setEmojiPickerOpen(false);
      clearRecordedAudio();
      setRecordingError('');
      if (composerFileInputRef.current) composerFileInputRef.current.value = '';
      await refreshBootstrapAndSelection(selectedConversation);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to send message.');
    }
  };

  const openCreateGroupModal = () => {
    setGroupForm({ mode: 'create', groupId: null, name: '', members: [], originalMembers: [] });
    setMemberSearch('');
    setGroupModalOpen(true);
  };

  const openAddUserModal = () => {
    setUserForm(emptyUserForm);
    setUserModalOpen(true);
  };

  const openEditUserModal = (user) => {
    setUserForm({
      mode: 'edit',
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      status: user.isOnline ? 'online' : 'offline',
      avatar: user.avatar || '',
      avatarFileName: '',
    });
    setUserModalOpen(true);
  };

  const openRenameGroupModal = () => {
    if (!selectedConversation) return;
    setGroupHeaderMenuOpen(false);
    setMemberSearch('');
    setGroupForm({
      mode: 'rename',
      groupId: selectedConversation.target,
      name: selectedConversation.name || '',
      members: [],
      originalMembers: [],
    });
    setGroupModalOpen(true);
  };

  const openMembersGroupModal = (mode = 'members') => {
    if (!selectedConversation) return;
    const currentMembers = (selectedConversation.members || [])
      .filter((member) => member.email !== safeBootstrap.currentUser?.email)
      .map((member) => member.email);

    setGroupHeaderMenuOpen(false);
    setMemberSearch('');
    setGroupForm({
      mode,
      groupId: selectedConversation.target,
      name: selectedConversation.name || '',
      members: currentMembers,
      originalMembers: currentMembers,
    });
    setGroupModalOpen(true);
  };

  const openDeleteGroupModal = () => {
    if (!selectedConversation) return;
    setGroupHeaderMenuOpen(false);
    setMemberSearch('');
    setGroupForm({
      mode: 'delete',
      groupId: selectedConversation.target,
      name: selectedConversation.name || '',
      members: [],
      originalMembers: [],
    });
    setGroupModalOpen(true);
  };

  const handleCreateGroup = async () => {
    try {
      await withCompanyChatFallback((base) => api.post(`${base}/groups`, {
        name: groupForm.name,
        memberEmails: groupForm.members,
      }));
      resetGroupForm();
      setActiveTab('groups');
      await loadBootstrap();
      setSuccessMessage('Group created successfully.');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create group.');
    }
  };

  const handleUserAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const avatar = await readFileAsDataUrl(file);
      setUserForm((current) => ({
        ...current,
        avatar,
        avatarFileName: file.name,
      }));
    } catch (err) {
      setError(err.message || 'Failed to load avatar.');
    }
  };

  const handleSaveUser = async () => {
    if (!userForm.name.trim()) {
      setError('User name is required.');
      return;
    }

    try {
      const payload = {
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        status: userForm.status,
        company_id: safeBootstrap.company?.id,
        avatar: userForm.avatar || null,
      };

      const { data } = await withCompanyChatFallback((base) => (
        userForm.mode === 'edit'
          ? api.put(`${base}/users/${encodeURIComponent(userForm.id)}`, payload)
          : api.post(`${base}/users`, payload)
      ));

      mergeUserIntoBootstrap(data.data);

      if (selectedConversation?.type === 'direct' && (selectedConversation.id === data.data.id || selectedConversation.target === data.data.email)) {
        setSelectedConversation((current) => current ? {
          ...current,
          id: data.data.id,
          name: data.data.name,
          target: data.data.email,
          email: data.data.email,
          status: data.data.status,
          isOnline: data.data.status === 'online',
          avatar: data.data.avatar || '',
        } : current);
      }

      resetUserForm();
      setSuccessMessage(userForm.mode === 'edit' ? 'User updated successfully.' : 'User created successfully.');
      await loadBootstrap();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save user.');
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (!confirmed) return;

    try {
      await withCompanyChatFallback((base) => api.delete(`${base}/users/${encodeURIComponent(user.id)}`));
      setBootstrap((current) => ({
        ...current,
        users: (current.users || []).filter((item) => item.id !== user.id && item.email !== user.email),
      }));
      if (selectedConversation?.type === 'direct' && (selectedConversation.id === user.id || selectedConversation.target === user.email)) {
        setSelectedConversation(null);
        setMessages([]);
      }
      setSuccessMessage('User deleted successfully.');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete user.');
    }
  };

  const handleRenameGroup = async () => {
    try {
      const { data } = await withCompanyChatFallback((base) =>
        api.put(`${base}/groups/${groupForm.groupId}`, { name: groupForm.name.trim() })
      );
      const nextConversation = selectedConversation
        ? { ...selectedConversation, name: data?.data?.name || groupForm.name.trim() }
        : null;

      resetGroupForm();
      if (nextConversation) setSelectedConversation(nextConversation);
      await refreshBootstrapAndSelection(nextConversation);
      setSuccessMessage('Group name updated.');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to update group name.');
    }
  };

  const handleSaveGroupMembers = async () => {
    try {
      const currentMembers = new Set(groupForm.originalMembers);
      const nextMembers = new Set(groupForm.members);
      const addedMembers = [...nextMembers].filter((email) => !currentMembers.has(email));
      const removedMembers = [...currentMembers].filter((email) => !nextMembers.has(email));

      if (addedMembers.length) {
        await withCompanyChatFallback((base) =>
          api.post(`${base}/groups/${groupForm.groupId}/members`, { userIds: addedMembers })
        );
      }

      for (const email of removedMembers) {
        await withCompanyChatFallback((base) =>
          api.delete(`${base}/groups/${groupForm.groupId}/members/${encodeURIComponent(email)}`)
        );
      }

      resetGroupForm();
      await refreshBootstrapAndSelection(selectedConversation);
      setSuccessMessage('Group members updated.');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to update group members.');
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await withCompanyChatFallback((base) => api.delete(`${base}/groups/${groupForm.groupId}`));
      const deletedKey = conversationKeyOf('group', String(groupForm.groupId));
      resetGroupForm();
      setSelectedConversation(null);
      setMessages([]);
      setArchivedConversations((current) => {
        const next = { ...current };
        delete next[deletedKey];
        return next;
      });
      setLockedConversations((current) => {
        const next = { ...current };
        delete next[deletedKey];
        return next;
      });
      await loadBootstrap();
      setActiveTab('groups');
      setSuccessMessage('Group deleted successfully.');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete group.');
    }
  };

  const handleSaveEdit = async (messageId) => {
    if (!editText.trim()) return;
    try {
      await withCompanyChatFallback((base) => api.put(`${base}/messages/${messageId}`, { message: editText.trim() }));
      setEditingId(null);
      setEditText('');
      await refreshBootstrapAndSelection(selectedConversation);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to edit message.');
    }
  };

  const handleDeleteEveryone = async (messageId) => {
    try {
      await withCompanyChatFallback((base) => api.delete(`${base}/messages/${messageId}`));
      setMenuId(null);
      await refreshBootstrapAndSelection(selectedConversation);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete message.');
    }
  };

  const openMessageInfo = (message) => {
    setMenuId(null);
    setMessageInfo({
      ...message,
      chatType: selectedConversation?.type || 'direct',
      chatName: selectedConversation?.name || '',
      senderLabel: selectedConversation?.type === 'group'
        ? (message.sender_name || 'Unknown sender')
        : (safeBootstrap.currentUser?.email === message.sender_email ? 'You' : selectedConversation?.name || message.sender_name || 'User'),
      statusLabel: message.deleted_for_everyone ? 'Deleted' : 'Delivered',
      seenLabel: selectedConversation?.type === 'group' ? 'Seen by group members' : 'Seen',
    });
  };

  const exportConversation = () => {
    if (!selectedConversation) return;
    const payload = JSON.stringify({ conversation: selectedConversation, messages }, null, 2);
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedConversation.name || selectedConversation.target}-company-chat.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const toggleEmoji = (emoji) => {
    setComposer((current) => (
      current.includes(emoji)
        ? current.split(emoji).join('').replace(/\s{2,}/g, ' ').trim()
        : `${current}${current ? ' ' : ''}${emoji}`
    ));
  };

  const handleComposerFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    clearRecordedAudio();
    setRecordingError('');
    setComposerFile(file);
  };

  const toggleMessageReaction = (messageId, emoji) => {
    setMessageReactions((current) => {
      const existing = current[messageId] || [];
      const next = existing.includes(emoji)
        ? existing.filter((value) => value !== emoji)
        : [...existing, emoji];
      return {
        ...current,
        [messageId]: next,
      };
    });
  };

  const toggleGroupMember = (email) => {
    setGroupForm((current) => ({
      ...current,
      members: current.members.includes(email)
        ? current.members.filter((value) => value !== email)
        : [...current.members, email],
    }));
  };

  const renderMessageMenu = (message) => (
    <div className="company-chat-menu" ref={menuId === message.id ? menuRef : null}>
      <button
        type="button"
        className="company-chat-menu-trigger"
        onClick={() => setMenuId((current) => (current === message.id ? null : message.id))}
      >
        <i className="fas fa-ellipsis-v" aria-hidden="true" />
      </button>
      {menuId === message.id ? (
        <div className="company-chat-menu-dropdown">
          <button type="button" onClick={() => openMessageInfo(message)}>
            <i className="fas fa-circle-info" aria-hidden="true" />
            <span>Message Info</span>
          </button>
          <button type="button" onClick={() => setSelectedMessages((current) => ({ ...current, [message.id]: !current[message.id] }))}>
            <i className="fas fa-check-double" aria-hidden="true" />
            <span>Select Message</span>
          </button>
          <button type="button" onClick={() => setHiddenMessages((current) => ({ ...current, [message.id]: true }))}>
            <i className="fas fa-trash" aria-hidden="true" />
            <span>Delete for Me</span>
          </button>
          <button type="button" onClick={() => handleDeleteEveryone(message.id)} disabled={safeBootstrap.currentUser?.email !== message.sender_email}>
            <i className="fas fa-ban" aria-hidden="true" />
            <span>Delete for Everyone</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingId(message.id);
              setEditText(message.message);
              setMenuId(null);
            }}
            disabled={safeBootstrap.currentUser?.email !== message.sender_email}
          >
            <i className="fas fa-pen" aria-hidden="true" />
            <span>Edit Message</span>
          </button>
          <button
            type="button"
            onClick={() => setReactionPickerMessageId((current) => current === message.id ? null : message.id)}
          >
            <i className="far fa-face-smile" aria-hidden="true" />
            <span>Emoji Reaction</span>
          </button>
          {reactionPickerMessageId === message.id ? (
            <div className="company-chat-menu-reaction-picker" ref={reactionPickerRef}>
              <FullEmojiPicker className="company-chat-full-emoji-picker" onEmojiSelect={(emoji) => toggleMessageReaction(message.id, emoji)} />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  const submitGroupModal = () => {
    if (groupForm.mode === 'create') return handleCreateGroup();
    if (groupForm.mode === 'rename') return handleRenameGroup();
    if (groupForm.mode === 'members') return handleSaveGroupMembers();
    if (groupForm.mode === 'delete') return handleDeleteGroup();
    return null;
  };

  const groupModalTitle = groupForm.mode === 'rename'
    ? 'Edit Group Name'
    : groupForm.mode === 'members'
      ? 'Manage Members'
      : groupForm.mode === 'delete'
        ? 'Delete Group'
        : 'Create Group';

  const groupModalActionLabel = groupForm.mode === 'rename'
    ? 'Save Name'
    : groupForm.mode === 'members'
      ? 'Save Members'
      : groupForm.mode === 'delete'
        ? 'Delete Group'
        : 'Create Group';

  return (
    <div className="company-chat-shell">
      <div className="company-chat-topbar">
        <div>
          <div className="company-chat-title">Company Chat</div>
          <div className="company-chat-subtitle">
            {safeBootstrap.company ? `${safeBootstrap.company.name} workspace` : noCompanyAssigned ? 'No company assigned to this account' : 'Loading company workspace'}
          </div>
        </div>
        <div className="company-chat-top-actions">
          <button
            type="button"
            className="company-chat-pill"
            onClick={showArchived ? showActiveChats : showArchivedChats}
            disabled={noCompanyAssigned}
          >
            {showArchived ? 'Show Active' : 'Show Archived'}
          </button>
          {canManageWorkspace ? (
            <>
              <button type="button" className="company-chat-pill" disabled={noCompanyAssigned} onClick={openAddUserModal}>
                Add User
              </button>
              <button type="button" className="company-chat-pill strong" disabled={noCompanyAssigned} onClick={openCreateGroupModal}>
                Create Group
              </button>
            </>
          ) : null}
        </div>
      </div>

      {successMessage ? <div className="company-chat-success">{successMessage}</div> : null}
      {error && !noCompanyAssigned ? <div className="company-chat-error">{error}</div> : null}

      <div className="company-chat-layout">
        <aside className="panel company-chat-sidebar">
          <div className="panel-head">
            <div className="panel-title">Workspace</div>
          </div>
          <div className="company-chat-sidebar-body">
            <div className="company-chat-search">
              <i className="fas fa-search" aria-hidden="true" />
              <input ref={searchRef} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users or groups" />
            </div>
            <div className="company-chat-tabs">
              <button type="button" className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Users</button>
              <button type="button" className={activeTab === 'groups' ? 'active' : ''} onClick={() => setActiveTab('groups')}>Groups</button>
            </div>
            <div className="company-chat-list">
              {loading && sidebarItems.length === 0 ? <p className="company-chat-empty-mini">Loading chats...</p> : null}
              {!loading && sidebarItems.length === 0 ? <p className="company-chat-empty-mini">No conversations found</p> : null}
              {sidebarItems.map((item) => {
                const key = conversationKeyOf(item.type, item.target);
                return (
                  <button key={key} type="button" className={`company-chat-list-item ${selectedKey === key ? 'active' : ''}`} onClick={() => loadConversation(item.type, item.target, item)}>
                    {item.avatar ? (
                      <img className="company-chat-avatar company-chat-avatar-image" src={item.avatar} alt={item.name} />
                    ) : (
                      <div className="company-chat-avatar">{getInitials(item.name)}</div>
                    )}
                    <div className="company-chat-item-content">
                      <div className="company-chat-item-top">
                        <strong>{item.name}</strong>
                        <div className="company-chat-item-actions">
                          <span>{formatTime(item.lastMessage?.created_at)}</span>
                          {canManageWorkspace && item.type === 'direct' ? (
                            <span
                              role="button"
                              tabIndex={0}
                              className="company-chat-user-edit"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                openEditUserModal(item);
                              }}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  openEditUserModal(item);
                                }
                              }}
                            >
                              <i className="fas fa-pen" aria-hidden="true" />
                            </span>
                          ) : null}
                          {canManageWorkspace && item.type === 'direct' ? (
                            <span
                              role="button"
                              tabIndex={0}
                              className="company-chat-user-edit delete"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                handleDeleteUser(item);
                              }}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  handleDeleteUser(item);
                                }
                              }}
                            >
                              <i className="fas fa-trash" aria-hidden="true" />
                            </span>
                          ) : null}
                        </div>
                      </div>
                      {item.type === 'direct' ? (
                        <div className="company-chat-user-status">
                          <span className={`company-chat-status-dot ${item.isOnline ? 'online' : 'offline'}`} />
                          <span>{item.isOnline ? 'Online' : 'Offline'}</span>
                        </div>
                      ) : null}
                      <div className="company-chat-item-preview">{item.lastMessage?.message || (item.type === 'group' ? 'No group messages yet' : 'Start a direct chat')}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="panel company-chat-main">
          <div className="panel-head company-chat-header">
            <div>
              <div className="panel-title">{selectedConversation?.name || (noCompanyAssigned ? 'Company unavailable' : 'Select a chat')}</div>
              <div className="company-chat-subtitle">
                {selectedConversation
                  ? `${selectedConversation.type === 'group' ? 'Group chat' : 'Direct chat'} • ${selectedConversation.target}`
                  : noCompanyAssigned
                    ? 'Assign this account to a company to start internal messaging.'
                    : 'Choose a user or group from the sidebar'}
              </div>
            </div>
            {selectedConversation ? (
              <div className="company-chat-header-actions">
                <button type="button" className="company-chat-header-btn feed" onClick={() => searchRef.current?.focus()}>
                  <i className="fas fa-search" aria-hidden="true" />
                  <span>Feed</span>
                </button>
                <button type="button" className="company-chat-header-btn export" onClick={exportConversation}>
                  <i className="fas fa-file-export" aria-hidden="true" />
                  <span>Export</span>
                </button>
                <button
                  type="button"
                  className="company-chat-header-btn archive"
                  onClick={() => {
                    if (!selectedKey) return;
                    if (archivedConversations[selectedKey]) {
                      unarchiveConversation(selectedKey);
                      return;
                    }
                    archiveConversation(selectedKey);
                  }}
                >
                  <i className="fas fa-box-archive" aria-hidden="true" />
                  <span>{archivedConversations[selectedKey] ? 'Unarchive' : 'Archive'}</span>
                </button>
                <button
                  type="button"
                  className="company-chat-header-btn lock"
                  onClick={() => setLockedConversations((current) => ({ ...current, [selectedKey]: !current[selectedKey] }))}
                >
                  <i className="fas fa-lock" aria-hidden="true" />
                  <span>{isLocked ? 'Unlock' : 'Lock'}</span>
                </button>
                <button type="button" className="company-chat-header-btn clear" onClick={clearSelectedConversation}>
                  <i className="fas fa-trash" aria-hidden="true" />
                  <span>Clear</span>
                </button>
                <button type="button" className="company-chat-header-btn refresh" onClick={() => refreshBootstrapAndSelection(selectedConversation)}>
                  <i className="fas fa-rotate-right" aria-hidden="true" />
                  <span>Refresh</span>
                </button>
                {canManageSelectedGroup ? (
                  <div className="company-chat-group-actions" ref={groupHeaderMenuRef}>
                    <button
                      type="button"
                      className="company-chat-group-menu-trigger"
                      onClick={() => setGroupHeaderMenuOpen((current) => !current)}
                    >
                      <i className="fas fa-ellipsis-v" aria-hidden="true" />
                    </button>
                    {groupHeaderMenuOpen ? (
                      <div className="company-chat-group-menu-dropdown">
                        <button type="button" onClick={openRenameGroupModal}>Edit Group Name</button>
                        <button type="button" onClick={() => openMembersGroupModal('members')}>Add Members</button>
                        <button type="button" onClick={() => openMembersGroupModal('members')}>Remove Members</button>
                        <button type="button" className="danger" onClick={openDeleteGroupModal}>Delete Group</button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="company-chat-messages" ref={messageListRef}>
            {noCompanyAssigned ? (
              <div className="company-chat-empty">
                <div className="company-chat-empty-icon"><i className="fas fa-building" aria-hidden="true" /></div>
                <h3>No company assigned</h3>
                <p>This account is not linked to a company yet. Once a valid company is assigned, users and groups will appear here.</p>
              </div>
            ) : !selectedConversation || messages.length === 0 ? (
              <div className="company-chat-empty">
                <div className="company-chat-empty-icon"><i className="fas fa-comments" aria-hidden="true" /></div>
                <h3>Select a conversation</h3>
                <p>Only users from your company can chat here. Pick a user or group to start messaging.</p>
              </div>
            ) : (
              messages.map((message) => {
                if (hiddenMessages[message.id]) return null;
                const mine = safeBootstrap.currentUser?.email === message.sender_email;
                return (
                  <div key={message.id} className={`company-chat-message-row ${mine ? 'mine' : ''} ${selectedMessages[message.id] ? 'selected' : ''}`}>
                    <div className={`company-chat-message-bubble ${mine ? 'mine' : ''}`}>
                      {mine ? renderMessageMenu(message) : null}
                      <div className="company-chat-message-meta">
                        <span>{selectedConversation.type === 'group' || !mine ? message.sender_name : 'You'}</span>
                        <span>{formatTime(message.created_at)}</span>
                      </div>
                      {editingId === message.id ? (
                        <div className="company-chat-edit-block">
                          <textarea value={editText} onChange={(e) => setEditText(e.target.value)} />
                          <div className="company-chat-edit-actions">
                            <button type="button" onClick={() => handleSaveEdit(message.id)}>Save</button>
                            <button type="button" onClick={() => { setEditingId(null); setEditText(''); }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="company-chat-message-text">{message.message}</div>
                          {message.fileUrl ? (
                            <div className="company-chat-attachment-wrap">
                              {String(message.fileType || '').startsWith('audio/') ? (
                                <AudioAttachment
                                  src={message.fileUrl}
                                  className="company-chat-audio-wrap"
                                  controlsClassName="company-chat-audio-player"
                                  metaClassName="company-chat-audio-duration"
                                />
                              ) : String(message.fileType || '').startsWith('image/') ? (
                                <a href={message.fileUrl} target="_blank" rel="noreferrer">
                                  <img className="company-chat-attachment-image" src={message.fileUrl} alt="Attachment" />
                                </a>
                              ) : (
                                <a className="company-chat-attachment-link" href={message.fileUrl} target="_blank" rel="noreferrer">
                                  <i className="fas fa-paperclip" aria-hidden="true" />
                                  <span>Open attachment</span>
                                </a>
                              )}
                            </div>
                          ) : null}
                        </>
                      )}
                      {messageReactions[message.id]?.length ? (
                        <div className="company-chat-reaction-list">
                          {messageReactions[message.id].map((emoji) => (
                            <button
                              key={`${message.id}-reaction-${emoji}`}
                              type="button"
                              className="company-chat-reaction-chip selected"
                              onClick={() => toggleMessageReaction(message.id, emoji)}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {selectedConversation && !noCompanyAssigned ? (
            <div className="company-chat-composer">
              {recordingError ? <div className="company-chat-recording-note error">{recordingError}</div> : null}
              {isRecording ? (
                <div className="company-chat-recording-note">
                  <span className="company-chat-recording-dot" />
                  <span>Recording...</span>
                </div>
              ) : null}
              <input
                ref={composerFileInputRef}
                type="file"
                hidden
                onChange={handleComposerFileChange}
              />
              {composerFile ? (
                <div className="company-chat-file-pill">
                  <div>
                    <strong>{composerFile.name}</strong>
                    <span>{Math.max(1, Math.round(composerFile.size / 1024))} KB</span>
                  </div>
                  {String(composerFile.type || '').startsWith('audio/') && recordedUrl ? (
                    <AudioAttachment
                      src={recordedUrl}
                      className="company-chat-audio-wrap compact"
                      controlsClassName="company-chat-audio-player"
                      metaClassName="company-chat-audio-duration"
                    />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setComposerFile(null);
                      clearRecordedAudio();
                      if (composerFileInputRef.current) composerFileInputRef.current.value = '';
                    }}
                  >
                    <i className="fas fa-xmark" aria-hidden="true" />
                  </button>
                </div>
              ) : null}
              <div className="company-chat-composer-row">
                <div className="company-chat-input-tools">
                  <div className="company-chat-emoji-wrap" ref={emojiRef}>
                    <button type="button" className="company-chat-icon-btn" onClick={() => setEmojiPickerOpen((current) => !current)} disabled={isLocked}>
                      <i className="far fa-face-smile" aria-hidden="true" />
                    </button>
                    {emojiPickerOpen ? (
                      <FullEmojiPicker className="company-chat-emoji-picker" onEmojiSelect={toggleEmoji} />
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="company-chat-icon-btn"
                    onClick={() => composerFileInputRef.current?.click()}
                    disabled={isLocked}
                  >
                    <i className="fas fa-paperclip" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={`company-chat-icon-btn voice ${isRecording ? 'recording' : ''}`}
                    onClick={() => {
                      if (isRecording) stopRecording();
                      else startRecording();
                    }}
                    disabled={isLocked}
                  >
                    <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`} aria-hidden="true" />
                  </button>
                </div>
                <input
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  placeholder={isLocked ? 'Conversation locked' : 'Type a message...'}
                  disabled={isLocked}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button type="button" className="company-chat-send" onClick={handleSend} disabled={isLocked || (!composer.trim() && !composerFile)}>
                  <i className="fas fa-paper-plane" aria-hidden="true" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="panel company-chat-details">
          <div className="panel-head"><div className="panel-title">Details</div></div>
          <div className="company-chat-details-body">
            {selectedConversation ? (
              <>
                <div className="company-chat-details-card">
                  {selectedConversation.avatar ? (
                    <img className="company-chat-avatar large company-chat-avatar-image" src={selectedConversation.avatar} alt={selectedConversation.name} />
                  ) : (
                    <div className="company-chat-avatar large">{getInitials(selectedConversation.name)}</div>
                  )}
                  <strong>{selectedConversation.name}</strong>
                  <span>{selectedConversation.type === 'group' ? 'Company Group' : 'Company User'}</span>
                </div>
                {selectedConversation.type === 'group' ? (
                  <div className="company-chat-details-card">
                    <div className="company-chat-details-title">Members</div>
                    {(selectedConversation.members || []).map((member) => (
                      <div key={member.email} className="company-chat-member-row">
                        <span>{member.name} • {member.role}</span>
                        {member.is_admin ? <span className="company-chat-admin-badge">Admin</span> : null}
                      </div>
                    ))}
                    {canManageSelectedGroup ? (
                      <button type="button" className="company-chat-pill strong" onClick={() => openMembersGroupModal('members')}>
                        Manage Members
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <div className="company-chat-details-card">
                    <div className="company-chat-details-title">Company Rules</div>
                    <p>Only users in {safeBootstrap.company?.name || 'your company'} can message or join groups here.</p>
                  </div>
                )}
              </>
            ) : <p className="company-chat-empty-mini">Select a user or group to view details.</p>}
          </div>
        </aside>
      </div>

      {groupModalOpen ? (
        <div className="modal" onClick={resetGroupForm}>
          <div className="modal-content company-chat-modal" onClick={(event) => event.stopPropagation()}>
            <h3>{groupModalTitle}</h3>
            {groupForm.mode === 'delete' ? (
              <div className="company-chat-delete-confirm">
                <p>Are you sure you want to delete this group?</p>
                <strong>{groupForm.name}</strong>
              </div>
            ) : null}

            {(groupForm.mode === 'create' || groupForm.mode === 'rename') ? (
              <input
                className="input"
                value={groupForm.name}
                onChange={(e) => setGroupForm((current) => ({ ...current, name: e.target.value }))}
                placeholder="Group name"
              />
            ) : null}

            {(groupForm.mode === 'create' || groupForm.mode === 'members') ? (
              <>
                {groupForm.mode === 'members' ? (
                  <div className="company-chat-current-members">
                    <div className="company-chat-details-title">Current Members</div>
                    <div className="company-chat-current-member-list">
                      {displayedGroupMembers.length ? displayedGroupMembers.map((member) => {
                        const email = member.email;
                        return (
                          <div key={email} className="company-chat-current-member-pill">
                            <div className="company-chat-current-member-label">
                              <span>{member?.name || email}</span>
                              {member.isNew ? <small>Selected to add</small> : null}
                            </div>
                            <button type="button" onClick={() => toggleGroupMember(email)} aria-label={`Remove ${member?.name || email}`}>
                              <i className="fas fa-xmark" aria-hidden="true" />
                            </button>
                          </div>
                        );
                      }) : <p className="company-chat-empty-mini">No members selected yet.</p>}
                    </div>
                  </div>
                ) : null}

                <div className="company-chat-member-selector">
                  <div className="company-chat-details-title">Add Members</div>
                  <div className="company-chat-search company-chat-member-search">
                    <i className="fas fa-search" aria-hidden="true" />
                    <input value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} placeholder="Search company users" />
                  </div>
                  <div className="company-chat-member-pick-list">
                    {filteredCompanyUsers.length ? filteredCompanyUsers.map((user) => {
                      const checked = groupForm.members.includes(user.email);
                      return (
                        <label key={user.email} className={`company-chat-member-option ${checked ? 'selected' : ''}`}>
                          <div className="company-chat-member-option-main">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleGroupMember(user.email)}
                            />
                            <div className="company-chat-avatar mini">{getInitials(user.name)}</div>
                            <div className="company-chat-member-option-text">
                              <span>{user.name}</span>
                              <small>{user.role}</small>
                            </div>
                          </div>
                          <span className="company-chat-member-state">{checked ? 'Selected' : 'Available'}</span>
                        </label>
                      );
                    }) : <p className="company-chat-empty-mini">No company users match this search.</p>}
                  </div>
                </div>
              </>
            ) : null}

            <div className="company-chat-modal-actions">
              <button type="button" className="btn btn-outline" onClick={resetGroupForm}>Cancel</button>
              <button
                type="button"
                className={`btn ${groupForm.mode === 'delete' ? 'btn-danger' : 'btn-solid'}`}
                onClick={submitGroupModal}
                disabled={(groupForm.mode === 'create' || groupForm.mode === 'rename') && !groupForm.name.trim()}
              >
                {groupModalActionLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {userModalOpen ? (
        <div className="modal" onClick={resetUserForm}>
          <div className="modal-content company-chat-modal company-chat-user-modal" onClick={(event) => event.stopPropagation()}>
            <h3>{userForm.mode === 'edit' ? 'Edit User' : 'Add User'}</h3>
            <div className="company-chat-user-avatar-editor">
              {userForm.avatar ? (
                <img className="company-chat-avatar large company-chat-avatar-image" src={userForm.avatar} alt={userForm.name || 'User avatar preview'} />
              ) : (
                <div className="company-chat-avatar large">{getInitials(userForm.name)}</div>
              )}
              <label className="company-chat-avatar-upload">
                <input type="file" accept="image/*" onChange={handleUserAvatarChange} />
                <span>{userForm.avatar ? 'Change Avatar' : 'Upload Avatar'}</span>
              </label>
              {userForm.avatarFileName ? <small>{userForm.avatarFileName}</small> : null}
            </div>
            <input
              className="input"
              value={userForm.name}
              onChange={(e) => setUserForm((current) => ({ ...current, name: e.target.value }))}
              placeholder="Name"
            />
            <input
              className="input"
              value={userForm.email}
              onChange={(e) => setUserForm((current) => ({ ...current, email: e.target.value }))}
              placeholder="Email"
            />
            <select
              className="input"
              value={userForm.status}
              onChange={(e) => setUserForm((current) => ({ ...current, status: e.target.value }))}
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
            <div className="company-chat-modal-actions">
              <button type="button" className="btn btn-outline" onClick={resetUserForm}>Cancel</button>
              <button type="button" className="btn btn-solid" onClick={handleSaveUser} disabled={!userForm.name.trim()}>
                {userForm.mode === 'edit' ? 'Save Changes' : 'Save User'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {messageInfo ? (
        <div className="modal" onClick={() => setMessageInfo(null)}>
          <div className="modal-content company-chat-modal company-chat-info-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Message Info</h3>
            <div className="company-chat-info-grid">
              <div className="company-chat-info-row">
                <span>Sender</span>
                <strong>{messageInfo.senderLabel}</strong>
              </div>
              <div className="company-chat-info-row">
                <span>Timestamp</span>
                <strong>{formatTime(messageInfo.created_at)}</strong>
              </div>
              <div className="company-chat-info-row">
                <span>Status</span>
                <strong>{messageInfo.statusLabel}</strong>
              </div>
              <div className="company-chat-info-row">
                <span>Seen</span>
                <strong>{messageInfo.seenLabel}</strong>
              </div>
              <div className="company-chat-info-row">
                <span>Chat Type</span>
                <strong>{messageInfo.chatType === 'group' ? 'Group Chat' : 'Direct Chat'}</strong>
              </div>
              {messageInfo.chatType === 'group' ? (
                <div className="company-chat-info-row">
                  <span>Conversation</span>
                  <strong>{messageInfo.chatName}</strong>
                </div>
              ) : null}
              <div className="company-chat-info-row">
                <span>Message ID</span>
                <strong>{messageInfo.id}</strong>
              </div>
            </div>
            <div className="company-chat-info-body">
              <span>Message</span>
              <p>{messageInfo.message}</p>
            </div>
            <div className="company-chat-modal-actions">
              <button type="button" className="btn btn-solid" onClick={() => setMessageInfo(null)}>Close</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const CompanyChatWorkspaceWithBoundary = (props) => (
  <CompanyChatErrorBoundary>
    <CompanyChatWorkspace {...props} />
  </CompanyChatErrorBoundary>
);

window.CompanyChatWorkspace = CompanyChatWorkspaceWithBoundary;

export default CompanyChatWorkspaceWithBoundary;
