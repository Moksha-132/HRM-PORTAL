import React from 'react';
import ProfileSettingsView from '../common/ProfileSettingsView';
import { getMe, updatePassword, updateProfile } from '../../services/authService';

const ManagerProfileView = ({ onProfileUpdated }) => {
  return (
    <ProfileSettingsView
      title="Account Settings"
      subtitle="Manage your manager profile and security"
      loadProfile={getMe}
      saveProfile={updateProfile}
      changePassword={updatePassword}
      onProfileUpdated={onProfileUpdated}
    />
  );
};

export default ManagerProfileView;
