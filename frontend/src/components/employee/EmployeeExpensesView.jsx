import React, { useEffect, useState } from 'react';
import { getExpenses, submitExpense } from '../../services/employeeService';

const EmployeeExpensesView = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
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
    await submitExpense(form);
    setForm({ title: '', amount: '', category: '' });
    load();
  };

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Expense Claims</h1>
      </div>
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">New Claim</div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSubmit}>
              <label className="form-label">Title</label>
              <input className="input" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
              <label className="form-label">Amount ($)</label>
              <input className="input" type="number" step="0.01" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} required />
              <label className="form-label">Category</label>
              <input className="input" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} />
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
                      <td>${expense.amount}</td>
                      <td>
                        <span className={`badge ${expense.status === 'Approved' ? 'bg-green' : expense.status === 'Rejected' ? 'bg-red' : 'bg-yellow'}`}>{expense.status}</span>
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
