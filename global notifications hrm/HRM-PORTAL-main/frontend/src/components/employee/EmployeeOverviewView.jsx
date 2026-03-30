import React, { useEffect, useState } from 'react';
import { getEmployeeDashboard } from '../../services/employeeService';

const EmployeeOverviewView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getEmployeeDashboard();
        if (active && res.success) {
          setData(res.data);
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

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Dashboard Summary</h1>
        <p className="page-sub">Your personal overview and stats</p>
      </div>
      <div className="grid grid-4" style={{ padding: 0, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-val">{data?.todayStatus || 'N/A'}</div>
          <div className="stat-label">Today's Status</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{data?.totalWorkingHours || 0}</div>
          <div className="stat-label">Work Hours (Current Month)</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{data?.lateAttendanceCount || 0}</div>
          <div className="stat-label">Late Arrivals</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{data?.assetCount || 0}</div>
          <div className="stat-label">Assigned Assets</div>
        </div>
      </div>
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Employment Details</div>
          </div>
          <div className="panel-body">
            <p style={{ marginBottom: 12 }}>
              <strong>Name:</strong> <span>{data?.employee?.name || 'Loading...'}</span>
            </p>
            <p style={{ marginBottom: 12 }}>
              <strong>Joined:</strong> <span>{data?.employee?.joining_date || 'N/A'}</span>
            </p>
            <p style={{ marginBottom: 12 }}>
              <strong>Department:</strong> <span>{data?.employee?.department || 'N/A'}</span>
            </p>
            <p>
              <strong>Designation:</strong> <span>{data?.employee?.designation || 'N/A'}</span>
            </p>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Recent Appreciations</div>
          </div>
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {loading ? (
                  <tr>
                    <td style={{ textAlign: 'center' }}>Loading...</td>
                  </tr>
                ) : data?.recentActivities?.appreciations?.length ? (
                  data.recentActivities.appreciations.map((app) => (
                    <tr key={app.appreciation_id}>
                      <td>
                        <strong>{app.title}</strong>
                        <br />
                        <small>{app.date}</small>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={{ textAlign: 'center' }}>No recent appreciations</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeOverviewView;
