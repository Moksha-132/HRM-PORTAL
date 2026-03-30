import React, { useEffect, useRef, useState } from 'react';
import EditModal from '../EditModal';
import { createOffboarding, deleteOffboarding, getEmployees, getOffboardings, updateOffboarding } from '../../services/managerService';

const ManagerOffboardingsView = () => {
  const [offboardings, setOffboardings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ employee_id: '', reason: '', last_working_date: '' });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalFields, setModalFields] = useState([]);
  const [saving, setSaving] = useState(false);
  const saveRef = useRef(() => {});

  const load = async () => {
    setLoading(true);
    try {
      const [offRes, empRes] = await Promise.all([getOffboardings(), getEmployees()]);
      if (offRes.success) setOffboardings(offRes.data);
      if (empRes.success) setEmployees(empRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createOffboarding(form);
    setForm({ employee_id: '', reason: '', last_working_date: '' });
    load();
  };

  const openEdit = (item) => {
    setModalFields([
      { label: 'Reason', key: 'reason', value: item.reason, type: 'textarea' },
      { label: 'Last Date', key: 'last_working_date', value: item.last_working_date, type: 'date' },
      { label: 'Status', key: 'status', value: item.status, type: 'select', options: ['Pending', 'In Progress', 'Completed'] },
    ]);
    saveRef.current = async (values) => {
      setSaving(true);
      try {
        await updateOffboarding(item.offboarding_id, values);
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
        <h1 className="page-h1">Offboarding Management</h1>
      </div>
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Initiate Resignation</div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSubmit}>
              <label className="form-label">Employee</label>
              <select className="input" value={form.employee_id} onChange={(e) => setForm((prev) => ({ ...prev, employee_id: e.target.value }))} required>
                <option value="">Select Member</option>
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.employee_name} (ID: {emp.employee_id})
                  </option>
                ))}
              </select>
              <label className="form-label">Reason for Departure</label>
              <textarea className="input" value={form.reason} onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))} required />
              <label className="form-label">Last Working Date</label>
              <input className="input" type="date" value={form.last_working_date} onChange={(e) => setForm((prev) => ({ ...prev, last_working_date: e.target.value }))} required />
              <button type="submit" className="btn btn-solid" style={{ width: '100%' }}>
                Confirm Offboarding
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
                  <th>Employee Name</th>
                  <th>Reason</th>
                  <th>Last Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center' }}>
                      Loading offboardings...
                    </td>
                  </tr>
                ) : offboardings.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center' }}>
                      No offboarding records.
                    </td>
                  </tr>
                ) : (
                  offboardings.map((item) => (
                    <tr key={item.offboarding_id}>
                      <td>{item.employee_id}</td>
                      <td>{item.Employee ? item.Employee.employee_name : 'N/A'}</td>
                      <td>{item.reason || 'N/A'}</td>
                      <td>{item.last_working_date}</td>
                      <td>
                        <span className={`badge ${item.status === 'Completed' ? 'bg-green' : 'bg-yellow'}`}>{item.status}</span>
                      </td>
                      <td>
                        <button type="button" className="action-btn" title="Complete" style={{ color: 'green' }} onClick={() => updateOffboarding(item.offboarding_id, { status: 'Completed' }).then(load)}>
                          <i className="fas fa-check-double" />
                        </button>
                        <button type="button" className="action-btn edit-btn" onClick={() => openEdit(item)}>
                          <i className="fas fa-edit" />
                        </button>
                        <button type="button" className="action-btn delete-btn" onClick={() => deleteOffboarding(item.offboarding_id).then(load)}>
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
      </div>

      <EditModal
        isOpen={modalOpen}
        title="Edit Offboarding"
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

export default ManagerOffboardingsView;
