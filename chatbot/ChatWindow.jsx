const ChatWindow = ({
  open,
  roleConfig,
  messages,
  onSend,
  loading,
  suggestions,
  onSuggestionClick,
  activeTab,
  onTabChange,
  historyPanel,
  onClear
}) => {
  const [input, setInput] = React.useState('');
  const [file, setFile] = React.useState(null);
  const [showEmoji, setShowEmoji] = React.useState(false);
  const listRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  const emojiPickerRef = React.useRef(null);

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, activeTab, open]);

  // Handle Emoji Selection
  React.useEffect(() => {
    const picker = emojiPickerRef.current;
    if (picker) {
      const handleEmoji = (e) => {
        setInput(prev => prev + e.detail.unicode);
        setShowEmoji(false);
      };
      picker.addEventListener('emoji-click', handleEmoji);
      return () => picker.removeEventListener('emoji-click', handleEmoji);
    }
  }, [showEmoji]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text && !file) return;
    onSend(text, file);
    setInput('');
    setFile(null);
    setShowEmoji(false);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  return (
    <div className={`cb-window ${open ? 'cb-open' : ''}`}>
      <div className="cb-header">
        <div className="cb-avatar">{roleConfig.avatar}</div>
        <div>
          <div className="cb-header-title">{roleConfig.title}</div>
          <div className="cb-header-sub">{roleConfig.subtitle}</div>
        </div>
        {onClear && (
          <div className="cb-header-actions">
            <button type="button" onClick={onClear}>Clear</button>
          </div>
        )}
      </div>

      {historyPanel && (
        <div className="cb-tabs">
          <button className={`cb-tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => onTabChange('chat')}>Chat</button>
          <button className={`cb-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => onTabChange('history')}>History</button>
        </div>
      )}

      {activeTab === 'chat' && (
        <>
          <div className="cb-messages" ref={listRef}>
            {messages.map((m, idx) => (
              <MessageBubble 
                key={idx} 
                role={m.role} 
                text={m.text} 
                fileUrl={m.fileUrl} 
                fileType={m.fileType} 
                senderName={m.senderName} 
              />
            ))}
            {loading && <MessageBubble role="bot" text="Typing..." senderName="Assistant" />}

            {suggestions && suggestions.length > 0 && (
              <div className="cb-chips">
                {suggestions.map((s) => (
                  <button key={s} className="cb-chip" onClick={() => onSuggestionClick(s)}>{s}</button>
                ))}
              </div>
            )}
          </div>

          {file && (
            <div className="cb-file-preview" style={{ padding: '8px 12px', background: '#f1f5f9', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📎 {file.name}</span>
              <button style={{ border: 'none', background: 'none', color: '#64748b', cursor: 'pointer' }} onClick={() => setFile(null)}>✕</button>
            </div>
          )}

          {showEmoji && (
            <div className="cb-emoji-popover" style={{ position: 'absolute', bottom: '60px', left: '10px', zIndex: 10 }}>
              <emoji-picker ref={emojiPickerRef}></emoji-picker>
            </div>
          )}

          <form className="cb-input" onSubmit={handleSubmit} style={{ position: 'relative' }}>
            <button type="button" className="cb-icon-btn" title="Emoji" onClick={() => setShowEmoji(!showEmoji)}>😊</button>
            <button type="button" className="cb-icon-btn" title="Attach File" onClick={() => fileInputRef.current.click()}>📎</button>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </>
      )}

      {historyPanel && activeTab === 'history' && historyPanel}
    </div>
  );
};

window.ChatWindow = ChatWindow;
