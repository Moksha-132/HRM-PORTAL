import React, { useEffect, useMemo, useState } from 'react';
import {
  getAttendanceHistory,
  getAppreciations,
  getExpenses,
  getHolidays,
} from '../../services/employeeService';

const formatHours = (value) => `${(Number(value) || 0).toFixed(1)} hrs`;

const EmployeeDashboardAddons = () => {
  const [attendance, setAttendance] = useState([]);
  const [appreciations, setAppreciations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    let active = true;

    const loadAddonsData = async () => {
      const [attendanceRes, appreciationsRes, expensesRes, holidaysRes] = await Promise.all([
        getAttendanceHistory().catch(() => ({ success: false })),
        getAppreciations().catch(() => ({ success: false })),
        getExpenses().catch(() => ({ success: false })),
        getHolidays().catch(() => ({ success: false })),
      ]);

      if (!active) return;

      setAttendance(attendanceRes.success ? attendanceRes.data || [] : []);
      setAppreciations(appreciationsRes.success ? appreciationsRes.data || [] : []);
      setExpenses(expensesRes.success ? expensesRes.data || [] : []);
      setHolidays(holidaysRes.success ? holidaysRes.data || [] : []);
    };

    loadAddonsData();

    return () => {
      active = false;
    };
  }, []);

  const uniqueDates = useMemo(() => Array.from(new Set(attendance.map(a => a.date))), [attendance]);

  const lateAttendanceCount = useMemo(
    () =>
      uniqueDates.filter((date) => {
        const dayRecords = attendance.filter(a => a.date === date && a.clock_in);
        if (dayRecords.length === 0) return false;
        // Find the first clock-in of the day
        const firstClockIn = dayRecords.sort((a, b) => new Date(a.clock_in) - new Date(b.clock_in))[0];
        const clockIn = new Date(firstClockIn.clock_in);
        return clockIn.getHours() > 10 || (clockIn.getHours() === 10 && clockIn.getMinutes() > 0);
      }).length,
    [uniqueDates, attendance]
  );

  const halfDaysCount = useMemo(
    () => attendance.filter((item) => {
      const workDuration = Number.parseFloat(item.work_duration || 0);
      return workDuration > 0 && workDuration < 4;
    }).length,
    [attendance]
  );

  const totalWorkedTime = useMemo(
    () => attendance.reduce((sum, item) => sum + (Number.parseFloat(item.work_duration) || 0), 0),
    [attendance]
  );

  const totalOfficeTime = useMemo(
    () => totalWorkedTime + uniqueDates.length * 0.5,
    [uniqueDates.length, totalWorkedTime]
  );

  const lateTime = useMemo(() => lateAttendanceCount * 0.5, [lateAttendanceCount]);

  const upcomingHolidays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return holidays
      .filter((item) => {
        const holidayDate = new Date(item.date);
        if (Number.isNaN(holidayDate.getTime())) return false;
        holidayDate.setHours(0, 0, 0, 0);
        return holidayDate >= today;
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
          <div className="panel-head"><div className="panel-title">Attendance Add-on Summary</div></div>
          <div className="panel-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <span>Late Attendance Count</span>
              <strong>{lateAttendanceCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span>Half Days Count</span>
              <strong>{halfDaysCount}</strong>
            </div>
          </div>
        </div>

        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-head"><div className="panel-title">Working Hours Details</div></div>
          <div className="panel-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <span>Total Office Time</span>
              <strong>{formatHours(totalOfficeTime)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <span>Total Worked Time</span>
              <strong>{formatHours(totalWorkedTime)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span>Late Time</span>
              <strong>{formatHours(lateTime)}</strong>
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
          <div className="panel-head"><div className="panel-title">Upcoming Holidays</div></div>
          <div className="panel-body">
            {upcomingHolidays.length > 0 ? upcomingHolidays.map((item, index) => (
              <div key={`${item.holiday_id || item.date}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: index < upcomingHolidays.length - 1 ? '1px solid #eee' : 'none' }}>
                <span>{item.holiday_name || item.name || 'Holiday'}</span>
                <strong>{new Date(item.date).toLocaleDateString()}</strong>
              </div>
            )) : (
              <div style={{ color: '#64748b' }}>No upcoming holidays available.</div>
            )}
          </div>
        </div>

        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-head"><div className="panel-title">Assigned Tasks</div></div>
          <div className="panel-body">
            <div style={{ color: '#64748b' }}>No tasks assigned</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboardAddons;
