import React, { useEffect, useRef, useState } from 'react';
import EditModal from '../EditModal';
import { createAppreciation, deleteAppreciation, getAppreciations, getEmployees, updateAppreciation } from '../../services/managerService';

const ManagerAppreciationsView = () => {
  const [appreciations, setAppreciations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    employee_id: '',
    title: '',
    description: '',
    date: '',
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalFields, setModalFields] = useState([]);
  const [saving, setSaving] = useState(false);
  const saveRef = useRef(() => {});

  const load = async () => {
    setLoading(true);
    try {
      const [appRes, empRes] = await Promise.all([getAppreciations(), getEmployees()]);
      if (appRes.success) setAppreciations(appRes.data);
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
    await createAppreciation(form);
    setForm({ employee_id: '', title: '', description: '', date: '' });
    load();
  };

  const openEdit = (item) => {
    setModalFields([
      { label: 'Award Title', key: 'title', value: item.title, type: 'text' },
      { label: 'Description', key: 'description', value: item.description, type: 'textarea' },
      { label: 'Date', key: 'date', value: item.date, type: 'date' },
    ]);
    saveRef.current = async (values) => {
      setSaving(true);
      try {
        await updateAppreciation(item.appreciation_id, values);
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
        <h1 className="page-h1">Appreciations & Awards</h1>
      </div>
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Give Award</div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSubmit}>
              <label className="form-label">Select Recipient</label>
              <select className="input" value={form.employee_id} onChange={(e) => setForm((prev) => ({ ...prev, employee_id: e.target.value }))} required>
                <option value="">Choose Employee</option>
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.employee_name} (ID: {emp.employee_id})
                  </option>
                ))}
              </select>
              <label className="form-label">Award/Appreciation Title</label>
              <input className="input" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
              <label className="form-label">Appreciation Message</label>
              <textarea className="input" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
              <label className="form-label">Award Date</label>
              <input className="input" type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} required />
              <button type="submit" className="btn btn-solid" style={{ width: '100%' }}>
                Issue Award
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
                  <th>Award</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center' }}>
                      Loading appreciations...
                    </td>
                  </tr>
                ) : appreciations.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center' }}>
                      No appreciations found.
                    </td>
                  </tr>
                ) : (
                  appreciations.map((item) => (
                    <tr key={item.appreciation_id}>
                      <td>
                        {item.employee_id} ({item.Employee ? item.Employee.employee_name : 'N/A'})
                      </td>
                      <td>
                        <strong>{item.title}</strong>
                        <br />
                        <small>{item.description}</small>
                      </td>
                      <td>{item.date}</td>
                      <td>
                        <button type="button" className="action-btn edit-btn" onClick={() => openEdit(item)}>
                          <i className="fas fa-edit" />
                        </button>
                        <button type="button" className="action-btn delete-btn" onClick={() => deleteAppreciation(item.appreciation_id).then(load)}>
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
        title="Edit Appreciation"
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

export default ManagerAppreciationsView;
