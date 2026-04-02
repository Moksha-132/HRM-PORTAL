import React, { useEffect, useMemo, useRef, useState } from 'react';
import EditModal from '../EditModal';
import {
  createPayroll,
  deletePayroll,
  generatePayslip,
  getEmployees,
  getIncrementPromotions,
  getPayroll,
  getPrePayments,
  updatePayroll,
} from '../../services/managerService';

const toAmount = (value) => {
  const amount = parseFloat(value);
  return Number.isFinite(amount) ? amount : 0;
};

const formatCurrency = (value) => `Rs. ${toAmount(value).toFixed(2)}`;
const STATUS_OPTIONS = ['All', 'Pending', 'Approved', 'Rejected'];

const statusBadgeClass = (status) => {
  if (status === 'Approved') return 'badge bg-green';
  if (status === 'Rejected') return 'badge bg-red';
  return 'badge bg-yellow';
};

const ManagerPayrollView = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [prePayments, setPrePayments] = useState([]);
  const [increments, setIncrements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [form, setForm] = useState({
    employee_id: '',
    basic_salary: '',
    allowances: 0,
    deductions: 0,
    payment_date: '',
  });
  const [message, setMessage] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalFields, setModalFields] = useState([]);
  const saveRef = useRef(() => {});

  const load = async () => {
    setLoading(true);
    try {
      const [payRes, empRes, preRes, incRes] = await Promise.all([
        getPayroll(),
        getEmployees(),
        getPrePayments(),
        getIncrementPromotions(),
      ]);
      if (payRes.success) setPayrolls(payRes.data || []);
      if (empRes.success) setEmployees(empRes.data || []);
      if (preRes.success) setPrePayments(preRes.data || []);
      if (incRes.success) setIncrements(incRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const payrollInsightByEmployee = useMemo(() => {
    const map = new Map();

    employees.forEach((employee) => {
      const employeeId = String(employee.employee_id);
      const approvedPrePayments = prePayments.filter(
        (item) => String(item.employee_id) === employeeId && item.status === 'Approved'
      );
      const latestApprovedIncrement = increments
        .filter((item) => String(item.employee_id) === employeeId && item.status === 'Approved')
        .sort((a, b) => new Date(b.effective_date || b.created_at || 0) - new Date(a.effective_date || a.created_at || 0))[0];
      const latestPayroll = payrolls
        .filter((item) => String(item.employee_id) === employeeId)
        .sort((a, b) => new Date(b.payment_date || 0) - new Date(a.payment_date || a.created_at || 0))[0];

      map.set(employeeId, {
        approvedAdvanceTotal: approvedPrePayments
          .filter((item) => item.payment_type === 'Advance')
          .reduce((sum, item) => sum + toAmount(item.amount), 0),
        approvedAllowanceTotal: approvedPrePayments
          .filter((item) => item.payment_type !== 'Advance')
          .reduce((sum, item) => sum + toAmount(item.amount), 0),
        latestApprovedIncrement,
        latestPayroll,
      });
    });

    return map;
  }, [employees, increments, payrolls, prePayments]);

  const selectedInsight = payrollInsightByEmployee.get(String(form.employee_id || ''));

  useEffect(() => {
    if (!form.employee_id) return;
    const insight = payrollInsightByEmployee.get(String(form.employee_id));
    if (!insight) return;

    const suggestedBasicSalary = toAmount(
      insight.latestApprovedIncrement?.new_salary ?? insight.latestPayroll?.basic_salary ?? form.basic_salary
    );

    setForm((prev) => ({
      ...prev,
      basic_salary: prev.basic_salary === '' ? String(suggestedBasicSalary || '') : prev.basic_salary,
      allowances: prev.allowances === 0 || prev.allowances === '0' ? insight.approvedAllowanceTotal : prev.allowances,
      deductions: prev.deductions === 0 || prev.deductions === '0' ? insight.approvedAdvanceTotal : prev.deductions,
    }));
  }, [form.employee_id, payrollInsightByEmployee]);

  const filteredPayrolls = useMemo(() => {
    if (statusFilter === 'All') return payrolls;
    return payrolls.filter((item) => item.status === statusFilter);
  }, [payrolls, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSaving(true);

    try {
      await createPayroll({
        employee_id: form.employee_id,
        basic_salary: toAmount(form.basic_salary),
        allowances: toAmount(form.allowances),
        deductions: toAmount(form.deductions),
        payment_date: form.payment_date || null,
        status: 'Pending',
      });
      setForm({ employee_id: '', basic_salary: '', allowances: 0, deductions: 0, payment_date: '' });
      setMessage('Payroll record created successfully.');
      await load();
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (payroll) => {
    setModalFields([
      { label: 'Basic Salary', key: 'basic_salary', value: payroll.basic_salary, type: 'number' },
      { label: 'Allowances', key: 'allowances', value: payroll.allowances, type: 'number' },
      { label: 'Deductions', key: 'deductions', value: payroll.deductions, type: 'number' },
      { label: 'Payment Date', key: 'payment_date', value: payroll.payment_date, type: 'date' },
    ]);
    saveRef.current = async (values) => {
      setSaving(true);
      try {
        await updatePayroll(payroll.payroll_id, values);
        await load();
      } finally {
        setSaving(false);
      }
    };
    setModalOpen(true);
  };

  const handleStatusChange = async (payroll, status) => {
    setMessage('');
    setSaving(true);
    try {
      await updatePayroll(payroll.payroll_id, { status });
      setMessage(`Payroll marked as ${status}.`);
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Payroll (Salary and Payslips)</h1>
      </div>
      {message ? <div style={{ marginBottom: 12, color: '#166534' }}>{message}</div> : null}

      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Create Payroll Record</div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSubmit}>
              <label className="form-label">Target Employee</label>
              <select
                className="input"
                value={form.employee_id}
                onChange={(e) => setForm((prev) => ({ ...prev, employee_id: e.target.value, basic_salary: '', allowances: 0, deductions: 0 }))}
                required
              >
                <option value="">Select Employee</option>
                {employees.filter(Boolean).map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {(emp.employee_name || 'Employee')} (ID: {emp.employee_id})
                  </option>
                ))}
              </select>

              {selectedInsight ? (
                <div style={{ marginBottom: 14, padding: 12, borderRadius: 10, background: '#f8fafc', color: '#334155' }}>
                  <div>Approved pre-payment deductions: <strong>{formatCurrency(selectedInsight.approvedAdvanceTotal)}</strong></div>
                  <div>Approved extra allowances: <strong>{formatCurrency(selectedInsight.approvedAllowanceTotal)}</strong></div>
                  <div>
                    Latest approved increment/promotion:
                    <strong> {selectedInsight.latestApprovedIncrement ? `${selectedInsight.latestApprovedIncrement.change_type} to ${formatCurrency(selectedInsight.latestApprovedIncrement.new_salary)}` : 'None'}</strong>
                  </div>
                </div>
              ) : null}

              <label className="form-label">Basic Salary</label>
              <input className="input" type="number" step="0.01" value={form.basic_salary} onChange={(e) => setForm((prev) => ({ ...prev, basic_salary: e.target.value }))} required />
              <label className="form-label">Total Allowances</label>
              <input className="input" type="number" step="0.01" value={form.allowances} onChange={(e) => setForm((prev) => ({ ...prev, allowances: e.target.value }))} />
              <label className="form-label">Total Deductions</label>
              <input className="input" type="number" step="0.01" value={form.deductions} onChange={(e) => setForm((prev) => ({ ...prev, deductions: e.target.value }))} />
              <label className="form-label">Payment Date</label>
              <input className="input" type="date" value={form.payment_date} onChange={(e) => setForm((prev) => ({ ...prev, payment_date: e.target.value }))} />
              <button type="submit" className="btn btn-solid" style={{ width: '100%' }} disabled={saving}>
                {saving ? 'Saving...' : 'Save Payroll'}
              </button>
            </form>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Payroll Records</div>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Basic</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center' }}>Loading payroll...</td></tr>
                ) : filteredPayrolls.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center' }}>No payroll records found.</td></tr>
                ) : (
                  filteredPayrolls.map((payroll) => (
                    <tr key={payroll.payroll_id}>
                      <td>{payroll.employee_id} ({payroll.Employee?.employee_name || 'N/A'})</td>
                      <td>{formatCurrency(payroll.basic_salary)}</td>
                      <td>{formatCurrency(payroll.allowances)}</td>
                      <td>{formatCurrency(payroll.deductions)}</td>
                      <td>{formatCurrency(payroll.net_salary)}</td>
                      <td><span className={statusBadgeClass(payroll.status)}>{payroll.status || 'Pending'}</span></td>
                      <td>{payroll.payment_date || 'N/A'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button type="button" className="btn btn-outline" style={{ fontSize: 10, padding: '4px 8px' }} onClick={() => handleStatusChange(payroll, 'Approved')} disabled={saving || payroll.status === 'Approved'}>
                            Approve
                          </button>
                          <button type="button" className="btn btn-outline" style={{ fontSize: 10, padding: '4px 8px' }} onClick={() => handleStatusChange(payroll, 'Rejected')} disabled={saving || payroll.status === 'Rejected'}>
                            Reject
                          </button>
                          <button type="button" className="btn btn-outline" style={{ fontSize: 10, padding: '4px 8px' }} onClick={async () => {
                            const res = await generatePayslip(payroll.payroll_id);
                            if (res?.message) setMessage(res.message);
                            await load();
                          }} disabled={saving || payroll.status !== 'Approved'}>
                            Generate Payslip
                          </button>
                          <button type="button" className="action-btn edit-btn" onClick={() => openEdit(payroll)}>
                            <i className="fas fa-edit" />
                          </button>
                          <button type="button" className="action-btn delete-btn" onClick={() => deletePayroll(payroll.payroll_id).then(load)}>
                            <i className="fas fa-trash" />
                          </button>
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

      <EditModal
        isOpen={modalOpen}
        title="Edit Payroll"
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

export default ManagerPayrollView;
