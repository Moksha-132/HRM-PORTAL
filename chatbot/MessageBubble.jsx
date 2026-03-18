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

const MessageBubble = ({ role, text }) => {
  return (
    <div
      className={`cb-bubble ${role}`}
      dangerouslySetInnerHTML={{ __html: formatMessage(text) }}
    />
  );
};

window.MessageBubble = MessageBubble;
