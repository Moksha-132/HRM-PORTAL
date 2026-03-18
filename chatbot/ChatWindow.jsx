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
  const listRef = React.useRef(null);

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, activeTab, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput('');
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
              <MessageBubble key={idx} role={m.role} text={m.text} />
            ))}
            {loading && <MessageBubble role="bot" text="Typing..." />}

            {suggestions && suggestions.length > 0 && (
              <div className="cb-chips">
                {suggestions.map((s) => (
                  <button key={s} className="cb-chip" onClick={() => onSuggestionClick(s)}>{s}</button>
                ))}
              </div>
            )}
          </div>

          <form className="cb-input" onSubmit={handleSubmit}>
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
