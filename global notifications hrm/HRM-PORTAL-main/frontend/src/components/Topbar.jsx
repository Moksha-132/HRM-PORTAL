import React from 'react';
import NotificationBell from './notifications/NotificationBell';

const Topbar = ({ title, roleLabel, roleKey, email, onToggle }) => {
  return (
    <header className="topbar">
      <button className="sidebar-toggle" type="button" onClick={onToggle} aria-label="Toggle sidebar">
        ☰
      </button>
      <div className="topbar-title">{title}</div>
      <div className="topbar-right">
        <NotificationBell role={roleKey} />
        <span className="admin-badge">{roleLabel}</span>
      </div>
    </header>
  );
};

export default Topbar;
