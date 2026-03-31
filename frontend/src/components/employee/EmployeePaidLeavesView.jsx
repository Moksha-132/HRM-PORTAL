import React, { useEffect, useState } from 'react';
import { getLeaves } from '../../services/employeeService';

const EmployeePaidLeavesView = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  const months = [
    'January 2026', 'February 2026', 'March 2026', 'April 2026', 
    'May 2026', 'June 2026', 'July 2026', 'August 2026', 
    'September 2026', 'October 2026', 'November 2026', 'December 2026'
  ];

  const load = async () => {
    setLoading(true);
    try {
      const res = await getLeaves();
      if (res.success) setLeaves(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const calculateMonthly = (monthYear, type) => {
    const [monthName, yearStr] = monthYear.split(' ');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return leaves
      .filter(l => {
        if (l.status === 'Rejected') return false;
        if (l.leave_type !== type) return false;
        const d = new Date(l.start_date);
        return monthNames[d.getMonth()] === monthName && d.getFullYear().toString() === yearStr;
      })
      .reduce((sum, l) => {
        const s = new Date(l.start_date);
        const e = new Date(l.end_date);
        const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
        return sum + (diff > 0 ? diff : 0);
      }, 0);
  };

  return (
    <div className="view">
      <div className="breadcrumb">
        <span>Dashboard</span>
        <span>Leaves</span>
        <span>Paid Leaves</span>
      </div>
      <div className="page-header">
        <h1 className="page-h1">Paid Leaves</h1>
      </div>
      <div className="panel" style={{ border: 'none', boxShadow: 'none' }}>
        <div className="table-wrap" style={{ padding: 0 }}>
          <table className="leave-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left' }}>Month</th>
                <th style={{ padding: '16px' }}>Annual Leave</th>
                <th style={{ padding: '16px' }}>Sick Leave</th>
                <th style={{ padding: '16px' }}>Casual Leave</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
              ) : months.map(month => (
                <tr key={month}>
                  <td style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>{month}</td>
                  <td style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>{calculateMonthly(month, 'Annual Leave')}</td>
                  <td style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>{calculateMonthly(month, 'Sick Leave')}</td>
                  <td style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>{calculateMonthly(month, 'Casual Leave')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeePaidLeavesView;
