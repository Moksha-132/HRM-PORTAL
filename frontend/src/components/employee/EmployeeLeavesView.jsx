import React, { useEffect, useState } from 'react';
import { getLeaves, applyLeave } from '../../services/employeeService';

const EmployeeLeavesView = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ leave_type: 'Casual Leave', start_date: '', end_date: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
    try {
      const res = await applyLeave(form);
      if (res.success) {
        setShowModal(false);
        setForm({ leave_type: 'Casual Leave', start_date: '', end_date: '', reason: '' });
        load();
      } else {
        alert(res.error || 'Failed to apply leave');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const calculateDays = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? `${diff} Day${diff > 1 ? 's' : ''}` : '0 Days';
  };

  const filteredLeaves = leaves.filter(leave => {
    if (activeTab !== 'All' && leave.status !== activeTab) return false;
    
    // Filter by Year
    if (year && !leave.start_date.startsWith(year)) return false;
    
    // Filter by Month
    if (month) {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const leaveMonthIndex = new Date(leave.start_date).getMonth();
      if (monthNames[leaveMonthIndex] !== month) return false;
    }
    
    return true;
  });

  return (
    <div className="view">
      <div className="breadcrumb">
        <span>Dashboard</span>
        <span>Leaves</span>
        <span>Leaves</span>
      </div>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-h1">Leaves</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select className="filter-select" value={year} onChange={(e) => setYear(e.target.value)} style={{ color: 'var(--text)', background: 'color-mix(in srgb, var(--card-bg) 88%, var(--bg) 12%)', borderColor: 'var(--border)' }}>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
          <select className="filter-select" value={month} onChange={(e) => setMonth(e.target.value)} style={{ color: 'var(--text)', background: 'color-mix(in srgb, var(--card-bg) 88%, var(--bg) 12%)', borderColor: 'var(--border)' }}>
            <option value="">Select Month</option>
            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
            <option value="April">April</option>
            <option value="May">May</option>
            <option value="June">June</option>
            <option value="July">July</option>
            <option value="August">August</option>
            <option value="September">September</option>
            <option value="October">October</option>
            <option value="November">November</option>
            <option value="December">December</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          className="btn btn-solid" 
          style={{ padding: '10px 20px', borderRadius: '8px', color: '#fff', boxShadow: '0 6px 18px rgba(79, 70, 229, 0.28)' }}
          onClick={() => setShowModal(true)}
        >
          + Add New Leave
        </button>
      </div>

      <div className="view-tabs">
        {['All', 'Pending', 'Approved', 'Rejected'].map(tab => (
          <button
            key={tab}
            className={`tab-btn${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="panel" style={{ border: 'none', boxShadow: 'none' }}>
        <div className="table-wrap" style={{ padding: 0 }}>
          <table className="leave-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ color: 'var(--text-light)' }}>User</th>
                <th style={{ color: 'var(--text-light)' }}>Leave Type</th>
                <th style={{ color: 'var(--text-light)' }}>Start Date</th>
                <th style={{ color: 'var(--text-light)' }}>End Date</th>
                <th style={{ color: 'var(--text-light)' }}>Status</th>
                <th style={{ color: 'var(--text-light)' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
              ) : filteredLeaves.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>No leave applications found</td></tr>
              ) : (
                filteredLeaves.map((leave, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          background: '#3b82f6', 
                          color: 'white', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {(leave.Employee?.employee_name || 'E').charAt(0).toUpperCase()}
                        </div>
                        {leave.Employee?.employee_name || `Employee #${leave.employee_id}`}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text)' }}>{leave.leave_type}</td>
                    <td>{leave.start_date}</td>
                    <td>{leave.end_date}</td>
                    <td>
                      <span className={`badge ${leave.status === 'Approved' ? 'bg-green' : leave.status === 'Rejected' ? 'bg-red' : 'bg-yellow'}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td>{calculateDays(leave.start_date, leave.end_date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          background: 'rgba(0, 0, 0, 0.5)', 
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 
        }}>
          <div className="panel" style={{ 
            width: '100%', maxWidth: '480px', margin: 'auto', 
            borderRadius: '20px', overflow: 'hidden', padding: '35px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            background: 'var(--card-bg)',
            animation: 'modalFadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', textAlign: 'center' }}>Apply for Leave</h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--text-light)', textAlign: 'center' }}>Please fill in the details below</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '6px' }}>Leave Type</label>
                <select 
                  className="input" 
                  style={{ height: '44px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'color-mix(in srgb, var(--bg-light) 88%, var(--bg) 12%)', color: 'var(--text)', fontSize: '0.9rem' }}
                  value={form.leave_type} 
                  onChange={(e) => setForm({ ...form, leave_type: e.target.value })}
                  required
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '6px' }}>Start Date</label>
                  <input 
                    type="date" 
                    className="input" 
                    style={{ height: '44px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'color-mix(in srgb, var(--bg-light) 88%, var(--bg) 12%)', color: 'var(--text)', fontSize: '0.9rem' }}
                    min={new Date().toISOString().split('T')[0]}
                    value={form.start_date} 
                    onChange={(e) => {
                      const newStart = e.target.value;
                      const updates = { ...form, start_date: newStart };
                      // If end date is not set or is before the new start date, update it
                      if (!form.end_date || form.end_date < newStart) {
                        updates.end_date = newStart;
                      }
                      setForm(updates);
                    }}
                    required 
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '6px' }}>End Date</label>
                  <input 
                    type="date" 
                    className="input" 
                    style={{ height: '44px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'color-mix(in srgb, var(--bg-light) 88%, var(--bg) 12%)', color: 'var(--text)', fontSize: '0.9rem' }}
                    min={form.start_date || new Date().toISOString().split('T')[0]}
                    value={form.end_date} 
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    required 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '6px' }}>Reason for Leave</label>
                <textarea 
                  className="input" 
                  style={{ borderRadius: '10px', border: '1.5px solid var(--border)', background: 'color-mix(in srgb, var(--bg-light) 88%, var(--bg) 12%)', color: 'var(--text)', padding: '12px', fontSize: '0.9rem', resize: 'none' }}
                  rows="3" 
                  value={form.reason} 
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="button" 
                  style={{ 
                    flex: 1, height: '46px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--card-bg)', 
                    color: 'var(--text)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' 
                  }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ 
                    flex: 1, height: '46px', borderRadius: '10px', border: 'none', 
                    background: 'var(--primary)', 
                    color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)'
                  }}
                  disabled={submitting}
                >
                  {submitting ? 'Applying...' : 'Apply Leave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeavesView;
