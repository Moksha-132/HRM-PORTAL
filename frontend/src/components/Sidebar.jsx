import React, { useMemo, useState } from 'react';
import { useSiteLogo } from '../hooks/useSiteLogo';

const Sidebar = ({ brand, tag, navItems, activeId, onSelect, onLogout, isOpen, isCollapsed }) => {
  const logoUrl = useSiteLogo();
  const initialOpenGroups = useMemo(() => {
    const groups = {};
    navItems.forEach((item) => {
      if (Array.isArray(item.children) && item.children.length) {
        groups[item.id] = item.children.some((child) => child.id === activeId);
      }
    });
    return groups;
  }, [activeId, navItems]);
  const [openGroups, setOpenGroups] = useState(initialOpenGroups);

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
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
          if (Array.isArray(item.children) && item.children.length) {
            const isOpenGroup = !!openGroups[item.id];
            const groupActive = item.children.some((child) => child.id === activeId);

            return (
              <div key={item.id} className="sidebar-group">
                <button
                  type="button"
                  className={`sidebar-link sidebar-parent${groupActive ? ' active' : ''}`}
                  onClick={() => toggleGroup(item.id)}
                >
                  <span className="nav-icon">
                    <i className={item.icon} />
                  </span>
                  <span>{item.label}</span>
                  <span className={`submenu-caret${isOpenGroup ? ' open' : ''}`}>
                    <i className="fas fa-chevron-down" />
                  </span>
                </button>
                <div className={`sidebar-submenu${isOpenGroup ? ' open' : ''}`}>
                  {item.children.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      className={`sidebar-link sidebar-sublink${activeId === child.id ? ' active' : ''}`}
                      onClick={() => {
                        setOpenGroups((prev) => ({ ...prev, [item.id]: true }));
                        onSelect(child.id);
                      }}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          return (
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
