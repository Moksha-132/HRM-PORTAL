import React, { useEffect, useState } from 'react';
import { createPrePayment, deletePrePayment, getEmployees, getPrePayments, updatePrePayment, updatePrePaymentStatus } from '../../services/managerService';

const initialForm = {
  employee_id: '',
  amount: '',
  date: '',
  payment_type: 'Advance',
  remarks: '',
};

const ManagerPrePaymentsView = () => {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const load = async () => {
    setLoading(true);
    try {
      // Load employees first and independently
      const empRes = await getEmployees();
      if (empRes && empRes.success) {
         setEmployees(empRes.data || []);
         console.log('Employees loaded:', (empRes.data || []).length);
      }
      
      const payRes = await getPrePayments();
      if (payRes && payRes.success) {
         setRecords(payRes.data || []);
      }
    } catch (err) {
      console.error('Error in ManagerPrePaymentsView load:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.employee_id) return alert('Please select an employee');
    
    setSaving(true);
    try {
      const payload = {
        ...form,
        employee_id: Number(form.employee_id),
        amount: Number(form.amount)
      };
      
      console.log('Submitting pre-payment payload:', payload);

      if (editingId) {
        const res = await updatePrePayment(editingId, payload);
        if(!res.success) throw new Error(res.error || 'Failed to update');
      } else {
        const res = await createPrePayment(payload);
        if(!res.success) throw new Error(res.error || 'Failed to create');
      }
      
      alert(editingId ? 'Pre-payment updated successfully!' : 'Pre-payment request saved successfully!');
      resetForm();
      await load();
    } catch (err) {
      console.error('Save failed:', err);
      alert('Error: ' + (err.message || 'Operation failed'));
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (item) => {
    setEditingId(item.id);
    setForm({
      employee_id: String(item.employee_id || ''),
      amount: String(item.amount || ''),
      date: item.date || '',
      payment_type: item.payment_type || 'Advance',
      remarks: item.remarks || '',
    });
  };

  const onDelete = async (id) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Delete this pre-payment request?')) return;
    await deletePrePayment(id);
    if (editingId === id) resetForm();
    await load();
  };

  const onStatusChange = async (id, status) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Mark this request as ${status}?`)) return;
    await updatePrePaymentStatus(id, status);
    await load();
  };

  return (
    <div className="view">
      <div className="page-header"><h1 className="page-h1">Pre Payments</h1></div>
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head"><div className="panel-title">{editingId ? 'Edit Pre Payment' : 'Create Pre Payment Request'}</div></div>
          <div className="panel-body">
            <form onSubmit={onSubmit}>
              <label className="form-label">Employee</label>
              <select className="input" value={form.employee_id} onChange={(e) => setForm((p) => ({ ...p, employee_id: e.target.value }))} required>
                <option value="">Select Employee</option>
                {employees.filter(Boolean).map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.employee_name || `Employee #${emp.employee_id}`}
                  </option>
                ))}
              </select>

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
                {saving ? (editingId ? 'Updating...' : 'Saving...') : (editingId ? 'Update Request' : 'Save Request')}
              </button>
              {editingId ? (
                <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: 8 }} onClick={resetForm}>
                  Cancel Edit
                </button>
              ) : null}
            </form>
          </div>
        </div>

        <div className="panel">
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Employee ID</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Payment Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center' }}>Loading...</td></tr>
                ) : records.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center' }}>No pre payment records found.</td></tr>
                ) : records.map((item) => (
                  <tr key={item.id}>
                    <td>{item.Employee?.employee_name || 'N/A'}</td>
                    <td>{item.employee_id}</td>
                    <td>₹{item.amount}</td>
                    <td>{item.date || '-'}</td>
                    <td>{item.payment_type}</td>
                    <td>
                      <span className={`badge ${item.status === 'Approved' ? 'bg-green' : item.status === 'Rejected' ? 'bg-red' : 'bg-yellow'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="action-btn" style={{ color: 'green' }} onClick={() => onStatusChange(item.id, 'Approved')} title="Approve">
                        <i className="fas fa-check" />
                      </button>
                      <button type="button" className="action-btn" style={{ color: '#ef4444' }} onClick={() => onStatusChange(item.id, 'Rejected')} title="Reject">
                        <i className="fas fa-times" />
                      </button>
                      <button type="button" className="action-btn edit-btn" onClick={() => onEdit(item)} title="Edit">
                        <i className="fas fa-edit" />
                      </button>
                      <button type="button" className="action-btn delete-btn" onClick={() => onDelete(item.id)} title="Delete">
                        <i className="fas fa-trash" />
                      </button>
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

export default ManagerPrePaymentsView;
