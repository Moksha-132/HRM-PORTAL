import React, { useEffect, useState } from 'react';
import { 
  getManagerDashboard, 
  getEmployees,
  getAttendance,
  getLeaves,
  getAppreciations,
  getPayroll,
  getAssets,
  getPolicies,
  getHolidays 
} from '../../services/managerService';

const ManagerOverviewView = () => {
  const [data, setData] = useState({
    dashboard: null,
    employees: [],
    attendance: [],
    leaves: [],
    appreciations: [],
    payrolls: [],
    assets: [],
    policies: [],
    holidays: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const loadAll = async () => {
      setLoading(true);
      try {
        const [
          dashRes, empRes, attRes, leavesRes, appRes, payRes, assetRes, polRes, holRes
        ] = await Promise.all([
          getManagerDashboard().catch(() => ({ success: false })),
          getEmployees().catch(() => ({ success: false })),
          getAttendance().catch(() => ({ success: false })),
          getLeaves().catch(() => ({ success: false })),
          getAppreciations().catch(() => ({ success: false })),
          getPayroll().catch(() => ({ success: false })),
          getAssets().catch(() => ({ success: false })),
          getPolicies().catch(() => ({ success: false })),
          getHolidays().catch(() => ({ success: false }))
        ]);

        if (active) {
          setData({
            dashboard: dashRes.success ? dashRes.data : null,
            employees: empRes.success ? (empRes.data || []) : [],
            attendance: attRes.success ? (attRes.data || []) : [],
            leaves: leavesRes.success ? (leavesRes.data || []) : [],
            appreciations: appRes.success ? (appRes.data || []) : [],
            payrolls: payRes.success ? (payRes.data || []) : [],
            assets: assetRes.success ? (assetRes.data || []) : [],
            policies: polRes.success ? (polRes.data || []) : [],
            holidays: holRes.success ? (holRes.data || []) : []
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    loadAll();
    return () => { active = false; };
  }, []);

  // 1. Manager Info (derived from session)
  const managerEmail = sessionStorage.getItem('shnoor_email') || sessionStorage.getItem('shnoor_admin_email') || 'Manager';
  const managerName = sessionStorage.getItem('shnoor_name') || managerEmail.split('@')[0];

  // Calculations for today
  const today = new Date().toISOString().split('T')[0];

  // 2. Attendance Overview
  const totalEmployeesCount = data.dashboard?.totalEmployees || 0;
  const activeEmployeesCount = data.dashboard?.activeEmployees || 0;

  // 3. Employee Status List
  // We identify who is present today
  const todaysAttendanceRecords = data.attendance.filter(a => a.date === today || (a.clock_in && a.clock_in.startsWith(today)));
  const presentEmpIds = new Set(todaysAttendanceRecords.map(a => a.employee_id));
  
  const employeeStatusList = data.employees.map(emp => {
    return {
       ...emp,
       isPresent: presentEmpIds.has(emp.employee_id)
    };
  });

  // 4. Leave Details
  const activeLeavesToday = data.leaves.filter(l => {
      if(l.status !== 'Approved') return false;
      const start = new Date(l.start_date);
      const end = new Date(l.end_date);
      const now = new Date();
      return now >= start && now <= end;
  });
  const employeesOnLeaveCount = new Set(activeLeavesToday.map(l => l.employee_id)).size;
  const totalLeavesCount = data.leaves.length;
  const approvedLeavesCount = data.leaves.filter(l => l.status === 'Approved').length;
  const rejectedLeavesCount = data.leaves.filter(l => l.status === 'Rejected').length;

   const todayStart = new Date();
   todayStart.setHours(0, 0, 0, 0);
   const validHolidays = data.holidays
      .filter(h => {
         const holidayDate = new Date(h.date);
         if (Number.isNaN(holidayDate.getTime())) return false;
         holidayDate.setHours(0, 0, 0, 0);
         return holidayDate >= todayStart;
      })
      .sort((a,b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Manager Dashboard</h1>
        <p className="page-sub">Comprehensive overview of team performance, attendance, and assets</p>
      </div>

      {loading && <div style={{ marginBottom: 20 }}>Loading dashboard data...</div>}

      {/* 1. Manager Information */}
      <div className="panel mb" style={{ marginBottom: 24, padding: 24, background: 'linear-gradient(135deg, #f8fafc, #ffffff)', borderLeft: '4px solid #4f46e5' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Manager Profile</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
           <div><small style={{ color: '#64748b' }}>Name</small><div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{managerName}</div></div>
           <div><small style={{ color: '#64748b' }}>Email</small><div style={{ fontWeight: 600 }}>{managerEmail}</div></div>
           <div><small style={{ color: '#64748b' }}>Role Context</small><div style={{ fontWeight: 600 }}>Team Manager / Supervisor</div></div>
        </div>
      </div>

      {/* 2 & 4. Employee Attendance Overview & Leave Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="panel" style={{ margin: 0 }}>
             <div className="panel-head"><div className="panel-title">Workforce & Attendance Overview</div></div>
             <div className="panel-body">
                 <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '8px 0' }}><span>Total Employees:</span> <strong>{totalEmployeesCount}</strong></div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '8px 0' }}><span>Active Roster:</span> <strong style={{color: '#10b981'}}>{activeEmployeesCount}</strong></div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '8px 0' }}><span>Present Today:</span> <strong style={{color: '#3b82f6'}}>{presentEmpIds.size}</strong></div>
             </div>
        </div>
        
        <div className="panel" style={{ margin: 0 }}>
             <div className="panel-head"><div className="panel-title">Leave Statistics</div></div>
             <div className="panel-body">
                 <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '8px 0' }}><span>Employees on Leave Today:</span> <strong style={{color: '#f59e0b'}}>{employeesOnLeaveCount}</strong></div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '8px 0' }}><span>Total Leave Requests:</span> <strong>{totalLeavesCount}</strong></div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '8px 0' }}><span>Approved Historical:</span> <strong style={{color: '#10b981'}}>{approvedLeavesCount}</strong></div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '8px 0' }}><span>Rejected Historical:</span> <strong style={{color: '#ef4444'}}>{rejectedLeavesCount}</strong></div>
             </div>
        </div>
      </div>

      {/* 3. Employee Status List */}
      <div className="panel" style={{ marginBottom: '24px' }}>
         <div className="panel-head"><div className="panel-title">Today's Employee Status</div></div>
         <div className="table-wrap" style={{ maxHeight: 300, overflowY: 'auto' }}>
           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                 <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Employee Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Department</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Current Status</th>
                 </tr>
              </thead>
              <tbody>
                 {employeeStatusList.length > 0 ? employeeStatusList.map(emp => (
                    <tr key={emp.employee_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                       <td style={{ padding: '12px 16px', fontWeight: 500 }}>{emp.employee_name}</td>
                       <td style={{ padding: '12px 16px', color: '#64748b' }}>{emp.department || 'N/A'}</td>
                       <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <span style={{ 
                             padding: '4px 10px', 
                             borderRadius: '12px', 
                             fontSize: '0.8rem', 
                             fontWeight: 600,
                             background: emp.isPresent || emp.status === 'Active' ? '#dcfce7' : '#fee2e2', 
                             color: emp.isPresent || emp.status === 'Active'  ? '#166534' : '#991b1b' 
                          }}>
                             {emp.isPresent ? 'Present' : (emp.status === 'Active' ? 'Absent (Active)' : 'Inactive')}
                          </span>
                       </td>
                    </tr>
                 )) : <tr><td colSpan="3" style={{ padding: 16, textAlign: 'center', color: '#64748b' }}>No employees found in your scope.</td></tr>}
              </tbody>
           </table>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
         {/* 5. Appreciation Details */}
         <div className="panel" style={{ margin: 0 }}>
            <div className="panel-head"><div className="panel-title">Team Appreciations</div></div>
            <div className="panel-body" style={{ maxHeight: '250px', overflowY: 'auto' }}>
               {data.appreciations.length > 0 ? data.appreciations.slice(0, 10).map(a => (
                  <div key={a.appreciation_id} style={{ padding: '12px', background: '#eff6ff', borderLeft: '3px solid #3b82f6', marginBottom: 12, borderRadius: '0 8px 8px 0' }}>
                     <div style={{ fontWeight: 600, color: '#1e3a8a', marginBottom: 4 }}>{a.Employee?.employee_name || 'Team Member'}</div>
                     <div style={{ fontSize: '0.85rem', color: '#475569' }}>{a.title} - {new Date(a.date).toLocaleDateString()}</div>
                  </div>
               )) : <div style={{ color: '#64748b' }}>No appreciations recorded recently.</div>}
            </div>
         </div>

         {/* 6. Recent Payrolls */}
         <div className="panel" style={{ margin: 0 }}>
            <div className="panel-head"><div className="panel-title">Recent Payrolls Processed</div></div>
            <div className="panel-body" style={{ maxHeight: '250px', overflowY: 'auto' }}>
               {data.payrolls.length > 0 ? data.payrolls.slice(0, 10).map(p => {
                  const paymentDateStr = p.payment_date ? new Date(p.payment_date).toLocaleDateString() : 'Pending';
                  const amount = p.net_salary ? parseFloat(p.net_salary).toFixed(2) : (p.basic_salary ? parseFloat(p.basic_salary).toFixed(2) : '0.00');
                  
                  const computedStatus = p.payment_date ? 'Paid' : 'Pending';
                  const statusBg = computedStatus === 'Paid' ? '#dcfce7' : '#fef9c3';
                  const statusColor = computedStatus === 'Paid' ? '#166534' : '#854d0e';
                  
                  return (
                     <div key={p.payroll_id} style={{ padding: '12px', border: '1px solid #e2e8f0', marginBottom: 12, borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                           <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.Employee?.employee_name || 'Employee'}</div>
                           <div style={{ fontWeight: 700, color: '#15803d', fontSize: '1.1rem' }}>${amount}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                           <span style={{ color: '#475569' }}>Paid on: {paymentDateStr}</span>
                           <span style={{ 
                              background: statusBg, 
                              color: statusColor, 
                              padding: '2px 8px', 
                              borderRadius: '12px', 
                              fontWeight: 600 
                           }}>
                              {computedStatus}
                           </span>
                        </div>
                     </div>
                  );
               }) : <div style={{ color: '#64748b' }}>No payroll data available.</div>}
            </div>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
         {/* 7. Recently Assigned Assets */}
         <div className="panel" style={{ margin: 0 }}>
            <div className="panel-head"><div className="panel-title">Recently Assigned Assets</div></div>
            <div className="panel-body" style={{ maxHeight: '250px', overflowY: 'auto' }}>
               {data.assets.length > 0 ? data.assets.slice(0, 5).map(a => {
                  let badgeColor = a.status === 'Assigned' || a.status === 'In Use' ? '#3b82f6' : '#64748b';
                  let displayStatus = a.status === 'Assigned' ? 'In Use' : (a.status || 'Not Returned');
                  if (a.status === 'Returned') { badgeColor = '#10b981'; displayStatus = 'Returned'; }
                  return (
                     <div key={a.asset_id} style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                           <div style={{ fontWeight: 600 }}>{a.asset_name}</div>
                           <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Type: {a.asset_type}</div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.9rem' }}>
                           <div style={{ color: '#4f46e5', fontWeight: 500, marginBottom: '4px' }}>{a.Employee?.employee_name || 'Unassigned'}</div>
                           <span style={{ 
                              background: badgeColor + '20', 
                              color: badgeColor, 
                              padding: '2px 8px', 
                              borderRadius: '12px', 
                              fontSize: '0.75rem', 
                              fontWeight: 700 
                           }}>
                              {displayStatus}
                           </span>
                        </div>
                     </div>
                  );
               }) : <div style={{ color: '#64748b' }}>No assets tracked.</div>}
            </div>
         </div>

         {/* 8. Policies */}
         <div className="panel" style={{ margin: 0 }}>
            <div className="panel-head"><div className="panel-title">Company Policies</div></div>
            <div className="panel-body">
               <div style={{ marginBottom: 24 }}>
                  <ul style={{ paddingLeft: 20, color: '#475569', fontSize: '0.9rem' }}>
                     {data.policies.slice(0, 5).map(p => (
                        <li key={p.policy_id} style={{ marginBottom: 4 }}>{p.title} <a href={p.file_url} target="_blank" rel="noreferrer" style={{color: '#4f46e5', textDecoration: 'none'}}>(View)</a></li>
                     ))}
                  </ul>
                  {data.policies.length === 0 && <span style={{ color: '#64748b', fontSize: '0.9rem' }}>No policies uploaded.</span>}
               </div>
            </div>
         </div>

         {/* 9. Holiday Calendar */}
         <div className="panel" style={{ margin: 0 }}>
            <div className="panel-head"><div className="panel-title">Holiday Calendar</div></div>
            <div className="table-wrap" style={{ maxHeight: '250px', overflowY: 'auto' }}>
               <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem'}}>
                  <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                     <tr>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Holiday Name</th>
                        <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Date</th>
                     </tr>
                  </thead>
                  <tbody>
                     {validHolidays.map(h => (
                        <tr key={h.holiday_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                           <td style={{ padding: '12px', fontWeight: 500, color: '#0f172a' }}>{h.holiday_name || h.name || 'Holiday'}</td>
                           <td style={{ padding: '12px', textAlign: 'right', color: '#3b82f6', fontWeight: 600 }}>
                              {new Date(h.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                           </td>
                        </tr>
                     ))}
                     {validHolidays.length === 0 && <tr><td colSpan="2" style={{textAlign: 'center', padding: '16px', color: '#64748b'}}>No upcoming holidays left this year.</td></tr>}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

    </div>
  );
};

export default ManagerOverviewView;
