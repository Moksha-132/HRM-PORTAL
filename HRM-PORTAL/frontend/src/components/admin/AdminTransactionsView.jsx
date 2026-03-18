import React, { useEffect, useState } from 'react';
import { createTransaction, deleteTransaction, getTransactions, updateTransaction } from '../../services/adminService';
import { getCompanies } from '../../services/adminService';

const AdminTransactionsView = () => {
  const [companies, setCompanies] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    id: '',
    companyId: '',
    amount: '',
    transactionDate: '',
    nextPaymentDate: '',
    paymentMethod: '',
    status: 'Success',
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [companyRes, transRes] = await Promise.all([getCompanies(), getTransactions()]);
      if (companyRes.success) setCompanies(companyRes.data);
      if (transRes.success) setTransactions(transRes.data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load transactions.');
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
      const payload = {
        companyId: form.companyId,
        amount: form.amount,
        transactionDate: form.transactionDate || new Date().toISOString(),
        nextPaymentDate: form.nextPaymentDate || null,
        paymentMethod: form.paymentMethod || '',
        status: form.status,
      };
      if (form.id) {
        await updateTransaction(form.id, payload);
      } else {
        await createTransaction(payload);
      }
      setForm({ id: '', companyId: '', amount: '', transactionDate: '', nextPaymentDate: '', paymentMethod: '', status: 'Success' });
      load();
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to save transaction.');
    }
  };

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Transactions</h1>
        <p className="page-sub">Monitor all payments</p>
      </div>
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Add / Edit Transaction</div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSubmit}>
              <label className="form-label">Company</label>
              <select className="input" value={form.companyId} onChange={(e) => setForm((prev) => ({ ...prev, companyId: e.target.value }))} required>
                <option value="">Select a company</option>
                {companies.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name}
                  </option>
                ))}
              </select>
              <label className="form-label">Amount ($)</label>
              <input className="input" type="number" step="0.01" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} required />
              <label className="form-label">Transaction Date</label>
              <input className="input" type="date" value={form.transactionDate} onChange={(e) => setForm((prev) => ({ ...prev, transactionDate: e.target.value }))} required />
              <label className="form-label">Next Payment Date</label>
              <input className="input" type="date" value={form.nextPaymentDate} onChange={(e) => setForm((prev) => ({ ...prev, nextPaymentDate: e.target.value }))} />
              <label className="form-label">Payment Method</label>
              <input className="input" value={form.paymentMethod} onChange={(e) => setForm((prev) => ({ ...prev, paymentMethod: e.target.value }))} />
              <label className="form-label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                <option value="Success">Success</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
              <button type="submit" className="btn btn-solid" style={{ width: '100%' }}>
                Save Transaction
              </button>
              {form.id && (
                <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: 10 }} onClick={() => setForm({ id: '', companyId: '', amount: '', transactionDate: '', nextPaymentDate: '', paymentMethod: '', status: 'Success' })}>
                  Cancel Edit
                </button>
              )}
            </form>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">All Transactions</div>
          </div>
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Company</th>
                  <th>Amount</th>
                  <th>Next Payment</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center' }}>
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center' }}>
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{transaction.transactionDate ? new Date(transaction.transactionDate).toLocaleDateString() : 'N/A'}</td>
                      <td>{transaction.Company?.name || 'Unknown'}</td>
                      <td>${transaction.amount}</td>
                      <td>{transaction.nextPaymentDate ? new Date(transaction.nextPaymentDate).toLocaleDateString() : 'N/A'}</td>
                      <td>{transaction.paymentMethod || 'N/A'}</td>
                      <td>
                        <span style={{ color: transaction.status === 'Success' ? 'green' : transaction.status === 'Failed' ? 'red' : 'orange', fontWeight: 600 }}>
                          {transaction.status}
                        </span>
                      </td>
                      <td>
                        <button type="button" className="action-btn edit-btn" onClick={() => setForm({
                          id: transaction.id,
                          companyId: transaction.companyId,
                          amount: transaction.amount,
                          transactionDate: transaction.transactionDate?.split('T')[0] || '',
                          nextPaymentDate: transaction.nextPaymentDate?.split('T')[0] || '',
                          paymentMethod: transaction.paymentMethod || '',
                          status: transaction.status || 'Success',
                        })}>
                          ✏️
                        </button>
                        <button type="button" className="action-btn delete-btn" onClick={() => deleteTransaction(transaction.id).then(load)}>
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactionsView;
