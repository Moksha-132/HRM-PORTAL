import React, { useEffect, useState } from 'react';
import { deleteAdmin, getAdmins, registerAdmin } from '../../services/authService';

const AdminSuperAdminView = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Manager' });

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const res = await getAdmins();
      if (res.success) setAdmins(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerAdmin(form);
      setForm({ name: '', email: '', password: '', role: 'Manager' });
      loadAdmins();
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to create admin.');
    }
  };

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Manager Management</h1>
        <p className="page-sub">Manage platform managers</p>
      </div>
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Add New Manager</div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSubmit}>
              <label className="form-label">Full Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
              <label className="form-label">Email</label>
              <input className="input" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required />
              <label className="form-label">Password</label>
              <input className="input" type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required />
              <label className="form-label">Role</label>
              <select className="input" value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
                <option value="Super Admin">Super Admin</option>
              </select>
              <button type="submit" className="btn btn-solid" style={{ width: '100%' }}>
                Create Account
              </button>
            </form>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Existing Administrators</div>
          </div>
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center' }}>
                      Loading admins...
                    </td>
                  </tr>
                ) : admins.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center' }}>
                      No managers found.
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => (
                    <tr key={admin.id}>
                      <td>
                        {admin.name}
                        <br />
                        <small>{admin.email}</small>
                      </td>
                      <td>{admin.role}</td>
                      <td>
                        <button type="button" className="action-btn delete-btn" onClick={() => deleteAdmin(admin.id).then(loadAdmins)}>
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSuperAdminView;
