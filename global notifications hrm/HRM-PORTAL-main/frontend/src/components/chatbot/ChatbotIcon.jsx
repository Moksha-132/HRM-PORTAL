import React from 'react';
const ChatbotIcon = ({ onClick }) => {
  return (
    <button className="cb-fab" onClick={onClick} aria-label="Open chatbot">
      <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px' }}>CHAT</span>
    </button>
  );
};

window.ChatbotIcon = ChatbotIcon;

export default ChatbotIcon;
