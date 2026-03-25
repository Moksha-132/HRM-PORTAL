import React, { useEffect, useState } from 'react';
import { getPayslips } from '../../services/employeeService';

const EmployeePayrollView = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getPayslips();
        if (active && res.success) setPayslips(res.data);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">My Payroll History</h1>
      </div>
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Payslips</div>
        </div>
        <div className="table-wrap" style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Month/Period</th>
                <th>Net Pay</th>
                <th>Paid On</th>
                <th>Document</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>
                    Loading payslips...
                  </td>
                </tr>
              ) : payslips.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>
                    No payslips available
                  </td>
                </tr>
              ) : (
                payslips.map((slip) => (
                  <tr key={slip.payslip_id || slip.payroll_id}>
                    <td>{slip.payment_date || 'N/A'}</td>
                    <td>${slip.net_salary}</td>
                    <td>{slip.payment_date || 'N/A'}</td>
                    <td>
                      <button className="btn btn-outline" style={{ fontSize: 11, padding: '4px 8px' }} type="button">
                        Download
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
  );
};

export default EmployeePayrollView;
