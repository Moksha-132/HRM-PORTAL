import React, { useEffect, useRef, useState } from 'react';
import EditModal from '../EditModal';
import { createExpense, deleteExpense, getEmployees, getExpenses, updateExpense } from '../../services/managerService';

const ManagerFinanceView = () => {
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', employee_id: '', amount: '', category: '' });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalFields, setModalFields] = useState([]);
  const [saving, setSaving] = useState(false);
  const saveRef = useRef(() => {});

  const load = async () => {
    setLoading(true);
    try {
      const [expRes, empRes] = await Promise.all([getExpenses(), getEmployees()]);
      if (expRes.success) setExpenses(expRes.data);
      if (empRes.success) setEmployees(empRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createExpense({
      title: form.title,
      employee_id: form.employee_id,
      amount: form.amount,
      category: form.category,
    });
    setForm({ title: '', employee_id: '', amount: '', category: '' });
    load();
  };

  const openEdit = (item) => {
    setModalFields([
      { label: 'Title', key: 'title', value: item.title, type: 'text' },
      { label: 'Amount', key: 'amount', value: item.amount, type: 'number' },
      { label: 'Category', key: 'category', value: item.category, type: 'text' },
      { label: 'Status', key: 'status', value: item.status, type: 'select', options: ['Pending', 'Approved', 'Rejected'] },
    ]);
    saveRef.current = async (values) => {
      setSaving(true);
      try {
        await updateExpense(item.expense_id, values);
        load();
      } finally {
        setSaving(false);
      }
    };
    setModalOpen(true);
  };

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Finance & Expenses</h1>
      </div>
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Log Expense</div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSubmit}>
              <label className="form-label">Expense Title</label>
              <input className="input" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
              <label className="form-label">Claiming Employee</label>
              <select className="input" value={form.employee_id} onChange={(e) => setForm((prev) => ({ ...prev, employee_id: e.target.value }))} required>
                <option value="">Choose Employee</option>
                {employees.filter(Boolean).map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {(emp.employee_name || 'Employee')} (ID: {emp.employee_id})
                  </option>
                ))}
              </select>
              <label className="form-label">Amount (₹)</label>
              <input className="input" type="number" step="0.01" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} required />
              <label className="form-label">Category</label>
              <input className="input" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} />
              <button type="submit" className="btn btn-solid" style={{ width: '100%' }}>
                Submit Expense
              </button>
            </form>
          </div>
        </div>
        <div className="panel">
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Emp ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>
                      Loading expenses...
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>
                      No expenses found.
                    </td>
                  </tr>
                ) : (
                  expenses.map((item) => (
                    <tr key={item.expense_id}>
                      <td>
                        <strong>{item.title}</strong>
                        <br />
                        <small>{item.category}</small>
                      </td>
                      <td>
                        {item.employee_id} ({item.Employee ? item.Employee.employee_name : 'N/A'})
                      </td>
                      <td>₹{item.amount}</td>
                      <td>
                        <span className={`badge ${item.status === 'Approved' ? 'bg-green' : item.status === 'Rejected' ? 'bg-red' : 'bg-yellow'}`}>{item.status}</span>
                      </td>
                      <td>
                        <button type="button" className="action-btn" style={{ color: 'green' }} onClick={() => updateExpense(item.expense_id, { status: 'Approved' }).then(load)} title="Approve">
                          <i className="fas fa-thumbs-up" />
                        </button>
                        <button type="button" className="action-btn" style={{ color: '#ef4444' }} onClick={() => updateExpense(item.expense_id, { status: 'Rejected' }).then(load)} title="Reject">
                          <i className="fas fa-thumbs-down" />
                        </button>
                        <button type="button" className="action-btn edit-btn" onClick={() => openEdit(item)}>
                          <i className="fas fa-edit" />
                        </button>
                        <button type="button" className="action-btn delete-btn" onClick={() => deleteExpense(item.expense_id).then(load)}>
                          <i className="fas fa-trash" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <EditModal
        isOpen={modalOpen}
        title="Edit Expense"
        fields={modalFields}
        onClose={() => setModalOpen(false)}
        onSave={async (values) => {
          if (saveRef.current) await saveRef.current(values);
          setModalOpen(false);
        }}
        saving={saving}
      />
    </div>
  );
};

export default ManagerFinanceView;
