import React, { useEffect, useState } from 'react';
import { clockIn, clockOut, getAttendanceHistory } from '../../services/employeeService';

const EmployeeAttendanceView = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clocking, setClocking] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAttendanceHistory();
      if (res.success) setRecords(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activeRecord = records.find((rec) => !rec.clock_out);

  const handleClockIn = async () => {
    setClocking(true);
    try {
      await clockIn();
      load();
    } catch (err) {
      alert(err?.response?.data?.error || 'Clock-in failed.');
    } finally {
      setClocking(false);
    }
  };

  const handleClockOut = async () => {
    setClocking(true);
    try {
      await clockOut();
      load();
    } catch (err) {
      alert(err?.response?.data?.error || 'Clock-out failed.');
    } finally {
      setClocking(false);
    }
  };

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Attendance History</h1>
      </div>
      <div className="panel">
        <div className="panel-body" style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <button className="btn btn-solid" style={{ height: 54, padding: '0 48px', fontSize: '1.1rem', borderRadius: 30 }} onClick={handleClockIn} disabled={clocking || !!activeRecord}>
            Clock In
          </button>
          <button className="btn btn-outline" style={{ height: 54, padding: '0 48px', fontSize: '1.1rem', borderRadius: 30 }} onClick={handleClockOut} disabled={clocking || !activeRecord}>
            Clock Out
          </button>
        </div>
      </div>
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">My Clock Logs</div>
        </div>
        <div className="table-wrap" style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>
                    Loading attendance...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>
                    No history found
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec.attendance_id}>
                    <td>{rec.date}</td>
                    <td>{rec.clock_in ? new Date(rec.clock_in).toLocaleTimeString() : '---'}</td>
                    <td>{rec.clock_out ? new Date(rec.clock_out).toLocaleTimeString() : '---'}</td>
                    <td>{rec.work_duration || '0'}</td>
                    <td>
                      <span className={`badge ${rec.status === 'Present' ? 'bg-green' : 'bg-yellow'}`}>{rec.status}</span>
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

export default EmployeeAttendanceView;
