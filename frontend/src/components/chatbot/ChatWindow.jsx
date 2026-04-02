import React from 'react';
import MessageBubble from './MessageBubble.jsx';
import FullEmojiPicker from '../shared/FullEmojiPicker.jsx';
import AudioAttachment from '../shared/AudioAttachment.jsx';
import useVoiceRecorder from '../../hooks/useVoiceRecorder.js';

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
  onClear,
  onDeleteForEveryone
}) => {
  const [input, setInput] = React.useState('');
  const [file, setFile] = React.useState(null);
  const [showEmoji, setShowEmoji] = React.useState(false);
  const listRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
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

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, activeTab, open]);

  React.useEffect(() => {
    if (recordedFile) setFile(recordedFile);
  }, [recordedFile]);

  const toggleInputEmoji = (emoji) => {
    setInput((current) => (
      current.includes(emoji)
        ? current.split(emoji).join('').replace(/\s{2,}/g, ' ').trim()
        : `${current}${current ? ' ' : ''}${emoji}`.trim()
    ));
    setShowEmoji(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text && !file) return;
    onSend(text, file);
    setInput('');
    setFile(null);
    clearRecordedAudio();
    setRecordingError('');
    setShowEmoji(false);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    clearRecordedAudio();
    setRecordingError('');
    setFile(selected);
  };

  return (
    <div className={`cb-window ${open ? 'cb-open' : ''}`}>
      <div className="cb-header">
        <div className="cb-avatar">{roleConfig.avatar}</div>
        <div>
          <div className="cb-header-title">{roleConfig.title}</div>
          <div className="cb-header-sub">{roleConfig.subtitle}</div>
        </div>
        {onClear ? (
          <div className="cb-header-actions">
            <button type="button" onClick={onClear}>Clear</button>
          </div>
        ) : null}
      </div>

      {historyPanel ? (
        <div className="cb-tabs">
          <button className={`cb-tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => onTabChange('chat')}>Chat</button>
          <button className={`cb-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => onTabChange('history')}>History</button>
        </div>
      ) : null}

      {activeTab === 'chat' ? (
        <>
          <div className="cb-messages" ref={listRef}>
            {messages.map((m, idx) => (
              <MessageBubble
                key={idx}
                messageId={m.id}
                role={m.role}
                text={m.text}
                fileUrl={m.fileUrl}
                fileType={m.fileType}
                senderName={m.senderName}
                timestamp={m.timestamp}
                deleted={m.deleted}
                onDeleteForEveryone={onDeleteForEveryone}
              />
            ))}
            {loading ? <MessageBubble role="bot" text="Typing..." senderName="Assistant" timestamp={new Date().toISOString()} /> : null}

            {suggestions && suggestions.length > 0 ? (
              <div className="cb-chips">
                {suggestions.map((s) => (
                  <button key={s} className="cb-chip" onClick={() => onSuggestionClick(s)}>{s}</button>
                ))}
              </div>
            ) : null}
          </div>

          {recordingError ? <div className="cb-voice-note error">{recordingError}</div> : null}
          {isRecording ? (
            <div className="cb-voice-note">
              <span className="cb-voice-dot" />
              <span>Recording...</span>
            </div>
          ) : null}

          {file ? (
            <div className="cb-file-preview">
              <div className="cb-file-preview-content">
                <span>📎 {file.name}</span>
                {file.type?.startsWith('audio/') && recordedUrl ? (
                  <AudioAttachment
                    src={recordedUrl}
                    className="cb-audio-wrap compact"
                    controlsClassName="cb-audio-player"
                    metaClassName="cb-audio-duration"
                  />
                ) : null}
              </div>
              <button type="button" className="cb-file-preview-remove" onClick={() => { setFile(null); clearRecordedAudio(); }}>✕</button>
            </div>
          ) : null}

          {showEmoji ? (
            <div className="cb-emoji-popover">
              <FullEmojiPicker className="cb-full-emoji-picker" onEmojiSelect={toggleInputEmoji} />
            </div>
          ) : null}

          <form className="cb-input" onSubmit={handleSubmit}>
            <button type="button" className="cb-icon-btn" title="Emoji" onClick={() => setShowEmoji((current) => !current)}>
              😊
            </button>
            <button type="button" className="cb-icon-btn" title="Attach File" onClick={() => fileInputRef.current?.click()}>
              📎
            </button>
            <button
              type="button"
              className={`cb-icon-btn cb-mic-btn ${isRecording ? 'recording' : ''}`}
              title={isRecording ? 'Stop Recording' : 'Record Voice'}
              onClick={() => {
                if (isRecording) stopRecording();
                else startRecording();
              }}
            >
              <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`} aria-hidden="true" />
            </button>
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
      ) : null}

      {historyPanel && activeTab === 'history' ? historyPanel : null}
    </div>
  );
};

window.ChatWindow = ChatWindow;

export default ChatWindow;
