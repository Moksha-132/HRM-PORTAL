import React, { useEffect, useMemo, useRef, useState } from 'react';
import EditModal from '../EditModal';
import { createOffboarding, deleteOffboarding, getEmployees, getOffboardings, updateOffboarding } from '../../services/managerService';

const isResignationCategory = (category) => category === 'Resignation';
const canManagerCreate = (category) => category !== 'Complaint';
const KNOWN_CATEGORIES = ['Warning', 'Resignation', 'Complaint'];

const todayDate = () => new Date().toISOString().split('T')[0];

const inferCategory = (item) => {
  const direct = String(item?.category || '').trim();
  if (KNOWN_CATEGORIES.includes(direct)) return direct;
  const reason = String(item?.reason || '').trim().toLowerCase();
  if (reason.startsWith('[warning]')) return 'Warning';
  if (reason.startsWith('[complaint]')) return 'Complaint';
  if (reason.startsWith('[resignation]')) return 'Resignation';
  return 'Resignation';
};

const stripPrefix = (reason) => String(reason || '').replace(/^\s*\[(warning|complaint|resignation)\]\s*/i, '').trim();

const applyPrefix = (reason, category) => {
  const clean = stripPrefix(reason);
  if (category === 'Warning') return `[Warning] ${clean}`;
  if (category === 'Complaint') return `[Complaint] ${clean}`;
  return clean;
};

const resolveError = (err) => err?.response?.data?.error || err?.message || 'Action failed';

const ManagerOffboardingCategoryView = ({ category }) => {
  const [offboardings, setOffboardings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFields, setModalFields] = useState([]);
  const [form, setForm] = useState({ employee_id: '', reason: '', last_working_date: '' });
  const saveRef = useRef(() => {});

  const load = async () => {
    setLoading(true);
    try {
      const [offRes, empRes] = await Promise.all([getOffboardings(), getEmployees()]);
      if (offRes.success) setOffboardings(Array.isArray(offRes.data) ? offRes.data : []);
      if (empRes.success) setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [category]);

  const filtered = useMemo(() => {
    return offboardings.filter((item) => inferCategory(item) === category);
  }, [category, offboardings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        employee_id: Number(form.employee_id),
        category,
        reason: applyPrefix(form.reason, category),
        last_working_date: isResignationCategory(category) ? form.last_working_date : todayDate(),
      };

      await createOffboarding(payload);
      setForm({ employee_id: '', reason: '', last_working_date: '' });
      await load();
      alert(category === 'Warning' ? 'Warning sent successfully' : 'Resignation created successfully');
    } catch (err) {
      alert(resolveError(err));
    }
  };

  const openEdit = (item) => {
    const fields = [
      { label: 'Details', key: 'reason', value: stripPrefix(item.reason), type: 'textarea' },
      { label: 'Status', key: 'status', value: item.status, type: 'select', options: ['Pending', 'In Progress', 'Completed'] },
    ];
    const effectiveCategory = inferCategory(item);
    if (effectiveCategory === 'Resignation') {
      fields.splice(1, 0, { label: 'Last Date', key: 'last_working_date', value: item.last_working_date, type: 'date' });
    }

    setModalFields(fields);
    saveRef.current = async (values) => {
      setSaving(true);
      try {
        const payload = {
          ...values,
          reason: applyPrefix(values.reason, effectiveCategory),
        };
        await updateOffboarding(item.offboarding_id, payload);
        await load();
      } finally {
        setSaving(false);
      }
    };
    setModalOpen(true);
  };

  const panelTitle = category === 'Warning' ? 'Issue Warning' : (category === 'Complaint' ? 'Employee Complaints' : 'Initiate Resignation');

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">{category}</h1>
      </div>
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">{panelTitle}</div>
          </div>
          <div className="panel-body">
            {canManagerCreate(category) ? (
              <form onSubmit={handleSubmit}>
                <label className="form-label">Employee</label>
                <select
                  className="input"
                  value={form.employee_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, employee_id: e.target.value }))}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.filter(Boolean).map((emp) => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {(emp.employee_name || 'Employee')} (ID: {emp.employee_id})
                    </option>
                  ))}
                </select>

                <label className="form-label">{category === 'Warning' ? 'Warning Details' : 'Reason'}</label>
                <textarea
                  className="input"
                  value={form.reason}
                  onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                  required
                />

                {isResignationCategory(category) ? (
                  <>
                    <label className="form-label">Last Working Date</label>
                    <input
                      className="input"
                      type="date"
                      value={form.last_working_date}
                      onChange={(e) => setForm((prev) => ({ ...prev, last_working_date: e.target.value }))}
                      required
                    />
                  </>
                ) : null}

                <button type="submit" className="btn btn-solid" style={{ width: '100%' }}>
                  {category === 'Warning' ? 'Send Warning' : 'Create Resignation'}
                </button>
              </form>
            ) : (
              <div style={{ color: 'var(--text-light)' }}>
                Complaints are created by employees. Review and update status from the table.
              </div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
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
                    <td colSpan={7} style={{ textAlign: 'center' }}>
                      Loading...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center' }}>
                      No {category.toLowerCase()} records.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.offboarding_id}>
                      <td>{item.employee_id}</td>
                      <td>{item.Employee ? item.Employee.employee_name : 'N/A'}</td>
                      <td>{stripPrefix(item.reason) || 'N/A'}</td>
                      <td>{item.last_working_date || '-'}</td>
                      <td>{item.raised_by || (category === 'Warning' ? 'Manager' : (category === 'Complaint' ? 'Employee' : '-'))}</td>
                      <td>
                        <span className={`badge ${item.status === 'Completed' ? 'bg-green' : 'bg-yellow'}`}>{item.status}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="action-btn"
                          title="Complete"
                          style={{ color: 'green' }}
                          onClick={async () => {
                            try {
                              await updateOffboarding(item.offboarding_id, { status: 'Completed' });
                              await load();
                            } catch (err) {
                              alert(resolveError(err));
                            }
                          }}
                        >
                          <i className="fas fa-check-double" />
                        </button>
                        <button type="button" className="action-btn edit-btn" onClick={() => openEdit(item)}>
                          <i className="fas fa-edit" />
                        </button>
                        <button
                          type="button"
                          className="action-btn delete-btn"
                          onClick={async () => {
                            try {
                              await deleteOffboarding(item.offboarding_id);
                              await load();
                            } catch (err) {
                              alert(resolveError(err));
                            }
                          }}
                        >
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
        title={`Edit ${category}`}
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

export default ManagerOffboardingCategoryView;
