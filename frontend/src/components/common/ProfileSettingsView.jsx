import React, { useEffect, useRef, useState } from 'react';

const normalizeProfile = (raw) => ({
  name: raw?.name || raw?.employee_name || '',
  email: raw?.email || '',
  phone: raw?.phone || '',
  department: raw?.department || '',
  designation: raw?.designation || '',
  joining_date: raw?.joining_date ? String(raw.joining_date).slice(0, 10) : '',
  work_mode: raw?.work_mode || '',
  location: raw?.location || '',
  profile_photo: raw?.profile_photo || '',
});

const initialsFromName = (name) => {
  const text = String(name || '').trim();
  if (!text) return 'U';
  const parts = text.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || '').join('') || 'U';
};

const ProfileSettingsView = ({
  title = 'Account Settings',
  subtitle = 'Profile configuration',
  loadProfile,
  saveProfile,
  changePassword,
  onProfileUpdated,
}) => {
  const [profile, setProfile] = useState(normalizeProfile({}));
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const onProfileUpdatedRef = useRef(onProfileUpdated);

  useEffect(() => {
    onProfileUpdatedRef.current = onProfileUpdated;
  }, [onProfileUpdated]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      try {
        const res = await loadProfile();
        if (!active || !res?.success) return;
        const normalized = normalizeProfile(res.data || {});
        setProfile(normalized);
        setPhotoPreview(normalized.profile_photo || '');
        if (onProfileUpdatedRef.current) onProfileUpdatedRef.current(normalized);
      } catch {
        // keep silent in UI and let user continue editing local values
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [loadProfile]);

  useEffect(() => {
    if (!photoFile) {
      setSelectedPhotoPreview('');
      return undefined;
    }
    const objectUrl = URL.createObjectURL(photoFile);
    setSelectedPhotoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile]);

  const currentPhoto = selectedPhotoPreview || photoPreview || profile.profile_photo || '';

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', profile.name || '');
      formData.append('phone', profile.phone || '');
      formData.append('department', profile.department || '');
      formData.append('designation', profile.designation || '');
      formData.append('joining_date', profile.joining_date || '');
      formData.append('work_mode', profile.work_mode || '');
      formData.append('location', profile.location || '');
      if (profile.email) formData.append('email', profile.email);
      if (photoFile) formData.append('profile_photo', photoFile);

      const res = await saveProfile(formData);
      const normalized = normalizeProfile(res?.data || profile);
      setProfile(normalized);
      setPhotoPreview(normalized.profile_photo || '');
      setPhotoFile(null);
      if (onProfileUpdatedRef.current) onProfileUpdatedRef.current(normalized);
      alert('Profile updated successfully.');
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await changePassword(passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      alert('Password updated successfully.');
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">{title}</h1>
        <p className="page-sub">{subtitle}</p>
      </div>
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Personal Information</div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleProfileSubmit}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid #e2e8f0',
                    background: '#f8fafc',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: '#475569',
                    flexShrink: 0,
                  }}
                >
                  {currentPhoto ? (
                    <img
                      src={currentPhoto}
                      alt="Profile"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    initialsFromName(profile.name)
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Profile Photo</label>
                  <input
                    className="input"
                    type="file"
                    accept="image/*"
                    onChange={(event) => setPhotoFile(event.target.files?.[0] || null)}
                    style={{ marginBottom: 6 }}
                  />
                  <small style={{ color: 'var(--text-light)' }}>PNG, JPG, WEBP up to 5MB.</small>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 15 }}>
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    className="input"
                    value={profile.name}
                    onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Corporate Email</label>
                  <input className="input" type="email" value={profile.email} readOnly />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 15, marginTop: 10 }}>
                <div>
                  <label className="form-label">Contact Number</label>
                  <input
                    className="input"
                    value={profile.phone}
                    onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="form-label">Joining Date</label>
                  <input
                    className="input"
                    type="date"
                    value={profile.joining_date}
                    onChange={(e) => setProfile((prev) => ({ ...prev, joining_date: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 15, marginTop: 10 }}>
                <div>
                  <label className="form-label">Department</label>
                  <input
                    className="input"
                    value={profile.department}
                    onChange={(e) => setProfile((prev) => ({ ...prev, department: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="form-label">Designation</label>
                  <input
                    className="input"
                    value={profile.designation}
                    onChange={(e) => setProfile((prev) => ({ ...prev, designation: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 15, marginTop: 10, marginBottom: 20 }}>
                <div>
                  <label className="form-label">Work Allotment</label>
                  <input
                    className="input"
                    value={profile.work_mode}
                    onChange={(e) => setProfile((prev) => ({ ...prev, work_mode: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="form-label">Location</label>
                  <input
                    className="input"
                    value={profile.location}
                    onChange={(e) => setProfile((prev) => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-solid" style={{ width: '100%' }} disabled={loading || savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Changes'}
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
              <input
                className="input"
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords((prev) => ({ ...prev, currentPassword: e.target.value }))}
                required
              />
              <label className="form-label">New Password</label>
              <input
                className="input"
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))}
                required
              />
              <button type="submit" className="btn btn-solid" style={{ width: '100%' }} disabled={savingPassword}>
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsView;
