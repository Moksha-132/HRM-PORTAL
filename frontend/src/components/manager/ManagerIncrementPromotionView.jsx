import React, { useEffect, useRef, useState } from 'react';
import EditModal from '../EditModal';
import {
  createIncrementPromotion,
  deleteIncrementPromotion,
  getEmployees,
  getIncrementPromotions,
  updateIncrementPromotion,
  updateIncrementPromotionStatus,
} from '../../services/managerService';

const initialForm = {
  employee_id: '',
  change_type: 'Increment',
  current_salary: '',
  new_salary: '',
  new_designation: '',
  effective_date: '',
};

const ManagerIncrementPromotionView = () => {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFields, setModalFields] = useState([]);
  const saveRef = useRef(() => {});

  const load = async () => {
    setLoading(true);
    try {
      const [res, empRes] = await Promise.all([getIncrementPromotions(), getEmployees()]);
      if (res.success) setRecords(res.data || []);
      if (empRes.success) setEmployees(empRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const selectedEmployee = employees.find((e) => String(e.employee_id) === String(form.employee_id));

  const onEmployeeChange = (employeeId) => {
    const empId = String(employeeId || '');
    const relatedRecords = records
      .filter((r) => String(r.employee_id) === empId)
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    const latest = relatedRecords[0];
    const autoCurrentSalary = latest?.new_salary || latest?.current_salary || '';

    setForm((p) => ({
      ...p,
      employee_id: empId,
      current_salary: p.current_salary || String(autoCurrentSalary || ''),
      new_designation: p.new_designation || '',
    }));
  };

  const validateForm = (values) => {
    const currentSalary = parseFloat(values.current_salary || 0);
    const newSalary = parseFloat(values.new_salary || 0);
    if (!Number.isNaN(currentSalary) && !Number.isNaN(newSalary) && newSalary <= currentSalary) {
      return 'New salary must be greater than current salary.';
    }
    if (values.change_type === 'Promotion' && !String(values.new_designation || '').trim()) {
      return 'New designation is required for promotion.';
    }
    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm(form);
    if (error) {
      setFormError(error);
      return;
    }
    setFormError('');
    setSaving(true);
    try {
      await createIncrementPromotion(form);
      setForm(initialForm);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (item) => {
    setModalFields([
      { label: 'Type', key: 'change_type', value: item.change_type, type: 'select', options: ['Increment', 'Promotion'] },
      { label: 'Current Salary', key: 'current_salary', value: item.current_salary || '', type: 'number' },
      { label: 'New Salary', key: 'new_salary', value: item.new_salary || '', type: 'number' },
      { label: 'New Designation', key: 'new_designation', value: item.new_designation || '', type: 'text' },
      { label: 'Effective Date', key: 'effective_date', value: item.effective_date || '', type: 'date' },
      { label: 'Status', key: 'status', value: item.status || 'Pending', type: 'select', options: ['Pending', 'Approved', 'Rejected'] },
    ]);

    saveRef.current = async (values) => {
      const error = validateForm(values);
      if (error) {
        // eslint-disable-next-line no-alert
        window.alert(error);
        return;
      }
      setSaving(true);
      try {
        await updateIncrementPromotion(item.increment_promotion_id, values);
        await load();
      } finally {
        setSaving(false);
      }
    };

    setModalOpen(true);
  };

  const onStatusChange = async (id, status) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Mark this record as ${status}?`)) return;
    await updateIncrementPromotionStatus(id, status);
    await load();
  };

  const onDelete = async (id) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Delete this increment/promotion record?')) return;
    await deleteIncrementPromotion(id);
    await load();
  };

  return (
    <div className="view">
      <div className="page-header"><h1 className="page-h1">Increment / Promotion</h1></div>
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head"><div className="panel-title">Create Salary / Role Change</div></div>
          <div className="panel-body">
            <form onSubmit={onSubmit}>
              <label className="form-label">Employee</label>
              <select className="input" value={form.employee_id} onChange={(e) => onEmployeeChange(e.target.value)} required>
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.employee_name} (ID: {emp.employee_id})
                  </option>
                ))}
              </select>

              <label className="form-label">Type</label>
              <select className="input" value={form.change_type} onChange={(e) => setForm((p) => ({ ...p, change_type: e.target.value }))}>
                <option value="Increment">Increment</option>
                <option value="Promotion">Promotion</option>
              </select>

              <label className="form-label">Current Salary</label>
              <input className="input" type="number" step="0.01" value={form.current_salary} onChange={(e) => setForm((p) => ({ ...p, current_salary: e.target.value }))} required />

              <label className="form-label">New Salary</label>
              <input className="input" type="number" step="0.01" value={form.new_salary} onChange={(e) => setForm((p) => ({ ...p, new_salary: e.target.value }))} required />

              <label className="form-label">New Designation {form.change_type === 'Promotion' ? '(Required)' : '(Optional)'}</label>
              <input className="input" value={form.new_designation} onChange={(e) => setForm((p) => ({ ...p, new_designation: e.target.value }))} required={form.change_type === 'Promotion'} />

              <label className="form-label">Effective Date</label>
              <input className="input" type="date" value={form.effective_date} onChange={(e) => setForm((p) => ({ ...p, effective_date: e.target.value }))} required />

              {selectedEmployee ? (
                <div style={{ marginBottom: 12, color: '#64748b', fontSize: '0.85rem' }}>
                  Current Designation: <strong>{selectedEmployee.designation || 'N/A'}</strong>
                </div>
              ) : null}

              {formError ? <div style={{ marginBottom: 10, color: '#b91c1c', fontSize: '0.9rem' }}>{formError}</div> : null}

              <button type="submit" className="btn btn-solid" style={{ width: '100%' }} disabled={saving}>
                {saving ? 'Saving...' : 'Save Record'}
              </button>
            </form>
          </div>
        </div>

        <div className="panel">
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  <th>Type</th>
                  <th>Current Salary</th>
                  <th>New Salary</th>
                  <th>New Designation</th>
                  <th>Effective Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center' }}>Loading...</td></tr>
                ) : records.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center' }}>No increment/promotion records found.</td></tr>
                ) : records.map((item) => (
                  <tr key={item.increment_promotion_id}>
                    <td>{item.employee_id}</td>
                    <td>{item.Employee?.employee_name || 'N/A'}</td>
                    <td>{item.change_type}</td>
                    <td>{item.current_salary ? `₹${item.current_salary}` : '-'}</td>
                    <td>{item.new_salary ? `₹${item.new_salary}` : '-'}</td>
                    <td>{item.new_designation || '-'}</td>
                    <td>{item.effective_date || '-'}</td>
                    <td>
                      <span className={`badge ${item.status === 'Approved' ? 'bg-green' : 'bg-yellow'}`}>
                        {item.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="action-btn" style={{ color: 'green' }} onClick={() => onStatusChange(item.increment_promotion_id, 'Approved')} title="Approve">
                        <i className="fas fa-check" />
                      </button>
                      <button type="button" className="action-btn" style={{ color: '#ef4444' }} onClick={() => onStatusChange(item.increment_promotion_id, 'Rejected')} title="Reject">
                        <i className="fas fa-times" />
                      </button>
                      <button type="button" className="action-btn edit-btn" onClick={() => openEdit(item)} title="Edit">
                        <i className="fas fa-edit" />
                      </button>
                      <button type="button" className="action-btn delete-btn" onClick={() => onDelete(item.increment_promotion_id)} title="Delete">
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

      <EditModal
        isOpen={modalOpen}
        title="Edit Increment / Promotion"
        fields={modalFields}
        onClose={() => setModalOpen(false)}
        onSave={async (values) => {
          await saveRef.current(values);
          setModalOpen(false);
        }}
        saving={saving}
      />
    </div>
  );
};

export default ManagerIncrementPromotionView;
