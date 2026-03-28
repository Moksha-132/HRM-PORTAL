import React from 'react';

const Sidebar = ({ brand, tag, navItems, activeId, onSelect, onLogout, isOpen, isCollapsed }) => {
  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}${isCollapsed ? ' collapsed' : ''}`} id="sidebar">
      <div className="sidebar-top">
        <span className="sidebar-brand">{brand}</span>
        <span className="sidebar-tag">{tag}</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar-link${activeId === item.id ? ' active' : ''}`}
            onClick={() => onSelect(item.id)}
          >
            <span className="nav-icon">
              <i className={item.icon} />
            </span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button type="button" className="sidebar-link sidebar-logout" onClick={onLogout}>
          <span className="nav-icon">↩</span> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
