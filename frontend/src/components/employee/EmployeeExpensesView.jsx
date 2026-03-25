import React, { useEffect, useState } from 'react';
import { getExpenses, submitExpense, updateExpense, deleteExpense } from '../../services/employeeService';

const EmployeeExpensesView = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', amount: '', category: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await getExpenses();
      if (res.success) setExpenses(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateExpense(editingId, form);
      } else {
        await submitExpense(form);
      }
      setForm({ title: '', amount: '', category: '' });
      setEditingId(null);
      load();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to submit expense');
    }
  };

  const handleEdit = (exp) => {
    if (exp.status !== 'Pending') return alert("Only pending claims can be edited");
    setForm({ title: exp.title, amount: exp.amount, category: exp.category });
    setEditingId(exp.expense_id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense claim?")) return;
    try {
      await deleteExpense(id);
      load();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to delete expense');
    }
  };

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Expense Claims</h1>
      </div>
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">{editingId ? 'Edit Claim' : 'New Claim'}</div>
            {editingId && <button className="btn btn-sm" onClick={() => { setEditingId(null); setForm({ title: '', amount: '', category: '' }); }}>Cancel</button>}
          </div>
          <div className="panel-body">
            <form onSubmit={handleSubmit}>
              <label className="form-label">Title</label>
              <input className="input" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
              <label className="form-label">Amount (₹)</label>
              <input className="input" type="number" step="0.01" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} required />
              <label className="form-label">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} required style={{ width: '100%', marginBottom: '15px' }}>
                <option value="" disabled>Select Category</option>
                <option value="Travel">Travel</option>
                <option value="Meals">Meals</option>
                <option value="Supplies">Supplies</option>
                <option value="Software">Software</option>
                <option value="Medical">Medical</option>
                <option value="Other">Other</option>
              </select>
              <button type="submit" className="btn btn-solid" style={{ width: '100%' }}>
                Submit Claim
              </button>
            </form>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">My Recent Claims</div>
          </div>
          <div className="table-wrap" style={{ padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center' }}>
                      Loading expenses...
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center' }}>
                      No claims
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense.expense_id}>
                      <td>{expense.title}</td>
                      <td>₹{expense.amount}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`badge ${expense.status === 'Approved' ? 'bg-green' : expense.status === 'Rejected' ? 'bg-red' : 'bg-yellow'}`}>{expense.status}</span>
                          {expense.status === 'Pending' && (
                            <>
                              <button className="btn-icon" onClick={() => handleEdit(expense)} title="Edit"><i className="fas fa-edit" style={{ color: 'var(--primary)' }}></i></button>
                              <button className="btn-icon" onClick={() => handleDelete(expense.expense_id)} title="Delete"><i className="fas fa-trash" style={{ color: 'var(--danger, #ef4444)' }}></i></button>
                            </>
                          )}
                        </div>
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

export default EmployeeExpensesView;
