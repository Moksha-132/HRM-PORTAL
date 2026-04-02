import React, { useMemo, useState } from 'react';
import { useSiteLogo } from '../hooks/useSiteLogo';

const Sidebar = ({
  brand,
  tag,
  navItems,
  activeId,
  onSelect,
  onLogout,
  isOpen,
  isCollapsed,
  portalMode,
  onPortalChange,
}) => {
  const logoUrl = useSiteLogo();
  const [expandedMenus, setExpandedMenus] = useState({});

  const navState = useMemo(() => {
    return navItems.map((item) => {
      const childItems = Array.isArray(item.children)
        ? item.children
        : Array.isArray(item.subItems)
          ? item.subItems
          : [];
      const hasSubItems = childItems.length > 0;
      const hasActiveChild = childItems.some((sub) => sub.id === activeId);
      const isExpanded = hasSubItems && (hasActiveChild || expandedMenus[item.id] === true);
      const isActive = activeId === item.id || hasActiveChild;

      return {
        ...item,
        childItems,
        hasSubItems,
        hasActiveChild,
        isExpanded,
        isActive,
      };
    });
  }, [activeId, expandedMenus, navItems]);

  const toggleMenu = (item) => {
    if (item.hasActiveChild) {
      setExpandedMenus((prev) => ({ ...prev, [item.id]: true }));
      return;
    }

    setExpandedMenus((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
  };

  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}${isCollapsed ? ' collapsed' : ''}`} id="sidebar">
      <div className="sidebar-top" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src={logoUrl || '/logo.avif'} alt="Logo" style={{ height: '48px' }} />
        <span className="sidebar-brand">{brand}</span>
        <span className="sidebar-tag">{tag}</span>
      </div>

      {portalMode && onPortalChange ? (
        <div className="sidebar-portal-toggle">
          <button
            type="button"
            className={`portal-btn${portalMode === 'self' ? ' active' : ''}`}
            onClick={() => onPortalChange('self')}
          >
            <i className="fas fa-user" /> <span>Self</span>
          </button>
          <button
            type="button"
            className={`portal-btn${portalMode === 'manager' ? ' active' : ''}`}
            onClick={() => onPortalChange('manager')}
          >
            <i className="fas fa-user-tie" /> <span>Manager</span>
          </button>
        </div>
      ) : null}

      <nav className="sidebar-nav">
        {navState.map((item) => (
          <div key={item.id} className="sidebar-item-group">
            <button
              type="button"
              className={`sidebar-link${item.isActive ? ' active' : ''}${item.hasSubItems ? ' sidebar-parent' : ''}${item.isExpanded ? ' open' : ''}`}
              aria-expanded={item.hasSubItems ? item.isExpanded : undefined}
              aria-controls={item.hasSubItems ? `${item.id}-submenu` : undefined}
              onClick={() => (item.hasSubItems ? toggleMenu(item) : onSelect(item.id))}
            >
              <span className="nav-icon">
                <i className={item.icon} />
              </span>
              {item.label}
              {item.hasSubItems ? (
                <span className={`submenu-caret fas fa-chevron-down${item.isExpanded ? ' open' : ''}`} />
              ) : null}
            </button>

            {item.hasSubItems && item.isExpanded ? (
              <div id={`${item.id}-submenu`} className={`sidebar-submenu${item.isExpanded ? ' open' : ''}`}>
                {item.childItems.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    className={`sidebar-sublink${activeId === sub.id ? ' active' : ''}`}
                    onClick={() => {
                      setExpandedMenus((prev) => ({ ...prev, [item.id]: true }));
                      onSelect(sub.id);
                    }}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button type="button" className="sidebar-link sidebar-logout" onClick={onLogout}>
          <span className="nav-icon">
            <i className="fas fa-sign-out-alt" />
          </span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
