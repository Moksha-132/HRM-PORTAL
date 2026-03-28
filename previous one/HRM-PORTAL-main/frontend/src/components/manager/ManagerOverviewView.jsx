import React, { useEffect, useState } from 'react';
import { getManagerDashboard } from '../../services/managerService';

const ManagerOverviewView = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaves: 0,
    todaysAttendance: 0,
    recentActivities: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getManagerDashboard();
        if (active && res.success) {
          setStats({
            totalEmployees: res.data.totalEmployees,
            activeEmployees: res.data.activeEmployees,
            pendingLeaves: res.data.pendingLeaves,
            todaysAttendance: res.data.todaysAttendance,
            recentActivities: res.data.recentActivities || [],
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

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Dashboard Overview</h1>
        <p className="page-sub">Real-time stats from the system</p>
      </div>
      <div className="grid grid-4" style={{ padding: 0, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-val">{stats.totalEmployees}</div>
          <div className="stat-label">Total Employees</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{stats.activeEmployees}</div>
          <div className="stat-label">Active Employees</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{stats.pendingLeaves}</div>
          <div className="stat-label">Pending Leaves</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{stats.todaysAttendance}</div>
          <div className="stat-label">Today's Attendance</div>
        </div>
      </div>
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Recent Activities (Leave Requests)</div>
        </div>
        <div className="table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>
                    Loading...
                  </td>
                </tr>
              ) : stats.recentActivities.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>
                    No recent leave activity
                  </td>
                </tr>
              ) : (
                stats.recentActivities.map((leave) => (
                  <tr key={leave.leave_id}>
                    <td>{leave.Employee ? leave.Employee.employee_name : 'N/A'}</td>
                    <td>{leave.leave_type}</td>
                    <td>
                      {leave.start_date} to {leave.end_date}
                    </td>
                    <td>
                      <span className={`badge ${leave.status === 'Approved' ? 'bg-green' : leave.status === 'Rejected' ? 'bg-red' : 'bg-yellow'}`}>
                        {leave.status}
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

export default ManagerOverviewView;
