import React from 'react';

const Topbar = ({ title, roleLabel, email, onToggle }) => {
  return (
    <header className="topbar">
      <button className="sidebar-toggle" type="button" onClick={onToggle} aria-label="Toggle sidebar">
        ☰
      </button>
      <div className="topbar-title">{title}</div>
      <div className="topbar-right">
        <span className="admin-badge">{roleLabel}</span>
        <span className="admin-email">{email}</span>
      </div>
    </header>
  );
};

export default Topbar;
