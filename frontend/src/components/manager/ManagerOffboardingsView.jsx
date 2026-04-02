import React, { useEffect, useRef, useState } from 'react';
import EditModal from '../EditModal';
import { createOffboarding, deleteOffboarding, getEmployees, getOffboardings, updateOffboarding } from '../../services/managerService';

const OFFBOARDING_CATEGORIES = ['Warning', 'Resignation', 'Complaint'];

const getCategory = (item) => {
  const category = String(item?.category || '').trim();
  return OFFBOARDING_CATEGORIES.includes(category) ? category : 'Resignation';
};

const ManagerOffboardingsView = () => {
  const [offboardings, setOffboardings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Resignation');
  const [form, setForm] = useState({ category: 'Resignation', employee_id: '', reason: '', last_working_date: '' });

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
    const payload = {
      employee_id: form.employee_id,
      category: form.category,
      reason: form.reason,
    };
    if (form.category === 'Resignation') {
      payload.last_working_date = form.last_working_date;
    }

    await createOffboarding(payload);
    setForm((prev) => ({ ...prev, employee_id: '', reason: '', last_working_date: '' }));
    load();
  };

  const openEdit = (item) => {
    const fields = [
      { label: 'Reason', key: 'reason', value: item.reason, type: 'textarea' },
      { label: 'Status', key: 'status', value: item.status, type: 'select', options: ['Pending', 'In Progress', 'Completed'] },
    ];
    if (getCategory(item) === 'Resignation') {
      fields.splice(1, 0, { label: 'Last Date', key: 'last_working_date', value: item.last_working_date, type: 'date' });
    }
    setModalFields(fields);
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

  const filteredOffboardings = offboardings.filter((item) => getCategory(item) === activeCategory);
  const isResignation = form.category === 'Resignation';

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Offboarding Management</h1>
      </div>
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Create Offboarding Record</div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSubmit}>
              <label className="form-label">Category</label>
              <select
                className="input"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value, last_working_date: '' }))}
                required
              >
                <option value="Resignation">Resignation</option>
                <option value="Warning">Warning</option>
              </select>

              <label className="form-label">Employee</label>
              <select className="input" value={form.employee_id} onChange={(e) => setForm((prev) => ({ ...prev, employee_id: e.target.value }))} required>
                <option value="">Select Member</option>
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.employee_name} (ID: {emp.employee_id})
                  </option>
                ))}
              </select>

              <label className="form-label">Details</label>
              <textarea className="input" value={form.reason} onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))} required />

              {isResignation ? (
                <>
                  <label className="form-label">Last Working Date</label>
                  <input className="input" type="date" value={form.last_working_date} onChange={(e) => setForm((prev) => ({ ...prev, last_working_date: e.target.value }))} required />
                </>
              ) : null}

              <button type="submit" className="btn btn-solid" style={{ width: '100%' }}>
                {isResignation ? 'Confirm Resignation' : 'Issue Warning'}
              </button>
            </form>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <div className="panel-title">Offboarding Sublist</div>
          </div>
          <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {OFFBOARDING_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className={`btn ${activeCategory === category ? 'btn-solid' : 'btn-outline'}`}
                onClick={() => setActiveCategory(category)}
                style={{ padding: '6px 12px' }}
              >
                {category === 'Warning' ? 'Warnings' : (category === 'Complaint' ? 'Complaints' : 'Resignation')}
              </button>
            ))}
          </div>
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Emp ID</th>
                  <th>Employee Name</th>
                  <th>Details</th>
                  <th>Last Date</th>
                  <th>Raised By</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center' }}>
                      Loading offboardings...
                    </td>
                  </tr>
                ) : filteredOffboardings.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center' }}>
                      No records in this category.
                    </td>
                  </tr>
                ) : (
                  filteredOffboardings.map((item) => (
                    <tr key={item.offboarding_id}>
                      <td>{getCategory(item)}</td>
                      <td>{item.employee_id}</td>
                      <td>{item.Employee ? item.Employee.employee_name : 'N/A'}</td>
                      <td>{item.reason || 'N/A'}</td>
                      <td>{item.last_working_date || '-'}</td>
                      <td>{item.raised_by || '-'}</td>
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
