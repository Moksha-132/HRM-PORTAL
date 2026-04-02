import React, { useEffect, useMemo, useState } from 'react';
import { getOffboardings, submitOffboarding } from '../../services/employeeService';

const canEmployeeCreate = (category) => category === 'Resignation' || category === 'Complaint';
const KNOWN_CATEGORIES = ['Warning', 'Resignation', 'Complaint'];

const todayDate = () => new Date().toISOString().split('T')[0];

const inferCategory = (item) => {
  const direct = String(item?.category || '').trim();
  if (KNOWN_CATEGORIES.includes(direct)) return direct;
  const reason = String(item?.reason || '').trim().toLowerCase();
  if (reason.startsWith('[warning]')) return 'Warning';
  if (reason.startsWith('[complaint]')) return 'Complaint';
  if (reason.startsWith('[resignation]')) return 'Resignation';
  return 'Resignation';
};

const stripPrefix = (reason) => String(reason || '').replace(/^\s*\[(warning|complaint|resignation)\]\s*/i, '').trim();

const applyPrefix = (reason, category) => {
  const clean = stripPrefix(reason);
  if (category === 'Complaint') return `[Complaint] ${clean}`;
  if (category === 'Warning') return `[Warning] ${clean}`;
  return clean;
};

const resolveError = (err) => err?.response?.data?.error || err?.message || 'Action failed';

const EmployeeOffboardingCategoryView = ({ category }) => {
  const [offboardings, setOffboardings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ reason: '', last_working_date: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await getOffboardings();
      if (res.success) setOffboardings(Array.isArray(res.data) ? res.data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [category]);

  const filtered = useMemo(() => {
    return offboardings.filter((item) => inferCategory(item) === category);
  }, [category, offboardings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        category,
        reason: applyPrefix(form.reason, category),
        last_working_date: category === 'Resignation' ? form.last_working_date : todayDate(),
      };
      await submitOffboarding(payload);
      setForm({ reason: '', last_working_date: '' });
      await load();
      alert(category === 'Complaint' ? 'Complaint sent successfully' : 'Resignation sent successfully');
    } catch (err) {
      alert(resolveError(err));
    }
  };

  const formTitle = category === 'Resignation' ? 'Submit Resignation' : (category === 'Complaint' ? 'Submit Complaint' : 'Warnings Received');

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">{category}</h1>
      </div>
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">{formTitle}</div>
          </div>
          <div className="panel-body">
            {canEmployeeCreate(category) ? (
              <form onSubmit={handleSubmit}>
                <label className="form-label">Details</label>
                <textarea
                  className="input"
                  style={{ minHeight: 120 }}
                  value={form.reason}
                  onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                  required
                />
                {category === 'Resignation' ? (
                  <>
                    <label className="form-label">Proposed Last Working Date</label>
                    <input
                      className="input"
                      type="date"
                      value={form.last_working_date}
                      onChange={(e) => setForm((prev) => ({ ...prev, last_working_date: e.target.value }))}
                      required
                    />
                  </>
                ) : null}
                <button type="submit" className="btn btn-solid" style={{ width: '100%' }}>
                  {category === 'Complaint' ? 'Send Complaint' : 'Send Resignation'}
                </button>
              </form>
            ) : (
              <div style={{ color: 'var(--text-light)' }}>
                Warnings are issued by your manager and shown in the table.
              </div>
            )}
          </div>
        </div>
        <div className="panel">
          <div className="table-wrap" style={{ padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Details</th>
                  <th>Last Date</th>
                  <th>Raised By</th>
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
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center' }}>
                      No {category.toLowerCase()} records.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.offboarding_id}>
                      <td>{stripPrefix(item.reason) || '-'}</td>
                      <td>{item.last_working_date || '-'}</td>
                      <td>{item.raised_by || (category === 'Warning' ? 'Manager' : (category === 'Complaint' ? 'Employee' : '-'))}</td>
                      <td>
                        <span className={`badge ${item.status === 'Completed' ? 'bg-green' : 'bg-yellow'}`}>{item.status}</span>
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

export default EmployeeOffboardingCategoryView;
