import React, { useEffect, useMemo, useState } from 'react';
import { getCompanies } from '../../services/adminService';

const AdminOverviewView = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getCompanies();
        if (active && res.success) {
          setCompanies(res.data);
        }
      } catch (err) {
        if (active) setError(err?.response?.data?.error || 'Failed to load companies.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = companies.length;
    const active = companies.filter((c) => c.status === 'Active').length;
    const inactive = companies.filter((c) => c.status === 'Inactive').length;
    const pending = companies.filter((c) => c.status === 'Pending').length;
    return { total, active, inactive, pending };
  }, [companies]);

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Dashboard</h1>
        <p className="page-sub">Overview of your platform</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Companies</div>
          <div className="stat-val">{stats.total}</div>
          <div className="stat-sub">Active organizations</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Companies</div>
          <div className="stat-val">{stats.active}</div>
          <div className="stat-sub">Currently active</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Inactive Companies</div>
          <div className="stat-val">{stats.inactive}</div>
          <div className="stat-sub">Suspended or inactive</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Companies</div>
          <div className="stat-val">{stats.pending}</div>
          <div className="stat-sub">Require approval</div>
        </div>
      </div>

      <div className="panel mt">
        <div className="panel-head">
          <div className="panel-title">Recent Companies Added</div>
        </div>
        <div className="table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Company Info</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center' }}>
                    Loading recent activities...
                  </td>
                </tr>
              ) : companies.slice(0, 5).length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center' }}>
                    No companies found.
                  </td>
                </tr>
              ) : (
                companies.slice(0, 5).map((comp) => (
                  <tr key={comp.id}>
                    <td>
                      <strong>{comp.name}</strong>
                      <br />
                      <small>{comp.email}</small>
                    </td>
                    <td>{comp.location}</td>
                    <td>
                      <span style={{ color: comp.status === 'Active' ? 'green' : comp.status === 'Inactive' ? 'red' : 'orange', fontWeight: 600 }}>
                        {comp.status}
                      </span>
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
  );
};

export default AdminOverviewView;
