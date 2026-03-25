import React, { useEffect, useState } from 'react';
import { getPolicies } from '../../services/employeeService';

const EmployeePoliciesView = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getPolicies();
        if (active && res.success) setPolicies(res.data);
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
        <h1 className="page-h1">Company Guidelines</h1>
      </div>
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Available Policies</div>
        </div>
        <div className="table-wrap" style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Policy Name</th>
                <th>Description</th>
                <th>Access</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center' }}>
                    Loading policies...
                  </td>
                </tr>
              ) : policies.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center' }}>
                    No policies found
                  </td>
                </tr>
              ) : (
                policies.map((policy) => (
                  <tr key={policy.policy_id}>
                    <td>
                      <strong>{policy.title}</strong>
                    </td>
                    <td>{policy.description}</td>
                    <td>
                      {policy.file_url ? (
                        <a href={policy.file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>
                          View
                        </a>
                      ) : (
                        'N/A'
                      )}
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

export default EmployeePoliciesView;
