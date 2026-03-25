import React, { useEffect, useState } from 'react';
import { applyLeave, getLeaves } from '../../services/employeeService';

const EmployeeLeavesView = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ leave_type: 'Sick Leave', start_date: '', end_date: '', reason: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await getLeaves();
      if (res.success) setLeaves(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await applyLeave(form);
    setForm({ leave_type: 'Sick Leave', start_date: '', end_date: '', reason: '' });
    load();
  };

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Leave Management</h1>
      </div>
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Apply for Leave</div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSubmit}>
              <label className="form-label">Leave Type</label>
              <select className="input" value={form.leave_type} onChange={(e) => setForm((prev) => ({ ...prev, leave_type: e.target.value }))} required>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Vacation">Vacation</option>
              </select>
              <label className="form-label">Start Date</label>
              <input className="input" type="date" value={form.start_date} onChange={(e) => setForm((prev) => ({ ...prev, start_date: e.target.value }))} required />
              <label className="form-label">End Date</label>
              <input className="input" type="date" value={form.end_date} onChange={(e) => setForm((prev) => ({ ...prev, end_date: e.target.value }))} required />
              <label className="form-label">Reason</label>
              <textarea className="input" style={{ minHeight: 100 }} value={form.reason} onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))} required />
              <button type="submit" className="btn btn-solid" style={{ width: '100%' }}>
                Submit Request
              </button>
            </form>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">My Applications</div>
          </div>
          <div className="table-wrap" style={{ padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Dates</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center' }}>
                      Loading leaves...
                    </td>
                  </tr>
                ) : leaves.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center' }}>
                      No leave requests
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave.leave_id}>
                      <td>
                        {leave.start_date} to {leave.end_date}
                      </td>
                      <td>{leave.leave_type}</td>
                      <td>
                        <span className={`badge ${leave.status === 'Approved' ? 'bg-green' : leave.status === 'Rejected' ? 'bg-red' : 'bg-yellow'}`}>{leave.status}</span>
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

export default EmployeeLeavesView;
