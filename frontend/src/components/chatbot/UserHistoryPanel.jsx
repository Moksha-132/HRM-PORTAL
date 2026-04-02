import React from 'react';
const UserHistoryPanel = ({ items, onRefresh }) => {
  return (
    <div className="cb-history-panel">
      <div className="cb-history-head">
        <strong>My History</strong>
        <button className="refresh" onClick={onRefresh}>Refresh</button>
      </div>
      {(!items || items.length === 0) && (
        <div className="cb-history-empty">No history yet.</div>
      )}
      {items && items.map((chat) => (
        <div key={chat.id} className="cb-history-item">
          <div className="cb-history-q"><strong>Q:</strong> {chat.deleted ? 'This message was deleted' : chat.message}</div>
          <div className="cb-history-a"><strong>A:</strong> {chat.deleted ? 'This message was deleted' : chat.response}</div>
          <div className="cb-history-time">{new Date(chat.timestamp).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
};

window.UserHistoryPanel = UserHistoryPanel;

export default UserHistoryPanel;
