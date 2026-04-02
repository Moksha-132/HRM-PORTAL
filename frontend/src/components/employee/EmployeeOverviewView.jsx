import React, { useEffect, useState } from 'react';
import { 
  getEmployeeDashboard, 
  getAttendanceHistory, 
  getLeaves, 
  getAppreciations, 
  getExpenses, 
  getHolidays, 
  getAssets, 
  getPolicies 
} from '../../services/employeeService';

const EmployeeOverviewView = () => {
  const [data, setData] = useState({
    dashboard: null,
    attendance: [],
    leaves: [],
    appreciations: [],
    expenses: [],
    holidays: [],
    assets: [],
    policies: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const loadAll = async () => {
      setLoading(true);
      try {
        const [
          dashboardRes,
          attendanceRes,
          leavesRes,
          appreciationsRes,
          expensesRes,
          holidaysRes,
          assetsRes,
          policiesRes
        ] = await Promise.all([
          getEmployeeDashboard().catch(() => ({ success: false })),
          getAttendanceHistory().catch(() => ({ success: false })),
          getLeaves().catch(() => ({ success: false })),
          getAppreciations().catch(() => ({ success: false })),
          getExpenses().catch(() => ({ success: false })),
          getHolidays().catch(() => ({ success: false })),
          getAssets().catch(() => ({ success: false })),
          getPolicies().catch(() => ({ success: false }))
        ]);

        if (active) {
          setData({
            dashboard: dashboardRes.success ? dashboardRes.data : null,
            attendance: attendanceRes.success ? (attendanceRes.data || []) : [],
            leaves: leavesRes.success ? (leavesRes.data || []) : [],
            appreciations: appreciationsRes.success ? (appreciationsRes.data || []) : [],
            expenses: expensesRes.success ? (expensesRes.data || []) : [],
            holidays: holidaysRes.success ? (holidaysRes.data || []) : [],
            assets: assetsRes.success ? (assetsRes.data || []) : [],
            policies: policiesRes.success ? (policiesRes.data || []) : []
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    loadAll();
    return () => { active = false; };
  }, []);

  // Compute calculated metrics securely
  const empProfile = data.dashboard?.employee || {};
  
  // Attendance metrics
  const uniqueDates = Array.from(new Set(data.attendance.map(a => a.date)));
  const totalAttendanceDays = uniqueDates.length;
  
  const presentDays = Array.from(new Set(
    data.attendance
      .filter(a => a.clock_out !== null)
      .map(a => a.date)
  )).length;

  // Let's count "late" as any day having its *first* clock_in after 10:00 AM
  const lateAttendance = uniqueDates.filter(date => {
      const dayRecords = data.attendance.filter(a => a.date === date && a.clock_in);
      if (dayRecords.length === 0) return false;
      // Sort to find the first clock-in of the day
      const firstClockIn = dayRecords.sort((a, b) => new Date(a.clock_in) - new Date(b.clock_in))[0];
      const d = new Date(firstClockIn.clock_in);
      return d.getHours() >= 10 && d.getMinutes() > 0;
  }).length;

  // Working Hours (summing work_duration if available)
  const totalWorkTime = data.attendance.reduce((sum, a) => sum + (parseFloat(a.work_duration) || 0), 0);
  const totalOfficeTime = totalWorkTime + (totalAttendanceDays * 0.5); // Padding based on unique days
  const totalLateTime = lateAttendance * 0.5; // Example scalar for late mapping 

  // Leaves
  const totalLeaves = data.leaves.length;
  const approvedLeaves = data.leaves.filter(l => l.status === 'Approved').length;
  const rejectedLeaves = data.leaves.filter(l => l.status === 'Rejected').length;
  const pendingLeaves = data.leaves.filter(l => l.status === 'Pending').length;

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
  const nextHoliday = validHolidays[0] || null;

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Employee Dashboard</h1>
        <p className="page-sub">Comprehensive overview of your profile, attendance, and metrics</p>
      </div>

      {loading && <div style={{ marginBottom: 20 }}>Loading dashboard data...</div>}

      {/* 1. Employee Information */}
         <div className="panel mb" style={{ marginBottom: 24, padding: 24, background: 'color-mix(in srgb, var(--card-bg) 88%, var(--bg) 12%)', borderLeft: '4px solid var(--primary)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 16, color: 'var(--text)' }}>Employee Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div><small style={{ color: 'var(--text-light)' }}>Name</small><div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{empProfile.name || 'N/A'}</div></div>
                <div><small style={{ color: 'var(--text-light)' }}>Department</small><div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{empProfile.department || 'N/A'}</div></div>
                <div><small style={{ color: 'var(--text-light)' }}>Designation</small><div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{empProfile.designation || 'N/A'}</div></div>
                <div><small style={{ color: 'var(--text-light)' }}>Joined Date</small><div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{empProfile.joining_date || 'N/A'}</div></div>
        </div>
      </div>

      {/* 2 & 3. Attendance Details & Leave Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="panel" style={{ margin: 0 }}>
             <div className="panel-head"><div className="panel-title">Attendance Details</div></div>
             <div className="panel-body">
                 <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '8px 0' }}><span>Total Record Days:</span> <strong>{totalAttendanceDays}</strong></div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '8px 0' }}><span>Present Days:</span> <strong>{presentDays}</strong></div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '8px 0' }}><span>Late Attendance Count:</span> <strong style={{color: lateAttendance > 0 ? '#ef4444' : '#10b981'}}>{lateAttendance}</strong></div>
             </div>
        </div>
        
        <div className="panel" style={{ margin: 0 }}>
             <div className="panel-head"><div className="panel-title">Leave Details</div></div>
             <div className="panel-body">
                 <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '8px 0' }}><span>Total Leaves Applied:</span> <strong>{totalLeaves}</strong></div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '8px 0' }}><span>Approved Leaves:</span> <strong style={{color: '#10b981'}}>{approvedLeaves}</strong></div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '8px 0' }}><span>Pending Leaves:</span> <strong style={{color: '#f59e0b'}}>{pendingLeaves}</strong></div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '8px 0' }}><span>Rejected Leaves:</span> <strong style={{color: '#ef4444'}}>{rejectedLeaves}</strong></div>
             </div>
        </div>
      </div>

      {/* 4. Combined Section (Single Row Layout: Appreciations, Expenses) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '24px' }}>
         <div className="stat-card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
            <div className="stat-val" style={{ color: '#166534' }}>{data.appreciations.length}</div>
            <div className="stat-label" style={{ color: '#166534' }}>Total Appreciations</div>
         </div>
         <div className="stat-card" style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
            <div className="stat-val" style={{ color: '#991b1b' }}>{data.expenses.length}</div>
            <div className="stat-label" style={{ color: '#991b1b' }}>Expenses Submitted</div>
         </div>
      </div>

      {/* 5. Working Hours Summary */}
      <div className="panel" style={{ marginBottom: '24px' }}>
          <div className="panel-head"><div className="panel-title">Working Hours Summary</div></div>
          <div className="panel-body" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
             <div style={{ flex: 1, minWidth: 200, padding: 16, background: '#f1f5f9', borderRadius: 8, textAlign: 'center' }}>
                 <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#334155' }}>{totalWorkTime.toFixed(1)} hrs</div>
                 <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Work Time</div>
             </div>
             <div style={{ flex: 1, minWidth: 200, padding: 16, background: '#f8fafc', borderRadius: 8, textAlign: 'center' }}>
                 <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#334155' }}>{totalOfficeTime.toFixed(1)} hrs</div>
                 <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Office Time (Est.)</div>
             </div>
             <div style={{ flex: 1, minWidth: 200, padding: 16, background: '#fef2f2', borderRadius: 8, textAlign: 'center' }}>
                 <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#991b1b' }}>{totalLateTime.toFixed(1)} hrs</div>
                 <div style={{ fontSize: '0.85rem', color: '#dc2626' }}>Total Late Penalty Time (Est.)</div>
             </div>
          </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
         {/* 6. Appreciation Box */}
         <div className="panel" style={{ margin: 0 }}>
            <div className="panel-head"><div className="panel-title">Appreciation Wall</div></div>
            <div className="panel-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
               {data.appreciations.length > 0 ? data.appreciations.map(a => (
                  <div key={a.appreciation_id} style={{ padding: '12px', background: '#eff6ff', borderLeft: '3px solid #3b82f6', marginBottom: 12, borderRadius: '0 8px 8px 0' }}>
                     <div style={{ fontWeight: 600, color: '#1e3a8a', marginBottom: 4 }}>{a.title}</div>
                     <div style={{ fontSize: '0.85rem', color: '#475569' }}>{a.summary || 'Recognition award'} - {new Date(a.date).toLocaleDateString()}</div>
                  </div>
               )) : <div style={{ color: '#64748b' }}>No appreciations yet. Keep up the good work!</div>}
            </div>
         </div>

         {/* 8. Assigned Assets */}
         <div className="panel" style={{ margin: 0 }}>
            <div className="panel-head"><div className="panel-title">Assigned Assets</div></div>
            <div className="panel-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
               {data.assets.length > 0 ? data.assets.map(a => {
                  let badgeColor = a.status === 'Assigned' || a.status === 'In Use' ? '#3b82f6' : '#64748b';
                  let displayStatus = a.status === 'Assigned' ? 'In Use' : (a.status || 'Not Returned');
                  if (a.status === 'Returned') { badgeColor = '#10b981'; displayStatus = 'Returned'; }

                  return (
                     <div key={a.asset_id} style={{ padding: '12px', border: '1px solid #e2e8f0', marginBottom: 12, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                           <div style={{ fontWeight: 600, color: '#0f172a' }}>{a.asset_name}</div>
                           <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Type: {a.asset_type} | Serial: {a.serial_number}</div>
                        </div>
                        <span style={{ 
                           background: `${badgeColor}15`, 
                           color: badgeColor, 
                           padding: '4px 10px', 
                           borderRadius: 12, 
                           fontSize: '0.85rem', 
                           fontWeight: 600 
                        }}>
                           {displayStatus}
                        </span>
                     </div>
                  );
               }) : <div style={{ color: '#64748b' }}>No assets currently assigned to you.</div>}
            </div>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
         {/* 7. Holidays Section */}
         <div className="panel" style={{ margin: 0 }}>
            <div className="panel-head"><div className="panel-title">Holiday Calendar</div></div>
            <div className="table-wrap" style={{ maxHeight: '300px', overflowY: 'auto' }}>
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
                           <td style={{ padding: '12px', fontWeight: 500, color: '#0f172a' }}>{h.holiday_name || h.name || 'Company Holiday'}</td>
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

         {/* 9. Additional Information */}
         <div className="panel" style={{ margin: 0 }}>
            <div className="panel-head"><div className="panel-title">Additional Info</div></div>
            <div className="panel-body">
               <div style={{ marginBottom: 16 }}>
                  <strong style={{ display: 'block', marginBottom: 4 }}>Next Holiday</strong>
                  {nextHoliday ? (
                     <div style={{ color: '#3b82f6', fontWeight: 600, fontSize: '1.1rem' }}>{nextHoliday.holiday_name || nextHoliday.name || 'Upcoming Holiday'} - {new Date(nextHoliday.date).toLocaleDateString()}</div>
                  ) : <span style={{ color: '#64748b' }}>None</span>}
               </div>
               <div>
                  <strong style={{ display: 'block', marginBottom: 4 }}>Company Policies Overview</strong>
                  <ul style={{ paddingLeft: 20, color: '#475569', fontSize: '0.9rem' }}>
                     {data.policies.slice(0, 3).map(p => (
                        <li key={p.policy_id} style={{ marginBottom: 4 }}>{p.title} <a href={p.file_url} target="_blank" rel="noreferrer" style={{color: '#4f46e5', textDecoration: 'none'}}>(View)</a></li>
                     ))}
                  </ul>
                  {data.policies.length === 0 && <span style={{ color: '#64748b', fontSize: '0.9rem' }}>No policies uploaded yet.</span>}
               </div>
            </div>
         </div>
      </div>

    </div>
  );
};

export default EmployeeOverviewView;
