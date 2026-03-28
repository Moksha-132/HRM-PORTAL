import React, { useEffect, useRef, useState } from 'react';
import EditModal from '../EditModal';
import { createPayroll, deletePayroll, generatePayslip, getEmployees, getPayroll, updatePayroll } from '../../services/managerService';

const ManagerPayrollView = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    employee_id: '',
    basic_salary: '',
    allowances: 0,
    deductions: 0,
    payment_date: '',
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalFields, setModalFields] = useState([]);
  const [saving, setSaving] = useState(false);
  const saveRef = useRef(() => {});

  const load = async () => {
    setLoading(true);
    try {
      const [payRes, empRes] = await Promise.all([getPayroll(), getEmployees()]);
      if (payRes.success) setPayrolls(payRes.data);
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
    const base = parseFloat(form.basic_salary || 0);
    const allow = parseFloat(form.allowances || 0);
    const ded = parseFloat(form.deductions || 0);
    await createPayroll({
      employee_id: form.employee_id,
      basic_salary: base,
      allowances: allow,
      deductions: ded,
      net_salary: base + allow - ded,
      payment_date: form.payment_date || null,
    });
    setForm({ employee_id: '', basic_salary: '', allowances: 0, deductions: 0, payment_date: '' });
    load();
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
        const net = parseFloat(values.basic_salary || 0) + parseFloat(values.allowances || 0) - parseFloat(values.deductions || 0);
        await updatePayroll(payroll.payroll_id, { ...values, net_salary: net });
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
        <h1 className="page-h1">Payroll (Salary & Payslips)</h1>
      </div>
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Generate Payslip</div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSubmit}>
              <label className="form-label">Target Employee</label>
              <select className="input" value={form.employee_id} onChange={(e) => setForm((prev) => ({ ...prev, employee_id: e.target.value }))} required>
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.employee_name} (ID: {emp.employee_id})
                  </option>
                ))}
              </select>
              <label className="form-label">Basic Salary</label>
              <input className="input" type="number" value={form.basic_salary} onChange={(e) => setForm((prev) => ({ ...prev, basic_salary: e.target.value }))} required />
              <label className="form-label">Total Allowances</label>
              <input className="input" type="number" value={form.allowances} onChange={(e) => setForm((prev) => ({ ...prev, allowances: e.target.value }))} />
              <label className="form-label">Total Deductions</label>
              <input className="input" type="number" value={form.deductions} onChange={(e) => setForm((prev) => ({ ...prev, deductions: e.target.value }))} />
              <label className="form-label">Payment Date</label>
              <input className="input" type="date" value={form.payment_date} onChange={(e) => setForm((prev) => ({ ...prev, payment_date: e.target.value }))} />
              <button type="submit" className="btn btn-solid" style={{ width: '100%' }}>
                Generate Payslip
              </button>
            </form>
          </div>
        </div>
        <div className="panel">
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Emp ID</th>
                  <th>Basic</th>
                  <th>Net</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>
                      Loading payroll...
                    </td>
                  </tr>
                ) : payrolls.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>
                      No payroll records found.
                    </td>
                  </tr>
                ) : (
                  payrolls.map((payroll) => (
                    <tr key={payroll.payroll_id}>
                      <td>
                        {payroll.employee_id} ({payroll.Employee ? payroll.Employee.employee_name : 'N/A'})
                      </td>
                      <td>${payroll.basic_salary}</td>
                      <td>${payroll.net_salary}</td>
                      <td>{payroll.payment_date || 'N/A'}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ fontSize: 10, padding: '4px 8px', marginRight: 6 }}
                          onClick={async () => {
                            const res = await generatePayslip(payroll.payroll_id);
                            if (res?.message) alert(res.message);
                          }}
                        >
                          Generate Payslip
                        </button>
                        <button type="button" className="action-btn edit-btn" onClick={() => openEdit(payroll)}>
                          <i className="fas fa-edit" />
                        </button>
                        <button type="button" className="action-btn delete-btn" onClick={() => deletePayroll(payroll.payroll_id).then(load)}>
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
