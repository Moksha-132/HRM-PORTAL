import React, { useEffect, useState } from 'react';
import { getCompanies } from '../../services/adminService';

const AdminSubscriptionsView = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getCompanies();
        if (active && res.success) setCompanies(res.data);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Subscriptions</h1>
        <p className="page-sub">Company plan enrollments</p>
      </div>
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Active Subscriptions</div>
        </div>
        <div className="table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Company</th>
                <th>Email</th>
                <th>Subscription Plan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>
                    Loading subscriptions...
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                companies.map((comp) => (
                  <tr key={comp.id}>
                    <td>{comp.name}</td>
                    <td>{comp.email}</td>
                    <td>{comp.subscriptionPlan || 'No Plan'}</td>
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
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptionsView;
