import React, { useEffect, useState } from 'react';
import { createCompany, deleteCompany, getCompanies } from '../../services/adminService';

const AdminCompaniesView = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    location: '',
    subscriptionPlan: '',
    status: 'Active',
  });

  const loadCompanies = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getCompanies();
      if (res.success) setCompanies(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load companies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCompany(form);
      setForm({ name: '', email: '', location: '', subscriptionPlan: '', status: 'Active' });
      loadCompanies();
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to create company.');
    }
  };

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Companies</h1>
        <p className="page-sub">Manage registered organizations</p>
      </div>
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Add New Company</div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSubmit}>
              <label className="form-label">Company Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
              <label className="form-label">Email Address</label>
              <input className="input" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required />
              <label className="form-label">Location</label>
              <input className="input" value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} required />
              <label className="form-label">Subscription Plan</label>
              <input className="input" value={form.subscriptionPlan} onChange={(e) => setForm((prev) => ({ ...prev, subscriptionPlan: e.target.value }))} />
              <label className="form-label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>
              <button type="submit" className="btn btn-solid" style={{ width: '100%' }}>
                Add Company
              </button>
            </form>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">All Companies</div>
          </div>
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Company Info</th>
                  <th>Location</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>
                      Loading companies...
                    </td>
                  </tr>
                ) : companies.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>
                      No companies found.
                    </td>
                  </tr>
                ) : (
                  companies.map((comp) => (
                    <tr key={comp.id}>
                      <td>
                        <strong>{comp.name}</strong>
                        <br />
                        <small>{comp.email}</small>
                      </td>
                      <td>{comp.location}</td>
                      <td>{comp.subscriptionPlan || 'N/A'}</td>
                      <td>
                        <span style={{ color: comp.status === 'Active' ? 'green' : comp.status === 'Inactive' ? 'red' : 'orange', fontWeight: 600 }}>
                          {comp.status}
                        </span>
                      </td>
                      <td>
                        <button type="button" className="action-btn delete-btn" onClick={() => deleteCompany(comp.id).then(loadCompanies)}>
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCompaniesView;
