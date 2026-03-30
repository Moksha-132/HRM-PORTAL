import React, { useEffect, useState } from 'react';
import { getOffboardings, submitResignation } from '../../services/employeeService';

const EmployeeOffboardingView = () => {
  const [offboardings, setOffboardings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ reason: '', last_working_date: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await getOffboardings();
      if (res.success) setOffboardings(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitResignation(form);
    setForm({ reason: '', last_working_date: '' });
    load();
  };

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Offboarding Process</h1>
      </div>
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Submit Resignation</div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSubmit}>
              <label className="form-label">Reason for Leaving</label>
              <textarea className="input" style={{ minHeight: 120 }} value={form.reason} onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))} required />
              <label className="form-label">Proposed Last Working Date</label>
              <input className="input" type="date" value={form.last_working_date} onChange={(e) => setForm((prev) => ({ ...prev, last_working_date: e.target.value }))} required />
              <button type="submit" className="btn btn-solid" style={{ width: '100%' }}>
                Initiate Exit
              </button>
            </form>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Request Status</div>
          </div>
          <div className="table-wrap" style={{ padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Exit Date</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'center' }}>
                      Loading requests...
                    </td>
                  </tr>
                ) : offboardings.length === 0 ? (
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'center' }}>
                      No requests
                    </td>
                  </tr>
                ) : (
                  offboardings.map((off) => (
                    <tr key={off.offboarding_id}>
                      <td>{off.last_working_date}</td>
                      <td>
                        <span className={`badge ${off.status === 'Completed' ? 'bg-green' : 'bg-yellow'}`}>{off.status}</span>
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

export default EmployeeOffboardingView;
