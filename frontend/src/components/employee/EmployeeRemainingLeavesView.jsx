import React, { useEffect, useState } from 'react';
import { getLeaves } from '../../services/employeeService';

const EmployeeRemainingLeavesView = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  // Total Allotted Leaves
  const TOTALS = {
    'Annual Leave': 15,
    'Sick Leave': 12,
    'Casual Leave': 12
  };

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

  const calculateStats = (type) => {
    const stats = { approved: 0, pending: 0 };
    leaves.forEach(l => {
      if (l.leave_type === type) {
        const s = new Date(l.start_date);
        const e = new Date(l.end_date);
        const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
        const days = diff > 0 ? diff : 0;
        
        if (l.status === 'Approved') stats.approved += days;
        else if (l.status === 'Pending') stats.pending += days;
      }
    });
    return stats;
  };

  return (
    <div className="view">
      <div className="breadcrumb">
        <span>Dashboard</span>
        <span>Leaves</span>
        <span>Remaining Leaves</span>
      </div>
      <div className="page-header">
        <h1 className="page-h1">Remaining Leaves</h1>
      </div>
      <div className="panel" style={{ border: 'none', boxShadow: 'none' }}>
        <div className="table-wrap" style={{ padding: 0 }}>
          <table className="leave-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#fcfcfc' }}>
              <tr>
                <th style={{ padding: '20px 16px', textAlign: 'left', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Leave Type</th>
                <th style={{ padding: '20px 16px', textAlign: 'center', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Total Allotted</th>
                <th style={{ padding: '20px 16px', textAlign: 'center', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Used (Approved)</th>
                <th style={{ padding: '20px 16px', textAlign: 'center', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Applied (Pending)</th>
                <th style={{ padding: '20px 16px', textAlign: 'center', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Balance (Remaining)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading...</td></tr>
              ) : Object.keys(TOTALS).map(type => {
                const stats = calculateStats(type);
                const remaining = TOTALS[type] - (stats.approved + stats.pending);
                return (
                  <tr key={type} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '18px 16px', fontWeight: 700, color: '#1f2937' }}>{type}</td>
                    <td style={{ padding: '18px 16px', textAlign: 'center', color: '#4b5563' }}>{TOTALS[type]}</td>
                    <td style={{ padding: '18px 16px', textAlign: 'center', color: '#10b981', fontWeight: 600 }}>{stats.approved}</td>
                    <td style={{ padding: '18px 16px', textAlign: 'center', color: '#f59e0b', fontWeight: 600 }}>{stats.pending}</td>
                    <td style={{ padding: '18px 16px', textAlign: 'center' }}>
                      <span style={{ 
                        background: remaining > 0 ? '#eff6ff' : '#fee2e2', 
                        color: remaining > 0 ? '#1d4ed8' : '#b91c1c', 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}>
                        {remaining}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeRemainingLeavesView;
