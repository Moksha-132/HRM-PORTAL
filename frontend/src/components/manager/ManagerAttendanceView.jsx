import React, { useEffect, useRef, useState } from 'react';
import EditModal from '../EditModal';
import { createAttendance, deleteAttendance, getAttendance, getEmployees, updateAttendance } from '../../services/managerService';

const ManagerAttendanceView = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    employee_id: '',
    date: '',
    clock_in: '',
    clock_out: '',
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalFields, setModalFields] = useState([]);
  const [modalTitle, setModalTitle] = useState('Edit Attendance');
  const [saving, setSaving] = useState(false);
  const saveRef = useRef(() => {});

  const load = async () => {
    setLoading(true);
    try {
      const [empRes, attRes] = await Promise.all([getEmployees(), getAttendance()]);
      if (empRes.success) setEmployees(empRes.data);
      if (attRes.success) setAttendance(attRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createAttendance({
      employee_id: form.employee_id,
      date: form.date,
      clock_in: form.clock_in,
      clock_out: form.clock_out || null,
    });
    setForm({ employee_id: '', date: '', clock_in: '', clock_out: '' });
    load();
  };

  const openEdit = (item) => {
    setModalTitle('Edit Attendance');
    setModalFields([
      { label: 'Date', key: 'date', value: item.date, type: 'date' },
      { label: 'Clock In', key: 'clock_in', value: item.clock_in ? item.clock_in.substring(0, 16) : '', type: 'datetime-local' },
      { label: 'Clock Out', key: 'clock_out', value: item.clock_out ? item.clock_out.substring(0, 16) : '', type: 'datetime-local' },
      { label: 'Status', key: 'status', value: item.status, type: 'select', options: ['Present', 'Absent', 'Late', 'Half Day'] },
    ]);
    saveRef.current = async (values) => {
      setSaving(true);
      try {
        await updateAttendance(item.attendance_id, values);
        load();
      } finally {
        setSaving(false);
      }
    };
    setModalOpen(true);
  };

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Attendance Tracking</h1>
      </div>
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Add Attendance Record</div>
        </div>
        <div className="panel-body">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label className="form-label">Select Employee</label>
              <select className="input" style={{ marginBottom: 0 }} value={form.employee_id} onChange={(e) => setForm((prev) => ({ ...prev, employee_id: e.target.value }))} required>
                <option value="">Choose...</option>
                {employees.filter(Boolean).map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {(emp.employee_name || 'Employee')} (ID: {emp.employee_id})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label className="form-label">Date</label>
              <input className="input" type="date" style={{ marginBottom: 0 }} value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} required />
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label className="form-label">Clock In</label>
              <input className="input" type="datetime-local" style={{ marginBottom: 0 }} value={form.clock_in} onChange={(e) => setForm((prev) => ({ ...prev, clock_in: e.target.value }))} required />
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label className="form-label">Clock Out</label>
              <input className="input" type="datetime-local" style={{ marginBottom: 0 }} value={form.clock_out} onChange={(e) => setForm((prev) => ({ ...prev, clock_out: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-solid" style={{ height: 42 }}>
              Save Record
            </button>
          </form>
        </div>
      </div>
      <div className="panel">
        <div className="table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>
                    Loading attendance...
                  </td>
                </tr>
              ) : attendance.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                attendance.map((item) => (
                  <tr key={item.attendance_id}>
                    <td>
                      {item.employee_id} <small>({item.Employee ? item.Employee.employee_name : 'N/A'})</small>
                    </td>
                    <td>{item.date}</td>
                    <td>{item.clock_in ? new Date(item.clock_in).toLocaleTimeString() : 'N/A'}</td>
                    <td>{item.clock_out ? new Date(item.clock_out).toLocaleTimeString() : 'N/A'}</td>
                    <td>{item.status}</td>
                    <td>
                      <button type="button" className="action-btn edit-btn" onClick={() => openEdit(item)}>
                        <i className="fas fa-edit" />
                      </button>
                      <button type="button" className="action-btn delete-btn" onClick={() => deleteAttendance(item.attendance_id).then(load)}>
                        <i className="fas fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EditModal
        isOpen={modalOpen}
        title={modalTitle}
        fields={modalFields}
        onClose={() => setModalOpen(false)}
        onSave={async (values) => {
          if (saveRef.current) await saveRef.current(values);
          setModalOpen(false);
        }}
        saving={saving}
      />
    </div>
  );
};

export default ManagerAttendanceView;
