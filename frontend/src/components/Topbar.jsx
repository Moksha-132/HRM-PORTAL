import React from 'react';
import NotificationBell from './notifications/NotificationBell';

const initialsFromName = (name, email) => {
  const text = String(name || email || '').trim();
  if (!text) return 'U';
  return text
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
};

const Topbar = ({ title, roleLabel, roleKey, profile, onToggle }) => {
  const profileName = profile?.name || profile?.employee_name || '';
  const profileEmail = profile?.email || '';
  const profilePhoto = profile?.profile_photo || '';
  const profileInitials = initialsFromName(profileName, profileEmail) || 'U';

  return (
    <header className="topbar">
      <button className="sidebar-toggle" type="button" onClick={onToggle} aria-label="Toggle sidebar">
        &#9776;
      </button>
      <div className="topbar-title">{title}</div>
      <div className="topbar-right">
        <NotificationBell role={roleKey} profile={profile} />
        <div className="topbar-avatar" title={profileName || profileEmail || 'Profile'}>
          {profilePhoto ? (
            <img src={profilePhoto} alt="Profile" className="topbar-avatar-img" />
          ) : (
            <span>{profileInitials}</span>
          )}
        </div>
        <span className="admin-badge">{roleLabel}</span>
      </div>
    </header>
  );
};

export default Topbar;
