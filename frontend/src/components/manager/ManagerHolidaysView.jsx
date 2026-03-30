import React, { useEffect, useRef, useState } from 'react';
import EditModal from '../EditModal';
import { createHoliday, deleteHoliday, getHolidays, updateHoliday } from '../../services/managerService';

const ManagerHolidaysView = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ holiday_name: '', date: '', description: '' });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalFields, setModalFields] = useState([]);
  const [saving, setSaving] = useState(false);
  const saveRef = useRef(() => {});

  const load = async () => {
    setLoading(true);
    try {
      const res = await getHolidays();
      if (res.success) setHolidays(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createHoliday(form);
    setForm({ holiday_name: '', date: '', description: '' });
    load();
  };

  const openEdit = (item) => {
    const holidayId = item.holiday_id || item.id;
    setModalFields([
      { label: 'Title', key: 'holiday_name', value: item.holiday_name, type: 'text' },
      { label: 'Date', key: 'date', value: item.date, type: 'date' },
      { label: 'Description', key: 'description', value: item.description, type: 'textarea' },
    ]);
    saveRef.current = async (values) => {
      setSaving(true);
      try {
        await updateHoliday(holidayId, values);
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
        <h1 className="page-h1">Holiday Management</h1>
      </div>
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Add Holiday</div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSubmit}>
              <label className="form-label">Holiday Title</label>
              <input className="input" value={form.holiday_name} onChange={(e) => setForm((prev) => ({ ...prev, holiday_name: e.target.value }))} required />
              <label className="form-label">Date</label>
              <input className="input" type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} required />
              <label className="form-label">Description (Optional)</label>
              <textarea className="input" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
              <button type="submit" className="btn btn-solid" style={{ width: '100%' }}>
                Save Holiday
              </button>
            </form>
          </div>
        </div>
        <div className="panel">
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center' }}>
                      Loading holidays...
                    </td>
                  </tr>
                ) : holidays.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center' }}>
                      No holidays found.
                    </td>
                  </tr>
                ) : (
                  holidays.map((holiday, index) => (
                    <tr key={holiday.holiday_id || holiday.id}>
                      <td>{index + 1}</td>
                      <td>{holiday.date}</td>
                      <td>
                        <strong>{holiday.holiday_name}</strong>
                      </td>
                      <td>
                        <button type="button" className="action-btn edit-btn" onClick={() => openEdit(holiday)}>
                          <i className="fas fa-edit" />
                        </button>
                        <button type="button" className="action-btn delete-btn" onClick={() => deleteHoliday(holiday.holiday_id || holiday.id).then(load)}>
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
        title="Edit Holiday"
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

export default ManagerHolidaysView;
