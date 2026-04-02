import React from 'react';
import ProfileSettingsView from '../common/ProfileSettingsView';
import { getProfile, updatePassword, updateProfile } from '../../services/employeeService';

const EmployeeProfileView = ({ onProfileUpdated }) => {
  return (
    <ProfileSettingsView
      title="Account Settings"
      subtitle="Manage your employee profile and security"
      loadProfile={getProfile}
      saveProfile={updateProfile}
      changePassword={updatePassword}
      onProfileUpdated={onProfileUpdated}
    />
  );
};

export default EmployeeProfileView;
