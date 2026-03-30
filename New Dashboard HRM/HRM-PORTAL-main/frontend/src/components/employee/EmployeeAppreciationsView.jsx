import React, { useEffect, useState } from 'react';
import { getAppreciations } from '../../services/employeeService';

const EmployeeAppreciationsView = () => {
  const [appreciations, setAppreciations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAppreciations();
        if (active && res.success) setAppreciations(res.data);
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
        <h1 className="page-h1">Awards & Recognitions</h1>
      </div>
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">My Feed</div>
        </div>
        <div className="table-wrap" style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Recognition Title</th>
                <th>Description</th>
                <th>Date Issued</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center' }}>
                    Loading appreciations...
                  </td>
                </tr>
              ) : appreciations.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center' }}>
                    No appreciations yet
                  </td>
                </tr>
              ) : (
                appreciations.map((app) => (
                  <tr key={app.appreciation_id}>
                    <td>
                      <strong>{app.title}</strong>
                    </td>
                    <td>{app.description || ''}</td>
                    <td>{app.date}</td>
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

export default EmployeeAppreciationsView;
