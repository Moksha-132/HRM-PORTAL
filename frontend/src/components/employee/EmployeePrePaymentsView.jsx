import React, { useEffect, useState } from 'react';
import { createMyPrePayment, getMyPrePayments } from '../../services/employeeService';

const initialForm = {
  amount: '',
  date: '',
  payment_type: 'Advance',
  remarks: '',
};

const EmployeePrePaymentsView = () => {
  const [form, setForm] = useState(initialForm);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyPrePayments();
      if (res.success) setRecords(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load pre payment requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await createMyPrePayment(form);
      setForm(initialForm);
      setSuccess('Pre payment request created successfully.');
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create pre payment request.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="view">
      <div className="page-header"><h1 className="page-h1">Pre Payments</h1></div>
      {error ? <div style={{ marginBottom: 10, color: '#b91c1c' }}>{error}</div> : null}
      {success ? <div style={{ marginBottom: 10, color: '#166534' }}>{success}</div> : null}
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head"><div className="panel-title">Create Pre Payment Request</div></div>
          <div className="panel-body">
            <form onSubmit={submit}>
              <label className="form-label">Amount</label>
              <input className="input" type="number" step="0.01" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} required />

              <label className="form-label">Date</label>
              <input className="input" type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} required />

              <label className="form-label">Payment Type</label>
              <select className="input" value={form.payment_type} onChange={(e) => setForm((p) => ({ ...p, payment_type: e.target.value }))}>
                <option value="Advance">Advance</option>
                <option value="Bonus">Bonus</option>
                <option value="Other">Other</option>
              </select>

              <label className="form-label">Remarks</label>
              <input className="input" value={form.remarks} onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))} />

              <button type="submit" className="btn btn-solid" style={{ width: '100%' }} disabled={saving}>
                {saving ? 'Saving...' : 'Save Request'}
              </button>
            </form>
          </div>
        </div>

        <div className="panel">
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Payment Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center' }}>Loading...</td></tr>
                ) : records.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center' }}>No pre payment requests found.</td></tr>
                ) : records.map((item) => (
                  <tr key={item.id}>
                    <td>₹{item.amount}</td>
                    <td>{item.date || '-'}</td>
                    <td>{item.payment_type}</td>
                    <td>
                      <span className={`badge ${item.status === 'Approved' ? 'bg-green' : item.status === 'Rejected' ? 'bg-red' : 'bg-yellow'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePrePaymentsView;
