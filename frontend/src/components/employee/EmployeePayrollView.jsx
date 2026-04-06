import React, { useEffect, useMemo, useState } from 'react';
import { getMyIncrementPromotions, getMyPayroll, getMyPrePayments, getPayslips } from '../../services/employeeService';

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

const EmployeePayrollView = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [prePayments, setPrePayments] = useState([]);
  const [increments, setIncrements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [payrollRes, payRes, preRes, incRes] = await Promise.all([
          getMyPayroll(),
          getPayslips(),
          getMyPrePayments(),
          getMyIncrementPromotions(),
        ]);
        if (!active) return;
        if (payrollRes.success) setPayrolls(payrollRes.data || []);
        if (payRes.success) setPayslips(payRes.data || []);
        if (preRes.success) setPrePayments(preRes.data || []);
        if (incRes.success) setIncrements(incRes.data || []);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const payslipByPayrollId = useMemo(() => {
    const map = new Map();
    payslips.forEach((slip) => {
      map.set(String(slip.payroll_id), slip);
    });
    return map;
  }, [payslips]);

  const payrollSummary = useMemo(() => {
    const approvedPrePayments = prePayments.filter((item) => item.status === 'Approved');
    const latestApprovedIncrement = increments
      .filter((item) => item.status === 'Approved')
      .sort((a, b) => new Date(b.effective_date || b.created_at || 0) - new Date(a.effective_date || a.created_at || 0))[0];

    return {
      approvedAdvanceTotal: approvedPrePayments
        .filter((item) => item.payment_type === 'Advance')
        .reduce((sum, item) => sum + toAmount(item.amount), 0),
      approvedExtraTotal: approvedPrePayments
        .filter((item) => item.payment_type !== 'Advance')
        .reduce((sum, item) => sum + toAmount(item.amount), 0),
      latestApprovedIncrement,
    };
  }, [increments, prePayments]);

  const filteredPayrolls = useMemo(() => {
    if (statusFilter === 'All') return payrolls;
    return payrolls.filter((item) => item.status === statusFilter);
  }, [payrolls, statusFilter]);

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">My Payroll History</h1>
      </div>

      <div className="grid grid-3" style={{ padding: 0, marginBottom: 20 }}>
        <div className="panel">
          <div className="panel-head"><div className="panel-title">Approved Advances</div></div>
          <div className="panel-body" style={{ fontSize: 22, fontWeight: 700 }}>{formatCurrency(payrollSummary.approvedAdvanceTotal)}</div>
        </div>
        <div className="panel">
          <div className="panel-head"><div className="panel-title">Approved Bonuses / Others</div></div>
          <div className="panel-body" style={{ fontSize: 22, fontWeight: 700 }}>{formatCurrency(payrollSummary.approvedExtraTotal)}</div>
        </div>
        <div className="panel">
          <div className="panel-head"><div className="panel-title">Latest Approved Increment</div></div>
          <div className="panel-body" style={{ color: '#334155' }}>
            {payrollSummary.latestApprovedIncrement ? (
              <>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(payrollSummary.latestApprovedIncrement.new_salary)}</div>
                <div>{payrollSummary.latestApprovedIncrement.change_type}</div>
                <div>{payrollSummary.latestApprovedIncrement.new_designation || 'Designation unchanged'}</div>
              </>
            ) : 'No approved increment or promotion yet.'}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Payroll Status</div>
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="table-wrap" style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Period</th>
                <th>Basic</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Net Pay</th>
                <th>Status</th>
                <th>Paid On</th>
                <th>Document</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center' }}>Loading payroll...</td></tr>
              ) : filteredPayrolls.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center' }}>No payroll records available</td></tr>
              ) : (
                filteredPayrolls.map((payroll) => {
                  const slip = payslipByPayrollId.get(String(payroll.payroll_id));
                  return (
                    <tr key={payroll.payroll_id}>
                      <td>{payroll.payment_date || 'N/A'}</td>
                      <td>{formatCurrency(payroll.basic_salary)}</td>
                      <td>{formatCurrency(payroll.allowances)}</td>
                      <td>{formatCurrency(payroll.deductions)}</td>
                      <td>{formatCurrency(payroll.net_salary)}</td>
                      <td><span className={statusBadgeClass(payroll.status)}>{payroll.status || 'Pending'}</span></td>
                      <td>{payroll.payment_date || 'N/A'}</td>
                      <td>
                        {slip ? (
                          <a
                            className="btn btn-outline"
                            style={{ fontSize: 11, padding: '4px 8px', textDecoration: 'none' }}
                            href={`/api/v1/employee/payslips/${slip.payslip_id}/download?token=${sessionStorage.getItem('shnoor_token') || localStorage.getItem('shnoor_token')}`}
                          >
                            Download
                          </a>
                        ) : (
                          <span style={{ color: '#64748b', fontSize: 12 }}>Not available</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeePayrollView;
