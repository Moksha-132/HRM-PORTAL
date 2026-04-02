import React, { useEffect, useState } from 'react';
import { getOffboardings, submitOffboarding } from '../../services/employeeService';

const OFFBOARDING_CATEGORIES = ['Warning', 'Resignation', 'Complaint'];

const getCategory = (item) => {
  const category = String(item?.category || '').trim();
  return OFFBOARDING_CATEGORIES.includes(category) ? category : 'Resignation';
};

const EmployeeOffboardingView = () => {
  const [offboardings, setOffboardings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Resignation');
  const [form, setForm] = useState({ category: 'Resignation', reason: '', last_working_date: '' });

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
    const payload = {
      category: form.category,
      reason: form.reason,
    };
    if (form.category === 'Resignation') {
      payload.last_working_date = form.last_working_date;
    }
    await submitOffboarding(payload);
    setForm((prev) => ({ ...prev, reason: '', last_working_date: '' }));
    load();
  };

  const filteredOffboardings = offboardings.filter((item) => getCategory(item) === activeCategory);
  const isResignation = form.category === 'Resignation';

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Offboarding Process</h1>
      </div>
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Raise Request</div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSubmit}>
              <label className="form-label">Category</label>
              <select
                className="input"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value, last_working_date: '' }))}
                required
              >
                <option value="Resignation">Resignation</option>
                <option value="Complaint">Complaint</option>
              </select>

              <label className="form-label">Details</label>
              <textarea className="input" style={{ minHeight: 120 }} value={form.reason} onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))} required />

              {isResignation ? (
                <>
                  <label className="form-label">Proposed Last Working Date</label>
                  <input className="input" type="date" value={form.last_working_date} onChange={(e) => setForm((prev) => ({ ...prev, last_working_date: e.target.value }))} required />
                </>
              ) : null}

              <button type="submit" className="btn btn-solid" style={{ width: '100%' }}>
                {isResignation ? 'Initiate Resignation' : 'Raise Complaint'}
              </button>
            </form>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Offboarding Sublist</div>
          </div>
          <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {OFFBOARDING_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className={`btn ${activeCategory === category ? 'btn-solid' : 'btn-outline'}`}
                onClick={() => setActiveCategory(category)}
                style={{ padding: '6px 12px' }}
              >
                {category === 'Warning' ? 'Warnings' : (category === 'Complaint' ? 'Complaints' : 'Resignation')}
              </button>
            ))}
          </div>
          <div className="table-wrap" style={{ padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Details</th>
                  <th>Last Date</th>
                  <th>Raised By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>
                      Loading requests...
                    </td>
                  </tr>
                ) : filteredOffboardings.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>
                      No records in this category
                    </td>
                  </tr>
                ) : (
                  filteredOffboardings.map((off) => (
                    <tr key={off.offboarding_id}>
                      <td>{getCategory(off)}</td>
                      <td>{off.reason || '-'}</td>
                      <td>{off.last_working_date || '-'}</td>
                      <td>{off.raised_by || '-'}</td>
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
