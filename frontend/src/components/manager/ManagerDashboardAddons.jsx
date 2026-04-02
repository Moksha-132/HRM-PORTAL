import React, { useEffect, useMemo, useState } from 'react';
import {
  getAttendance,
  getEmployees,
  getLeaves,
  getAppreciations,
  getExpenses,
  getHolidays,
} from '../../services/managerService';

const formatHours = (value) => `${(Number(value) || 0).toFixed(1)} hrs`;

const ManagerDashboardAddons = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [appreciations, setAppreciations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    let active = true;

    const loadAddonsData = async () => {
      const [employeesRes, attendanceRes, leavesRes, appreciationsRes, expensesRes, holidaysRes] = await Promise.all([
        getEmployees().catch(() => ({ success: false })),
        getAttendance().catch(() => ({ success: false })),
        getLeaves().catch(() => ({ success: false })),
        getAppreciations().catch(() => ({ success: false })),
        getExpenses().catch(() => ({ success: false })),
        getHolidays().catch(() => ({ success: false })),
      ]);

      if (!active) return;

      setEmployees(employeesRes.success ? employeesRes.data || [] : []);
      setAttendance(attendanceRes.success ? attendanceRes.data || [] : []);
      setLeaves(leavesRes.success ? leavesRes.data || [] : []);
      setAppreciations(appreciationsRes.success ? appreciationsRes.data || [] : []);
      setExpenses(expensesRes.success ? expensesRes.data || [] : []);
      setHolidays(holidaysRes.success ? holidaysRes.data || [] : []);
    };

    loadAddonsData();

    return () => {
      active = false;
    };
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const attendanceToday = useMemo(
    () => attendance.filter((item) => item.date === today || (item.clock_in && item.clock_in.startsWith(today))),
    [attendance, today]
  );

  const presentToday = useMemo(() => new Set(attendanceToday.map((item) => item.employee_id)).size, [attendanceToday]);
  const totalEmployees = employees.length;
  const absentToday = Math.max(totalEmployees - presentToday, 0);

  const lateEntries = useMemo(
    () =>
      attendanceToday.filter((item) => {
        if (!item.clock_in) return false;
        const clockIn = new Date(item.clock_in);
        if (Number.isNaN(clockIn.getTime())) return false;
        return clockIn.getHours() > 10 || (clockIn.getHours() === 10 && clockIn.getMinutes() > 0);
      }).length,
    [attendanceToday]
  );

  const totalWorkedTime = useMemo(
    () => attendance.reduce((sum, item) => sum + (Number.parseFloat(item.work_duration) || 0), 0),
    [attendance]
  );

  const averageWorkingHours = useMemo(
    () => (attendance.length > 0 ? totalWorkedTime / attendance.length : 0),
    [attendance.length, totalWorkedTime]
  );

  const pendingLeaves = useMemo(
    () => leaves.filter((item) => (item.status || '').toLowerCase() === 'pending').length,
    [leaves]
  );

  const upcomingHolidays = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return holidays
      .filter((item) => {
        const holidayDate = new Date(item.date);
        if (Number.isNaN(holidayDate.getTime())) return false;
        holidayDate.setHours(0, 0, 0, 0);
        return holidayDate >= now;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  }, [holidays]);

  const activityStats = useMemo(
    () => [
      { label: 'Appreciations', icon: 'fas fa-award', count: appreciations.length },
      { label: 'Expenses', icon: 'fas fa-receipt', count: expenses.length },
    ],
    [appreciations.length, expenses.length]
  );

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-head"><div className="panel-title">Team Attendance Overview</div></div>
          <div className="panel-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <span>Total Employees</span>
              <strong>{totalEmployees}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <span>Present Today</span>
              <strong>{presentToday}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <span>Absent Today</span>
              <strong>{absentToday}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span>Late Entries</span>
              <strong>{lateEntries}</strong>
            </div>
          </div>
        </div>

        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-head"><div className="panel-title">Team Working Hours</div></div>
          <div className="panel-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <span>Average Working Hours</span>
              <strong>{formatHours(averageWorkingHours)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <span>Total Worked Time</span>
              <strong>{formatHours(totalWorkedTime)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span>Late Time Count</span>
              <strong>{lateEntries}</strong>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {activityStats.map((item) => (
          <div className="stat-card" key={item.label} style={{ margin: 0 }}>
            <div style={{ fontSize: '1.25rem', marginBottom: '8px' }}><i className={item.icon} aria-hidden="true" /></div>
            <div className="stat-val" style={{ fontSize: '1.6rem', marginBottom: '4px' }}>{item.count}</div>
            <div className="stat-label">{item.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-head"><div className="panel-title">Recent Activity</div></div>
          <div className="panel-body">
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569' }}>
              <li>Admin sent a message</li>
              <li>Leave request approved</li>
              <li>Employee added</li>
            </ul>
          </div>
        </div>

        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-head"><div className="panel-title">Upcoming Holidays</div></div>
          <div className="panel-body">
            {upcomingHolidays.length > 0 ? upcomingHolidays.map((item, index) => (
              <div key={`${item.holiday_id || item.date}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: index < upcomingHolidays.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <div style={{ color: 'var(--text)', fontWeight: 700 }}>{item.name || item.holiday_name || item.title || 'Holiday'}</div>
                  {item.description ? <div style={{ color: 'var(--text-light)', fontSize: '0.82rem', marginTop: 2 }}>{item.description}</div> : null}
                </div>
                <strong style={{ color: 'var(--primary-dark)', whiteSpace: 'nowrap' }}>{new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
              </div>
            )) : (
              <div style={{ color: '#64748b' }}>No upcoming holidays available.</div>
            )}
          </div>
        </div>

        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-head"><div className="panel-title">Pending Actions</div></div>
          <div className="panel-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <span>Leave approvals pending</span>
              <strong>{pendingLeaves}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span>Requests pending</span>
              <strong>0</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardAddons;
