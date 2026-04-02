import React, { useEffect, useState } from 'react';
import { getMyIncrementPromotions } from '../../services/employeeService';

const EmployeeIncrementPromotionView = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMyIncrementPromotions();
      if (res.success) setRecords(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="view">
      <div className="page-header"><h1 className="page-h1">Increment / Promotion</h1></div>
      <div className="panel">
        <div className="table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Current Salary</th>
                <th>New Salary</th>
                <th>New Designation</th>
                <th>Effective Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center' }}>Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center' }}>No increment/promotion records found.</td></tr>
              ) : records.map((item) => (
                <tr key={item.increment_promotion_id}>
                  <td>{item.current_salary ? `₹${item.current_salary}` : '-'}</td>
                  <td>{item.new_salary ? `₹${item.new_salary}` : '-'}</td>
                  <td>{item.new_designation || '-'}</td>
                  <td>{item.effective_date || '-'}</td>
                  <td>
                    <span className={`badge ${item.status === 'Approved' ? 'bg-green' : item.status === 'Rejected' ? 'bg-red' : 'bg-yellow'}`}>
                      {item.status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeIncrementPromotionView;
