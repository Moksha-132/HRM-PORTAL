import React, { useEffect, useState } from 'react';
import { getHolidays } from '../../services/employeeService';

const EmployeeCalendarView = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getHolidays();
        if (active && res.success) setHolidays(res.data);
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
        <h1 className="page-h1">Holiday Calendar</h1>
      </div>
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Upcoming Holidays</div>
        </div>
        <div className="table-wrap" style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Holiday Event</th>
                <th>Date</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center' }}>
                    Loading holidays...
                  </td>
                </tr>
              ) : holidays.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center' }}>
                    No upcoming holidays
                  </td>
                </tr>
              ) : (
                holidays.map((holiday) => (
                  <tr key={holiday.id}>
                    <td>
                      <strong>{holiday.holiday_name}</strong>
                    </td>
                    <td>{holiday.date}</td>
                    <td>{holiday.description || ''}</td>
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

export default EmployeeCalendarView;
