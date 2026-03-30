import React, { useEffect, useState } from 'react';
import { getProfile, updatePassword, updateProfile } from '../../services/employeeService';

const EmployeeProfileView = () => {
  const [profile, setProfile] = useState({ employee_name: '', email: '', phone: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getProfile();
        if (active && res.success) {
          setProfile({
            ...res.data,
            phone: res.data.phone || '',
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    await updateProfile({ employee_name: profile.employee_name, phone: profile.phone });
    alert('Profile updated');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    await updatePassword(passwords);
    setPasswords({ currentPassword: '', newPassword: '' });
    alert('Password changed successfully');
  };

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Account Settings</h1>
      </div>
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Personal Information</div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleProfileSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '15px' }}>
                <div>
                  <label className="form-label">Full Name</label>
                  <input className="input" value={profile.employee_name} onChange={(e) => setProfile((prev) => ({ ...prev, employee_name: e.target.value }))} required />
                </div>
                <div>
                  <label className="form-label">Corporate Email</label>
                  <input className="input" type="email" value={profile.email} readOnly />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '15px', marginTop: '10px' }}>
                <div>
                  <label className="form-label">Contact Number</label>
                  <input className="input" value={profile.phone} onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Joining Date</label>
                  <input className="input" value={profile.joining_date || 'N/A'} readOnly />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '15px', marginTop: '10px' }}>
                <div>
                  <label className="form-label">Department</label>
                  <input className="input" value={profile.department || 'N/A'} readOnly />
                </div>
                <div>
                  <label className="form-label">Designation</label>
                  <input className="input" value={profile.designation || 'N/A'} readOnly />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '15px', marginTop: '10px', marginBottom: '20px' }}>
                <div>
                  <label className="form-label">Work Allotment</label>
                  <input className="input" value={profile.work_mode || 'N/A'} readOnly />
                </div>
                <div>
                  <label className="form-label">Location</label>
                  <input className="input" value={profile.location || 'N/A'} readOnly />
                </div>
              </div>

              <button type="submit" className="btn btn-solid" style={{ width: '100%' }} disabled={loading}>
                Save Changes
              </button>
            </form>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Security & Access</div>
          </div>
          <div className="panel-body">
            <form onSubmit={handlePasswordSubmit}>
              <label className="form-label">Current Password</label>
              <input className="input" type="password" value={passwords.currentPassword} onChange={(e) => setPasswords((prev) => ({ ...prev, currentPassword: e.target.value }))} required />
              <label className="form-label">New Password</label>
              <input className="input" type="password" value={passwords.newPassword} onChange={(e) => setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))} required />
              <button type="submit" className="btn btn-solid" style={{ width: '100%' }}>
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileView;
