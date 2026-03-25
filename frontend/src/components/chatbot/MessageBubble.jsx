import React from 'react';
const escapeHtml = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
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

const MessageBubble = ({ role, text, fileUrl, fileType, senderName }) => {
  const isImage = fileType && fileType.startsWith('image/');

  return (
    <div className={`cb-bubble ${role}`}>
      {senderName && (
        <div className="cb-sender-name" style={{ fontWeight: '600', fontSize: '11px', marginBottom: '4px', opacity: 0.8 }}>
          {senderName}
        </div>
      )}
      {fileUrl && (
        <div className="cb-file-attachment" style={{ marginBottom: '8px' }}>
          {isImage ? (
            <img src={fileUrl} alt="Attachment" style={{ maxWidth: '100%', borderRadius: '8px', cursor: 'pointer' }} onClick={() => window.open(fileUrl, '_blank')} />
          ) : (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'underline' }}>
              <i className="fas fa-file"></i> View Attachment
            </a>
          )}
        </div>
      )}
      <div dangerouslySetInnerHTML={{ __html: formatMessage(text) }} />
    </div>
  );
};

window.MessageBubble = MessageBubble;

export default MessageBubble;
