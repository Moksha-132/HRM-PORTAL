import React, { useEffect, useState } from 'react';
import { getMe, updateProfile as updateAdminProfile } from '../../services/authService';

const AdminSystemView = () => {
  const [form, setForm] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await getMe();
        if (active && res.success) {
          setForm({ name: res.data.name || '', email: res.data.email || '' });
        }
      } catch {
        // ignore
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateAdminProfile(form);
      if (res.success) {
        localStorage.setItem('shnoor_admin_email', res.data.email);
        alert('Profile updated successfully!');
      }
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Settings</h1>
        <p className="page-sub">Profile configuration</p>
      </div>
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Profile Settings</div>
        </div>
        <div className="panel-body">
          <form onSubmit={handleSubmit}>
            <label className="form-label">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
            <label className="form-label">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required />
            <button type="submit" className="btn btn-solid" disabled={saving}>
              {saving ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSystemView;
