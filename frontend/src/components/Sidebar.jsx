import React, { useState } from 'react';
import { useSiteLogo } from '../hooks/useSiteLogo';

const Sidebar = ({ brand, tag, navItems, activeId, onSelect, onLogout, isOpen, isCollapsed }) => {
  const logoUrl = useSiteLogo();
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (id) => {
    setExpandedMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}${isCollapsed ? ' collapsed' : ''}`} id="sidebar">
      <div className="sidebar-top" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src={logoUrl || '/logo.avif'} alt="Logo" style={{ height: '48px' }} />
        <span className="sidebar-brand">{brand}</span>
        <span className="sidebar-tag">{tag}</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isExpanded = expandedMenus[item.id];
          const hasSubItems = item.subItems && item.subItems.length > 0;

          return (
            <div key={item.id} className="sidebar-item-group">
              <button
                type="button"
                className={`sidebar-link${activeId === item.id || (hasSubItems && item.subItems.some((s) => s.id === activeId)) ? ' active' : ''}`}
                onClick={() => (hasSubItems ? toggleMenu(item.id) : onSelect(item.id))}
              >
                <span className="nav-icon">
                  <i className={item.icon} />
                </span>
                {item.label}
                {hasSubItems && (
                  <span className={`caret fas fa-chevron-${isExpanded ? 'up' : 'down'}`} style={{ marginLeft: 'auto', fontSize: '0.7rem' }} />
                )}
              </button>
              {hasSubItems && isExpanded && (
                <div className="sidebar-submenu">
                  {item.subItems.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      className={`sidebar-sublink${activeId === sub.id ? ' active' : ''}`}
                      onClick={() => onSelect(sub.id)}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
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
