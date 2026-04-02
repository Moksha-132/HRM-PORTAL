import React from 'react';
import FullEmojiPicker from '../shared/FullEmojiPicker.jsx';
import AudioAttachment from '../shared/AudioAttachment.jsx';
const escapeHtml = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const formatMessage = (text) => {
  const escaped = escapeHtml(text || '');
  const withBold = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  const lines = withBold.split(/\r?\n/);
  let html = '';
  let inList = false;

  lines.forEach((line) => {
    const trimmed = line.trim();
    const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
    if (isBullet) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${trimmed.replace(/^[-*]\s+/, '')}</li>`;
    } else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      if (trimmed.length === 0) {
        html += '<br>';
      } else {
        html += `<div>${line}</div>`;
      }
    }
  });

  if (inList) html += '</ul>';
  return html;
};

const MessageBubble = ({ role, text, fileUrl, fileType, senderName, timestamp, messageId, deleted = false, onDeleteForEveryone }) => {
  const isImage = fileType && fileType.startsWith('image/');
  const isAudio = fileType && fileType.startsWith('audio/');
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);
  const [selected, setSelected] = React.useState(false);
  const [deletedForMe, setDeletedForMe] = React.useState(false);
  const [deletedForEveryone, setDeletedForEveryone] = React.useState(Boolean(deleted));
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(text || '');
  const [reactions, setReactions] = React.useState([]);
  const [reactionPickerOpen, setReactionPickerOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const onClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
        setReactionPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  React.useEffect(() => {
    setDeletedForEveryone(Boolean(deleted));
  }, [deleted]);

  if (deletedForMe) return null;

  const visibleText = deletedForEveryone ? 'This message was deleted' : draft;
  const statusLabel = deletedForEveryone ? 'Deleted' : role === 'user' ? 'Sent' : 'Delivered';

  const toggleReaction = (emoji) => {
    setReactions((current) => (
      current.includes(emoji)
        ? current.filter((item) => item !== emoji)
        : [...current, emoji]
    ));
  };

  return (
    <div className={`cb-bubble ${role} ${selected ? 'is-selected' : ''}`}>
      {role === 'user' ? (
        <div className="cb-bubble-menu" ref={menuRef}>
          <button type="button" className="cb-bubble-menu-trigger" onClick={() => setMenuOpen((current) => !current)}>
            <i className="fas fa-ellipsis-v" aria-hidden="true" />
          </button>
          {menuOpen ? (
            <div className="cb-bubble-menu-dropdown">
              <button type="button" onClick={() => { setShowInfo(true); setMenuOpen(false); }}>
                <i className="fas fa-circle-info" aria-hidden="true" />
                <span>Message Info</span>
              </button>
              <button type="button" onClick={() => { setSelected((current) => !current); setMenuOpen(false); }}>
                <i className="fas fa-check-double" aria-hidden="true" />
                <span>{selected ? 'Unselect Message' : 'Select Message'}</span>
              </button>
              <button type="button" onClick={() => { setDeletedForMe(true); setMenuOpen(false); }}>
                <i className="fas fa-trash" aria-hidden="true" />
                <span>Delete for Me</span>
              </button>
              <button type="button" onClick={async () => {
                try {
                  if (onDeleteForEveryone && messageId) {
                    await onDeleteForEveryone(messageId);
                  } else {
                    setDeletedForEveryone(true);
                  }
                } finally {
                  setMenuOpen(false);
                }
              }}>
                <i className="fas fa-ban" aria-hidden="true" />
                <span>Delete for Everyone</span>
              </button>
              <button type="button" onClick={() => { setEditing(true); setMenuOpen(false); }} disabled={deletedForEveryone}>
                <i className="fas fa-pen" aria-hidden="true" />
                <span>Edit Message</span>
              </button>
              <button type="button" onClick={() => setReactionPickerOpen((current) => !current)}>
                <i className="far fa-face-smile" aria-hidden="true" />
                <span>Emoji Reaction</span>
              </button>
              {reactionPickerOpen ? (
                <div className="cb-bubble-reaction-picker">
                  <FullEmojiPicker className="cb-full-emoji-picker" onEmojiSelect={toggleReaction} />
                </div>
              ) : null}
            </div>
          ) : null}
          {showInfo ? (
            <div className="cb-bubble-info-card">
              <div><strong>Sender:</strong> {senderName || (role === 'user' ? 'You' : 'Assistant')}</div>
              <div><strong>Time:</strong> {timestamp ? new Date(timestamp).toLocaleString() : 'Just now'}</div>
              <div><strong>Status:</strong> {statusLabel}</div>
              <button type="button" onClick={() => setShowInfo(false)}>Close</button>
            </div>
          ) : null}
        </div>
      ) : null}
      {senderName && (
        <div className="cb-sender-name" style={{ fontWeight: '600', fontSize: '11px', marginBottom: '4px', opacity: 0.8 }}>
          {senderName}
        </div>
      )}
      {fileUrl && !deletedForEveryone && (
        <div className="cb-file-attachment" style={{ marginBottom: '8px' }}>
          {isAudio ? (
            <AudioAttachment
              src={fileUrl}
              className="cb-audio-wrap"
              controlsClassName="cb-audio-player"
              metaClassName="cb-audio-duration"
            />
          ) : isImage ? (
            <img src={fileUrl} alt="Attachment" style={{ maxWidth: '100%', borderRadius: '8px', cursor: 'pointer' }} onClick={() => window.open(fileUrl, '_blank')} />
          ) : (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'underline' }}>
              <i className="fas fa-file"></i> View Attachment
            </a>
          )}
        </div>
      )}
      {editing && !deletedForEveryone ? (
        <div className="cb-bubble-edit-wrap">
          <textarea value={draft} onChange={(event) => setDraft(event.target.value)} className="cb-bubble-edit-textarea" />
          <div className="cb-bubble-edit-actions">
            <button type="button" onClick={() => setEditing(false)}>Save</button>
            <button type="button" onClick={() => { setDraft(text || ''); setEditing(false); }}>Cancel</button>
          </div>
        </div>
      ) : (
        deletedForEveryone ? (
          <div className="cb-bubble-deleted">{visibleText}</div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: formatMessage(visibleText) }} />
        )
      )}
      {reactions.length ? (
        <div className="cb-bubble-reactions">
          {reactions.map((emoji) => (
            <button key={emoji} type="button" className="cb-bubble-reaction-pill" onClick={() => toggleReaction(emoji)}>
              {emoji}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

window.MessageBubble = MessageBubble;

export default MessageBubble;
